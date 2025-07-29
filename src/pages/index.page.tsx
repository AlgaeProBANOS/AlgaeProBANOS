import { PageMetadata } from '@stefanprobst/next-page-metadata';
import Image from 'next/image';

import { Document, Fragment } from '@/api/apb-client';
import { useI18n } from '@/app/i18n/use-i18n';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { usePageTitleTemplate } from '@/app/metadata/use-page-title-template';
import { useAppSelector } from '@/app/store';
import { selectDocuments, selectFragmentContentForDocumentByID } from '@/app/store/memorise.slice';
import { useConvertDataToInTaVia } from '@/features/common/data/use-convert-data';
import { selectVisualizationById } from '@/features/common/visualization.slice';
import DataPanel from '@/features/ui/data-panel';
import { useDocumentWordsAsOneString } from '@/features/ui/use-document-words';
import VisualisationComponent from '@/features/visualization-layouts/visualization-wrapper';
import Wordcloud from '@/features/wordcloud/wordcloud';
import Link from 'next/link';
// import { useTestResponseType } from '@/features/common/data/use-data';

export const getStaticProps = withDictionaries(['common']);

export default function HomePage(): JSX.Element {
  const { t } = useI18n<'common'>();

  const titleTemplate = usePageTitleTemplate();

  const metadata = { title: t(['common', 'home', 'metadata', 'title']) };

  const mapVis = useAppSelector((state) => {
    return selectVisualizationById(state, 'map-test');
  });

  const timelineVis = useAppSelector((state) => {
    return selectVisualizationById(state, 'timeline-test');
  });

  const documents = useAppSelector((state) => {
    return selectDocuments(state);
  });

  const documentsAsStrings: Record<string, string> = {};

  const fragsPerDocument = {} as Record<Document['id'], Array<Fragment>>;
  for (const doc of Object.keys(documents)) {
    const docString = useDocumentWordsAsOneString({ document: doc });
    documentsAsStrings[doc] = docString;

    const frags = useAppSelector((state) => {
      return selectFragmentContentForDocumentByID(state, doc);
    });
    fragsPerDocument[doc] = Object.values(frags);
  }

  const convertedFragments = useConvertDataToInTaVia(fragsPerDocument);

  console.log(convertedFragments);

  return (
    <div className="grid size-full grid-cols-[1fr] grid-rows-[1fr,auto] gap-2 p-2 dark:bg-apb-dark dark:text-apb-gold-100">
      <PageMetadata title={metadata.title} titleTemplate={titleTemplate} />
      <div className="flex size-full items-center justify-center gap-2">
        <div className="flex rounded-md border border-apb-gray flex-col p-4">
          Species
          <Link className="text-apb-aubergine" href="/species">
            Algae Species
          </Link>
        </div>
        <div className="rounded-md border border-apb-gray flex flex-col p-4">
          Products
          <Link className="text-apb-aubergine" href="/products">
            Algae Products
          </Link>
        </div>
      </div>
      <footer className="col-span-3 flex h-12 place-content-center items-center gap-4 bg-neutral-200 px-20 text-xs text-neutral-900 dark:bg-apb-gray dark:text-apb-gold-100">
        <Image src="/assets/images/EC_logo_s.png" alt="EC Logo" width={45} height={26} />
        <p>
          This project is funded by the European Union&apos;s Horizon Europe research and innovation
          programme under grant agreement No. 101061016. This website reflects only the
          authors&apos; views.
        </p>
      </footer>
    </div>
  );
}
