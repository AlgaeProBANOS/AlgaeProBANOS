import { Fragment, useEffect } from 'react';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import ProductFilter from '@/features/products/ProductFilter';
import ProductMap from '@/features/products/ProductMap';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectFilters, selectSpecies, setFilteredSpecies } from '@/app/store/apb.slice';
import { filter } from 'd3';
import SpeciesList from '@/features/products/SpeciesList';
import { useApplyFilters } from '@/lib/get-filtered-species';
import test from 'node:test';
import { LocalHospital } from '@mui/icons-material';

export const getStaticProps = withDictionaries(['common']);

export default function ProductPage(): JSX.Element {
  // const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();

  const filteredSpecies = useApplyFilters();
  const species = useAppSelector(selectSpecies);

  useEffect(() => {
    dispatch(setFilteredSpecies(filteredSpecies));
  }, [filteredSpecies]);

  return (
    <Fragment>
      <div className="grid h-full grid-cols-[60%_40%] grid-rows-[60%_40%]">
        <ProductMap />
        <div className="flex flex-col row-span-2">
          <ProductFilter />
        </div>
        <div className="col-span">
          <SpeciesList />
        </div>
      </div>
    </Fragment>
  );
}
