import { Fragment, useEffect, useMemo, useState } from 'react';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  setFilteredSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { Species } from '@/api/apb.client';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { algaeColors } from './utils';
import { useTooltipState } from '../common/tooltip/tooltip-provider';
import { useI18n } from '@/app/i18n/use-i18n';

export const getStaticProps = withDictionaries(['common']);

export default function SpeciesList(): JSX.Element {
  const [selectedSpecies, setSelectedSpecies] = useState<Array<Species['id']>>([]);
  const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();
  const filteredSpecies = useAppSelector(selectFilteredSpecies) ?? [];
  const species = useAppSelector(selectSpecies);
  const { updateTooltip } = useTooltipState();
  const applicationFilter = useAppSelector(selectFilters).applications ?? [];

  // useEffect(() => {
  //   dispatch(setFilters({ type: 'species', cat: 'species', val: selectedSpecies }));
  // }, [selectedSpecies]);

  const groupedGenusSpecies = useMemo(() => {
    const genusSpecies: Record<Species['genus'], Array<Species>> = {};

    for (const spec of filteredSpecies) {
      const specObj = species[spec] as Species;
      if (genusSpecies[specObj.genus] != null) {
        genusSpecies[specObj.genus]?.push(specObj);
      } else {
        genusSpecies[specObj.genus] = [specObj];
      }
    }
    return genusSpecies;
  }, [filteredSpecies]);

  const sortedGenusKeys = Object.keys(groupedGenusSpecies).sort();

  const sortedFilteredSpecies = [...filteredSpecies].sort((a, b) => {
    const speciesA = species[a] as Species;
    const speciesB = species[b] as Species;
    if (speciesA.genus === speciesB.genus) {
      if (speciesB.species === '') {
        return 1;
      } else {
        return -1;
      }
    } else {
      return a.localeCompare(b);
    }
  });

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr] size-full p-4">
      <div className="font-bold">{`${Object.keys(filteredSpecies).length} species filtered`}</div>
      <div className="relative">
        <div className="flex flex-col absolute overflow-hidden overflow-y-scroll size-full font-sans">
          {sortedFilteredSpecies?.map((spec) => {
            const algae = species[spec] as Species;
            const selected = selectedSpecies != null ? selectedSpecies.includes(spec) : false;
            return (
              <div
                className={`${selected ? 'bg-gray-200' : 'bg-transparent'} cursor-pointer grid items-center gap-1 p-1 border-apb-gray-light border-b hover:bg-gray-200`}
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
                <div className="grid grid-cols-[15px_auto] items-center w-full">
                  <div className="flex gap-[1px]">
                    {Object.values(algaeColors)
                      .filter((col) => algae.color.includes(col.value))
                      .map((col, i) => {
                        return (
                          <div
                            className="h-3 w-1 shrink-0"
                            key={`color-bar-${i}-${algae.species}`}
                            style={{ backgroundColor: col.color }}
                          />
                        );
                      })}
                  </div>
                  <div className="flex gap-1 items-center">
                    {algae.scientificName != '' ? (
                      algae.species != '' ? (
                        <span className="italic">{algae.scientificName}</span>
                      ) : (
                        <span className="italic font-bold">{`${algae.genus} spp.`}</span>
                      )
                    ) : (
                      'Unknown species'
                    )}
                    {species[spec]?.emodnet_points && (
                      <MapPinIcon className="size-4 text-apb-gray" />
                    )}
                  </div>
                  {selected && (
                    <div className="col-start-2 grid grid-cols-2 gap-1 w-full">
                      <div className="col-span-2">
                        {algae.commonName && algae.commonName !== 'No common name'
                          ? `(${algae.commonName})`
                          : ''}
                      </div>
                      <div className="col-start-1">
                        <span className="font-bold">Division: </span>
                        {algae.division}
                        <div className="col-start-1">
                          <span className="font-bold">Type: </span>
                          {algae.microMacro}
                        </div>
                        <div className="col-start-1">
                          <span className="font-bold">Water Type: </span>
                          {algae.waterType}
                        </div>
                        <div className="col-start-1">
                          <span className="font-bold">Location: </span>
                          {algae.geographicPosition}
                        </div>
                        <div className="col-start-1">
                          <span className="font-bold">Habitat: </span>
                          {algae.habitat}
                        </div>
                        <div className="col-start-1">
                          <span className="font-bold">Invasive: </span>
                          {algae.invasive}
                        </div>
                      </div>
                      <div className="col-start-2 row-start-2">
                        {applicationFilter.map((e, i) => {
                          if (algae.applications[e] != null) {
                            return (
                              <div>
                                <span className="font-bold">{t(['common', 'products', e])}: </span>
                                {algae.applications[e]}
                              </div>
                            );
                          } else {
                            return <></>;
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
