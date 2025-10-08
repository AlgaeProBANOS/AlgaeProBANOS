import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { EmptySpecies, Species } from '@/api/apb.client';
import { useI18n } from '@/app/i18n/use-i18n';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  selectSpeciesPhotos,
  setFilters,
} from '@/app/store/apb.slice';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { useTooltipState } from '../common/tooltip/tooltip-provider';
import { algaeColors, applicationCategories } from './utils';

export const getStaticProps = withDictionaries(['common']);

export default function SpeciesList(): JSX.Element {
  const [selectedSpecies, setSelectedSpecies] = useState<Species>(null);
  const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();
  const filteredSpecies = useAppSelector(selectFilteredSpecies) ?? [];
  const filters = useAppSelector(selectFilters);
  const species = useAppSelector(selectSpecies);
  const { updateTooltip } = useTooltipState();
  const applicationFilter = useAppSelector(selectFilters).applications ?? [];
  const speciesPhotos = useAppSelector(selectSpeciesPhotos);

  const applicationColors = useMemo(() => {
    return Object.fromEntries(applicationCategories.map((e) => [e.key, e.color]));
  }, [applicationCategories]);

  useEffect(() => {
    dispatch(setFilters({ type: 'species', cat: 'genus', val: selectedSpecies?.genus ?? null }));
    dispatch(
      setFilters({ type: 'species', cat: 'species', val: selectedSpecies?.species ?? null }),
    );
    dispatch(
      setFilters({ type: 'species', cat: 'type', val: selectedSpecies?.microMacro ?? null }),
    );
  }, [selectedSpecies]);

  useEffect(() => {}, [filters.name]);

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

  // useEffect(()=>{
  //   if(Object.keys(selectSpecies).length === 1) {
  //     setSelectedSpecies();
  //   }
  // }, [selectedSpecies])

  const genEntryDetailPanel = useCallback(
    (algae: Species) => {
      const speciesKey = algae.scientificName.replace(' ', '_');
      return (
        <div className="grid grid-cols-[min-content_auto auto] gap-1.5 w-[40vw]">
          <div key={`species-title-${speciesKey}`} className="col-span-3 italic font-bold">
            {algae.scientificName}
          </div>
          <div key={`species-commonName-${speciesKey}`} className="col-span-3">
            {algae.commonName && algae.commonName !== 'No common name'
              ? `(${algae.commonName})`
              : ''}
          </div>
          <div key={`species-photo-${speciesKey}`} className="col-start-1 w-20 h-full">
            {(speciesPhotos[algae.scientificName]?.url ?? false) && (
              <img
                className="w-20 h-full object-cover rounded-sm"
                src={speciesPhotos[algae.scientificName]?.url}
              ></img>
            )}
          </div>
          <div key={`species-char-${speciesKey}`} className="col-start-2 flex gap-1.5 flex-col">
            <div className="col-start-2">
              <span className="font-bold">Division: </span>
              {algae.division}
            </div>
            <div className="col-start-2">
              <span className="font-bold">Type: </span>
              {algae.microMacro}
            </div>
            <div className="col-start-2">
              <span className="font-bold">Water Type: </span>
              {algae.waterType}
            </div>
            <div className="col-start-2">
              <span className="font-bold">Location: </span>
              {algae.geographicPosition}
            </div>
            <div className="col-start-2">
              <span className="font-bold">Habitat: </span>
              {algae.habitat}
            </div>
            <div className="col-start-2">
              <span className="font-bold">Invasive: </span>
              {algae.invasive}
            </div>
          </div>
          <div
            key={`species-apps-${speciesKey}`}
            className="col-start-3 row-start-3 flex gap-1.5 flex-col"
          >
            {applicationFilter
              .filter((e) => algae.applications[e] != null)
              .map((e, i) => {
                return (
                  <div key={`appl-${speciesKey}-${i}`}>
                    <span
                      className="font-bold px-1 rounded-sm ml-[-4px]"
                      style={{ backgroundColor: `${applicationColors[e]}33` }}
                    >
                      {t(['common', 'products', e])}:
                    </span>{' '}
                    {algae.applications[e]}
                  </div>
                );
              })}
          </div>
        </div>
      );
    },
    [speciesPhotos],
  );

  const sortedGenusKeys = Object.keys(groupedGenusSpecies).sort();

  const genListEntry = useCallback(
    (algae: Species, selected: boolean, selectedSpecies, isGenus) => {
      return (
        <div
          className={`${selected ? 'bg-gray-200' : 'bg-transparent'} ${isGenus ? '' : 'pl-5'} cursor-pointer grid grid-cols-[20px_auto] py-[1px] items-center w-full border-apb-gray-light border-t hover:bg-gray-200`}
          key={`species-entry-${algae.scientificName.replaceAll(' ', '_')}`}
          onClick={() => {
            setSelectedSpecies(algae);
          }}
          onMouseOver={() => {
            updateTooltip(<div>{genEntryDetailPanel(algae)}</div>);
          }}
          /* onMouseLeave={() => {
            updateTooltip(null);
          }} */
        >
          <div className="flex gap-[1px]">
            {algae != null &&
              Object.values(algaeColors)
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
          <div className="flex gap-1 flex-row w-full items-center justify-between">
            <span className="flex flex-row items-center gap-1">
              <span className={`italic ${isGenus ? 'font-bold' : ''}`}>
                {algae.scientificName}
                {isGenus && !algae.scientificName.trim().endsWith('p.') && <span> spp.</span>}
              </span>
              {algae?.emodnet_points && <MapPinIcon className="size-4 text-apb-gray" />}
            </span>
            <span className="p-1">
              {selected && (
                <a
                  className="border rounded-md border-apb-gray text-sm px-0.5 hover:bg-apb-gray hover:text-white"
                  href={`/species/${algae.scientificName}`}
                >
                  Read More
                </a>
              )}
            </span>
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
                      <div key={`appl-${i}`}>
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
      );
    },
    [algaeColors],
  );

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr] size-full p-4">
      <div className="font-bold">{`${Object.keys(filteredSpecies).length} species filtered`}</div>
      <div className="relative">
        <div className="flex flex-col absolute overflow-hidden overflow-y-scroll size-full font-sans">
          <>
            {sortedGenusKeys.map((genusKey, i) => {
              const genus = groupedGenusSpecies[genusKey];
              const onlyGenus = genus?.find((e) => e.species == null);
              const selected = false;

              return (
                <Fragment key={`speciesListEntry-${i}`}>
                  <div
                    className={`${selected ? 'bg-gray-200' : 'bg-transparent'} cursor-pointer flex items-center gap-1 p-1  hover:bg-gray-200`}
                    key={`species-entry-${genusKey}`}
                  >
                    {genListEntry(
                      onlyGenus != null
                        ? onlyGenus
                        : {
                            ...EmptySpecies,
                            id: genusKey,
                            scientificName: genusKey,
                            genus: genusKey,
                            color:
                              groupedGenusSpecies[genusKey]?.map((e) => e.color).join(',') ?? '',
                          },
                      selected,
                      selectedSpecies,
                      true,
                    )}
                  </div>
                  {genus != null &&
                    genus
                      .filter((e) => e.species != null)
                      .map((algae) => {
                        return genListEntry(
                          algae,
                          selectedSpecies != null &&
                            algae.scientificName === selectedSpecies.scientificName &&
                            Object.keys(filteredSpecies).length === 1,
                          selectedSpecies,
                          false,
                        );
                      })}
                </Fragment>
              );
            })}
          </>
        </div>
      </div>
    </div>
  );
}
