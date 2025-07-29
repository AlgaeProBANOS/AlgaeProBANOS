// import {Document} from "memor"

import type {
  CulturalHeritageObject,
  CulturalHeritageObjectType,
  EntityEventRelation,
  Event,
  EventEntityRelation,
  InternationalizedLabel,
} from '@intavia/api-client';
import { Entity, event } from '@intavia/api-client';

import type { Document, Fragment } from '@/api/memorise-client';
import { useAppSelector } from '@/app/store';
import { selectDocuments, selectPlaces } from '@/app/store/memorise.slice';

// export interface Document {
//   id: string;
//   type: 'diary' | 'letter' | 'testimony';
// }

// export interface Fragment {
//   id: string;
//   projectID: Project['id'];
//   text?: string;
//   date?: IsoDateString; //it will be a string after being loaded from the storage, hence, making it a string in the first place to avoid type messup
//   isPartOf?: Document['id'];
//   annotations?: Array<Annotation>;
//   place?: Place['id'];
// }

/* export interface Event {
  id: string;
  label: InternationalizedLabel;
  description?: string;
  kind: EventKind["id"];
  startDate?: IsoDateString;
  endDate?: IsoDateString;
  media?: Array<MediaResource["id"]>;
  relations: Array<EventEntityRelation>;
} */

export function convertDocument(d: Document): CulturalHeritageObject {
  return {
    id: `${d.id}-entity`,
    kind: 'cultural-heritage-object',
    type: {
      id: d.type,
      label: { en: d.type } as InternationalizedLabel,
    } as CulturalHeritageObjectType,
    label: { en: d.id } as InternationalizedLabel,
    relations: [],
  };
}

export function convertFragment(f: Fragment): Event {
  return {
    id: `${f.id}-event`,
    label: { en: `${f.text?.substring(0, 20)}...` } as InternationalizedLabel,
    kind: 'fragment',
    relations: [],
    description: f.text,
    startDate: f.date,
    endDate: f.date,
  };
}

export function useConvertDataToInTaVia(fragments: Record<Document['id'], Array<Fragment>>) {
  const documents = useAppSelector((state) => {
    return selectDocuments(state);
  });

  const places = useAppSelector((state) => {
    return selectPlaces(state);
  });

  const events = [];
  const entities = [];

  for (const [docKey, frags] of Object.entries(fragments)) {
    const documentEntity = convertDocument(documents[docKey] as Document);

    for (const fragment of frags.slice(0,1)) {
      const documentEvent = convertFragment(fragment);

      const docRelation: EntityEventRelation = {
        event: documentEvent.id,
        role: 'diary-entry',
      };
      documentEntity.relations.push(docRelation);

      const eventRelation: EventEntityRelation = {
        entity: documentEntity.id,
        role: 'part-of',
      };
      documentEvent.relations.push(eventRelation);

      if (fragment.place != null && Object.keys(places).includes(fragment.place)) {
        const placeRelation: EventEntityRelation = {
          entity: fragment.place,
          role: 'location',
        };

        documentEvent.relations.push(placeRelation);
      }

      events.push(documentEvent);
    }

    entities.push(documentEntity);
  }

  return { entities: entities, events: events };
}
