import { Species } from '@/api/apb.client';
import { useI18n } from '@/app/i18n/use-i18n';
import { useAppSelector } from '@/app/store';
import { selectFilters, selectSpeciesPhotos } from '@/app/store/apb.slice';
import { algaeColors, applicationCategories } from '../products/utils';
import { useEffect, useMemo, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';

export interface SpeciesDetailsPanelProps {
  species: Species;
  hideSpeciesName?: boolean;
}

export default function SpeciesDetailsPanel(props: SpeciesDetailsPanelProps) {
  const { species, hideSpeciesName = false } = props;
  const applicationFilter = useAppSelector(selectFilters).applications;
  const speciesPhotos = useAppSelector(selectSpeciesPhotos);
  const { t } = useI18n<'common'>();
  const [speciesWithOccurrences, setSpeciesWithOccurrences] = useState(null);

  useEffect(() => {
    fetch('/data/hex_counts.json')
      .then((res) => res.json())
      .then(function (json) {
        const tmp = Object.keys(json).filter(
          (e) => json[e] != null && Object.keys(json[e]).length > 0,
        );
        setSpeciesWithOccurrences(tmp);
      });
  }, []);

  const applicationColors = useMemo(() => {
    return Object.fromEntries(applicationCategories.map((e) => [e.key, e.color]));
  }, [applicationCategories]);

  const speciesKey = species.scientificName.replace(' ', '_');
  return (
    <div className="grid grid-cols-[auto_auto] gap-1.5">
      {!hideSpeciesName && (
        // <div key={`species-title-${speciesKey}`} className="col-span-2 italic font-bold text-sm">
        //   {species.scientificName}
        // </div>
        <span className="flex flex-row items-center gap-1">
          <span className={`italic mr-1`}>
            {species.scientificName}
            {/* {isGenus && !algae.scientificName.trim().endsWith('p.') && <span> spp.</span>} */}
          </span>
          <div className="flex gap-[1px]">
            {species != null &&
              Object.values(algaeColors)
                .filter((col) => species.color.includes(col.value))
                .map((col, i) => {
                  return (
                    <div
                      className="h-3 w-1 shrink-0"
                      key={`color-bar-${i}-${species.species}`}
                      style={{ backgroundColor: col.color }}
                    />
                  );
                })}
          </div>
          {species?.emodnet_points && <MapPinIcon className="size-4 text-apb-gray" />}
          {speciesWithOccurrences != null &&
            speciesWithOccurrences.includes(species.scientificName) && (
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  WebkitClipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)',
                  clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)',
                }}
                className="bg-apb-gray"
              ></div>
            )}
        </span>
      )}
      <div key={`species-commonName-${speciesKey}`} className="col-span-2 text-xs">
        {species.commonName && species.commonName !== 'No common name'
          ? `(${species.commonName})`
          : ''}
      </div>
      {/* <div key={`species-photo-${speciesKey}`} className="col-start-1 w-20 h-full">
        {(speciesPhotos[species.scientificName]?.url ?? false) && (
          <img
            className="w-20 h-full object-cover rounded-sm"
            src={speciesPhotos[species.scientificName]?.url}
          ></img>
        )}
      </div> */}
      <div key={`species-char-${speciesKey}`} className="col-start-1 flex gap-1.5 flex-col text-xs">
        <div className="col-start-1">
          <span className="font-bold">Division: </span>
          {species.division}
        </div>
        <div className="col-start-1">
          <span className="font-bold">Type: </span>
          {species.microMacro}
        </div>
        <div className="col-start-1">
          <span className="font-bold">Water Type: </span>
          {species.waterType}
        </div>
        <div className="col-start-1">
          <span className="font-bold">Location: </span>
          {species.geographicPosition}
        </div>
        <div className="col-start-1">
          <span className="font-bold">Habitat: </span>
          {species.habitat}
        </div>
        <div className="col-start-1">
          <span className="font-bold">Invasive: </span>
          {species.invasive}
        </div>
      </div>
      {applicationFilter && (
        <div
          key={`species-apps-${speciesKey}`}
          className="col-start-2 row-start-3 flex gap-1.5 flex-col text-xs"
        >
          {applicationFilter
            .filter((e) => species.applications[e] != null)
            .map((e, i) => {
              return (
                <div key={`appl-${speciesKey}-${i}`}>
                  <span
                    className="font-bold px-1 rounded-sm ml-[-4px]"
                    style={{ backgroundColor: `${applicationColors[e]}33` }}
                  >
                    {t(['common', 'products', e])}:
                  </span>{' '}
                  {species.applications[e]}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
