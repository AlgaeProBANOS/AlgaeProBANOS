import { configureApiBaseUrl } from '@intavia/api-client';
import { createApi } from '@reduxjs/toolkit/query/react';
import type { RequestOptions } from '@stefanprobst/request';
import { request } from '@stefanprobst/request';

import { baseUrl } from '~/config/apb.config';

import { ProductPathParams, SearchPathParams, SearchResponse, searchSpeciesByProduct} from './apb.client';
import { searchSpecies } from './apb.client';

//===
//External services; data fetching, api calls;
//===

configureApiBaseUrl(baseUrl);

export const service = createApi({
  reducerPath: 'apb-api',
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
      searchSpecies: builder.query<SearchResponse, SearchPathParams>({
        query(params) {
          return {
            url: searchSpecies.url(params),
            options: searchSpecies.options(),
          };
        },
      }),
      searchSpeciesByProduct: builder.query<SearchResponse, ProductPathParams>({
        query(params) {
          return {
            url: searchSpeciesByProduct.url(params),
            options: searchSpeciesByProduct.options(),
          };
        },
      }),
    };
  },
});

export const {
  useSearchSpeciesQuery,
  useSearchSpeciesByProductQuery,
  useLazySearchSpeciesQuery
} = service;
