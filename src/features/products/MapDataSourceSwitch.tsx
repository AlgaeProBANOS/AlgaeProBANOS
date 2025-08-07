import { useState } from 'react';

export type MapDataSourceType = 'EMOD' | 'GBIF';

export function MapDataSourceSwitch() {
  const [mapSource, setMapSource] = useState<MapDataSourceType>('EMOD');

  return (
    <div
      className="flex cursor-pointer rounded-md w-min overflow-hidden"
      onClick={() => {
        if (mapSource === 'EMOD') {
          setMapSource('GBIF');
        } else {
          setMapSource('EMOD');
        }
      }}
    >
      <div
        className="px-1 py-[1px] transition-colors duration-500"
        style={{
          backgroundColor: mapSource === 'EMOD' ? 'black' : 'white',
          color: mapSource === 'EMOD' ? 'white' : 'black',
        }}
      >
        EMOD
      </div>
      <div
        className="px-1 py-[1px] transition-colors duration-500"
        style={{
          backgroundColor: mapSource === 'GBIF' ? 'black' : 'white',
          color: mapSource === 'GBIF' ? 'white' : 'black',
        }}
      >
        GBIF
      </div>
    </div>
  );
}
