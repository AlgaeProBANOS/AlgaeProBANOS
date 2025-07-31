import { Fragment, useEffect, useState } from 'react';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectSpecies,
  setFilteredSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { Species } from '@/api/apb.client';
import { MapPinIcon } from '@heroicons/react/24/solid';

export const getStaticProps = withDictionaries(['common']);

export default function SpeciesList(): JSX.Element {
  const [selectedSpecies, setSelectedSpecies] = useState<Array<Species['id']>>([]);

  const dispatch = useAppDispatch();
  const filteredSpecies = useAppSelector(selectFilteredSpecies) ?? [];
  const species = useAppSelector(selectSpecies);

  useEffect(() => {
    dispatch(setFilters({ type: 'species', cat: 'species', val: selectedSpecies }));
  }, [selectedSpecies]);

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr] size-full p-4">
      <div className="font-bold">{`${Object.keys(filteredSpecies).length} species filtered`}</div>
      <div className="relative">
        <div className="flex flex-col absolute overflow-hidden overflow-y-scroll size-full font-sans">
          {filteredSpecies?.map((spec) => {
            return (
              <div
                className={`${selectedSpecies.includes(spec) ? 'bg-apb-green-light' : 'bg-transparent'} cursor-pointer flex items-center gap-1`}
                key={`species-entry-${spec}`}
                onClick={() => {
                  const oldSelected = [...selectedSpecies];
                  if (oldSelected.includes(spec)) {
                    var index = oldSelected.indexOf(spec);
                    if (index > -1) {
                      oldSelected.splice(index, 1);
                    }
                  } else {
                    oldSelected.push(spec);
                  }
                  setSelectedSpecies(oldSelected);
                }}
              >
                <div className="italic">{spec}</div>
                {species[spec]?.emodnet_points && <MapPinIcon className="size-4 text-apb-gray" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
