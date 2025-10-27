import { createSelector, createSlice } from '@reduxjs/toolkit';

import type { ApplicationType, Species } from '@/api/apb.client';
import { service as apbService } from '@/api/apb.service';
import type {
  Document,
  Fragment,
  Project
} from '@/api/memorise-client';
import type { RootState } from '@/app/store';
import { Region } from '@/features/products/AreaSearchBar';
import { MapDataSourceType } from '@/features/products/MapDataSourceSwitch';
import { all_colors } from '@/features/products/utils';

//===
// State management; logic for handling parts of a state; organisation, reducers, actions
//===

export interface Country {
   title: string; 
   value: string; 
   iso: string; 
   iso3: string; 
   type: string; 
   found: boolean;
}

export interface Certifications {
  onMarket: boolean;
  novelFood: boolean;
  foodList: boolean;
  polyCulture: boolean;
}

export interface Filters {
  colors: Record<string, boolean> | null;
  name: string | null;
  species: Record<string, string | null>;
  applications: Array<ApplicationType> | null;
  includeNonApplications: boolean;
  countries: Record<Country['title'], Country> | null;
  region: Region | null;
  certifications: Certifications;
  keyword: string | null;
};

//Declaration
export interface APBState {
  species: Record<Species['id'], Species>;
  filteredSpecies: Array<Species['id']> | null;
  filters: Filters;
  speciesPhotos: Record<Species['id'], string | null>;
  productMapMode: MapDataSourceType;
  categoryColors: Record<string, string>;
}

//Constructor
const initialState: APBState = {
  species: {},
  filteredSpecies: null,
  filters: {region: null, colors: {'green': true, 'brown': true, 'red': true, 'purple': true, 'unknown': true}, name: null, species: {'species': null, 'genus': null, 'type': null}, applications: ['environmental', 'humanConsumption', 'medicinal', 'cosmetics', 'agriculture', 'industrial'],
  includeNonApplications: true, countries: null, certifications: {
  onMarket: false,
  novelFood: false,
  foodList: false,
  polyCulture: false,
}, keyword: null},
  speciesPhotos: {},
  productMapMode: "EMOD",
  categoryColors: {}
};

export const slice = createSlice({
  name: 'apb',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.species = {};
    },
    setFilteredSpecies: (state, action) => {
      state.filteredSpecies = action.payload;
    },
    setProductMapMode: (state, action) => {
      state.productMapMode = action.payload;
    },
    resetSpeciesFilters: (state, acion) => {
      state.filters.species = {species: null, genus: null, type: null}
    },
    setSpeciesPhotos: (state, action) =>{
      const photos = action.payload;
      state.speciesPhotos = photos;
    },
    setFilters: (state, action) => {
      const {type, cat, val} = action.payload;
      switch(type) {
        case "colors":
          const oldColors = {...state.filters.colors};
          if(cat === "reset") {
            for(const c of Object.keys(oldColors)) {
              oldColors[c] = true;
            }
            state.filters.colors = oldColors;
          }
          else {
            if(oldColors != null) {
              oldColors[cat] = val;
              state.filters.colors = oldColors;
            }
            else {
              state.filters.colors = {[cat]: val};
            }
          }
          break;
        case "name":
          state.filters.name = val;
          break;
        case "certifications":
          state.filters.certifications[cat] = val;
          break;
        case "species":
          state.filters.species[cat] = val;
          break;
        case "keyword":
          state.filters.keyword = val;
          break;
        case "applications":
          state.filters.applications = val;
          break;
        case "countries":
          state.filters.countries = val;
          break;
        case "region":
          state.filters.region = val;
          break;
        case "includeNonApplications":
          state.filters.includeNonApplications = val;
          break;
        default:
      }
    }
  },
  extraReducers(builder) {
    builder.addMatcher(
      apbService.endpoints.searchSpecies.matchFulfilled,
      (state, action) => {
        //then execute the reducer with state and action
        const result = action.payload; //result of the API call aka data
        const clusterProperties = {};
        const newSpecies = {} as Record<Species['id'], Species>;
        for(const speciesIt of result) {
          let species = {...speciesIt};
          console.log(species);
          
          const newID = species.scientificName;
          if(Object.keys(newSpecies).includes(newID)) {
            console.error("Species already exists in store", newID, species);
          }
          else {
            // if(newID.endsWith("sp.") || newID.endsWith("spp.")) {
            //   const splitArray = newID.split(" ");
            //   const genus = splitArray[0] as string;
            //   const speciesName = "";
            //   species.genus = genus;
            //   species.species = speciesName;
            //   species.scientificName = newID;
            // }
            // else if(newID.includes(" ")) {
            //   const splitArray = newID.split(" ");
            //   const genus = splitArray[0] as string;
            //   const speciesName = splitArray.slice(1).join(" ");
            //   const scientificName = genus + " " + speciesName;
            //   species.genus = genus;
            //   species.species = speciesName;
            //   species.scientificName = scientificName;
            // }
            
            let newEmodPoints = null;
            if(species.emodnet_points != null) {
              newEmodPoints = [];
              for (const dot of species.emodnet_points) {
                const newMethods = [];
                for (const meth of dot.production_method.split(',')) {
                  const propKey = `${meth.trim()}`;
                  newMethods.push(propKey);
                  if (!Object.keys(clusterProperties).includes(propKey)) {
                    clusterProperties[propKey] = [
                      '+',
                      ['case', ['>=', ['index-of', meth.trim(), ['get', 'production_method']], 0], 1, 0],
                    ];
                  }
                }
                const newDot = {...dot, production_method_array: newMethods}
                newEmodPoints.push(newDot);
              }
            }

            newSpecies[newID] = {...species, emodnet_points: newEmodPoints};

          }
        }

        const categoryColors = {};
        const sortedKeys = Object.keys(clusterProperties).sort();
        for (const [i, key] of sortedKeys.entries()) {
          categoryColors[key] = all_colors[i];
        }
        state.species = newSpecies;
        state.categoryColors = categoryColors;
      },
    );
    builder.addMatcher(
      apbService.endpoints.searchSpeciesByProduct.matchFulfilled,
      (state, action) => {
        //then execute the reducer with state and action
        const result = action.payload; //result of the API call aka data
        
        console.log('result', result);
        
        // state.species = newSpecies;
      },
    );
  },
});

export function selectSpecies(state: RootState) {
  return state.apb.species;
}

export function selectFilters(state: RootState) {
  return state.apb.filters;
}

export function selectCategoryColors(state: RootState) {
  return state.apb.categoryColors;
}

export function selectSpeciesPhotos(state: RootState) {
  return state.apb.speciesPhotos;
}

export function selectFilteredSpecies(state: RootState) {
  return state.apb.filteredSpecies;
}

export function selectProductMapMode(state: RootState) {
  return state.apb.productMapMode;
}


export function selectProjectsAndFragments(state: RootState) {
  return state.memorise.fragmentsByProjectID;
}

export function selectMaintenanceMode(state: RootState) {
  return state.memorise.maintenanceMode;
}

export function selectPlaces(state: RootState) {
  return state.memorise.places;
}

export function selectDocuments(state: RootState) {
  return state.memorise.documents;
}

export function selectFragments(state: RootState) {
  return state.memorise.fragmentsByID;
}

export function selectSearchResultDocuments(state: RootState) {
  return state.memorise.searchResultDocuments;
}

export function selectSearchResultFragments(state: RootState) {
  return state.memorise.searchResultFragments;
}

export function selectAllFragmentsByDocument(state: RootState) {
  return state.memorise.fragmentsByDocument;
}

export const selectFragmentsByProjectId = createSelector(
  (state: RootState) => {
    return state.memorise.fragmentsByProjectID;
  },
  (state: RootState, id: Project['id']) => {
    return id;
  },
  (fragmentsByProjectID, id) => {
    return fragmentsByProjectID[id];
  },
);

export const selectDocumentByProjectId = createSelector(
  (state: RootState) => {
    return state.memorise.documentsByProjectID;
  },
  (state: RootState, id: Project['id']) => {
    return id;
  },
  (documentsByProjectID, id) => {
    return documentsByProjectID[id];
  },
);

export const selectFragmentById = createSelector(
  (state: RootState) => {
    return state.memorise.fragmentsByID;
  },
  (state: RootState, id: Fragment['id']) => {
    return id;
  },
  (fragments, id) => {
    return fragments[id];
  },
);

export const selectDocumentByID = createSelector(
  (state: RootState) => {
    return state.memorise.documents;
  },
  (state: RootState, id: Document['id']) => {
    return id;
  },
  (documents, id) => {
    return documents[id];
  },
);

export const selectFragmentIDsByDocument = createSelector(
  (state: RootState) => {
    return state.memorise.fragmentsByDocument;
  },
  (state: RootState, id: string) => {
    return id;
  },
  (fragmentsByDocument, id) => {
    return fragmentsByDocument[id];
  },
);

export const selectFragmentContentForDocumentByID = createSelector(
  (state: RootState) => {
    return state.memorise;
  },
  (state: RootState, id: string) => {
    return id;
  },
  (memorise, id) => {
    return Object.fromEntries(
      Object.entries(memorise.fragmentsByID).filter(([k]) => {
        return memorise.fragmentsByDocument[id]?.includes(k) ?? false;
      }),
    );
  },
);

export const { clearSearchResults, setFilteredSpecies, setFilters, resetSpeciesFilters, setSpeciesPhotos, setProductMapMode } = slice.actions;

/* export const {
  addLocalEntity,
} = slice.actions; */
