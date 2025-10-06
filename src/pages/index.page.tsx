import { PageMetadata } from '@stefanprobst/next-page-metadata';
import Image from 'next/image';

import { useI18n } from '@/app/i18n/use-i18n';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { usePageTitleTemplate } from '@/app/metadata/use-page-title-template';
import Link from 'next/link';
// import { useTestResponseType } from '@/features/common/data/use-data';

export const getStaticProps = withDictionaries(['common']);

export default function HomePage(): JSX.Element {
  const { t } = useI18n<'common'>();

  const titleTemplate = usePageTitleTemplate();

  const metadata = { title: t(['common', 'home', 'metadata', 'title']) };

  return (
    <div className="grid size-full grid-cols-[1fr] grid-rows-[1fr,auto] gap-2 p-2 dark:bg-apb-dark dark:text-apb-gold-100">
      <PageMetadata title={metadata.title} titleTemplate={titleTemplate} />
      <div className="flex size-full items-center justify-center gap-2">
        <div className="rounded-md border border-apb-gray flex flex-col p-4">
          Explore
          <Link className="text-apb-aubergine" href="/products">
            Algae Species & Products
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
