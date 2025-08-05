import type { Dictionary } from '@/app/i18n/common';

export const dictionary: Dictionary = {
  '404': {
    metadata: {
      title: 'Page not found',
    },
  },
  '500': {
    metadata: {
      title: 'Unexpected error',
    },
  },
  'app-bar': {
    algaeProducts: 'Algae Products',
    algaeSpecies: 'Algae Species',
    search: 'Search',
  },
  entities: {
    fragment: { one: 'Fragment', other: 'Fragments' },
    document: { one: 'Document', other: 'Documents' },
    place: { one: 'Place', other: 'Places' },
  },
  home: {
    hero: {
      title: 'AlgaeProBANOS',
      subtitle: 'AlgaeProBANOS',
    },
    metadata: {
      title: 'AlgaeProBANOS',
    },
    'card-search': {
      title: 'Search in {{number-fragments}} Fragments',
      text: 'The Memorise knowledge graph consists of fragments, small snippets or text and information, which originate from diaries, letter and testimonies. So far there are {{number-fragments}} digitized and available in the knowledge graph with further to come...',
    },
    'card-documents': {
      title: 'Read {{number-documents}} Documents Parallel',
      text: 'The Comparative Document Reader is allowing you to read the {{number-documents}} documents in parallel so that they contextualize each other. Thereby the documents are aligned along their chared timeline so that the different experiences throughout times and locations get comparable.',
    },
    'card-map': {
      title: 'Locate the Fragments',
      text: 'Explore the manifold fragments on the geospatial map visualization showing their origin place in form of cities, regions, ghettos, camps and barracks',
    },
    'card-timeline': {
      title: 'Date the Documents',
      text: 'The documents are witnesses of the challenging times, hence they can be displayed as timelines, which are then explorable.',
    },
  },
  form: {
    save: 'Save',
    yes: 'Yes',
    'delete-tab-bar':
      'Are you sure you want to delete the whole column and close the open documents?',
    cancel: 'Cancel',
    submit: 'Submit',
    remove: 'Remove',
    add: 'Add',
    more: 'More',
    clear: 'Clear',
    search: 'Search',
  },
  documents: {
    'show-annotations': 'Show Annotations',
    'search-in-text': 'Search in texts',
    'align-scrolling': 'Align Scrolling',
    'add-column': 'Add Column',
  },
  vis: {
    'click-to-filter': 'Click to filter for {{value}}!',
    'click-to-search': 'Click to search for {{value}}!',
  },
  regex: {
    '^': {
      meaning: 'Start of a string',
      explanation: 'The caret (^) asserts position at the start of a line.',
    },
    $: {
      meaning: 'End of a string',
      explanation: 'The dollar sign ($) asserts position at the end of a line.',
    },
    dot: {
      meaning: 'Any character',
      explanation: 'The dot (.) matches any single character except newline.',
    },
    '\\d': {
      meaning: 'Digit (0-9)',
      explanation: 'Matches any digit from 0 to 9.',
    },
    '\\w': {
      meaning: 'Word character',
      explanation: 'Matches any letter, digit, or underscore (A-Z, a-z, 0-9, _).',
    },
    '\\s': {
      meaning: 'Whitespace',
      explanation: 'Matches any whitespace character (spaces, tabs, line breaks).',
    },
    '*': {
      meaning: '0 or more occurrences',
      explanation: 'Matches the preceding character or group 0 or more times.',
    },
    '+': {
      meaning: '1 or more occurrences',
      explanation: 'Matches the preceding character or group 1 or more times.',
    },
    '?': {
      meaning: '0 or 1 occurrence',
      explanation: 'Makes the preceding character or group optional.',
    },
    '[abc]': {
      meaning: 'Any of a, b, or c',
      explanation: 'Character class that matches any one of the enclosed characters.',
    },
    '(abc)': {
      meaning: 'Group',
      explanation: 'Capturing group that groups multiple characters together.',
    },
    '\\b': {
      meaning: 'Word boundary',
      explanation: 'Matches a position between a word character and a non-word character.',
    },
  },
};
