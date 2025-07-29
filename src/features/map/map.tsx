import 'maplibre-gl/dist/maplibre-gl.css';

import { forwardRef, useState } from 'react';
import type { MapProps, MapRef } from 'react-map-gl/maplibre';
import { Map, NavigationControl, useMap } from 'react-map-gl/maplibre';

import { useElementDimensions } from '@/lib/use-element-dimensions';
import type { ElementRef } from '@/lib/use-element-ref';
import { useElementRef } from '@/lib/use-element-ref';

export type MapVisProps = Omit<MapProps, 'mapLib'>;

const defaultMapState = {
  mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  viewState: {
    latitude: 50,
    longitude: 12,
    zoom: 3,
  },
};

/**
 * Geo-visualisation.
 */
export const MapVis = forwardRef<MapRef, MapVisProps>(function MapVis(props, ref): JSX.Element {
  const { children } = props;

  const [element, setElement] = useElementRef();

  const [viewState, setViewState] = useState(defaultMapState.viewState);
  const [zoomLevel, setZoomlevel] = useState(viewState.zoom);

  return (
    <div ref={setElement} className="size-full bg-neutral-50">
      <Map
        ref={ref}
        antialias
        minPitch={0}
        maxPitch={85}
        // reuseMaps
        onZoom={(e) => {
          setZoomlevel(e.viewState.zoom);
        }}
        onMove={(e) => {
          setViewState(e.viewState);
        }}
        zoom={zoomLevel}
        scrollZoom={true}
        /* longitude={viewState.longitude}
        latitude={viewState.latitude} */
        initialViewState={defaultMapState.viewState}
        mapStyle={defaultMapState.mapStyle}
      >
        <AutoResize element={element} />
        <NavigationControl />
        {/* <ScaleControl /> */}
        {/*  <div
          key={`zoomLevelNumber`}
          style={{
            position: 'absolute',
            top: 10,
            right: 45,
            backgroundColor: 'white',
            padding: 3,
            width: 40,
            height: '2.2em',
            border: 'solid 1px lightgray',
            borderRadius: '5px',
          }}
        >
          {zoomLevel.toFixed(1)}
        </div> */}
        {children}
      </Map>
    </div>
  );
});

interface AutoResizeProps {
  element: ElementRef<Element> | null;
}

function AutoResize(props: AutoResizeProps): null {
  const { element } = props;

  const { current: mapRef } = useMap();

  useElementDimensions({
    element,
    onChange() {
      mapRef?.resize();
    },
  });

  return null;
}
