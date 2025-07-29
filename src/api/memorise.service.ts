import { configureApiBaseUrl } from '@intavia/api-client';
import { createApi } from '@reduxjs/toolkit/query/react';
import type { RequestOptions } from '@stefanprobst/request';
import { request } from '@stefanprobst/request';

import { baseUrl } from '~/config/memorise.config';

import type {
  FragmentPathParams,
  FragmentResponse,
  FragmentsByDocumentParams,
  FragmentSearchPathParams,
  ProjectPathParams,
  ProjectResponse,
} from './memorise-client';
import {
  getDocumentsByProject,
  getFragmentByID,
  getFragmentsByDocument,
  getFragmentsByProject,
  getSearchFragmentByID,
} from './memorise-client';

//===
//External services; data fetching, api calls;
//===

configureApiBaseUrl(baseUrl);

export const service = createApi({
  reducerPath: 'memoris-api',
  async baseQuery(args: { url: URL; options: RequestOptions }) {
    try {
      const { url, options } = args;
      const response = await request(url, options);
      return { data: response };
    } catch (error) {
      return { error };
    }
  },
  endpoints(builder) {
    return {
      getFragmentsByProject: builder.query<ProjectResponse, ProjectPathParams>({
        query(params) {
          return {
            url: getFragmentsByProject.url(params),
            options: getFragmentsByProject.options(),
          };
        },
      }),
      getFragmentsByDocument: builder.query<ProjectResponse, FragmentsByDocumentParams>({
        query(params) {
          return {
            url: getFragmentsByDocument.url(params),
            options: getFragmentsByDocument.options(),
          };
        },
      }),
      getFragmentByID: builder.query<FragmentResponse, FragmentPathParams>({
        query(params) {
          return {
            url: getFragmentByID.url(params),
            options: getFragmentByID.options(),
          };
        },
      }),
      getSearchFragmentByID: builder.query<FragmentResponse, FragmentSearchPathParams>({
        query(params) {
          return {
            url: getSearchFragmentByID.url(params),
            options: getSearchFragmentByID.options(),
          };
        },
      }),
      getDocumentsByProject: builder.query<ProjectResponse, ProjectPathParams>({
        query(params) {
          return {
            url: getDocumentsByProject.url(params),
            options: getDocumentsByProject.options(),
          };
        },
      }),
    };
  },
});

export const {
  useGetFragmentsByProjectQuery,
  useGetFragmentByIDQuery,
  useGetDocumentsByProjectQuery,
  useGetFragmentsByDocumentQuery,
  useGetSearchFragmentByIDQuery,
  useLazyGetSearchFragmentByIDQuery,
} = service;
