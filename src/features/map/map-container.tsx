import type { JSX } from 'react/jsx-runtime';

import { MapVis as Map } from './map';

/* interface MapContainerProps {
  type: 'map';
} */

export default function MapContainer(/* props: MapContainerProps */): JSX.Element {
  /* const { type } = props; */

  return (
    <div className={'size-full bg-memorise-blue-300'}>
      <Map></Map>
    </div>
  );
}
