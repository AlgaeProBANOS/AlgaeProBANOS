import { Fragment, useEffect } from 'react';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import ProductFilter from '@/features/products/ProductFilter';
import ProductMap from '@/features/products/ProductMap';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectFilters, selectSpecies, setFilteredSpecies } from '@/app/store/apb.slice';
import { filter } from 'd3';
import SpeciesList from '@/features/products/SpeciesList';

export const getStaticProps = withDictionaries(['common']);

export default function ProductPage(): JSX.Element {
  // const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();

  const species = useAppSelector(selectSpecies);
  const filters = useAppSelector(selectFilters);
  const colorFilter = filters?.colors;
  const colorFilteredSpecies = Object.keys(species).filter((key) => {
    let hit = false;
    if (colorFilter) {
      for (const col of Object.keys(colorFilter)) {
        if (colorFilter[col] === true) {
          hit = species[key]?.color.includes(col) as boolean;
          if (hit) {
            return hit;
          }
        }
      }
    }
    return hit;
  });

  const nameFilter = filters?.name;
  const nameFilteredSpecies = Object.keys(species).filter((key) => {
    let hit = true;
    if (nameFilter) {
      return species[key]?.species.includes(nameFilter) as boolean;
    }
    return hit;
  });

  const colorAndNameFilteredSpecies = colorFilteredSpecies.filter((item) =>
    nameFilteredSpecies.includes(item),
  );

  const applicationFilter = filters?.applications;
  console.log('applicationFilter', applicationFilter);
  const includeNonApplications = filters.includeNonApplications;

  const applicationFilteredSpecies = Object.keys(species).filter((key) => {
    let hit = true;
    const speciesApplications = Object.keys(species[key]?.applications).filter(
      (k) => species[key]?.applications[k] != null,
    );

    if (applicationFilter && includeNonApplications === false) {
      hit = applicationFilter.some((a) =>
        speciesApplications.length > 0 ? speciesApplications.includes(a) : true,
      );
    }
    return hit;
  });

  const filteredSpecies = colorAndNameFilteredSpecies.filter((item) =>
    applicationFilteredSpecies.includes(item),
  );

  useEffect(() => {
    dispatch(setFilteredSpecies(filteredSpecies));
  }, [filteredSpecies]);

  return (
    <Fragment>
      <div className="grid h-full grid-cols-[3fr_1fr] grid-rows-1">
        <ProductMap />
        <div className="flex flex-col">
          <ProductFilter />
          <SpeciesList />
        </div>
      </div>
    </Fragment>
  );
}
