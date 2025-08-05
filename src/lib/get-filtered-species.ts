import { ApplicationType, Species } from '@/api/apb.client';
import { useAppSelector } from '@/app/store';
import { selectFilters, selectSpecies } from '@/app/store/apb.slice';
import { filter } from 'd3';

export function useApplyFilters() {
  const species = useAppSelector(selectSpecies);
  const filters = useAppSelector(selectFilters);

  // Start with all species in the beginning and then narrow the arrow of species names down with all the set filters
  let currentSpecies = Object.keys(species);

  // Application Filter
  const applicationFilter = filters.applications;
  const includeNonApplications = filters.includeNonApplications;

  currentSpecies = currentSpecies.filter((spec: Species['id']) => {
    const speciesApplications = (
      Object.keys(species[spec]?.applications) as Array<ApplicationType>
    ).filter((key: ApplicationType) => species[spec]?.applications[key] != null);

    if (speciesApplications.length > 0) {
      if (applicationFilter != null) {
        return applicationFilter.some((application) => {
          return speciesApplications.includes(application);
        });
      } else {
        return false;
      }
    } else {
      return includeNonApplications;
    }
  });

  // Color Filter
  const colorFilter = filters.colors;
  if (colorFilter != null) {
    currentSpecies = currentSpecies.filter((spec) =>
      species[spec]?.color != null && species[spec]?.color != ''
        ? Object.entries(colorFilter).some(
            ([key, val]) => species[spec]?.color.toLowerCase().includes(key) && val,
          )
        : true,
    );
  }

  // Name Filter
  // TODO this needs to be elaborated since the name search is supposed to include also the trade name and so on
  const nameFilter = filters.name;
  if (nameFilter != null && nameFilter.length > 0) {
    currentSpecies = currentSpecies.filter((spec) => spec.includes(nameFilter));
  }

  return currentSpecies;
}
