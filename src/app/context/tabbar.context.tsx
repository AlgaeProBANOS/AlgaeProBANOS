import { assert } from '@stefanprobst/assert';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import type { Tab } from '@/features/ui/ui.slice';

export interface TabbarContextType {
  selected: Tab | null;
  updateSelected: (tab: Tab | null) => void;
}

interface TabbarProviderProps {
  children: ReactNode;
  initialValue?: Tab;
}

export const TabbarContext = createContext<TabbarContextType | null>(null);

export function TabbarProvider(props: TabbarProviderProps): JSX.Element {
  const { children, initialValue } = props;
  const [selected, setSelected] = useState<Tab | null>(initialValue ?? null);

  const value = useMemo(() => {
    const updateSelected = (select: Tab | null) => {
      setSelected(select);
    };
    return { selected, updateSelected };
  }, [selected]);

  return <TabbarContext.Provider value={value}>{children}</TabbarContext.Provider>;
}

export function useTabbarState() {
  const value = useContext(TabbarContext);
  assert(value != null, 'missing tabbar provider');
  return value;
}
