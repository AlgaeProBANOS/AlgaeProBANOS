import type { Dictionary } from '@/app/i18n/common';

export const dictionary: Dictionary = {
  '404': {
    metadata: {
      title: 'Pagina niet gevonden',
    },
  },
  '500': {
    metadata: {
      title: 'Onverwachte fout',
    },
  },
  'app-bar': {
    mapTest: 'Kaarttest',
    coordinationTest: 'Gecombineerde weergavetest',
    timelineTest: 'Tijdlijntest',
    fragmentTest: 'Fragmenten',
    documents: 'Documenten',
    search: 'Zoeken',
  },
  entities: {
    fragment: { one: 'Fragment', other: 'Fragmenten' },
    document: { one: 'Document', other: 'Documenten' },
    place: { one: 'Plaats', other: 'Plaatsen' },
  },
  home: {
    hero: {
      title: 'CDR 2.0',
      subtitle: 'Vergelijkende Documentlezer',
    },
    metadata: {
      title: 'Vergelijkende Documentlezer',
    },
    'card-search': {
      title: 'Zoek in {{number-fragments}} Fragmenten',
      text: 'De Memorise-kennisgrafiek bestaat uit fragmenten, kleine stukjes tekst en informatie, afkomstig uit dagboeken, brieven en getuigenissen. Tot nu toe zijn er {{number-fragments}} gedigitaliseerd en beschikbaar in de kennisgrafiek, met meer op komst...',
    },
    'card-documents': {
      title: 'Lees {{number-documents}} Documenten Parallel',
      text: 'De Vergelijkende Documentlezer stelt je in staat om de {{number-documents}} documenten parallel te lezen, zodat ze elkaar contextualiseren. De documenten worden daarbij uitgelijnd langs hun gedeelde tijdlijn, waardoor de verschillende ervaringen door de tijd en locaties vergelijkbaar worden.',
    },
    'card-map': {
      title: 'Lokaliseer de Fragmenten',
      text: 'Verken de diverse fragmenten op de geospatiale kaartvisualisatie, die hun oorsprong toont in de vorm van steden, regio’s, getto’s, kampen en barakken.',
    },
    'card-timeline': {
      title: 'Dateer de Documenten',
      text: 'De documenten zijn getuigen van moeilijke tijden en kunnen daarom als tijdlijnen worden weergegeven, die vervolgens te verkennen zijn.',
    },
  },
  form: {
    save: 'Opslaan',
    yes: 'Ja',
    'delete-tab-bar':
      'Weet u zeker dat u de hele kolom wilt verwijderen en de geopende documenten wilt sluiten?',
    cancel: 'Annuleren',
    submit: 'Indienen',
    remove: 'Verwijderen',
    add: 'Toevoegen',
    more: 'Meer',
    clear: 'Wissen',
    search: 'Zoeken',
  },
  documents: {
    'show-annotations': 'Toon annotaties',
    'search-in-text': 'Zoeken in teksten',
    'align-scrolling': 'Schuif gelijk laten lopen',
    'add-column': 'Kolom toevoegen',
  },
  vis: {
    'click-to-filter': 'Klik om te filteren op {{value}}!',
    'click-to-search': 'Klik om te zoeken naar {{value}}!',
  },
  regex: {
    '^': {
      meaning: 'Begin van een tekenreeks',
      explanation: 'Het dakje (^) geeft de positie aan het begin van een regel aan.',
    },
    $: {
      meaning: 'Einde van een tekenreeks',
      explanation: 'Het dollarteken ($) geeft de positie aan het einde van een regel aan.',
    },
    dot: {
      meaning: 'Elk teken',
      explanation: 'De punt (.) komt overeen met elk enkel teken, behalve een nieuwe regel.',
    },
    '\\d': {
      meaning: 'Cijfer (0-9)',
      explanation: 'Komt overeen met elk cijfer van 0 tot 9.',
    },
    '\\w': {
      meaning: 'Woordteken',
      explanation:
        'Komt overeen met elke letter, elk cijfer of een onderstrepingsteken (A-Z, a-z, 0-9, _).',
    },
    '\\s': {
      meaning: 'Witruimte',
      explanation: 'Komt overeen met elk witruimte-teken (spaties, tabs, regeleinden).',
    },
    '*': {
      meaning: '0 of meer keer',
      explanation: 'Komt overeen met het voorafgaande teken of de groep 0 of meer keer.',
    },
    '+': {
      meaning: '1 of meer keer',
      explanation: 'Komt overeen met het voorafgaande teken of de groep 1 of meer keer.',
    },
    '?': {
      meaning: '0 of 1 keer',
      explanation: 'Maakt het voorafgaande teken of de groep optioneel.',
    },
    '[abc]': {
      meaning: 'Eén van a, b of c',
      explanation: 'Een tekenklasse die overeenkomt met een van de ingesloten tekens.',
    },
    '(abc)': {
      meaning: 'Groep',
      explanation: 'Een groep die meerdere tekens samenvoegt.',
    },
    '\\b': {
      meaning: 'Woordgrens',
      explanation: 'Komt overeen met een positie tussen een woordteken en een niet-woordteken.',
    },
  },
};
