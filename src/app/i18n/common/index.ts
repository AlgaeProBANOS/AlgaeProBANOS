/* import type { Plurals } from '@/app/i18n/dictionaries'; */

import type { Plurals } from '../dictionaries';

export interface Dictionary {
  '404': {
    metadata: {
      title: string;
    };
  };
  '500': {
    metadata: {
      title: string;
    };
  };
  'app-bar': {
    algaeProducts: string;
    algaeSpecies: string;
    search: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
    };
    metadata: {
      title: string;
    };
    'card-search': {
      title: string;
      text: string;
    };
    'card-documents': {
      title: string;
      text: string;
    };
    'card-map': {
      title: string;
      text: string;
    };
    'card-timeline': {
      title: string;
      text: string;
    };
  };
  entities: {
    fragment: Plurals;
    document: Plurals;
    place: Plurals;
  };
  form: {
    save: string;
    yes: string;
    'delete-tab-bar': string;
    cancel: string;
    submit: string;
    remove: string;
    add: string;
    more: string;
    clear: string;
    search: string;
  };
  documents: {
    'show-annotations': string;
    'align-scrolling': string;
    'add-column': string;
    'search-in-text': string;
  };
  vis: {
    'click-to-filter': string;
    'click-to-search': string;
  };
  regex: Record<string, Record<string, string>>;
}
