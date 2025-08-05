import 'maplibre-gl/dist/maplibre-gl.css'; // See notes below

import type { MapRef } from '@vis.gl/react-maplibre';
import { Layer, Map, Source } from '@vis.gl/react-maplibre';
import { useEffect, useMemo, useRef, useState } from 'react';
import { selectFilteredSpecies, selectFilters, selectSpecies } from '@/app/store/apb.slice';
import { useAppSelector } from '@/app/store';
import { Marker } from 'maplibre-gl';
import { Checkbox, Field, Label } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';

export default function ProductMap(): JSX.Element {
  const mapRef = useRef<MapRef>(null);
  const [isClustering, setIsClustering] = useState(true);

  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);

  const speciesFilter = useAppSelector(selectFilters).species;
  const filteredAndSelectedSpecies =
    filteredSpecies != null
      ? filteredSpecies.filter((item) =>
          speciesFilter != null && speciesFilter.length > 0 ? speciesFilter.includes(item) : true,
        )
      : Object.keys(species);

  const productSpecies = filteredAndSelectedSpecies.filter((key) => {
    return species[key]!.emodnet_points != null;
  });

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

  const [showBathymetry, setShowBathymetry] = useState(true);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current
        .getMap()
        .setLayoutProperty('bathymetry-layer', 'visibility', showBathymetry ? 'visible' : 'none');
    }
  }, [showBathymetry]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: 15,
        latitude: 54,
        zoom: 4,
      }}
      minZoom={0}
      maxZoom={20}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      mapStyle="https://api.maptiler.com/maps/019864da-bd1a-77a6-8cb4-b2fb2323302f/style.json?key=JryEbN305oNyHUvClr79"
      onLoad={() => {
        console.log('----- Map and Layers loaded! ----- ');
        if (mapRef.current) {
          mapRef.current.getMap().setPaintProperty('Water', 'fill-color', '#f0fbff');
        }
      }}
    >
      <Source
        id="bathymetry-source"
        type="vector"
        bounds={[-26.942848249874004, 31.43581990686755, 65.1077179732153, 73.33119246537285]}
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
      <div className="absolute top-3 right-3 p-2 bg-apb-gray-light shadow-md rounded-md flex flex-col">
        <b>Map Options</b>
        <div>{`${Object.keys(productSpecies).length} product species on map`}</div>
        <div className="w-full h-1 border-b border-gray-400 mb-1"></div>
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
      </div>
    </Map>
  );
}
