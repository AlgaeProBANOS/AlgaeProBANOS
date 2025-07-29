import { assert } from '@stefanprobst/assert';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

export interface DateContextType {
  date: Date | null;
  document: string | null;
  director: string | null;
  showAnnotations: boolean | null;
  alignScrolling: boolean | null;
  updateDate: (d: Date | null, document: string | null) => void;
  updateDirector: (d: string | null) => void;
  updateAlignScrolling: (b: boolean | null) => void;
  updateShowAnnotations: (b: boolean | null) => void;
}

interface DateProviderProps {
  children: ReactNode;
}

export const DateContext = createContext<DateContextType | null>(null);

export function DateProvider(props: DateProviderProps): JSX.Element {
  const { children } = props;
  const [date, setDate] = useState<Date | null>(null);
  const [document, setDocument] = useState<string | null>(null);
  const [director, setDirector] = useState<string | null>(null);
  const [alignScrolling, setAlignScrolling] = useState<boolean | null>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean | null>(true);

  const value = useMemo(() => {
    const updateDate = (d: Date | null, document: string | null) => {
      setDate(d);
      setDocument(document);
    };

    const updateDirector = (d: string | null) => {
      setDirector(d);
    };

    const updateAlignScrolling = (d: boolean | null) => {
      setAlignScrolling(d);
    };

    const updateShowAnnotations = (d: boolean | null) => {
      setShowAnnotations(d);
    };

    return {
      date,
      updateDate,
      document,
      director,
      showAnnotations,
      alignScrolling,
      updateDirector,
      updateAlignScrolling,
      updateShowAnnotations,
    };
  }, [date, document, director, alignScrolling, showAnnotations]);

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
}

export function useDateState() {
  const value = useContext(DateContext);
  assert(value != null, 'missing tabbar provider');
  return value;
}
