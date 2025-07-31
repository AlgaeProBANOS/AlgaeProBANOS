import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { useRouter } from 'next/router';
import { type FormEvent, useEffect, useRef, useState } from 'react';

import { useLazyGetSearchFragmentByIDQuery } from '@/api/memorise.service';
import { useI18n } from '@/app/i18n/use-i18n';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  clearSearchResults,
  selectFragmentsByProjectId,
  selectSearchResultDocuments,
  selectSearchResultFragments,
} from '@/app/store/memorise.slice';
import { Button } from '@/features/ui/button';
import RegexTable from '@/features/ui/regex-table';
import { baseAPIProject } from '~/config/apb.config';

export const getStaticProps = withDictionaries(['common']);

export default function SearchPage(): JSX.Element {
  const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();

  const router = useRouter();
  const { q } = router.query;

  const [searchTerm, setSearchTerm] = useState<string>(q as string);

  const fragmentLimit = 200;

  const fragments = useAppSelector((state) => {
    return selectFragmentsByProjectId(state, baseAPIProject);
  });
  const [trigger] = useLazyGetSearchFragmentByIDQuery();

  const searchResultDocuments = useAppSelector((state) => {
    return selectSearchResultDocuments(state);
  });

  const searchResultFragments = useAppSelector((state) => {
    return selectSearchResultFragments(state);
  });

  const searchRef = useRef<HTMLInputElement>(null);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchTerm(searchRef.current?.value ?? '');
  }

  useEffect(() => {
    if (q != null) {
      setSearchTerm(q as string);
    }
  }, [q]);

  useEffect(() => {
    if (fragments != null && searchTerm !== '') {
      dispatch(clearSearchResults());
      for (const frag of fragments.slice(0, fragmentLimit)) {
        void trigger({
          project: baseAPIProject,
          fragmentID: frag,
          searchTerm: searchTerm,
        });
      }
    } else {
      dispatch(clearSearchResults());
    }
  }, [dispatch, fragments, searchTerm, trigger]);

  function SearchForm(): JSX.Element {
    return (
      <div className="flex px-8 py-4">
        <form autoComplete="off" name="search" noValidate onSubmit={onSubmit} role="search">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <input
              ref={searchRef}
              aria-label="Search"
              className="rounded-md border border-neutral-500 bg-neutral-50 p-2"
              defaultValue={searchTerm}
              key="search-test"
              placeholder={`${t(['common', 'form', 'search'])} ...`}
              type="search"
            />
            <Button>{`Search in the first ${fragmentLimit} fragments`}</Button>
          </div>
        </form>
        <Popover className="relative flex items-center">
          <div className="hover:text-memorise-blue-900">
            <PopoverButton>&#9432;</PopoverButton>
          </div>
          <PopoverPanel
            anchor={{ to: 'bottom' }}
            transition
            className="z-[99998] flex p-1 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {() => {
              return (
                <div className="relative flex flex-col items-center">
                  <div className="z-50 h-[12px] w-[24px]">
                    <div className="relative size-0 border-x-[12px] border-b-[12px] border-x-transparent border-b-memorise-black-600">
                      <div className="absolute left-[-11px] top-px size-0 border-x-[11px] border-b-[11px] border-x-transparent border-b-white"></div>
                    </div>
                  </div>
                  <div className="z-10 flex flex-col gap-1 rounded-md bg-white p-2 shadow-xl ring-1 ring-memorise-black-600 ">
                    <RegexTable />
                  </div>
                </div>
              );
            }}
          </PopoverPanel>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex h-full w-[600px] flex-col self-center">
      <SearchForm />
      <div>
        {Object.keys(searchResultDocuments).map((e) => {
          return (
            <div key={`search-result-${e}`}>
              <div className="font-bold">{`${searchResultDocuments[e]?.author?.lastName} ${searchResultDocuments[e]?.author?.firstName}`}</div>
              <div>
                {searchTerm !== '' &&
                  searchResultDocuments[e]!.fragments?.map((f) => {
                    const text = searchResultFragments[f]!.text ?? '';
                    const regex = new RegExp(`(?<!\\w)${searchTerm}(?!\\w)`, 'gi');

                    let match;
                    const positions = [];

                    while ((match = regex.exec(text)) !== null) {
                      positions.push({ index: match.index, text: match[0] });
                    }

                    return (
                      <div className="ml-4" key={`search-result-fragment-${f}`}>
                        <span className="font-bold">{searchResultFragments[f]?.date}:</span>
                        {positions.map((match, i) => {
                          return (
                            <div key={`search-result-fragment-text-${f}-${i}`}>
                              ...
                              {text.substring(match.index - 30, match.index)}
                              <span className="rounded bg-yellow-300 shadow-md">{match.text}</span>
                              {text.substring(
                                match.index + match.text.length,
                                match.index + match.text.length + 30,
                              )}
                              ...
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
