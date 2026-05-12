import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { PageMetadata } from '@stefanprobst/next-page-metadata';
import Image from 'next/image';
import Link from 'next/link';

import { useI18n } from '@/app/i18n/use-i18n';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { usePageTitleTemplate } from '@/app/metadata/use-page-title-template';
import { AcademicCapIcon, FunnelIcon, MapIcon } from '@heroicons/react/24/outline';
// import { useTestResponseType } from '@/features/common/data/use-data';

export const getStaticProps = withDictionaries(['common']);

export default function StartPage(): JSX.Element {
  const { t } = useI18n<'common'>();

  const titleTemplate = usePageTitleTemplate();

  const metadata = { title: t(['common', 'home', 'metadata', 'title']) };

  const cards = [
    {
      id: 'card-apb-dashboard',
      title: 'Algae Farming and Product Dashboard',
      text: 'The Algae Farming and Product Dashboard lets you explore algae cultivation and the products made from it. The dashboard uses an interactive map and filters so you find companies by production characteristics and the species they use. These matching species appear in a nested tree map visualizations and a list view. All views are connected, helping you move smoothly between farming activity and products.',
      href: { pathname: '/dashboard' },
      icon: <MapIcon className="size-6" />,
      img: {
        src: '/assets/images/dashboard_teaser.jpeg',
        alt: 'Algae Farming and Product Dashboard',
      },
      button: 'Explore',
    },
    {
      id: 'card-bio-refinery',
      title: 'Algae Economist',
      text: 'The screening tool supports the techno-economic assessment of algal biorefinery concepts by integrating biomass characteristics, process configurations, and economic assumptions. It translates technical inputs into key economic indicators and levelized production costs, enabling rapid evaluation of. The results provide a transparent, decision-oriented basis for early-stage planning and scenario exploration.',
      href: { pathname: '/bio/index.html' },
      icon: <FunnelIcon className="size-6" />,
      img: { src: '/assets/images/BioRefinery2.jpeg', alt: 'Visual Analytics Studio' },
      button: 'Customize',
    },
    {
      id: 'card-knowledge-base',
      title: 'Algae Knowledge Base',
      text: 'The Algae Knowledge Base is an interactive, AI-powered platform that brings together curated scientific literature, reports, and reference material on algae in one searchable environment. It connects a structured knowledge base with a conversational chat interface, allowing users to ask natural-language questions and receive precise, context-aware answers.',
      href: { pathname: 'https://algaebrain.dk/public' },
      icon: <AcademicCapIcon className="size-6" />,
      img: { src: '/assets/images/algaeKnowledgeBase.png', alt: 'Story Creator' },
      button: 'Learn',
    },
  ];

  return (
    <>
      <PageMetadata title={metadata.title} titleTemplate={titleTemplate} />
      <main>
        <div className="size-full grid grid-cols-1 grid-rows-[auto_1fr_min-content] justify-between">
          <section className="flex max-h-[400px] min-h-[200px] flex-col place-content-center items-center gap-10 bg-gradient-to-r to-apb-green-dark from-apb-green">
            <div className="flex flex-row items-center gap-8">
              <div className="relative h-48 w-52">
                <Link href="/">
                  <Image
                    src={'/assets/images/APB-logo-white.png'}
                    layout="fill"
                    objectFit="contain"
                  />
                </Link>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-apb-gray-light">AlgaeProBANOS Tool Suite</h1>
                <h2 className="text-2xl text-apb-gray-light">Suite of Algae Analytics Tools</h2>
              </div>
            </div>
          </section>

          <div className="relative size-full overflow-hidden">
            <div className="absolute size-full overflow-hidden overflow-y-scroll">
              <section className="my-10 flex flex-wrap justify-center gap-10">
                {cards.map((card) => {
                  return (
                    <div
                      key={card.title}
                      className="flex w-96 max-w-sm flex-col flex-nowrap rounded-lg border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-800 text-apb-aubergine"
                    >
                      <Link
                        href={card.href.pathname}
                        className="flex place-content-center items-center gap-2 pt-3"
                      >
                        <div>{card.icon}</div>
                        <div className="text-lg font-medium dark:text-white">{card.title}</div>
                      </Link>
                      <div className="w-full h-fit px-5 py-2">
                        <div className="size-full h-auto relative flex items-center">
                          <Link href={card.href.pathname}>
                            <Image
                              src={card.img.src}
                              width={500}
                              height={500}
                              className="h-44 w-auto"
                              alt={card.img.alt}
                            />
                          </Link>
                        </div>
                      </div>
                      <p className="h-full px-5 py-2 text-justify font-normal text-neutral-700 dark:text-neutral-400">
                        {card.text}
                      </p>
                      <Link
                        href={card.href.pathname}
                        className="flex w-full place-content-end items-center gap-2 rounded-b-lg px-5 py-3 font-medium"
                      >
                        {card.button}
                        <ChevronRightIcon className="size-5" />
                      </Link>
                    </div>
                  );
                })}
              </section>
            </div>
          </div>

          <footer className="flex h-16 place-content-center items-center gap-4 bg-neutral-200 px-20 text-sm text-neutral-900">
            <Image src="/assets/images/EC_logo_s.png" alt="EC Logo" width={55} height={36} />
            <p>
              This project is funded by the European Union's Horizon Europe research and innovation
              programme under grant agreement No. 101061016. This website reflects only the authors'
              views.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
