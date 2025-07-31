import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppSelector } from '@/app/store';
import { selectDocumentByProjectId } from '@/app/store/memorise.slice';
import { baseAPIProject } from '~/config/apb.config';

import DocumentPreview from './document-preview';
import { useOverlayState } from '@/app/context/overlay.context';
// import { useTestResponseType } from '@/features/common/data/use-data';

export const getStaticProps = withDictionaries(['common']);

export default function DataPanel(): JSX.Element {
  const documents = useAppSelector((state) => {
    return selectDocumentByProjectId(state, baseAPIProject);
  });

  const { updateOverlay } = useOverlayState();

  const images = [
    {
      title: 'Part of the Lager',
      artist: 'Ervin Abadi',
      img: '/images/uknownByArbadi.png',
      camp: 'Bergen-Belsen',
      dateStr: 'Ca. 1945',
      caption:
        "'Part of the Lager' (Bergen Belsen) by Ervin Abadi. Watercolor, ink and colored graphite pencil drawing. Ervin Abadi, a Hungarian Jew from Budapest, was an aspiring young artist when WWII began. He was drafted into the Hungarian labor service in the early 1940s. Abadi managed to escape, but was recaptured and immediately deported to Bergen-Belsen. When the camp was liberated, his condition was such that he required extended hospitalization. During his convalescence, he created dozens of works of holocaust art, including ink drawings, pencil and ink sketches and watercolors.After recuperating Abadi returned to Budapest, where he published a collection of his watercolors in 1946. After becoming disillusioned with the communist regime in Hungary, he moved to Israel, where he continued to publish in Hungarian and Hebrew. He died in Israel in 1980.",
    },
  ];

  return (
    <div className="size-full font-sans dark:text-memorise-gold-100">
      {documents != null && (
        <Disclosure as="div" className="" defaultOpen={true}>
          <DisclosureButton className="group flex w-full items-center justify-between font-bold">
            <span className="px-1 text-sm/6 font-bold group-data-[hover]:text-black/80 group-data-[hover]:bg-memorise-blue-100 dark:group-data-[hover]:bg-memorise-gold-100 dark:group-data-[hover]:text-memorise-dark">
              {`Documents (${documents.length})`}
            </span>
            <ChevronDownIcon className="size-5  group-data-[open]:rotate-180 group-data-[hover]:fill-black/50 dark:group-data-[hover]:fill-memorise-gold-100" />
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top text-sm/5 transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0 pl-2"
          >
            {documents.map((e, i) => {
              return <DocumentPreview key={`document-${i}`} id={e} />;
            })}
          </DisclosurePanel>
        </Disclosure>
      )}
      {documents != null && (
        <Disclosure as="div" className="" defaultOpen={true}>
          <DisclosureButton className="group flex w-full items-center justify-between font-bold">
            <span className="px-1 text-sm/6 font-bold group-data-[hover]:text-black/80 group-data-[hover]:bg-memorise-blue-100 dark:group-data-[hover]:bg-memorise-gold-100 dark:group-data-[hover]:text-memorise-dark">
              {`Images (${images.length})`}
            </span>
            <ChevronDownIcon className="size-5 group-data-[open]:rotate-180 group-data-[hover]:fill-black/50 dark:group-data-[hover]:fill-memorise-gold-100" />
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top text-sm/5 transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0 pl-2"
          >
            {images.map((e, i) => {
              return (
                <div
                  className="hover:cursor-pointer hover:bg-memorise-blue-100 dark:text-memorise-gold-100 dark:hover:bg-memorise-gold-100 dark:hover:text-memorise-dark"
                  key={`image-data-entry-${i}`}
                  onClick={() => {
                    console.log('click', e, i);

                    updateOverlay({ entity: e, mode: 'document' } as Overlay);
                  }}
                >
                  {e.title}
                </div>
              );
            })}
          </DisclosurePanel>
        </Disclosure>
      )}
      {documents != null && (
        <Disclosure as="div" className="" defaultOpen={true}>
          <DisclosureButton className="group flex w-full items-center justify-between">
            <span className="px-1 text-sm/6 font-bold group-data-[hover]:text-black/80 group-data-[hover]:bg-memorise-blue-100 dark:group-data-[hover]:bg-memorise-gold-100 dark:group-data-[hover]:text-memorise-dark">
              {`Persons (1000)`}
            </span>
            <ChevronDownIcon className="size-5 group-data-[open]:rotate-180 group-data-[hover]:fill-black/50 dark:group-data-[hover]:fill-memorise-gold-100" />
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top text-sm/5 transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0 pl-2"
          ></DisclosurePanel>
        </Disclosure>
      )}
    </div>
  );
}
