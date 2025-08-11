import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit';

import type { Applications, ApplicationType, JSONObject, Species } from '@/api/apb.client';
import { service as apbService } from '@/api/apb.service';
import type {
    Document,
    Fragment,
    Project
} from '@/api/memorise-client';
import type { RootState } from '@/app/store';

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

export interface Filters {
  colors: Record<string, boolean> | null;
  name: string | null;
  species: Array<Species['id']> | null;
  applications: Array<ApplicationType> | null;
  includeNonApplications: boolean;
  countries: Record<Country['title'], Country> | null;
};

//Declaration
export interface APBState {
  species: Record<Species['id'], Species>;
  filteredSpecies: Array<Species['id']> | null;
  filters: Filters;
}

//Constructor
const initialState: APBState = {
  species: {},
  filteredSpecies: null,
  filters: {colors: {'green': true, 'brown': true, 'red': true, 'unknown': true}, name: null, species: null, applications: ['environmental', 'humanConsumption', 'medicinal', 'cosmetics', 'agriculture', 'industrial'],
  includeNonApplications: true, countries: null}
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
    setFilters: (state, action) => {
      const {type, cat, val} = action.payload;
      switch(type) {
        case "colors":
          const oldColors = {...state.filters.colors};
          if(oldColors != null) {
            oldColors[cat] = val;
            state.filters.colors = oldColors;
          }
          else {
            state.filters.colors = {[cat]: val};
          }
          break;
        case "name":
          state.filters.name = val;
          break;
        case "species":
          state.filters.species = val;
          break;
        case "applications":
          state.filters.applications = val;
          break;
        case "countries":
          state.filters.countries = val;
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
      apbService.endpoints.searchSpecies.matchFulfilled, //Do this if determined that getFragmentsByProject was called
      (state, action) => {
        //then execute the reducer with state and action
        const result = action.payload; //result of the API call aka data
        
        const newSpecies = {} as Record<Species['id'], Species>;
        for(const speciesIt of result) {
          let species = {...speciesIt};
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
            newSpecies[newID] = species;
          }
        }
        state.species = newSpecies;
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

export function selectFilteredSpecies(state: RootState) {
  return state.apb.filteredSpecies;
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

export const { clearSearchResults, setFilteredSpecies, setFilters } = slice.actions;

/* export const {
  addLocalEntity,
} = slice.actions; */
