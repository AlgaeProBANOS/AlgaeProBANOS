import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { Input } from '@intavia/ui';
import { isEmojiSupported } from 'is-emoji-supported';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useRef } from 'react';
import { ReactCountryFlag } from 'react-country-flag';

import { useI18n } from '@/app/i18n/use-i18n';
import * as routes from '@/app/route/routes';
import { usePathname } from '@/app/route/use-pathname';

import { Button } from './button';

interface Link {
  id: string;
  href: { pathname: string };
  label: JSX.Element | string;
}

interface AppBarProps {
  maintenanceMode?: boolean;
}

export function AppBar(props: AppBarProps): JSX.Element {
  const { maintenanceMode = false } = props;

  const currentPath = usePathname();

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

  return (
    <div className="h-16 w-full px-4 bg-apb-green">
      <div className="flex flex-row flex-nowrap justify-between">
        <div className="flex flex-row items-center gap-4 text-white underline-offset-8">
          <div className="relative h-14 w-32">
            <Link href="/" aria-current={currentPath === '/' ? 'page' : undefined}>
              <div>
                <span className="sr-only">Home</span>
                <Image
                  alt=""
                  src="/assets/images/APB-logo-white.png"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </Link>
          </div>
          <Link
            href="/species"
            className={`${currentPath.includes('species') ? 'font-bold underline' : ''}`}
          >
            Algae Species
          </Link>
          <Link
            href="/products"
            className={`${currentPath.includes('products') ? 'font-bold underline' : ''}`}
          >
            Algae Products
          </Link>
          {/* <div className="flex h-16 flex-row items-center gap-3 text-2xl">
            Heritage of Nazi Persecution - Portal
          </div> */}
        </div>
        {/* {maintenanceMode === true && (
          <div className="flex h-10 items-center rounded-full bg-apb-pink-100 p-[4px_12px] text-center text-apb-dark text-white">
            &#9888; Maintenance Mode
          </div>
        )} */}
        <div className="flex flex-row items-center justify-center py-4">
          <SearchForm />
          <Popover className="relative flex items-center">
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
          </Popover>
        </div>
      </div>
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
