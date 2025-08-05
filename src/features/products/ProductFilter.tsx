import AgricultureIcon from '@mui/icons-material/Agriculture';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import FactoryIcon from '@mui/icons-material/Factory';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ParkIcon from '@mui/icons-material/Park';
import RestaurantIcon from '@mui/icons-material/Restaurant';

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
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ColorSelectionBarChart } from './ColorSelectionBarChart';

export const getStaticProps = withDictionaries(['common']);

const applicationCategories = [
  {
    key: 'industrial' as ApplicationType,
    title: 'Industrial',
    description: 'Industrial applications and processes',
    color: '#2196f3',
    icon: FactoryIcon,
  },
  {
    key: 'agriculture' as ApplicationType,
    title: 'Agriculture',
    description: 'Agricultural and farming uses',
    color: '#4caf50',
    icon: AgricultureIcon,
  },
  {
    key: 'medicinal' as ApplicationType,
    title: 'Medicinal',
    description: 'Medical and pharmaceutical applications',
    color: '#f44336',
    icon: MedicalServicesIcon,
  },
  {
    key: 'cosmetics' as ApplicationType,
    title: 'Cosmetics',
    description: 'Beauty and personal care products',
    color: '#e91e63',
    icon: FaceRetouchingNaturalIcon,
  },
  {
    key: 'environmental' as ApplicationType,
    title: 'Environmental',
    description: 'Environmental solutions and applications',
    color: '#009688',
    icon: ParkIcon,
  },
  {
    key: 'humanConsumption' as ApplicationType,
    title: 'Human Consumption',
    description: 'Food and nutritional products',
    color: '#ff9800',
    icon: RestaurantIcon,
  },
];

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
  // const { t } = useI18n<'common'>();
  const species = useAppSelector(selectSpecies);
  const dispatch = useAppDispatch();

  const filters = useAppSelector(selectFilters);
  const appplicationFilter = filters.applications;
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const [selectedApplication, setSelectedApplication] = useState<Array<ApplicationType> | null>(
    appplicationFilter,
  );
  const includeNonApplicationsFilter = filters.includeNonApplications;

  const [includeNonApplications, setIncludeNonApplications] = useState(
    includeNonApplicationsFilter,
  );

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'applications',
        cat: 'applications',
        val: selectedApplication != null ? selectedApplication : null,
      }),
    );
  }, [selectedApplication]);

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'includeNonApplications',
        cat: 'includeNonApplications',
        val: includeNonApplications,
      }),
    );
  }, [includeNonApplications]);

  return (
    <div className="grid grid-cols-1 p-4">
      <div className="text-lg font-bold mb-1">Algae Product Sectors</div>
      <div className="grid grid-cols-2 gap-4">
        {applicationCategories.map((category) => {
          /* Application Cards */
          const Icon = category.icon;
          const isSelected =
            selectedApplication != null
              ? selectedApplication.includes(category.key as ApplicationType)
              : false;
          return (
            <div
              className={`rounded flex h-full cursor-pointer flex-col border-l-4 transition-all p-2 hover:shadow-md select-none ${isSelected ? 'shadow-md' : ''}`}
              style={{
                borderColor: category.color,
                backgroundColor: isSelected ? `${category.color}22` : 'white',
              }}
              key={category.key}
              onClick={(e) => {
                let oldApplications = selectedApplication != null ? [...selectedApplication] : [];
                switch (e.detail) {
                  case 1:
                    if (oldApplications?.includes(category.key)) {
                      var index = oldApplications.indexOf(category.key);
                      if (index > -1) {
                        oldApplications.splice(index, 1);
                      }
                    } else {
                      oldApplications.push(category.key);
                    }
                    break;
                  default:
                    oldApplications = [category.key];
                }

                setSelectedApplication(oldApplications);
              }}
            >
              <div className="flex h-full flex-col p-1">
                <div className="mb-1 flex items-center mb-2">
                  <Icon className="mr-1" style={{ color: category.color }} />
                  <span className="text-lg font-bold">{category.title}</span>
                </div>
                <span className="text-sm text-gray-500">{category.description}</span>
              </div>
            </div>
          );
        })}
        <div className="col-span-2">
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
                <span className="text-lg font-bold">No Application</span>
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
      </div>
      <div className="grid grid-cols-[30%_70%] gap-2 mt-3">
        <ColorSelectionBarChart />
        <div className="flex flex-col my-1">
          <div className="text-lg font-bold whitespace-nowrap mb-1">
            Filter for species names, common names, ...
          </div>
          <SearchForm />
          <div className="text-sm text-gray-500 mt-1">{`${Object.keys(species).length} species in sum`}</div>
        </div>
      </div>
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
