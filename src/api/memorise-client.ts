import type { Place } from '@intavia/api-client';
import { request, type RequestOptions } from '@stefanprobst/request';

import { createApiUrl } from '@/lib/api-url';

//===
// Client runs on the user's webbrowser solely; render user interface and handle interactions; rendering UI, routing, state management, requests to api calls
//===

export type JSONValue =
  | string
  | number
  | boolean
  | Array<JSONValue>
  | Record<string, string>
  | object;

export interface JSONObject {
  [x: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

export interface Project {
  id: string;
}

export interface Annotation {
  id: string;
  begin: number;
  end: number;
  thesaurusLink?: string;
  type: 'search' | 'annotation';
}

export interface Document {
  id: string;
  type: 'diary' | 'letter' | 'testimony';
  author?: Author;
  title: string;
  fragments?: Array<Fragment['id']>;
}

//The backend/Data Model fragment interface; Here we have all information collected from the KG
export interface Fragment {
  id: string;
  projectID: Project['id'];
  text?: string;
  date?: IsoDateString; //it will be a string after being loaded from the storage, hence, making it a string in the first place to avoid type messup
  isPartOf?: Document['id'];
  annotations?: Array<Annotation>;
  place?: Place['id'];
  author: Author;
}

export interface Author {
  firstName?: string;
  lastName?: string;
  id: string;
  associatedDiaryID: string;
  biographicalData: string; //to be read from kg later
  dateOfBirth: string;
  dateOfDeath: string;
  placeOfBirth: string;
}

//deactivate lint-error for now until I am experienced enough to understand it and fix it... (RK 20240924)
//export declare namespace GetFragmentsByProject {
export type ProjectPathParams = {
  project: Project['id'];
};
export type ProjectParams = ProjectPathParams;
export type ProjectResponse = JSONObject;

export type FragmentPathParams = {
  project: Project['id'];
  fragmentID: Fragment['id'];
};

export type FragmentSearchPathParams = {
  project: Project['id'];
  fragmentID: Fragment['id'];
  searchTerm: string;
};

export type FragmentsByDocumentParams = {
  project: Project['id'];
  documentID: Document['id'];
};
export type FragmentParams = FragmentPathParams;

export type FragmentResponse = {
  fragment_id: string;
  project_id: string;
  fragment: JSONArray;
};

export interface Location {
  lat: number;
  lon: number;
}

//}

//http://159.69.27.245:8080/project/string7/fragment/Fb988b738b00b.json

export const getFragmentsByProject = {
  pathname(params: ProjectPathParams): string {
    return `/project/${encodeURIComponent(params.project)}/fragments`;
  },
  url(params: ProjectParams): URL {
    const url = createApiUrl({
      pathname: getFragmentsByProject.pathname(params),
    });
    return url;
  },
  options(): RequestOptions {
    return {
      method: 'get',
      responseType: 'json',
      headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    };
  },
  request(params: ProjectParams): Promise<ProjectResponse> {
    const url = getFragmentsByProject.url(params);
    const options = getFragmentsByProject.options();
    return request(url, options);
  },
};

export const getDocumentsByProject = {
  pathname(params: ProjectPathParams): string {
    return `/project/${encodeURIComponent(params.project)}/documents`;
  },
  url(params: ProjectParams): URL {
    const url = createApiUrl({
      pathname: getDocumentsByProject.pathname(params),
    });
    return url;
  },
  options(): RequestOptions {
    return {
      method: 'get',
      responseType: 'json',
      headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    };
  },
  request(params: ProjectParams): Promise<ProjectResponse> {
    const url = getDocumentsByProject.url(params);
    const options = getDocumentsByProject.options();
    return request(url, options);
  },
};

export const getFragmentsByDocument = {
  pathname(params: FragmentsByDocumentParams): string {
    return `/project/${encodeURIComponent(params.project)}/document/${encodeURIComponent(params.documentID)}/fragments`;
  },
  url(params: FragmentsByDocumentParams): URL {
    const url = createApiUrl({
      pathname: getFragmentsByDocument.pathname(params),
    });
    return url;
  },
  options(): RequestOptions {
    return {
      method: 'get',
      responseType: 'json',
      headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    };
  },
  request(params: FragmentsByDocumentParams): Promise<ProjectResponse> {
    const url = getFragmentsByDocument.url(params);
    const options = getFragmentsByDocument.options();
    return request(url, options);
  },
};

export const getFragmentByID = {
  pathname(params: FragmentPathParams): string {
    return `/project/${encodeURIComponent(params.project)}/fragment/${encodeURIComponent(params.fragmentID)}`;
  },
  url(params: FragmentParams): URL {
    const url = createApiUrl({
      pathname: getFragmentByID.pathname(params),
    });
    return url;
  },
  options(): RequestOptions {
    return {
      method: 'get',
      responseType: 'json',
      headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    };
  },
  request(params: FragmentParams): Promise<FragmentResponse> {
    const url = getFragmentByID.url(params);
    const options = getFragmentByID.options();
    return request(url, options);
  },
};

export const getSearchFragmentByID = {
  pathname(params: FragmentSearchPathParams): string {
    return `/project/${encodeURIComponent(params.project)}/fragment/${encodeURIComponent(params.fragmentID)}?searchTerm=${encodeURIComponent(params.searchTerm)}`;
  },
  url(params: FragmentSearchPathParams): URL {
    const url = createApiUrl({
      pathname: getFragmentByID.pathname(params),
    });
    return url;
  },
  options(): RequestOptions {
    return {
      method: 'get',
      responseType: 'json',
      headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    };
  },
  request(params: FragmentSearchPathParams): Promise<FragmentResponse> {
    const url = getFragmentByID.url(params);
    const options = getFragmentByID.options();
    return request(url, options);
  },
};
