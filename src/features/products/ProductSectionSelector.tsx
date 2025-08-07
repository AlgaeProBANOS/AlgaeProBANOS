import { ApplicationType } from '@/api/apb.client';
import { useI18n } from '@/app/i18n/use-i18n';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { useEffect, useState } from 'react';
import { applicationCategories } from './utils';

export function ProductSectionSelector() {
  const species = useAppSelector(selectSpecies);
  const filters = useAppSelector(selectFilters);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const appplicationFilter = filters.applications;
  const dispatch = useAppDispatch();
  const { t } = useI18n<'common'>();

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
              <div className="flex items-center mb-2">
                <Icon className="mr-1" style={{ color: category.color }} />
                <span className="text-lg font-bold">{t(['common', 'products', category.key])}</span>
              </div>
              <span className="text-sm text-gray-500">{category.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
