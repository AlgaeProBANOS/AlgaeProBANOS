import { Fragment, useEffect } from 'react';

import { Species } from '@/api/apb.client';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectSpecies, setFilteredSpecies, setSpeciesPhotos } from '@/app/store/apb.slice';
import { ColorSelectionBarChart } from '@/features/products/ColorSelectionBarChart';
import CountrySearchBar from '@/features/products/CountrySearchBar';
import NameSearchBar from '@/features/products/NameSearchBar';
import ProductFilter from '@/features/products/ProductFilter';
import ProductMap from '@/features/products/ProductMap';
import SpeciesList from '@/features/products/SpeciesList';
import { SpeciesTreeMap } from '@/features/products/SpeciesTreeMap';
import { useApplyFilters } from '@/lib/get-filtered-species';

export const getStaticProps = withDictionaries(['common']);

export default function ProductPage(): JSX.Element {
  // const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();

  const filteredSpecies = useApplyFilters();
  const species = useAppSelector(selectSpecies);

  useEffect(() => {
    dispatch(setFilteredSpecies(filteredSpecies));
  }, [filteredSpecies]);

  useEffect(() => {
    fetch('/data/species.json')
      .then((res) => res.json())
      .then(function (json) {
        const tmpPhotos: Record<Species['id'], string | null> = {};
        for (const spec of Object.keys(json)) {
          const photo =
            json != null
              ? json[spec] != null && json[spec].images != null
                ? json[spec].images[0]
                : null
              : null;

          tmpPhotos[spec] = photo;
        }

        dispatch(setSpeciesPhotos(tmpPhotos));
      });
  }, []);

  return (
    <Fragment>
      <div className="grid size-full grid-rows-[1fr_100px_1fr] grid-cols-2">
        <div>
          <ProductMap />
        </div>
        <div>
          <ProductFilter />
        </div>
        <div className="col-span-2 grid grid-cols-3 gap-1 p-2">
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
