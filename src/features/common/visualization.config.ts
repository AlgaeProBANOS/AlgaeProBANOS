import type { EntityKind, EventKind } from '@intavia/api-client';

import type { IntaviaIconTypes } from '@/features/common/icons/intavia-icon';

interface KindColor {
  foreground: string;
  background: string;
  main?: string;
  light?: string;
  dark?: string;
}

interface EventKindProperties {
  type: string;
  label: string;
  shape: 'dot' | 'ellipse' | 'rectangle' | 'triangle';
  icon: IntaviaIconTypes;
  iconStyle: string;
  color: KindColor;
  strokeWidth: number;
}

interface EntityKindProperties {
  kind: string;
  label: string;
  shape: 'dot' | 'ellipse' | 'rectangle' | 'triangle';
  icon: IntaviaIconTypes;
  iconStyle: string;
  color: KindColor;
}

export const highlight = {
  color: '#ffdf00',
  scale: 1.6,
};

export const temporalColorScales = {
  reds: ['#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d', '#27000d'],
};

const eventKindPropertiesByType: Record<EventKindProperties['type'], EventKindProperties> = {
  birth: {
    label: 'Birth',
    type: 'birth',
    shape: 'dot',
    icon: 'event-circle', //event-diamond
    iconStyle: 'fill-[#EFEFEF] stroke-[#333333]',
    color: {
      foreground: '#333333',
      background: '#EFEFEF',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
    strokeWidth: 3,
  },
  death: {
    label: 'Death',
    type: 'death',
    shape: 'dot',
    icon: 'event-circle', //event-diamond
    iconStyle: 'fill-[#666666] stroke-[#111111]',
    color: {
      foreground: '#111111',
      background: '#666666',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
    strokeWidth: 2,
  },
  production: {
    label: 'Production',
    type: 'production',
    shape: 'rectangle',
    icon: 'event-rectangle',
    iconStyle: 'fill-intavia-conifer-400 stroke-intavia-conifer-600',
    color: {
      foreground: '#ceeda9',
      background: '#92d050',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
    strokeWidth: 1,
  },
  movement: {
    label: 'Travel',
    type: 'movement',
    shape: 'dot',
    icon: 'event-circle',
    iconStyle: 'fill-intavia-cornflower-400 stroke-intavia-cornflower-600',
    color: {
      foreground: '#c5d9f8',
      background: '#6d9eeb',
     main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
    strokeWidth: 1,
  },
  career: {
    label: 'Career',
    type: 'career',
    shape: 'dot',
    icon: 'event-circle',
    iconStyle: 'fill-intavia-downy-400 stroke-intavia-downy-600',
    color: {
      foreground: '#b1e9cb',
      background: '#65c99e',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
    strokeWidth: 1,
  },
  default: {
    label: 'Event',
    type: 'default',
    shape: 'dot',
    icon: 'event-circle',
    iconStyle: 'fill-intavia-apple-500 stroke-intavia-apple-700',
    color: {
      foreground: '#4b5988',
      background: '#849dd0',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
    strokeWidth: 1,
  },
};

export const eventKindByEventId: Record<EventKind['id'], EventKindProperties['type']> = {
  //TODO: check if labels of upstream event-kinds still used within code to access colors/shapes
  //birth
  birth: 'birth',
  'Birth (crm)': 'birth',
  'aHR0cDovL3d3dy5jaWRvYy1jcm0ub3JnL2NpZG9jLWNybS9FNjdfQmlydGg=': 'birth', // Birth (crm)
  'event-kind-birth': 'birth',

  //event/default
  'Event (crm)': 'default',
  'aHR0cDovL3d3dy5jaWRvYy1jcm0ub3JnL2NpZG9jLWNybS9FNV9FdmVudA==': 'default', // Event (crm)

  //production
  'Production (crm)': 'production',
  creation: 'production',
  production: 'production',
  'aHR0cDovL3d3dy5jaWRvYy1jcm0ub3JnL2NpZG9jLWNybS9FMTJfUHJvZHVjdGlvbg==': 'production', // Production (crm)
  'event-kind-production': 'production',
  'event-kind-creation': 'production',

  //career
  Career: 'career',
  professional: 'career',
  'aHR0cDovL3d3dy5pbnRhdmlhLmV1L2lkbS1jb3JlL0NhcmVlcg==': 'career', // Career (idm-core)
  'event-kind-professional': 'career',
  education: 'career',
  'event-kind-education': 'career',
  'event-kind-career': 'career',

  //honour
  'aHR0cDovL3d3dy5pbnRhdmlhLmV1L2lkbS1jb3JlL0hvbm91cg==': 'career', // Honour (idm-core)
  'event-kind-honour': 'career',

  //movement
  travel: 'movement',
  'event-kind-travel': 'movement',
  'event-kind-movement': 'movement',

  //death
  death: 'death',
  'Death (crm)': 'death',
  'aHR0cDovL2RhdGEuYmlvZ3JhcGh5bmV0Lm5sL3JkZi9EZWF0aA==': 'death',
  'aHR0cDovL3d3dy5jaWRvYy1jcm0ub3JnL2NpZG9jLWNybS9FNjlfRGVhdGg=': 'death', // Death (crm)
  'event-kind-death': 'death',
};

export function getColorById(id: string): string {
  const eventKind = eventKindByEventId[id];
  if (eventKind != null) {
    return eventKindPropertiesByType[eventKind]!.color.background as string;
  } else {
    return eventKindPropertiesByType.default!.color.background as string;
  }
}

export function getColorsById(id: string): KindColor {
  const eventKind = eventKindByEventId[id];
  if (eventKind != null) {
    return eventKindPropertiesByType[eventKind]!.color;
  } else {
    return eventKindPropertiesByType.default!.color;
  }
}

export function getEventKindPropertiesById(id: string): EventKindProperties {
  const eventKind = eventKindByEventId[id];
  if (eventKind != null) {
    return eventKindPropertiesByType[eventKind] as EventKindProperties;
  } else {
    return eventKindPropertiesByType.default as EventKindProperties;
  }
}

export function getEventKindPropertiesByType(type: string): EventKindProperties {
  if (type in eventKindPropertiesByType) {
    return eventKindPropertiesByType[type] as EventKindProperties;
  } else {
    return eventKindPropertiesByType.default as EventKindProperties;
  }
}

const entityKindProperties: Record<EntityKind, EntityKindProperties> = {
  person: {
    label: 'Person',
    kind: 'person',
    shape: 'dot',
    icon: 'person',
    iconStyle: 'fill-intavia-apple-500 stroke-intavia-apple-700',
    color: {
      foreground: '#4b5988',
      background: '#849dd0',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
  },
  'cultural-heritage-object': {
    label: 'CH-Object',
    kind: 'cultural-heritage-object',
    shape: 'rectangle',
    icon: 'cultural-heritage-object',
    iconStyle: 'fill-intavia-conifer-400 stroke-intavia-conifer-600',
    color: {
      foreground: '#ceeda9',
      background: '#92d050',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
  },
  place: {
    label: 'Place',
    kind: 'place',
    shape: 'triangle',
    icon: 'place',
    iconStyle: 'fill-intavia-wistful-400 stroke-intavia-wistful-600',
    color: {
      foreground: '#e5e2f2',
      background: '#b4a7d6',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
  },
  group: {
    label: 'Group',
    kind: 'group',
    shape: 'ellipse',
    icon: 'group',
    iconStyle: 'fill-intavia-tumbleweed-400 stroke-intavia-tumbleweed-600',
    color: {
      foreground: '#ecd3bc',
      background: '#d19066',
      main: '#849dd0',
      light: '#d4e3f1',
      dark: '#4b5988',
    },
  },
  'historical-event': {
    label: 'Historical Event',
    kind: 'historical-event',
    shape: 'dot',
    icon: 'historical-event',
    color: { foreground: 'hsl(297, 60%, 80%)', background: 'hsl(297, 100%, 35%)' },
  },
};

export function getEntityColorByKind(kind: EntityKind): KindColor {
  return entityKindProperties[kind].color;
}

export function getEntityKindPropertiesByKind(kind: EntityKind): EntityKindProperties {
  return entityKindProperties[kind] as EntityKindProperties;
}
