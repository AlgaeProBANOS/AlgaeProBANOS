// import 'maplibre-gl/dist/maplibre-gl.css'; // See notes below

import { Species } from '@/api/apb.client';
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
// import type { MapRef } from '@vis.gl/react-maplibre';
// import { Layer, Map, Source } from '@vis.gl/react-maplibre';
import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTooltipState } from '../common/tooltip/tooltip-provider';
import { CountryLayer } from './CountryLayer';
import { MapDataSourceSwitch } from './MapDataSourceSwitch';

import ReactMapGL, { Layer, Marker, NavigationControl, ScaleControl, Source } from 'react-map-gl';

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

interface ProductMapProps {
  focusSpecies?: [Species['id']];
}

const setupHexagonJSON = (
  resolution: number,
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
  return [
    {
      type: 'FeatureCollection',
      features: geoJsonHexas,
    },
    colors,
  ];
};

export default function TestMap(props: ProductMapProps): JSX.Element {
  const mapRef = useRef(null);
  const { focusSpecies = [] } = props;
  const dispatch = useAppDispatch();
  const [isClustering, setIsClustering] = useState(true);
  const countryFilters = useAppSelector(selectFilters).countries ?? {};
  const mapDataMode = useAppSelector(selectProductMapMode);
  const [hexagonGeoJsonOriginal3, setHexagonGeoJsonOriginal3] = useState();
  const [hexagonGeoJsonOriginal4, setHexagonGeoJsonOriginal4] = useState();
  const [hexCounts3, setHexCounts3] = useState();
  const [hexCounts4, setHexCounts4] = useState();
  const { updateTooltip } = useTooltipState();
  const [hexResolution, setHexResolution] = useState<number>(3);

  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);

  useEffect(() => {
    // fetch('/data/hexagon_2_Project.json')
    fetch('/data/hexas_3.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexagonGeoJsonOriginal3(json);
      });

    fetch('/data/hexas_4.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexagonGeoJsonOriginal4(json);
      });

    fetch('/data/hex_counts_3.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexCounts3(json);
      });

    fetch('/data/hex_counts_4.json')
      .then((res) => res.json())
      .then(function (json) {
        setHexCounts4(json);
      });
  }, []);

  const speciesFilter = useAppSelector(selectFilters).species;
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
  }, [filteredSpecies, speciesFilter, focusSpecies]);

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

  const [hexagonGeoJson3, colors3] = useMemo(() => {
    if (hexCounts3 && hexagonGeoJsonOriginal3)
      return setupHexagonJSON(3, hexCounts3, hexagonGeoJsonOriginal3, filteredAndSelectedSpecies);
    else return [null, null];
  }, [hexagonGeoJsonOriginal3, hexCounts3, filteredAndSelectedSpecies]);

  const [hexagonGeoJson4, colors4] = useMemo(() => {
    if (hexCounts4 && hexagonGeoJsonOriginal4)
      return setupHexagonJSON(4, hexCounts4, hexagonGeoJsonOriginal4, filteredAndSelectedSpecies);
    else return [null, null];
  }, [hexagonGeoJsonOriginal4, hexCounts4, filteredAndSelectedSpecies]);

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
      const hexagonGeoJson = hexResolution === 3 ? hexagonGeoJson3 : hexagonGeoJson4;
      if (hexagonGeoJson != null) {
        const bounds = getBoundsForHexagons(hexagonGeoJson.features);
        if (bounds != null) {
          mapRef.current?.fitBounds(bounds);
        }
      }
    }
  }, [filteredSpecies, mapDataMode, hexagonGeoJson3, hexagonGeoJson4]);

  if (mapMarkers.length === 0 && hexagonGeoJson3 != null && hexagonGeoJson3.features.length === 0) {
    return <div>No Map!</div>;
  }

  return (
    <div className="size-full relative">
      <ReactMapGL
        ref={mapRef}
        mapboxAccessToken="pk.eyJ1IjoiamFrb2JrdXNuaWNrIiwiYSI6ImNsYTAzYjQ2NjBrdnQzcWx0d2EyajFzbHQifQ.LQN-NvTn6PbHEbXHJO0CTw"
        // mapStyle="mapbox://styles/mapbox/light-v11?optimize=true"
        mapStyle="https://api.maptiler.com/maps/019864da-bd1a-77a6-8cb4-b2fb2323302f/style.json?key=JryEbN305oNyHUvClr79"
        initialViewState={{
          longitude: 0,
          latitude: 0,
          zoom: 1,
        }}
        projection="mercator"
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        {mapDataMode === 'GBIF' && hexagonGeoJson3 != null && (
          <Source type="geojson" id="hexagonsource3" data={hexagonGeoJson3}>
            <Layer
              beforeId="waterway"
              // beforeId="state-label"
              {...{
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
                      ['get', 'occCount'],
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
      </ReactMapGL>
      <div className="absolute top-3 right-3 p-2 bg-apb-gray-light shadow-md rounded-md flex flex-col gap-1 text-sm">
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
    </div>
  );
}
