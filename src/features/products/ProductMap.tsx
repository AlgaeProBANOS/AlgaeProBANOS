import 'maplibre-gl/dist/maplibre-gl.css'; // See notes below

import type { MapRef } from '@vis.gl/react-maplibre';
import { Layer, Map, Source } from '@vis.gl/react-maplibre';
import { useEffect, useRef, useState } from 'react';

export default function ProductMap(): JSX.Element {
  const mapRef = useRef<MapRef>(null);
  const [microData, setMicroData] = useState();
  const [isClustering, setIsClustering] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mapRef.current) {
        console.log(mapRef.current.getLayer('geojson-fill'));
        clearInterval(interval);
        mapRef.current.getMap().setPaintProperty('Water', 'fill-color', '#f0fbff');
      }
    }, 500);

    fetch('/data/Microalgae.json')
      .then((res) => res.json())
      .then((json) => {
        setMicroData(json);
      })
      .catch((err) => console.error('Failed to load GeoJSON:', err));
  }, []);

  console.log('microData', microData);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: 15,
        latitude: 54,
        zoom: 4,
      }}
      minZoom={4}
      maxZoom={20}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://api.maptiler.com/maps/01985667-132f-7fdb-9b7a-5e164b9d79f2/style.json?key=JryEbN305oNyHUvClr79"
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
              '#002b4f', // deeper than -6000
              -6000,
              '#003f6b',
              -4000,
              '#005c85',
              -2000,
              '#007acc',
              -1000,
              '#3399ff',
              -500,
              '#66bfff',
              -300,
              '#80d4ff',
              -200,
              '#99e0ff',
              -150,
              '#b3ecff',
              -100,
              '#ccefff',
              -50,
              '#e6f7ff',
              -20,
              '#f0fbff',
              0,
              '#ffffff', // land or 0m sea level
            ],
          }}
          beforeId="Aeroway"
        />
      </Source>
      {microData && (
        <Source
          id="micro-source"
          data={microData}
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
                    '#51bbd6',
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
    </Map>
  );
}
