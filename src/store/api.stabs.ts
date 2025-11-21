import {ApiEndpointDto} from './dto/api-endpoint.dto';

export const ApiStabs: ApiEndpointDto[] = [
  {
    method: 'GET',
    path: '/info/apis',
    description: 'Server info',
    tags: ['info', 'api'],
    version: 'v1',
  },
  {
    method: 'GET',
    path: '/info',
    description: 'Server info',
    tags: ['info'],
    version: 'v1',
  },
  {
    method: 'GET',
    path: '/info/bots-types-list',
    description: 'Bots types list',
    tags: ['bot'],
    version: 'v1',
  },
  {
    method: 'GET',
    path: 'info/job-type-list',
    description: 'Job types  list',
    tags: ['job'],
    version: 'v1',
  },
  {
    method: 'GET',
    path: '/store',
    description: 'Get current store snapshot',
    tags: ['store', 'bot', 'job', 'info'],
    version: 'v1',
  },
  {
    method: 'GET',
    path: '/bots/get-all',
    description: 'Get all launched bots',
    tags: ['bot'],
    version: 'v1',
  },
  {
    method: 'GET',
    path: '/bot/:botId/params',
    description: 'Get bot params by botId',
    tags: ['bot'],
    version: 'v1',
  },
  {
    method: 'GET',
    path: '/bot/:botId/settings',
    description: 'Get settings by botId',
    tags: ['bot'],
    version: 'v1',
  },
  {
    method: 'PUT',
    path: '/bot/:botId/settings',
    description: 'Set settings by botId',
    tags: ['quotes', 'markets'],
    version: 'v1',
  },
  {
    method: 'GET',
    path: '/api/quotes/html/getLastQuotesByMarketIdAndQuoteId/:marketId/:quoteId',
    description: 'Get last quotes by market ID and quote ID',
    tags: ['quotes', 'markets'],
    version: 'v1',
  },
];
