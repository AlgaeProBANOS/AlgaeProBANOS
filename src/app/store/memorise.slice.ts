import type { InternationalizedLabel, Place, PlaceType } from '@intavia/api-client';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import { service as memoriseService } from '@/api/memorise.service';
import type {
  Annotation,
  Document,
  Fragment,
  JSONArray,
  JSONObject,
  JSONValue,
  Project,
} from '@/api/memorise-client';
import type { RootState } from '@/app/store';

//===
// State management; logic for handling parts of a state; organisation, reducers, actions
//===

const concentrationCamp: PlaceType = {
  id: 'concentrationCamp',
  label: { en: 'Concentration-Camp' } as InternationalizedLabel,
};

export const initialPlaces: Record<Place['id'], Place> = {
  'Bergen-Belsen': {
    kind: 'place',
    id: 'Bergen-Belsen',
    geometry: { type: 'Point', coordinates: [9.9072, 52.7586] },
    type: concentrationCamp,
    label: { en: 'Bergen-Belsen' } as InternationalizedLabel,
    relations: [],
  },
  'Kamp Westerbork': {
    kind: 'place',
    id: 'Kamp Westerbork',
    geometry: { type: 'Point', coordinates: [6.611, 52.9286] },
    type: concentrationCamp,
    label: { en: 'Kamp Westerbork' } as InternationalizedLabel,
    relations: [],
  },
};

//Declaration
interface MemoriseState {
  maintenanceMode: boolean;
  documentsByProjectID: Record<Project['id'], Array<Document['id']>>;
  fragmentsByProjectID: Record<Project['id'], Array<Fragment['id']>>;
  fragmentsByID: Record<Fragment['id'], Fragment>;
  fragmentsByDocument: Record<string, Array<Fragment['id']>>;
  places: Record<Place['id'], Place>;
  documents: Record<Document['id'], Document>;
  searchResultDocuments: Record<Document['id'], Document>;
  searchResultFragments: Record<Fragment['id'], Fragment>;
}

//Constructor
const initialState: MemoriseState = {
  maintenanceMode: true,
  documentsByProjectID: {},
  fragmentsByProjectID: {},
  fragmentsByID: {},
  fragmentsByDocument: {},
  places: initialPlaces,
  documents: {},
  searchResultFragments: {},
  searchResultDocuments: {},
};

const FragmentElementTypes: Record<string, string> = {
  'http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#EntityOccurrence': 'annotation',
  'http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#beginIndex': 'begin',
  'http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#endIndex': 'end',
  'http://www.w3.org/2005/11/its/rdf#taIdentRef': 'thesaurusLink',
};

const ReverseElementTypes: Record<string, string> = Object.fromEntries(
  Object.entries(FragmentElementTypes).map(([key, value]) => {
    return [value, key];
  }),
);

const checkType = (element: JSONObject) => {
  if (Object.keys(element).includes('@type')) {
    if (element['@type'] != null) {
      const typeArray = element['@type'] as Array<string>;
      if (typeArray[0] != null) {
        return FragmentElementTypes[typeArray[0] as string];
      }
      return undefined;
    }
  } else {
    return undefined;
  }
};

export const slice = createSlice({
  name: 'memorise',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResultDocuments = {};
      state.searchResultFragments = {};
    },
    setData: (state, action) => {
      state.documentsByProjectID = action.payload.documentsByProjectID;
      state.fragmentsByID = action.payload.fragmentsByID;
      state.fragmentsByDocument = action.payload.fragmentsByDocument;
      state.places = action.payload.places;
      state.documents = action.payload.documents;
    },
  },
  extraReducers(builder) {
    builder.addMatcher(
      memoriseService.endpoints.getFragmentsByProject.matchFulfilled, //Do this if determined that getFragmentsByProject was called
      (state, action) => {
        //then execute the reducer with state and action
        const result = action.payload; //result of the API call aka data

        const fragments = result['fragments'] as Array<Fragment['id']>;
        const projectID = result['project_id'] as string;

        //update the state with the newly retrieved fragments
        state.fragmentsByProjectID[projectID] = fragments;

        /* const newFragments = {...state.fragmentsByID};
        for(const frag of fragments) {
          if(newFragments[frag] === undefined) {
            newFragments[frag] = null;
          }
        }
        state.fragmentsByID = newFragments; */
      },
    );
    builder.addMatcher(
      memoriseService.endpoints.getFragmentsByDocument.matchFulfilled, //Do this if determined that getFragmentsByProject was called
      (state, action) => {
        //then execute the reducer with state and action
        const result = action.payload; //result of the API call aka data

        const fragments = result['fragments'] as Array<Fragment['id']>;
        const documentID = result['document_id'] as string;

        //update the state with the newly retrieved fragments
        state.fragmentsByDocument[documentID] = fragments;

        /* const newFragments = {...state.fragmentsByID};
        for(const frag of fragments) {
          if(newFragments[frag] === undefined) {
            newFragments[frag] = null;
          }
        }
        state.fragmentsByID = newFragments; */
      },
    );
    builder.addMatcher(
      memoriseService.endpoints.getDocumentsByProject.matchFulfilled, //Do this if determined that getDocumentsByProject was called
      (state, action) => {
        //then execute the reducer with state and action
        const result = action.payload; //result of the API call aka data

        const documents = result['documents'] as Array<Document['id']>;
        const projectID = result['project_id'] as string;

        //update the state with the newly retrieved documents
        state.documentsByProjectID[projectID] = documents;

        /*  const newDocuments = {...state.documents};
        for(const doc of documents) {
          if(newDocuments[doc] == null) {
            newDocuments[doc] = {
              id: doc,
              type: 'diary',
              title: doc
            };
          }
        }
        state.documents = newDocuments; */
      },
    );
    builder.addMatcher(
      memoriseService.endpoints.getFragmentByID.matchFulfilled,
      (state, action) => {
        const result = action.payload;

        const singleFragment = result['fragment'];

        const fragmentID = result['fragment_id'];
        const projectID = result['project_id'];

        const newFragment = { id: fragmentID, projectID: projectID } as Fragment;
        const annotations = [] as Array<Annotation>;

        singleFragment.forEach((fragmentElement: JSONValue) => {
          if (checkType(fragmentElement as JSONObject) === 'annotation') {
            const newAnnotation = {} as Annotation;
            for (const [key, value] of Object.entries(fragmentElement)) {
              newAnnotation.type = 'annotation';
              switch (key) {
                case '@id':
                  newAnnotation.id = value;
                  break;
                case ReverseElementTypes['begin']:
                  newAnnotation.begin = value[0]['@value'];
                  break;
                case ReverseElementTypes['end']:
                  newAnnotation.end = value[0]['@value'];
                  break;
                case ReverseElementTypes['thesaurusLink']:
                  newAnnotation.thesaurusLink = value[0]['@id'];
                  break;
              }
            }
            annotations.push(newAnnotation);
          } else {
            for (const [key, value] of Object.entries(fragmentElement)) {
              switch (key) {
                case 'http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#isString':
                  {
                    const textObj = (value as JSONArray)[0];
                    if (textObj != null) {
                      const textText = (textObj as JSONObject)['@value'];
                      /* const test = { ...newFragment, text: (value as JSONArray)[0]!@value }; */
                      newFragment.text = textText as string;
                    }
                  }
                  break;

                case 'http://purl.org/dc/terms/isPartOf': {
                  const textObj = (value as JSONArray)[0];
                  const isPartOfText = (textObj as JSONObject)['@id'];
                  const documentID = (isPartOfText as string).replace(
                    'https://data.memorise.sdu.dk/documents/',
                    'DOCUMENT_',
                  );

                  newFragment.isPartOf = documentID;
                  if (state.fragmentsByDocument[documentID] != null) {
                    if (!state.fragmentsByDocument[documentID].includes(fragmentID)) {
                      state.fragmentsByDocument[documentID].push(fragmentID);
                    }
                  } else {
                    state.fragmentsByDocument[documentID] = [fragmentID];
                    state.documents[documentID] = {
                      id: documentID,
                      type: 'diary',
                      author: undefined, //will be later attached
                      title: '',
                    };
                  }
                  break;
                }
                case 'https://semantics.memorise.sdu.dk/ontology/1.0/hasDate': {
                  const tmp = (value as JSONArray)[0];
                  const date = (tmp as JSONObject)['@value'] as IsoDateString;
                  newFragment.date = date;
                  break;
                }
                case 'http://www.w3.org/2005/11/its/rdf#taIdentRef': {
                  break;
                }
                case 'https://semantics.memorise.sdu.dk/ontology/1.0/hasAuthor': {
                  const authorURIArray = (value as JSONArray)[0];
                  const authorURI = (authorURIArray as JSONObject)['@id'];
                  singleFragment.forEach((nestedElement: JSONValue) => {
                    if ((nestedElement as JSONObject)['@id'] === authorURI) {
                      const authorElement = nestedElement as JSONObject;
                      const nameObject = (authorElement['http://schema.org/name'] as JSONArray)[0];
                      const authorName = (nameObject as JSONObject)['@value'] as string;
                      const splittedName = authorName.split(', ');
                      const firstName = splittedName.length === 2 ? splittedName[1] : '';
                      const lastName = splittedName.length > 1 ? splittedName[0] : '';
                      const dateOfBirth = (
                        authorElement[
                          'https://semantics.memorise.sdu.dk/ontology/1.0/dateOfBirth'
                        ] as JSONArray
                      )[0] as JSONObject['@value'] as string;
                      const dateOfDeath = (
                        authorElement[
                          'https://semantics.memorise.sdu.dk/ontology/1.0/dateOfDeath'
                        ] as JSONArray
                      )[0] as JSONObject['@value'] as string;
                      const placeOfBirth = (
                        authorElement[
                          'https://semantics.memorise.sdu.dk/ontology/1.0/placeOfBirth'
                        ] as JSONArray
                      )[0] as JSONObject['@value'] as string;

                      const author = {
                        id: (authorURI as string).split('people/')[1] as string,
                        firstName,
                        lastName,
                        associatedDiaryID: 'TBD',
                        biographicalData: 'TBD',
                        dateOfBirth,
                        dateOfDeath,
                        placeOfBirth,
                      };

                      newFragment.author = author;

                      //register the Author to the document
                      const isPartOfText = (fragmentElement as JSONObject)['@id'] as string;
                      const docID = isPartOfText.replace(
                        'https://data.memorise.sdu.dk/documents/',
                        'DOCUMENT_',
                      );

                      const authorID = author.id;
                      const oldAuthorID = state.documents[docID]?.author?.id;
                      if (authorID !== oldAuthorID && oldAuthorID !== undefined) {
                        console.log(
                          "Possible wrong attachment of author's document to document ID",
                          authorID,
                          oldAuthorID,
                          fragmentID,
                        );
                      }

                      if (state.documents[docID] === undefined) {
                        state.documents[docID] = {
                          id: docID as string,
                          type: 'diary',
                          author: author,
                          title: '',
                        };
                      } else {
                        state.documents[docID].author = author;
                      }
                    }
                  });
                  break;
                }
                default:
                  break;
              }
            }
          }
        });

        newFragment.annotations = annotations;
        newFragment.place =
          Object.keys(initialPlaces)[Math.floor(Math.random() * Object.keys(initialPlaces).length)];
        state.fragmentsByID[fragmentID] = newFragment;
      },
    );
    builder.addMatcher(
      memoriseService.endpoints.getSearchFragmentByID.matchFulfilled,
      (state, action) => {
        const result = action.payload;

        const singleFragment = result['fragment'];

        const fragmentID = result['fragment_id'];
        const projectID = result['project_id'];

        const newFragment = { id: fragmentID, projectID: projectID } as Fragment;

        const searchTerm = action.meta.arg.originalArgs.searchTerm;

        singleFragment.forEach((fragmentElement: JSONValue) => {
          if (checkType(fragmentElement as JSONObject) === 'annotation') {
            /* const newAnnotation = {} as Annotation;
            for (const [key, value] of Object.entries(fragmentElement)) {
              newAnnotation.type = 'annotation';
              switch (key) {
                case '@id':
                  newAnnotation.id = value;
                  break;
                case ReverseElementTypes['begin']:
                  newAnnotation.begin = value[0]['@value'];
                  break;
                case ReverseElementTypes['end']:
                  newAnnotation.end = value[0]['@value'];
                  break;
                case ReverseElementTypes['thesaurusLink']:
                  newAnnotation.thesaurusLink = value[0]['@id'];
                  break;
              }
            }
            annotations.push(newAnnotation); */
          } else {
            for (const [key, value] of Object.entries(fragmentElement)) {
              switch (key) {
                case 'http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#isString':
                  {
                    const textObj = (value as JSONArray)[0];
                    if (textObj != null) {
                      const textText = (textObj as JSONObject)['@value'];
                      /* const test = { ...newFragment, text: (value as JSONArray)[0]!@value }; */
                      newFragment.text = textText as string;
                    }
                  }
                  break;

                case 'http://purl.org/dc/terms/isPartOf': {
                  const textObj = (value as JSONArray)[0];
                  const isPartOfText = (textObj as JSONObject)['@id'];
                  const documentID = (isPartOfText as string).replace(
                    'https://data.memorise.sdu.dk/documents/',
                    'DOCUMENT_',
                  );

                  newFragment.isPartOf = documentID;
                  /* if (state.fragmentsByDocument[documentID] != null) {
                    if(!state.fragmentsByDocument[documentID].includes(fragmentID))
                      {
                        state.fragmentsByDocument[documentID].push(fragmentID);
                      }
                  } else {
                    state.fragmentsByDocument[documentID] = [fragmentID];
                    state.documents[documentID] = {
                      id: documentID,
                      type: 'diary',
                      author: undefined, //will be later attached
                      title: '',
                    };
                  } */
                  break;
                }
                case 'https://semantics.memorise.sdu.dk/ontology/1.0/hasDate': {
                  const tmp = (value as JSONArray)[0];
                  const date = (tmp as JSONObject)['@value'] as IsoDateString;
                  newFragment.date = date;
                  break;
                }
                case 'http://www.w3.org/2005/11/its/rdf#taIdentRef': {
                  break;
                }
                case 'https://semantics.memorise.sdu.dk/ontology/1.0/hasAuthor': {
                  const authorURIArray = (value as JSONArray)[0];
                  const authorURI = (authorURIArray as JSONObject)['@id'];
                  singleFragment.forEach((nestedElement: JSONValue) => {
                    if ((nestedElement as JSONObject)['@id'] === authorURI) {
                      const authorElement = nestedElement as JSONObject;
                      const nameObject = (authorElement['http://schema.org/name'] as JSONArray)[0];
                      const authorName = (nameObject as JSONObject)['@value'] as string;
                      const splittedName = authorName.split(', ');
                      const firstName = splittedName.length === 2 ? splittedName[1] : '';
                      const lastName = splittedName.length > 1 ? splittedName[0] : '';
                      const dateOfBirth = (
                        authorElement[
                          'https://semantics.memorise.sdu.dk/ontology/1.0/dateOfBirth'
                        ] as JSONArray
                      )[0] as JSONObject['@value'] as string;
                      const dateOfDeath = (
                        authorElement[
                          'https://semantics.memorise.sdu.dk/ontology/1.0/dateOfDeath'
                        ] as JSONArray
                      )[0] as JSONObject['@value'] as string;
                      const placeOfBirth = (
                        authorElement[
                          'https://semantics.memorise.sdu.dk/ontology/1.0/placeOfBirth'
                        ] as JSONArray
                      )[0] as JSONObject['@value'] as string;

                      const author = {
                        id: (authorURI as string).split('people/')[1] as string,
                        firstName,
                        lastName,
                        associatedDiaryID: 'TBD',
                        biographicalData: 'TBD',
                        dateOfBirth,
                        dateOfDeath,
                        placeOfBirth,
                      };

                      newFragment.author = author;

                      //register the Author to the document
                      const isPartOfText = (fragmentElement as JSONObject)['@id'] as string;
                      const docID = isPartOfText.replace(
                        'https://data.memorise.sdu.dk/documents/',
                        'DOCUMENT_',
                      );

                      const authorID = author.id;
                      const oldAuthorID = state.documents[docID]?.author?.id;
                      if (authorID !== oldAuthorID && oldAuthorID !== undefined) {
                        console.log(
                          "Possible wrong attachment of author's document to document ID",
                          authorID,
                          oldAuthorID,
                          fragmentID,
                        );
                      }

                      /* if (state.documents[docID] === undefined) {
                        state.documents[docID] = {
                          id: docID as string,
                          type: 'diary',
                          author: author,
                          title: '',
                        };
                      } else {
                        state.documents[docID].author = author;
                      } */
                    }
                  });
                  break;
                }
                default:
                  break;
              }
            }
          }
        });

        newFragment.place =
          Object.keys(initialPlaces)[Math.floor(Math.random() * Object.keys(initialPlaces).length)];
        // state.fragmentsByID[fragmentID] = newFragment;
        const regex = new RegExp(`(?<!\\w)${searchTerm}(?!\\w)`, 'gi');

        if (newFragment.text != null && regex.test(newFragment.text.toLowerCase())) {
          state.searchResultFragments[fragmentID] = newFragment;

          const documentID = newFragment.isPartOf;
          if (documentID != null) {
            if (state.searchResultDocuments[documentID] != null) {
              state.searchResultDocuments[documentID]!.fragments!.push(fragmentID);
            } else {
              state.searchResultDocuments[documentID] = {
                id: documentID,
                type: 'diary',
                author: newFragment.author, //will be later attached
                title: '',
                fragments: [fragmentID],
              };
            }
          }
        }
      },
    );
  },
});

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

export const { clearSearchResults, setData } = slice.actions;

/* export const {
  addLocalEntity,
} = slice.actions; */
