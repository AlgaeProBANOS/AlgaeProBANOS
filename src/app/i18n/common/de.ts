import type { Dictionary } from '@/app/i18n/common';

export const dictionary: Dictionary = {
  '404': {
    metadata: {
      title: 'Seite nicht gefunden',
    },
  },
  '500': {
    metadata: {
      title: 'Unerwarteter Fehler',
    },
  },
  'app-bar': {
    algaeProducts: 'Algen Produkte',
    algaeSpecies: 'Algen Spezies',
    search: 'Suche',
  },
  entities: {
    fragment: { one: 'Fragment', other: 'Fragmente' },
    document: { one: 'Dokument', other: 'Dokumente' },
    place: { one: 'Ort', other: 'Orte' },
  },
  home: {
    hero: {
      title: 'CDR 2.0',
      subtitle: 'Vergleichender Dokumentenleser',
    },
    metadata: {
      title: 'Vergleichender Dokumentenleser',
    },
    'card-search': {
      title: 'Suche in {{number-fragments}} Fragmenten',
      text: 'Der Memorise-Wissensgraph besteht aus Fragmenten, kleinen Textausschnitten und Informationen, die aus Tagebüchern, Briefen und Zeugenaussagen stammen. Bisher sind {{number-fragments}} digitalisiert und im Wissensgraph verfügbar, mit weiteren, die noch kommen...',
    },
    'card-documents': {
      title: 'Lese {{number-documents}} Dokumente parallel',
      text: 'Der Vergleichende Dokumentenleser ermöglicht es Ihnen, die {{number-documents}} Dokumente parallel zu lesen, sodass sie sich gegenseitig kontextualisieren. Die Dokumente sind entlang ihrer gemeinsamen Zeitachse ausgerichtet, sodass die unterschiedlichen Erfahrungen durch Zeiten und Orte vergleichbar werden.',
    },
    'card-map': {
      title: 'Fragmente lokalisieren',
      text: 'Entdecken Sie die vielfältigen Fragmente auf der geospatialen Kartenvisualisierung, die ihren Ursprungsort in Form von Städten, Regionen, Ghettos, Lagern und Baracken zeigt.',
    },
    'card-timeline': {
      title: 'Dokumente datieren',
      text: 'Die Dokumente sind Zeugen schwieriger Zeiten und können daher als Zeitstrahlen dargestellt und erkundet werden.',
    },
  },
  form: {
    save: 'Speichern',
    yes: 'Ja',
    'delete-tab-bar':
      'Möchten Sie wirklich die ganze Spalte löschen und die geöffneten Dokumente schließen?',
    cancel: 'Abbrechen',
    submit: 'Einreichen',
    remove: 'Entfernen',
    add: 'Hinzufügen',
    more: 'Mehr',
    clear: 'Löschen',
    search: 'Suche',
  },
  documents: {
    'show-annotations': 'Anmerkungen anzeigen',
    'search-in-text': 'In Texten suchen',
    'align-scrolling': 'Scrolling angleichen',
    'add-column': 'Spalte hinzufügen',
  },
  vis: {
    'click-to-filter': 'Klicke um nach {{value}} zu filtern!',
    'click-to-search': 'Klicke um nach {{value}} zu suchen!',
  },
  regex: {
    '^': {
      meaning: 'Anfang einer Zeichenkette',
      explanation: 'Das Zirkumflex (^) gibt die Position am Anfang einer Zeile an.',
    },
    $: {
      meaning: 'Ende einer Zeichenkette',
      explanation: 'Das Dollarzeichen ($) gibt die Position am Ende einer Zeile an.',
    },
    dot: {
      meaning: 'Beliebiges Zeichen',
      explanation: 'Der Punkt (.) entspricht jedem einzelnen Zeichen außer einem Zeilenumbruch.',
    },
    '\\d': {
      meaning: 'Ziffer (0-9)',
      explanation: 'Entspricht jeder Ziffer von 0 bis 9.',
    },
    '\\w': {
      meaning: 'Wortzeichen',
      explanation:
        'Entspricht jedem Buchstaben, jeder Ziffer oder einem Unterstrich (A-Z, a-z, 0-9, _).',
    },
    '\\s': {
      meaning: 'Leerzeichen',
      explanation: 'Entspricht jedem Leerzeichen (Leerraum, Tabulator, Zeilenumbruch).',
    },
    '*': {
      meaning: '0 oder mehr Vorkommen',
      explanation: 'Entspricht dem vorherigen Zeichen oder der Gruppe 0 oder mehr Mal.',
    },
    '+': {
      meaning: '1 oder mehr Vorkommen',
      explanation: 'Entspricht dem vorherigen Zeichen oder der Gruppe 1 oder mehr Mal.',
    },
    '?': {
      meaning: '0 oder 1 Vorkommen',
      explanation: 'Macht das vorherige Zeichen oder die Gruppe optional.',
    },
    '[abc]': {
      meaning: 'Eines von a, b oder c',
      explanation: 'Eine Zeichenklasse, die eines der eingeschlossenen Zeichen entspricht.',
    },
    '(abc)': {
      meaning: 'Gruppe',
      explanation: 'Eine Gruppe, die mehrere Zeichen zusammenfasst.',
    },
    '\\b': {
      meaning: 'Wortgrenze',
      explanation:
        'Entspricht einer Position zwischen einem Wortzeichen und einem Nicht-Wortzeichen.',
    },
  },
};
