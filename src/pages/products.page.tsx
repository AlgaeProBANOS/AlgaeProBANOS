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
import { SpeciesTreeMap } from '@/features/products/SpeciesTreeMap';
import { ColorSelectionBarChart } from '@/features/products/ColorSelectionBarChart';
import NameSearchBar from '@/features/products/NameSearchBar';
import CountrySearchBar from '@/features/products/CountrySearchBar';

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
      <div className="grid size-full grid-rows-[1fr_100px_1fr] grid-cols-2">
        <div>
          <ProductMap />
        </div>
        <div>
          <ProductFilter />
        </div>
        <div className="col-span-2 border border-apb-gray grid grid-cols-3 gap-1">
          <ColorSelectionBarChart />
          <div className="flex items-center justify-center">
            <NameSearchBar />
          </div>
          <div className="flex items-center justify-center">
            <CountrySearchBar />
          </div>
        </div>
        <div>
          <SpeciesList />
        </div>
        <div>
          <SpeciesTreeMap />
        </div>
      </div>
      {/* <div className="grid h-full grid-cols-[60%_40%] grid-rows-[60%_40%]">
        <ProductMap />
        <div className="flex flex-col">
        </div>
          <SpeciesList />
        </div>
        <div className="grid size-full border border-gray-600">
          <SpeciesTreeMap />
        </div>
      </div> */}
    </Fragment>
  );
}
