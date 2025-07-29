import 'maplibre-gl/dist/maplibre-gl.css'; // See notes below

import type { MapRef } from '@vis.gl/react-maplibre';
import { Layer, Map, Source } from '@vis.gl/react-maplibre';
import { useEffect, useRef, useState } from 'react';

export default function ProductMap(): JSX.Element {
  const mapRef = useRef<MapRef>(null);
  const [microData, setMicroData] = useState();

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
        zoom: 3,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://api.maptiler.com/maps/01985667-132f-7fdb-9b7a-5e164b9d79f2/style.json?key=JryEbN305oNyHUvClr79"
    >
      <Source
        id="bathymetry-source"
        type="vector"
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
        <Source id="micro-source" data={microData} type="geojson">
          <Layer
            id="geojson-fill"
            type="circle"
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
