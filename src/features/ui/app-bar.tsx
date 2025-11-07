import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { GlobeAltIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Input } from '@intavia/ui';
import { isEmojiSupported } from 'is-emoji-supported';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';
import { ReactCountryFlag } from 'react-country-flag';

import { useI18n } from '@/app/i18n/use-i18n';
import * as routes from '@/app/route/routes';
import { usePathname } from '@/app/route/use-pathname';

import { Button } from './button';
import { useTooltipState } from '../common/tooltip/tooltip-provider';
import { resetAllFilters } from '@/app/store/apb.slice';
import { useAppDispatch } from '@/app/store';

interface Link {
  id: string;
  href: { pathname: string };
  label: JSX.Element | string;
}

interface AppBarProps {
  maintenanceMode?: boolean;
}

export function Sidepanel(props): JSX.Element {
  const { active } = props;

  return (
    <div
      className={`absolute top-[48px] right-0 h-full transition-size bg-slate-100 shadow-2xl z-[100] ${active ? 'max-w-[33vw]' : 'max-w-0'}`}
    >
      {active && (
        <div className="p-3 flex flex-col justify-center size-full">
          <div>
            <div className="font-bold mb-2">
              Welcome to the AlgaeProBANOS Farming and Product Dashboard
            </div>
            <div>
              This dashboard gives an overview of algae farming in Europe. It lets you explore where
              different species are cultivated, compare production methods, and look at potential
              contributions to nutrient removal and carbon sequestration. You can filter by species,
              products, and farm characteristics to find the information most relevant to your work.
            </div>
            <div className="m-2 bg-gray-400 text-white h-24 flex items-center justify-center">
              YouTube video here ...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppBar(props: AppBarProps): JSX.Element {
  const { maintenanceMode = false } = props;
  const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();

  const currentPath = usePathname();

  const { updateTooltip } = useTooltipState();

  const languages = [
    { localeString: 'en', countryCode: 'GB', languageString: 'English' },
    { localeString: 'de', countryCode: 'DE', languageString: 'Deutsch' },
    { localeString: 'nl', countryCode: 'NL', languageString: 'Nederlands' },
  ];

  const createLanguageLink = (
    localeString: string,
    countryCode: string,
    languageString: string,
  ) => {
    return (
      <Link
        key={`${countryCode}LanguageLink`}
        onClick={() => {
          close();
        }}
        href={currentPath}
        locale={localeString}
      >
        <div className="flex flex-row items-center gap-1 px-1 hover:bg-apb-blue-200">
          <ReactCountryFlag
            style={{
              fontSize: '1.5em',
              lineHeight: '1.5em',
            }}
            countryCode={countryCode}
            svg={!isEmojiSupported('🇬🇧')}
          />
          <div>{languageString}</div>
        </div>
      </Link>
    );
  };

  const [showSidepanel, setShowsidepanel] = useState<boolean>();

  return (
    <div className="h-12 w-full px-4 bg-apb-green">
      <div className="flex flex-row flex-nowrap justify-between h-full">
        <div className="flex flex-row items-center gap-4 text-white underline-offset-8">
          <div className="relative h-10 w-24">
            <Link href="/" aria-current={currentPath === '/' ? 'page' : undefined}>
              <div className="relative size-full">
                <span className="sr-only">Home</span>
                <Image
                  alt=""
                  src="/assets/images/APB-logo-white.png"
                  fill={true}
                  style={{ objectFit: 'contain' }}
                  sizes={'40px 40px'}
                />
              </div>
            </Link>
          </div>
          <div
            className="relative h-10 w-24 flex items-center"
            onMouseEnter={() => {
              updateTooltip(
                <div className="p-1">
                  This project is funded by the European Union's Horizon Europe research and
                  innovation programme under grant agreement No. 101061016. This website reflects
                  only the authors' views.
                </div>,
              );
            }}
            onMouseLeave={() => {
              updateTooltip(null);
            }}
          >
            <Image
              alt="EC Logo"
              src="/assets/images/EC_logo_s.png"
              style={{ objectFit: 'contain' }}
              width={45}
              height={26}
            />
          </div>
        </div>
        {maintenanceMode === true && (
          <div className="flex h-8 items-center rounded-b-md bg-apb-aubergine p-[4px_12px] text-center text-white">
            &#9888; Maintenance Mode
          </div>
        )}
        <div className="flex flex-row items-center justify-center py-4 gap-2">
          <button
            className="rounded-md bg-apb-aubergine text-white px-3 h-7"
            onClick={() => {
              dispatch(resetAllFilters());
            }}
          >
            Reset All
          </button>
          {/* <Popover className="relative flex items-center">
            <PopoverButton>
              <GlobeAltIcon className="size-7 text-white" />
            </PopoverButton>
            <PopoverPanel
              anchor="bottom"
              className="z-[99999] ml-[-8px] mt-2 flex flex-col gap-1 rounded-md bg-white p-2 shadow-lg"
            >
              {() => {
                return (
                  <>
                    {languages.map((entry) => {
                      return createLanguageLink(
                        entry.localeString,
                        entry.countryCode,
                        entry.languageString,
                      );
                    })}
                  </>
                );
              }}
            </PopoverPanel>
          </Popover> */}
          <button
            onClick={() => {
              setShowsidepanel(!showSidepanel);
            }}
          >
            <QuestionMarkCircleIcon className="size-7 text-white stroke-2" />
          </button>
        </div>
      </div>
      {showSidepanel && (
        <div
          className="absolute top-0 left-0 w-screen h-screen z-[99]"
          onClick={(e) => {
            setShowsidepanel(false);
            e.stopPropagation();
          }}
        ></div>
      )}
      <Sidepanel active={showSidepanel} />
    </div>
  );
}

function SearchForm(): JSX.Element {
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useI18n<'common'>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    const searchTerm = formData.get('q') as string;

    void router.push({
      pathname: routes.search().pathname,
      query: { q: searchTerm },
    });

    event.preventDefault();
  }

  return (
    <form autoComplete="off" name="search" noValidate onSubmit={onSubmit} role="search">
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <Input
          ref={searchRef}
          aria-label="Search"
          className="bg-neutral-50 rounded-full dark:bg-apb-gold-100 dark:text-apb-dark"
          defaultValue=""
          key="search-test"
          name="q"
          placeholder={`${t(['common', 'form', 'search'])} ...`}
          type="search"
        />

        <Button>{t(['common', 'form', 'search'])}</Button>
      </div>
    </form>
  );
}
