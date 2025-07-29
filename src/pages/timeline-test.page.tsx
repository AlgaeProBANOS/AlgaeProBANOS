import { Fragment, Document } from '@/api/memorise-client';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppSelector } from '@/app/store';
import {
  selectAllFragmentsByDocument,
  selectDocuments,
  selectFragmentContentForDocumentByID,
} from '@/app/store/memorise.slice';
import { useConvertDataToInTaVia } from '@/features/common/data/use-convert-data';
import type { Visualization } from '@/features/common/visualization.slice';
import { selectVisualizationById } from '@/features/common/visualization.slice';
import VisualisationComponent from '@/features/visualization-layouts/visualization-wrapper';

export const getStaticProps = withDictionaries(['common']);

export default function TimelineTest(): JSX.Element {
  // const { t } = useI18n<'common'>();

  const timelineVis = useAppSelector((state) => {
    return selectVisualizationById(state, 'timeline-test');
  });

  const documents = useAppSelector((state) => {
    return selectDocuments(state);
  });

  const fragsPerDocument = {} as Record<Document['id'], Array<Fragment>>;
  for (const doc of Object.keys(documents)) {
    const frags = useAppSelector((state) => {
      return selectFragmentContentForDocumentByID(state, doc);
    });
    fragsPerDocument[doc] = Object.values(frags);
  }

  const convertedFragments = useConvertDataToInTaVia(fragsPerDocument);

  return (
    <>
      <VisualisationComponent
        type="timeline"
        visualization={timelineVis as Visualization}
        entities={Object.fromEntries(
          convertedFragments.entities.map((e) => {
            return [e.id, e];
          }),
        )}
        events={Object.fromEntries(
          convertedFragments.events.map((e) => {
            return [e.id, e];
          }),
        )}
      />
    </>
  );
}
