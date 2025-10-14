import 'maplibre-gl/dist/maplibre-gl.css'; // See notes below

import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  Country,
  selectFilteredSpecies,
  selectFilters,
  selectProductMapMode,
  selectSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { Checkbox, Field, Label } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';
import type { MapRef } from '@vis.gl/react-maplibre';
import { Layer, Map, Source } from '@vis.gl/react-maplibre';
import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CountryLayer } from './CountryLayer';
import { MapDataSourceSwitch } from './MapDataSourceSwitch';
import { useTooltipState } from '../common/tooltip/tooltip-provider';
import mapboxgl from 'mapbox-gl';

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
  const pointsLong = points
    .filter((point) => point.geometry.coordinates != null)
    .map((point) => point.geometry.coordinates[0][0][0]);
  const pointsLat = points
    .filter((point) => point.geometry.coordinates != null)
    .map((point) => {
      return point.geometry.coordinates[0][0][1];
    });

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

export default function ProductMap(): JSX.Element {
  const mapRef = useRef<MapRef>(null);
  const dispatch = useAppDispatch();
  const [isClustering, setIsClustering] = useState(true);
  const countryFilters = useAppSelector(selectFilters).countries ?? {};
  const mapDataMode = useAppSelector(selectProductMapMode);
  const [hexagonGeoJsonOriginal, setHexagonGeoJsonOriginal] = useState();
  const [hexCounts, setHexCounts] = useState();
  const { updateTooltip } = useTooltipState();

  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);

  useEffect(() => {
    fetch('/data/hexagon_2_Project.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexagonGeoJsonOriginal(json);
      });

    fetch('/data/hex_counts.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexCounts(json);
      });
  }, []);

  const speciesFilter = useAppSelector(selectFilters).species;
  const filteredAndSelectedSpecies = useMemo(() => {
    return filteredSpecies != null
      ? filteredSpecies.filter((item) =>
          speciesFilter != null && speciesFilter.length > 0 ? speciesFilter.includes(item) : true,
        )
      : Object.keys(species);
  }, [filteredSpecies, speciesFilter]);

  const productSpecies = useMemo(() => {
    return filteredAndSelectedSpecies.filter((key) => {
      return species[key]!.emodnet_points != null;
    });
  }, [filteredAndSelectedSpecies]);

  const mapMarkers = useMemo(() => {
    const markers = [];
    for (const speciesName of productSpecies) {
      const spec = species[speciesName];
      for (const dot of spec.emodnet_points) {
        const newMarker = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [dot.coordinates[1], dot.coordinates[0]],
          },
        };
        markers.push(newMarker);
      }
    }

    return markers;
  }, [productSpecies]);

  const [hexagonGeoJson, colors] = useMemo(() => {
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
    const vals = Object.values(hexSums);
    const hexSumMax = Math.max(...vals);

    // Create a linear scale from 0 → 1
    const colorScale = d3.scaleLinear().domain([0, hexSumMax]).range(['#fcfbfd', '#3f007d']);

    // Generate 10 evenly spaced colors
    const colors = Array.from({ length: 10 }, (_, i) => [
      Math.max(Math.floor((i / 9) * hexSumMax), 1),
      colorScale(Math.floor((i / 9) * hexSumMax)),
    ]);

    const geoJsonHexas = [];

    if (hexagonGeoJsonOriginal != null) {
      for (const hexa of hexagonGeoJsonOriginal.features) {
        if (hexSums[hexa.properties.HexagonID] > 0) {
          let tmpHexagon = {
            ...hexa,
            properties: {
              ...hexa.properties,
              occCount: hexSums[hexa.properties.HexagonID],
              speciesCount: hexSpecies[hexa.properties.HexagonID].length,
            },
          };

          const innerBounds = getBoundsForHexagons([tmpHexagon]).flat();

          if (boundsWithin(innerBounds, outerMapBounds)) {
            geoJsonHexas.push(tmpHexagon);
          }
        }
      }
    }
    return [
      {
        type: 'FeatureCollection',
        features: geoJsonHexas,
      },
      colors,
    ];
  }, [filteredAndSelectedSpecies, hexCounts, hexagonGeoJsonOriginal]);

  const [showBathymetry, setShowBathymetry] = useState(true);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current
        .getMap()
        .setLayoutProperty('bathymetry-layer', 'visibility', showBathymetry ? 'visible' : 'none');
    }
  }, [showBathymetry]);

  useEffect(() => {
    if (mapDataMode === 'EMOD') {
      const bounds = getBoundsForPoints(mapMarkers);
      if (bounds != null) {
        mapRef.current?.fitBounds(bounds);
      }
    } else {
      const bounds = getBoundsForHexagons(hexagonGeoJson.features);
      if (bounds != null) {
        mapRef.current?.fitBounds(bounds);
      }
    }
  }, [filteredSpecies, mapDataMode]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: 8,
        latitude: 54,
        zoom: 3,
      }}
      minZoom={0}
      maxZoom={20}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      mapStyle="https://api.maptiler.com/maps/019864da-bd1a-77a6-8cb4-b2fb2323302f/style.json?key=JryEbN305oNyHUvClr79"
      onLoad={() => {
        // console.log('----- Map and Layers loaded! ----- ', mapRef.current?.getStyle().layers);
        if (mapRef.current) {
          mapRef.current.getMap().setPaintProperty('Water', 'fill-color', '#f0fbff');
        }
      }}
      onClick={(e) => {
        console.log(e.features);

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
      interactiveLayerIds={['country-fill', 'hexagons']}
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
          beforeId="waterway"
        />
      </Source>
      <CountryLayer />
      {mapDataMode === 'GBIF' && hexagonGeoJson != null && (
        <Source type="geojson" id="hexagonsource" data={hexagonGeoJson}>
          <Layer
            beforeId="waterway"
            {...{
              // beforeId: 'state-label',
              id: 'hexagons',
              source: 'hexagonsource',
              ...{
                paint: {
                  'fill-color': ['interpolate', ['linear'], ['get', 'occCount'], ...colors.flat()],
                  'fill-opacity': 0.8,
                  'fill-outline-color': 'transparent',
                },
                type: 'fill',
              },
            }}
          />
        </Source>
      )}
      <Source id="bbox-rect" type="geojson" data={rectangle}>
        <Layer {...lineStyle} />
      </Source>
      {mapDataMode === 'EMOD' && (
        <Source
          id="micro-source"
          data={{
            type: 'FeatureCollection',
            features: mapMarkers,
          }}
          type="geojson"
          generateId={true}
          cluster={isClustering ? true : false}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {isClustering && (
            <>
              <Layer
                id="clusters"
                type="circle"
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
                type="symbol"
                source="micro-source"
                filter={['has', 'point_count']}
                layout={{
                  'text-field': ['get', 'point_count_abbreviated'],
                  'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                  'text-size': 12,
                }}
              />
            </>
          )}
          <Layer
            id="geojson-fill"
            key={`geojson-fill-${isClustering}`}
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-radius': 6,
              'circle-color': '#ff6600',
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
            }}
            source="micro-source"
          />
        </Source>
      )}
      {mapDataMode === 'GBIF' && (
        <div className="absolute bottom-3 right-3 p-1 bg-apb-gray-light shadow-md rounded-md grid grid-cols-10 grid-rows-2 h-7 w-1/2">
          {colors.map((e, i) => (
            <>
              <div
                key={`legend-entry-${i}`}
                style={{ backgroundColor: e[1] }}
                className="row-start-1 rounded"
                onMouseEnter={(event) => {
                  updateTooltip(<div className="p-1 size-2">{e[0]}</div>);
                }}
                onMouseLeave={(event) => {
                  updateTooltip(null);
                }}
              ></div>
              <div
                key={`legend-entry-number-${i}`}
                className="row-start-2 text-xs items-start justify-center flex"
                onMouseEnter={(event) => {
                  updateTooltip(<div className="p-1 size-2">{e[0]}</div>);
                }}
                onMouseLeave={(event) => {
                  updateTooltip(null);
                }}
              >
                {e[0]}
              </div>
            </>
          ))}
        </div>
      )}
      <div className="absolute top-3 right-3 p-2 bg-apb-gray-light shadow-md rounded-md flex flex-col gap-1">
        <b>Map Options</b>
        <div>{`${Object.keys(productSpecies).length} product species on map`}</div>
        <div className="w-full h-1 border-b border-gray-400"></div>
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
        <div className="flex gap-1">
          Source: <MapDataSourceSwitch />
        </div>
      </div>
    </Map>
  );
}
