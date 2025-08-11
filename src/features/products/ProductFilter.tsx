import { ApplicationType } from '@/api/apb.client';
import { useI18n } from '@/app/i18n/use-i18n';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { Input } from '@intavia/ui';
import { ContactSupport } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ColorSelectionBarChart } from './ColorSelectionBarChart';
import { applicationCategories } from './utils';
import { ProductSectionTreeMap } from './ProductSectionTreeMap';
import { ProductSectionSelector } from './ProductSectionSelector';
import { Switch } from './Switch';
import CountrySearchBar from './CountrySearchBar';
import NameSearchBar from './NameSearchBar';

export const getStaticProps = withDictionaries(['common']);

const colors = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928',
];

export default function ProductFilter(): JSX.Element {
  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const filters = useAppSelector(selectFilters);
  const appplicationFilter = filters.applications;
  const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();

  type SectionType = 'treeMap' | 'selection';
  const [sectionType, setSectionType] = useState<SectionType>('treeMap');

  const includeNonApplicationsFilter = filters.includeNonApplications;
  const [includeNonApplications, setIncludeNonApplications] = useState(
    includeNonApplicationsFilter,
  );

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'includeNonApplications',
        cat: 'includeNonApplications',
        val: includeNonApplications,
      }),
    );
  }, [includeNonApplications]);

  const [selectedApplication, setSelectedApplication] = useState<Array<ApplicationType> | null>(
    appplicationFilter,
  );

  useEffect(() => {
    setSelectedApplication(appplicationFilter);
  }, [appplicationFilter]);

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'applications',
        cat: 'applications',
        val: selectedApplication != null ? selectedApplication : null,
      }),
    );
  }, [selectedApplication]);

  return (
    <div className="grid grid-cols-1 p-2">
      <div className="flex gap-2 justify-between">
        <div className="text-lg font-bold mb-1">{t(['common', 'products', 'productSectors'])}</div>
        {/* <Switch
          value={sectionType}
          setValue={setSectionType}
          firstOption={{ val: 'selection', name: 'Selection' }}
          secondOption={{ val: 'treeMap', name: 'TreeMap' }}
          className="h-min"
        /> */}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div
          className={`border-apb-gray rounded flex h-full cursor-pointer flex-col border-l-4 transition-all px-2 hover:shadow-md select-none ${selectedApplication?.length === 6 ? 'shadow-md' : ''}`}
          style={{
            backgroundColor: selectedApplication?.length === 6 ? `#3c3c3c22` : 'white',
          }}
          onClick={(e) => {
            setSelectedApplication(applicationCategories.map((e) => e.key));
            setIncludeNonApplications(true);
          }}
        >
          <div className="flex h-full flex-col p-1">
            <div className="flex items-center">
              <ContactSupport className="mr-1" style={{ color: '#3c3c3c' }} />
              <span className="font-bold">Select All</span>
            </div>
            <span className="text-sm text-gray-500">{`Include all species.`}</span>
          </div>
        </div>
        <div
          className={`border-apb-gray rounded flex h-full cursor-pointer flex-col border-l-4 transition-all px-2 hover:shadow-md select-none ${includeNonApplications ? 'shadow-md' : ''}`}
          style={{
            backgroundColor: includeNonApplications ? `#3c3c3c22` : 'white',
          }}
          onClick={(e) => {
            setIncludeNonApplications(!includeNonApplications);
          }}
        >
          <div className="flex h-full flex-col p-1">
            <div className="flex items-center">
              <ContactSupport className="mr-1" style={{ color: '#3c3c3c' }} />
              <span className="font-bold">No Application</span>
            </div>
            <span className="text-sm text-gray-500">{`Include ${
              filteredSpecies?.filter(
                (k) =>
                  Object.keys(species[k]?.applications).filter(
                    (ak) => species[k]?.applications[ak] != null,
                  ).length === 0,
              ).length
            } species without any application`}</span>
          </div>
        </div>
      </div>
      {/* {sectionType === 'treeMap' ? ( */}
      <div className="grid h-[250px]">
        <ProductSectionTreeMap />
      </div>
      {/* ) : ( */}
      {/* <ProductSectionSelector /> */}
      {/* )} */}
    </div>
  );
}

function SearchForm(): JSX.Element {
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useI18n<'common'>();
  const nameFilter = useAppSelector(selectFilters).name;
  const [value, setValue] = useState(nameFilter);

  async function onSubmit(event: ChangeEvent) {
    const searchTerm = event.target.value;
    setValue(searchTerm);
    event.preventDefault();
  }

  useEffect(() => {
    dispatch(setFilters({ type: 'name', cat: '', val: value !== '' ? value : null }));
  }, [value]);

  return (
    // <form autoComplete="off" name="search" noValidate onSubmit={onSubmit} role="search">
    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
      <Input
        ref={searchRef}
        aria-label="Search"
        className="bg-neutral-50 rounded-full dark:bg-apb-gold-100 dark:text-apb-dark"
        defaultValue={value ?? ''}
        key="search-test"
        name="q"
        placeholder={`${t(['common', 'form', 'search'])} ...`}
        type="search"
        onChange={onSubmit}
      />
      {/* <button type="submit">{t(['common', 'form', 'search'])}</button> */}
    </div>
    // </form>
  );
}
