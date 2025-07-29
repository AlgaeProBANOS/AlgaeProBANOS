import { createUrl, type UrlInit } from '@stefanprobst/request';

import { baseUrl } from '~/config/memorise.config';

type CreateApiUrlParams = Omit<UrlInit, 'baseUrl'>;

export function createApiUrl(params: CreateApiUrlParams): URL {
  return createUrl({ ...params, baseUrl });
}
