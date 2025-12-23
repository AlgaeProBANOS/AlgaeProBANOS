import { ApplicationType, Species } from '@/api/apb.client';
import { useAppSelector } from '@/app/store';
import { selectFilters, selectSpecies } from '@/app/store/apb.slice';
import { getMatchingSpecies } from '@/features/common/prodcutFilter';
import { filter } from 'd3';
import { useEffect } from 'react';

export function useApplyFilters() {
  const species = useAppSelector(selectSpecies);
  const filters = useAppSelector(selectFilters);

// Start with all species in the beginning and then narrow the arrow of species names down with all the set filters
  let currentSpecies = Object.keys(species);

  // Species Filter
  const speciesFilter = filters.species;
  
  if(speciesFilter.species != null) {
    currentSpecies = currentSpecies.filter(e => species[e]?.species === speciesFilter.species);
  }
  else if(speciesFilter.genus != null) {
    currentSpecies = currentSpecies.filter(e => species[e]?.genus === speciesFilter.genus);
  }
  else if(speciesFilter.type != null) {
    currentSpecies = currentSpecies.filter(e => species[e]?.microMacro?.toLowerCase().includes(speciesFilter.type?.toLowerCase()));
  }

  //Certification filters
  const certificationsFilter = filters.certifications;
  if(certificationsFilter != null && Object.values(certificationsFilter).find(e => e)) {
    currentSpecies = currentSpecies.filter((spec)=> {
      
      let hit = true;

      if(certificationsFilter.polyCulture === true) {
        hit = hit && species[spec]?.certifications.canBeGrownInPolyculture as boolean;
      }

      if(certificationsFilter.novelFood === true) {
        hit = hit && species[spec]?.certifications.inNovelFoodCatalogue as boolean;
      }

      if(certificationsFilter.foodList === true) {
        hit = hit && species[spec]?.certifications.inUnionNovelFoodList as boolean;
      }

      if(certificationsFilter.onMarket === true) {
        hit = hit && species[spec]?.certifications.onMarket as boolean;
      }
      
      return hit;
    })
  }

  // Application Filter
  const applicationFilter = filters.applications;
  const includeNonApplications = filters.includeNonApplications;

  currentSpecies = currentSpecies.filter((spec: Species['id']) => {
    const speciesApplications = species != null && species[spec] != null ? (
      Object.keys(species[spec].applications) as Array<ApplicationType>
    ).filter((key: ApplicationType) => species[spec]?.applications[key] != null) : [];

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
  if(nameFilter != null) {
    currentSpecies = currentSpecies.filter((spec)=>{
      const testSpecies = species[spec];
      if(testSpecies?.scientificName.includes(nameFilter.value)) {
        return true;
      }

      if(testSpecies?.commonName.includes(nameFilter.value)) {
        return true;
      }

      return false;
    })
  }

  //Country filter
  const countriesFilter = filters.countries;
  if(countriesFilter != null && Object.keys(countriesFilter).length > 0) {
    currentSpecies = currentSpecies.filter((spec)=> {
      if(species[spec]?.emodnet_points != null) {
        return species[spec]?.emodnet_points.some(e=>Object.keys(countriesFilter).includes(e.country));
      }
      return false;
    })
  }
  
  //Hexagon filter
  const hexagonFilter = filters.hexagon;

  if(hexagonFilter != null ) {
      fetch('/data/hex_counts_3.json')
      .then((res) => res.json())
      .then(function (json) {
        const tmpFilteredSpecies = [];
        for (const [key, value] of Object.entries(json)) {
          if(Object.keys(value).includes(hexagonFilter.toString())) {
            tmpFilteredSpecies.push(key);
          }
        }
        console.log("TMP", currentSpecies, tmpFilteredSpecies);
        
        currentSpecies = currentSpecies.filter(e => tmpFilteredSpecies.includes(e));
      });
  }
  
  //Product Keyword filter
  const keywordFilter = filters.keyword;
  if(keywordFilter != null) {
    console.log("Keyword Filter", keywordFilter, Object.values(species).filter(e=>currentSpecies.includes(e.scientificName)));
    const matchingResults = getMatchingSpecies(Object.values(species).filter(e=>currentSpecies.includes(e.scientificName)), keywordFilter);
    console.log("matching results", matchingResults);
    
    currentSpecies = matchingResults.map(e=>e.id);
  }

  return currentSpecies;
}
