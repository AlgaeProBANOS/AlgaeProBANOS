import { assert } from '@stefanprobst/assert';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

export interface SearchContextType {
  searchTerm: string | null;
  isCasing: boolean | null;
  updateSearchTerm: (d: string | null) => void;
  updateCasing: (v: boolean | null) => void;
}

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider(props: SearchProviderProps): JSX.Element {
  const { children } = props;
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [isCasing, setCasing] = useState<boolean | null>(null);

  const value = useMemo(() => {
    const updateSearchTerm = (t: string | null) => {
      setSearchTerm(t);
    };

    const updateCasing = (v: boolean | null) => {
      setCasing(v);
    };

    return { searchTerm, updateSearchTerm, isCasing, updateCasing };
  }, [searchTerm]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchState() {
  const value = useContext(SearchContext);
  assert(value != null, 'missing search provider');
  return value;
}
