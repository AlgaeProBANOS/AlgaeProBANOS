import { Species } from '@/api/apb.client';
import { useI18n } from '@/app/i18n/use-i18n';
import { useAppSelector } from '@/app/store';
import { selectFilters, selectSpeciesPhotos } from '@/app/store/apb.slice';
import { applicationCategories } from '../products/utils';
import { useMemo } from 'react';

export interface SpeciesDetailsPanelProps {
  species: Species;
}

export default function SpeciesDetailsPanel(props: SpeciesDetailsPanelProps) {
  const { species } = props;
  const applicationFilter = useAppSelector(selectFilters).applications;
  const speciesPhotos = useAppSelector(selectSpeciesPhotos);
  const { t } = useI18n<'common'>();

  const applicationColors = useMemo(() => {
    return Object.fromEntries(applicationCategories.map((e) => [e.key, e.color]));
  }, [applicationCategories]);

  const speciesKey = species.scientificName.replace(' ', '_');
  return (
    <div className="grid grid-cols-[min-content_auto auto] gap-1.5 w-[40vw] max-w-[800px]">
      <div key={`species-title-${speciesKey}`} className="col-span-3 italic font-bold">
        {species.scientificName}
      </div>
      <div key={`species-commonName-${speciesKey}`} className="col-span-3">
        {species.commonName && species.commonName !== 'No common name'
          ? `(${species.commonName})`
          : ''}
      </div>
      <div key={`species-photo-${speciesKey}`} className="col-start-1 w-20 h-full">
        {(speciesPhotos[species.scientificName]?.url ?? false) && (
          <img
            className="w-20 h-full object-cover rounded-sm"
            src={speciesPhotos[species.scientificName]?.url}
          ></img>
        )}
      </div>
      <div key={`species-char-${speciesKey}`} className="col-start-2 flex gap-1.5 flex-col">
        <div className="col-start-2">
          <span className="font-bold">Division: </span>
          {species.division}
        </div>
        <div className="col-start-2">
          <span className="font-bold">Type: </span>
          {species.microMacro}
        </div>
        <div className="col-start-2">
          <span className="font-bold">Water Type: </span>
          {species.waterType}
        </div>
        <div className="col-start-2">
          <span className="font-bold">Location: </span>
          {species.geographicPosition}
        </div>
        <div className="col-start-2">
          <span className="font-bold">Habitat: </span>
          {species.habitat}
        </div>
        <div className="col-start-2">
          <span className="font-bold">Invasive: </span>
          {species.invasive}
        </div>
      </div>
      {applicationFilter && (
        <div
          key={`species-apps-${speciesKey}`}
          className="col-start-3 row-start-3 flex gap-1.5 flex-col"
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
