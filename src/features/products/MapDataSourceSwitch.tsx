import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectProductMapMode, setProductMapMode } from '@/app/store/apb.slice';
import { useEffect, useState } from 'react';

export type MapDataSourceType = 'EMOD' | 'GBIF';

export function MapDataSourceSwitch() {
  const productMapMode = useAppSelector(selectProductMapMode);
  const [mapSource, setMapSource] = useState<MapDataSourceType>(productMapMode);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setProductMapMode(mapSource));
  }, [mapSource]);

  return (
    <div
      className="flex cursor-pointer rounded-md w-min overflow-hidden select-none"
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
        Products
      </div>
      <div
        className="px-1 py-[1px] transition-colors duration-500"
        style={{
          backgroundColor: mapSource === 'GBIF' ? 'black' : 'white',
          color: mapSource === 'GBIF' ? 'white' : 'black',
        }}
      >
        Species
      </div>
    </div>
  );
}
