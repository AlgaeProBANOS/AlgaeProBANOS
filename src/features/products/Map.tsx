// import 'maplibre-gl/dist/maplibre-gl.css'; // See notes below

import { Species } from '@/api/apb.client';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  Country,
  selectCategoryColors,
  selectFilteredSpecies,
  selectFilters,
  selectProductMapMode,
  selectSpecies,
  setFilters,
  setProductMapMode,
} from '@/app/store/apb.slice';
import { Checkbox, Field, Label } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';
// import type { MapRef } from '@vis.gl/react-maplibre';
// import { Layer, Map, Source } from '@vis.gl/react-maplibre';
import * as d3 from 'd3';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTooltipState } from '../common/tooltip/tooltip-provider';

import ReactMapGL, { AttributionControl, Layer, Marker, Source } from 'react-map-gl';
import { Switch } from './Switch';
import { nanoid } from '@reduxjs/toolkit';

const outerMapBounds: [number, number, number, number] = [
  -26.942848249874004, 31.43581990686755, 65.1077179732153, 73.33119246537285,
];

const [minLng, minLat, maxLng, maxLat] = outerMapBounds;

const rectangle = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat],
      ],
    ],
  },
};

const lineStyle = {
  id: 'bbox-rect-outline',
  type: 'line' as const,
  paint: {
    'line-color': '#ff6b00',
    'line-width': 1,
    'line-dasharray': [2, 2],
  },
};

const getBoundsForPoints = (points, { width = 200, height = 500, padding = 0 } = {}) => {
  // Calculate corner values of bounds
  const pointsLong = points
    .filter((point) => point.geometry.coordinates != null)
    .map((point) => point.geometry.coordinates[0]);
  const pointsLat = points
    .filter((point) => point.geometry.coordinates != null)
    .map((point) => point.geometry.coordinates[1]);

  if (pointsLong.length === 0 || pointsLat.length === 0) {
    return null;
  } else {
    const cornersLongLat = [
      [Math.min(...pointsLong), Math.min(...pointsLat)],
      [Math.max(...pointsLong), Math.max(...pointsLat)],
    ];
    return cornersLongLat;
  }
};

const getBoundsForHexagons = (points, { width = 200, height = 500, padding = 0 } = {}) => {
  // Calculate corner values of bounds
  const pointsLong =
    points.length > 10
      ? points
          .filter((point) => point.geometry.coordinates != null)
          .map((point) => point.geometry.coordinates[0][0][0])
      : points
          .filter((point) => point.geometry.coordinates != null)
          .flatMap((point) => point.geometry.coordinates[0].flatMap((e) => e[0]));

  const pointsLat =
    points.length > 10
      ? points
          .filter((point) => point.geometry.coordinates != null)
          .map((point) => point.geometry.coordinates[0][0][1])
      : points
          .filter((point) => point.geometry.coordinates != null)
          .flatMap((point) => point.geometry.coordinates[0].flatMap((e) => e[1]));

  if (pointsLong.length === 0 || pointsLat.length === 0) {
    return null;
  } else {
    const cornersLongLat = [
      [Math.min(...pointsLong), Math.min(...pointsLat)],
      [Math.max(...pointsLong), Math.max(...pointsLat)],
    ];
    return cornersLongLat;
  }
};

const boundsWithin = (inner, outer) => {
  const [innerWest, innerSouth, innerEast, innerNorth] = inner;
  const [outerWest, outerSouth, outerEast, outerNorth] = outer;

  return (
    innerWest >= outerWest &&
    innerEast <= outerEast &&
    innerSouth >= outerSouth &&
    innerNorth <= outerNorth
  );
};

interface MapProps {
  focusSpecies?: Array<Species['id']>;
}

const setupHexagonJSON = (
  hexCounts: Record<string, number>,
  geojson: any,
  filteredAndSelectedSpecies: any,
) => {
  const hexSums = {};
  const hexSpecies = {};
  if (hexCounts != null) {
    for (const spec of filteredAndSelectedSpecies) {
      if (hexCounts[spec] != null) {
        for (const hexKey of Object.keys(hexCounts[spec])) {
          if (Object.keys(hexSums).includes(hexKey)) {
            hexSums[hexKey] = hexSums[hexKey] + hexCounts[spec][hexKey];
            hexSpecies[hexKey].push(spec);
          } else {
            hexSums[hexKey] = hexCounts[spec][hexKey];
            hexSpecies[hexKey] = [spec];
          }
        }
      }
    }
  }
  const vals = Object.values(hexSpecies).map((e) => e.length);
  const hexSumMax = Math.max(...vals);

  // Create a linear scale from 0 → 1
  const colorScale = d3.scaleLinear().domain([0, hexSumMax]).range(['#e5f5f9', '#00441b']);

  const scaleLength = Math.min(hexSumMax, 10);

  // Generate 10 evenly spaced colors
  const colors = Array.from({ length: scaleLength }, (_, i) => [
    Math.max(Math.floor((i / scaleLength) * hexSumMax), 1),
    colorScale(Math.floor(((i + 1) / scaleLength) * hexSumMax)),
  ]);

  const geoJsonHexas = [];

  if (geojson != null) {
    for (const hexa of geojson.features) {
      if (hexSums[hexa.properties.HexagonID] > 0) {
        let tmpHexagon = {
          ...hexa,
          properties: {
            ...hexa.properties,
            occCount: hexSums[hexa.properties.HexagonID],
            speciesCount: hexSpecies[hexa.properties.HexagonID].length,
          },
        };

        geoJsonHexas.push(tmpHexagon);
      }
    }
  }
  // console.log('Hexagon Features', resolution, geoJsonHexas.length);

  const legendColsString = `grid-cols-[repeat(${colors != null ? colors.length + 1 : 1},_1fr)]`;

  return [
    {
      type: 'FeatureCollection',
      features: geoJsonHexas,
    },
    colors,
    legendColsString,
  ];
};

function groupBy(xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

function createDonutChart(props, dataKeys, colors) {
  const offsets = [];

  const grouped = Object.fromEntries(
    Object.entries(props).filter(([key, val]) => dataKeys.includes(key)),
  );

  const sortedGroupedKeys = Object.keys(grouped).sort().reverse();

  let total = 0;
  for (const group of sortedGroupedKeys) {
    offsets.push(total);
    total = total + grouped[group];
  }

  const fontSize = total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
  let r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
  if (props.point_count == null || props.point_count <= 1) {
    r = r - 8;
  }
  const r0 = props.point_count > 1 ? Math.round(r * 0.6) : 0;
  const w = r * 2;

  return (
    <svg
      onClick={(e) => {
        e.stopPropagation();
      }}
      width={`${w}`}
      height={`${w}`}
      viewBox={`0 0 ${w} ${w}`}
      textAnchor="middle"
    >
      <circle cx={r} cy={r} r={r} fill="white" stroke={'none'}></circle>
      <g transform={'translate(1, 1)'}>
        {sortedGroupedKeys.map((item, index) => {
          return donutSegment(
            offsets[index] / total,
            (offsets[index] + grouped[item]) / total,
            r - 1,
            r0,
            colors[item],
            `donut-segment-${index}-${nanoid()}`,
          );
        })}
      </g>
      {props.point_count > 1 && (
        <text dominantBaseline="central" transform={`translate(${r}, ${r})`}>
          {total.toLocaleString()}
        </text>
      )}
    </svg>
  );
}

function donutSegment(start, end, r, r0, color, key) {
  if (end - start === 1) end -= 0.00001;
  const a0 = 2 * Math.PI * (start - 0.25);
  const a1 = 2 * Math.PI * (end - 0.25);
  const x0 = Math.cos(a0),
    y0 = Math.sin(a0);
  const x1 = Math.cos(a1),
    y1 = Math.sin(a1);
  const largeArc = end - start > 0.5 ? 1 : 0;

  return (
    <path
      key={key}
      d={`M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
        r + r * y0
      } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
        r + r0 * x1
      } ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${r + r0 * y0}`}
      fill={`${color}`}
    />
  );
}

export type MapDataSourceType = 'EMOD' | 'GBIF';

export default function Map(props: MapProps): JSX.Element {
  const mapRef = useRef();
  const [focusSpecies] = useState(props.focusSpecies ?? null);
  const dispatch = useAppDispatch();
  const [isClustering, setIsClustering] = useState(true);
  const [combineBoth, setCombineBoth] = useState(focusSpecies != null ? true : false);
  const countryFilters = useAppSelector(selectFilters).countries ?? {};
  const mapDataMode = useAppSelector(selectProductMapMode);
  const { updateTooltip } = useTooltipState();
  const [hexResolution, setHexResolution] = useState<number>(3);
  const [projection, setProjection] = useState<'globe' | 'equalEarth'>('globe');
  const productMapMode = useAppSelector(selectProductMapMode);
  const [mapSource, setMapSource] = useState<MapDataSourceType>(productMapMode);
  const categoryColors = useAppSelector(selectCategoryColors);

  useEffect(() => {
    dispatch(setProductMapMode(mapSource));
  }, [mapSource]);

  const [hexagonGeoJsonOriginal3, setHexagonGeoJsonOriginal3] = useState();
  const [hexagonGeoJsonOriginal4, setHexagonGeoJsonOriginal4] = useState();
  const [hexagonGeoJsonOriginal5, setHexagonGeoJsonOriginal5] = useState();
  const [hexCounts3, setHexCounts3] = useState();
  const [hexCounts4, setHexCounts4] = useState();
  const [hexCounts5, setHexCounts5] = useState();

  const [hex3Init, setHex3Init] = useState(true);
  const [hex4Init, setHex4Init] = useState(true);
  const [hex5Init, setHex5Init] = useState(true);

  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);

  const speciesFilter = useAppSelector(selectFilters).species;

  const [countryData, setCountryData] = useState(null);
  const countryFilter = useAppSelector(selectFilters).countries;
  const filteredCountryIsos =
    countryFilter != null ? Object.values(countryFilter).map((e: Country) => e.iso3) : null;

  const filteredAndSelectedSpecies = useMemo(() => {
    if (focusSpecies != null && focusSpecies.length > 0) {
      return Object.keys(species).filter((item) => focusSpecies.includes(item));
    } else {
      return filteredSpecies != null
        ? filteredSpecies.filter((item) =>
            speciesFilter != null && speciesFilter.length > 0 ? speciesFilter.includes(item) : true,
          )
        : Object.keys(species);
    }
  }, [
    filteredSpecies,
    speciesFilter.genus,
    speciesFilter.species,
    speciesFilter.type,
    focusSpecies,
  ]);

  const [filteredProductionMethods, setFilteredProductionMethods] = useState<Array<string>>(
    Object.keys(categoryColors),
  );

  const updateFilteredProductionMethods = useCallback(
    (element, filteredProductionMethods) => {
      const newMethods = new Set(filteredProductionMethods);
      if (newMethods.has(element)) {
        newMethods.delete(element);
      } else {
        newMethods.add(element);
      }
      setFilteredProductionMethods([...newMethods]);
    },
    [setFilteredProductionMethods],
  );

  useEffect(() => {
    fetch('/data/UN_Worldmap_FeaturesToJSON10percentCorrected.json')
      .then((res) => res.json())
      .then(function (json) {
        setCountryData(json);
      });

    fetch('/data/hexas_3_filtered.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexagonGeoJsonOriginal3(json);

        fetch('/data/hex_counts_3.json')
          .then((res) => res.json())
          .then(function (json) {
            setHexCounts3(json);
            setHex3Init(false);
          });
      });

    fetch('/data/hexas_4_filtered.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexagonGeoJsonOriginal4(json);

        fetch('/data/hex_counts_4.json')
          .then((res) => res.json())
          .then(function (json) {
            setHexCounts4(json);
            setHex4Init(false);
          });
      });

    /* fetch('/data/hexas_5_filtered.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexagonGeoJsonOriginal5(json);

        fetch('/data/hex_counts_5.json')
          .then((res) => res.json())
          .then(function (json) {
            setHexCounts5(json);
            setHex5Init(false);
          });
      }); */
  }, []);

  // useEffect(() => {
  //   console.log('CHANGED ===== filteredSpecies', filteredSpecies);
  // }, [filteredSpecies]);

  // useEffect(() => {
  //   console.log('CHANGED ===== focusSpecies', focusSpecies);
  // }, [focusSpecies]);

  // useEffect(() => {
  //   console.log('CHANGED ===== speciesFilter', speciesFilter);
  // }, [speciesFilter]);

  const productSpecies = useMemo(() => {
    return filteredAndSelectedSpecies.filter((key) => {
      return species[key]!.emodnet_points != null;
    });
  }, [filteredAndSelectedSpecies]);

  const [mapMarkers, clusterProperties] = useMemo(() => {
    const clusterProperties = {};
    const markers = [];
    for (const speciesName of productSpecies) {
      const spec = species[speciesName];
      for (const dot of spec.emodnet_points) {
        const newProps = {};
        for (const meth of dot.production_method_array) {
          const propKey = `${meth.trim()}`;
          newProps[propKey] = 1;
          if (!Object.keys(clusterProperties).includes(propKey)) {
            clusterProperties[propKey] = [
              '+',
              ['case', ['in', propKey, ['get', 'production_method_array']], 1, 0],
            ];
          }
        }

        const newMarker = {
          type: 'Feature',
          properties: {
            site_id: dot.site_id,
            production_details: dot.production_details,
            production_method: dot.production_method,
            production_method_array: dot.production_method_array,
            ...newProps,
          },
          geometry: {
            type: 'Point',
            coordinates: [dot.coordinates[1], dot.coordinates[0]],
          },
        };

        if (dot.production_method_array?.some((e) => filteredProductionMethods.includes(e))) {
          markers.push(newMarker);
        }
      }
    }

    return [markers, clusterProperties];
  }, [productSpecies, isClustering, filteredProductionMethods]);

  const [hexagonGeoJson3, colors3, legendColsString] = useMemo(() => {
    if (hexCounts3 != null) {
      return setupHexagonJSON(hexCounts3, hexagonGeoJsonOriginal3, filteredAndSelectedSpecies);
    } else return [null, null];
  }, [filteredAndSelectedSpecies, hex3Init]);

  const [hexagonGeoJson4, colors4] = useMemo(() => {
    if (hexCounts4 != null) {
      return setupHexagonJSON(hexCounts4, hexagonGeoJsonOriginal4, filteredAndSelectedSpecies);
    } else {
      return [null, null];
    }
  }, [filteredAndSelectedSpecies, hex4Init]);

  /* const [hexagonGeoJson5, colors5] = useMemo(() => {
    if (hexCounts5 != null && hexResolution === 5) {
      console.log('CHANGE 5');
      return setupHexagonJSON(hexCounts5, hexagonGeoJsonOriginal5, filteredAndSelectedSpecies);
    } else {
      return [null, null];
    }
  }, [filteredAndSelectedSpecies, hex5Init, hexResolution]); */

  const [showBathymetry, setShowBathymetry] = useState(true);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current
        .getMap()
        .setLayoutProperty('bathymetry-layer', 'visibility', showBathymetry ? 'visible' : 'none');
    }
  }, [showBathymetry]);

  const [lastBounds, setLastBounds] = useState(null);

  useEffect(() => {
    if (mapDataMode === 'GBIF' || combineBoth) {
      const hexagonGeoJson = hexResolution === 3 ? hexagonGeoJson3 : hexagonGeoJson4;
      if (hexagonGeoJson != null) {
        const bounds = getBoundsForHexagons(hexagonGeoJson.features);
        if (bounds != null) {
          mapRef.current?.fitBounds(bounds);
        }
      }
    } else {
      const bounds = getBoundsForPoints(mapMarkers);
      if (bounds != null) {
        mapRef.current?.fitBounds(bounds);
      }
    }
  }, [filteredSpecies, mapDataMode, hexagonGeoJson3, hexagonGeoJson4, lastBounds]);

  // if (mapMarkers.length === 0 && hexagonGeoJson3 != null && hexagonGeoJson3.features.length === 0) {
  //   return <div>No Map!</div>;
  // }

  const [donutClusterMarkers, setDonutClusterMarkers] = useState([]);

  const updateDonutClusterMarkers = useCallback(() => {
    const newMarkers = [];
    if (mapRef.current != null) {
      const features = mapRef.current.querySourceFeatures('micro-source');
      const clusterPropertiesKey = Object.keys(clusterProperties);

      let index = 0;
      for (const feat of features) {
        const markerKey = `marker-${index}`;

        // if (feat.properties.point_count > 0) {
        newMarkers.push(
          <Marker
            key={markerKey}
            longitude={feat.geometry.coordinates[0]}
            latitude={feat.geometry.coordinates[1]}
            anchor="center"
          >
            {createDonutChart(feat.properties, clusterPropertiesKey, categoryColors)}
          </Marker>,
        );
        index = index + 1;
        // }
      }
    }

    setDonutClusterMarkers(newMarkers);
  }, [categoryColors]);

  return (
    <div
      className={`size-full relative ${focusSpecies != null ? 'rounded-md overflow-hidden' : ''}`}
    >
      <ReactMapGL
        ref={mapRef}
        initialViewState={{
          longitude: 8,
          latitude: 54,
          zoom: 3,
        }}
        // fog={{
        //   range: [0.8, 8],
        //   color: 'rgb(100,100,106)',
        //   'horizon-blend': 0.2,
        //   'high-color': 'rgb(200,200,206)',
        //   'space-color': '#000000',
        //   'star-intensity': 0.15,
        // }}
        minZoom={0}
        maxZoom={20}
        projection={projection}
        onZoomEnd={(e) => {
          const zoomLevel = e.viewState.zoom;
          if (zoomLevel > 4 && hexResolution !== 4) {
            setHexResolution(4);
          } else if (zoomLevel <= 4 && hexResolution !== 3) {
            setHexResolution(3);
          }
        }}
        style={{ width: '100%', height: '100%', position: 'relative' }}
        // mapStyle="https://api.maptiler.com/maps/019864da-bd1a-77a6-8cb4-b2fb2323302f/style.json?key=JryEbN305oNyHUvClr79"
        mapStyle="mapbox://styles/mapbox/light-v11?optimize=true"
        mapboxAccessToken="pk.eyJ1IjoiamFrb2JrdXNuaWNrIiwiYSI6ImNsYTAzYjQ2NjBrdnQzcWx0d2EyajFzbHQifQ.LQN-NvTn6PbHEbXHJO0CTw"
        onLoad={() => {
          // console.log('----- Map and Layers loaded! ----- ', mapRef.current?.getStyle().layers);
          if (mapRef.current) {
            mapRef.current.getMap().setPaintProperty('Water', 'fill-color', '#f0fbff');
          }
        }}
        onRender={() => {
          updateDonutClusterMarkers();
        }}
        onClick={(e) => {
          const feature = e.features?.[0];
          if (feature && feature.layer.id === 'country-fill') {
            const oldFilters = { ...countryFilters } as Record<Country['title'], Country>;
            if (Object.keys(oldFilters).includes(feature.properties.ROMNAM)) {
              delete oldFilters[feature.properties.ROMNAM];
            } else {
              oldFilters[feature.properties.ROMNAM] = {
                title: feature.properties.ROMNAM,
                value: feature.properties.ROMNAM,
                iso3: feature.properties.ISO3CD,
              };
            }

            dispatch(
              setFilters({
                type: 'countries',
                cat: 'countries',
                val: oldFilters,
              }),
            );
          }
        }}
        interactiveLayerIds={['country-fill']}
      >
        <Source
          id="bathymetry-source"
          type="vector"
          bounds={outerMapBounds}
          url="https://api.maptiler.com/tiles/ocean/tiles.json?key=JryEbN305oNyHUvClr79"
        >
          <Layer
            id="bathymetry-layer"
            source="bathymetry-source"
            source-layer="contour"
            type="fill"
            paint={{
              'fill-color': [
                'step',
                ['get', 'depth'],
                '#00527e', // 11
                -6000,
                '#075a89', // 10
                -4000,
                '#0f6294', // 9
                -2000,
                '#166a9f', // 8
                -1000,
                '#1c72ab', // 7
                -500,
                '#237bb7', // 6
                -300,
                '#2983c2', // 5
                -200,
                '#2f8cce', // 4
                -150,
                '#3494da', // 3
                -100,
                '#3a9de6', // 2
                -50,
                '#40a6f3', // 1
                -10,
                '#46afff',
              ],
            }}
            beforeId="state-label"
          />
        </Source>
        {countryData && (
          <Source type="geojson" data={countryData}>
            <Layer
              beforeId="state-label"
              id="country-fill"
              type="fill"
              paint={{
                'fill-color': 'transparent',
                //   'fill-opacity': 0.8,
              }}
            />
            <Layer
              beforeId="state-label"
              id="country-line"
              type="line"
              paint={{
                'line-color': 'purple',
                'line-width': 2,
                'line-opacity': [
                  'case',
                  ['in', ['get', 'ISO3CD'], ['literal', filteredCountryIsos]],
                  1.0,
                  0.0,
                ],
              }}
            />
          </Source>
        )}
        {(mapDataMode === 'GBIF' || combineBoth) && hexagonGeoJson3 != null && (
          <Source type="geojson" id="hexagonsource3" data={hexagonGeoJson3}>
            <Layer
              beforeId="state-label"
              {...{
                // beforeId: 'state-label',
                id: 'hexagons3',
                source: 'hexagonsource3',
                layout: {
                  visibility: hexResolution === 3 ? 'visible' : 'none',
                },
                ...{
                  paint: {
                    'fill-color': [
                      'interpolate',
                      ['linear'],
                      ['get', 'speciesCount'],
                      ...colors3.flat(),
                    ],
                    'fill-opacity': 0.8,
                    'fill-outline-color': 'transparent',
                  },
                  type: 'fill',
                },
              }}
            />
          </Source>
        )}
        {(mapDataMode === 'GBIF' || combineBoth) && hexagonGeoJson4 != null && (
          <Source type="geojson" id="hexagonsource4" data={hexagonGeoJson4}>
            <Layer
              beforeId="state-label"
              {...{
                // beforeId: 'state-label',
                id: 'hexagons4',
                source: 'hexagonsource4',
                layout: {
                  visibility: hexResolution === 4 ? 'visible' : 'none',
                },
                ...{
                  paint: {
                    'fill-color': [
                      'interpolate',
                      ['linear'],
                      ['get', 'speciesCount'],
                      ...colors4.flat(),
                    ],
                    'fill-opacity': 0.8,
                    'fill-outline-color': 'transparent',
                  },
                  type: 'fill',
                },
              }}
            />
          </Source>
        )}
        {/* {mapDataMode === 'GBIF' && hexagonGeoJson5 != null && (
          <Source type="geojson" id="hexagonsource5" data={hexagonGeoJson5}>
            <Layer
              beforeId="waterway"
              {...{
                // beforeId: 'state-label',
                id: 'hexagons5',
                source: 'hexagonsource5',
                layout: {
                  visibility: hexResolution === 5 ? 'visible' : 'none',
                },
                ...{
                  paint: {
                    'fill-color': [
                      'interpolate',
                      ['linear'],
                      ['get', 'occCount'],
                      ...colors5.flat(),
                    ],
                    'fill-opacity': 0.8,
                    'fill-outline-color': 'transparent',
                  },
                  type: 'fill',
                },
              }}
            />
          </Source>
        )} */}
        <Source id="bbox-rect" type="geojson" data={rectangle}>
          <Layer {...lineStyle} />
        </Source>
        {(mapDataMode === 'EMOD' || combineBoth) && (
          <Source
            id="micro-source"
            data={{
              type: 'FeatureCollection',
              features: mapMarkers,
            }}
            type="geojson"
            key={`geojson-marker-source-${isClustering}`}
            generateId={true}
            cluster={isClustering ? true : false}
            clusterMaxZoom={14}
            clusterRadius={50}
            clusterProperties={{
              ...clusterProperties,
              sites: ['concat', ['concat', ' ', ['get', 'site_id']]],
            }}
          >
            {/* {isClustering && ( */}
            <>
              {donutClusterMarkers}
              <Layer
                id="geojson-fill"
                key={`geojson-fill-${isClustering}`}
                type="circle"
                filter={['!', ['has', 'point_count']]}
                paint={{ 'circle-radius': 0 }}
                source="micro-source"
              />
            </>
            {/* )} */}
            {/* {isClustering && (
              <Layer
                id="clusters"
                type="circle"
                key={`geojson-clusters-${isClustering}`}
                source="micro-source"
                filter={['has', 'point_count']}
                paint={{
                  'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#ff6600',
                    100,
                    '#f1f075',
                    750,
                    '#f28cb1',
                  ],
                  'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
                  // 'circle-emissive-strength': 1,
                }} 
              ></Layer>
            )}*/}
          </Source>
        )}
        {(mapDataMode === 'GBIF' || combineBoth) && (
          <div
            className={`absolute bottom-6 left-2 p-1 pt-0 bg-apb-gray-light/60 hover:bg-apb-gray-light/90 shadow-md rounded-md grid ${legendColsString} grid-rows-2 h-[30px] max-w-1/2`}
          >
            {(hexResolution === 3 ? (colors3 ?? []) : (colors4 ?? [])).map((e, i) => (
              <>
                <div
                  key={`legend-entry-number-${i}`}
                  className="row-start-1 text-xs items-start justify-center flex select-none"
                  onMouseEnter={(event) => {
                    updateTooltip(
                      <div className="p-1 size-2 flex items-center justify-center">{e[0]}</div>,
                    );
                  }}
                  onMouseLeave={(event) => {
                    updateTooltip(null);
                  }}
                >
                  {e[0]}
                </div>
                <div
                  key={`legend-entry-${i}`}
                  style={{ backgroundColor: e[1] }}
                  className="row-start-2 rounded min-w-6"
                  onMouseEnter={(event) => {
                    updateTooltip(
                      <div className="p-1 size-2 flex items-center justify-center">{e[0]}</div>,
                    );
                  }}
                  onMouseLeave={(event) => {
                    updateTooltip(null);
                  }}
                ></div>
              </>
            ))}
            <div className="row-start-1 text-xs items-start justify-center flex whitespace-nowrap">
              Species /
            </div>
            <div className="row-start-2 items-start justify-center flex">
              <div
                style={{
                  width: '15px',
                  height: '15px',
                  '-webkit-clip-path':
                    'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)',
                  clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)',
                }}
                className="bg-apb-gray"
              ></div>
            </div>
          </div>
        )}
        {(mapDataMode === 'EMOD' || combineBoth) && (
          <div
            className={`absolute ${combineBoth ? 'bottom-[60px]' : 'bottom-6'} left-2 p-1 bg-apb-gray-light/60 shadow-md rounded-md flex flex-col max-w-1/2 gap-x-1 h-7 overflow-hidden hover:h-fit hover:bg-apb-gray-light/90`}
          >
            <div
              onClick={() => {
                updateFilteredProductionMethods('', Object.keys(categoryColors));
              }}
              className="font-bold flex flex-row justify-between group cursor-pointer border border-transparent hover:border-apb-gray hover:bg-white/50 px-1 rounded-md select-none gap-1"
            >
              <span>Production Methods</span>
              <span className="font-normal hidden group-hover:block">(Add all)</span>
            </div>
            {categoryColors &&
              Object.keys(clusterProperties).map((e, i) => (
                <div
                  key={`productionLegendEntry-${i}`}
                  onClick={() => {
                    updateFilteredProductionMethods(e, filteredProductionMethods);
                  }}
                  onDoubleClick={() => {
                    updateFilteredProductionMethods(e, []);
                  }}
                  className={`flex flex-row gap-1 cursor-pointer ${filteredProductionMethods.includes(e) ? 'opacity-100' : 'opacity-30'} border border-transparent hover:border-apb-gray hover:bg-white/50 px-1 rounded-md select-none`}
                >
                  <div
                    className="size-2 rounded-md self-center"
                    style={{ backgroundColor: categoryColors[e] }}
                  />
                  <div>{e}</div>
                </div>
              ))}
          </div>
        )}
      </ReactMapGL>
      <div className="absolute top-2 left-2 p-2 bg-apb-gray-light/60 shadow-md text-xs rounded-md flex flex-col gap-1 h-7 overflow-hidden hover:h-fit hover:bg-apb-gray-light/90">
        <b>Map Options</b>
        <div>{`${Object.keys(productSpecies).length} product species on map`}</div>
        <div>
          <Field className="flex items-center gap-1 cursor-pointer">
            <Checkbox
              checked={isClustering}
              onChange={(val) => {
                setIsClustering(!isClustering);
              }}
              defaultChecked
              className="group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-apb-gray focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-apb-gray"
            >
              <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
            </Checkbox>
            <Label
              className={`cursor-pointer select-none ${isClustering ? 'text-black' : 'text-gray-400'}`}
            >
              Cluster Markers
            </Label>
          </Field>
        </div>
        <div>
          <Field className="flex items-center gap-1 cursor-pointer">
            <Checkbox
              checked={showBathymetry}
              onChange={(val) => {
                setShowBathymetry(!showBathymetry);
              }}
              defaultChecked
              className="group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-apb-gray focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-apb-gray"
            >
              <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
            </Checkbox>
            <Label
              className={`cursor-pointer select-none ${showBathymetry ? 'text-black' : 'text-gray-400'}`}
            >
              Show Bathymetry
            </Label>
          </Field>
        </div>
        <div className="w-full flex gap-1">
          Projection:{' '}
          <Switch
            value={projection}
            setValue={setProjection}
            firstOption={{ value: 'globe', title: 'Globe' }}
            secondOption={{ value: 'equalEarth', title: 'Equal Earth' }}
          />
        </div>
        <div className="w-full h-1 border-b border-gray-400"></div>
        <div className="flex gap-1">
          Source:{' '}
          <Switch
            value={mapSource}
            setValue={setMapSource}
            firstOption={{ value: 'EMOD', title: 'Products' }}
            secondOption={{ value: 'GBIF', title: 'Species' }}
          />
        </div>
        <div>
          <Field className="flex items-center gap-1 cursor-pointer">
            <Checkbox
              checked={combineBoth}
              onChange={(val) => {
                setCombineBoth(!combineBoth);
              }}
              className="group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-apb-gray focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-apb-gray"
            >
              <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
            </Checkbox>
            <Label
              className={`cursor-pointer select-none ${combineBoth ? 'text-black' : 'text-gray-400'}`}
            >
              Combine both
            </Label>
          </Field>
        </div>
      </div>
    </div>
  );
}

{
  /* <Layer
                  id="clusters"
                  type="circle"
                  key={`geojson-clusters-${isClustering}`}
                  source="micro-source"
                  filter={['has', 'point_count']}
                  paint={{
                    'circle-color': [
                      'step',
                      ['get', 'point_count'],
                      '#ff6600',
                      100,
                      '#f1f075',
                      750,
                      '#f28cb1',
                    ],
                    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
                    // 'circle-emissive-strength': 1,
                  }}
                />
                <Layer
                  id="cluster-count"
                  key={`geojson-symbol-${isClustering}`}
                  type="symbol"
                  source="micro-source"
                  filter={['has', 'point_count']}
                  layout={{
                    'text-field': ['get', 'point_count_abbreviated'],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                  }}
                /> */
}
