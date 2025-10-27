import { PageMetadata } from '@stefanprobst/next-page-metadata';

import { useI18n } from '@/app/i18n/use-i18n';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { usePageTitleTemplate } from '@/app/metadata/use-page-title-template';

import { Fragment, useEffect } from 'react';

import { Species } from '@/api/apb.client';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectSpecies, setFilteredSpecies, setSpeciesPhotos } from '@/app/store/apb.slice';
import AreaSearchBar from '@/features/products/AreaSearchBar';
import CountrySearchBar from '@/features/products/CountrySearchBar';
import NameSearchBar from '@/features/products/NameSearchBar';
import Map from '@/features/products/Map';
import ProductScreen from '@/features/products/ProductScreen';
import SpeciesScreen from '@/features/products/SpeciesScreen';
import { useApplyFilters } from '@/lib/get-filtered-species';
// import { useTestResponseType } from '@/features/common/data/use-data';

export const getStaticProps = withDictionaries(['common']);

export default function HomePage(): JSX.Element {
  const { t } = useI18n<'common'>();

  const titleTemplate = usePageTitleTemplate();

  const metadata = { title: t(['common', 'home', 'metadata', 'title']) };

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
        // for (const test of Object.values(json)) {
        //   if (test.speciesKey != null) console.log(test.speciesKey);
        // }
        console.log(
          Object.values(json)
            .filter((e) => e.speciesKey != null)
            .map((e) => e.speciesKey),
        );
      });
  }, []);

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
      <div className="grid size-full grid-rows-[1fr_1fr] grid-cols-2 gap-1">
        <PageMetadata title={metadata.title} titleTemplate={titleTemplate} />
        <div className="row-span-2 grid grid-cols-1 grid-rows-[50px_1fr]">
          {/* <TestMap key="product-page-map" /> */}
          <div className="grid grid-cols-3 grid-rows-1 gap-1 p-2">
            <div className="flex items-center justify-center">
              <AreaSearchBar />
            </div>
            <div className="flex items-center justify-center">
              <CountrySearchBar />
            </div>
            <div className="flex items-center justify-center">
              <NameSearchBar />
            </div>
          </div>
          <Map key="product-page-map" />
        </div>
        <div className="relative size-full overflow-hidden">
          <div className="absolute size-full">
            <ProductScreen />
          </div>
        </div>
        <div className="relative size-full overflow-hidden">
          <div className="absolute size-full">
            <SpeciesScreen />
          </div>
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
      {/* <footer className="col-span-3 flex h-12 place-content-center items-center gap-4 bg-neutral-200 px-20 text-xs text-neutral-900 dark:bg-apb-gray dark:text-apb-gold-100">
          <Image src="/assets/images/EC_logo_s.png" alt="EC Logo" width={45} height={26} />
          <p>
            This project is funded by the European Union&apos;s Horizon Europe research and
            innovation programme under grant agreement No. 101061016. This website reflects only the
            authors&apos; views.
          </p>
        </footer> */}
    </Fragment>
  );
}
