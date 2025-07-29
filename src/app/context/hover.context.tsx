import { assert } from '@stefanprobst/assert';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

export interface Hover {
  entities?: Array<string>;
  words?: Array<string>;
  events?: Array<string>;
  relatedEvents?: Array<string>;
}

interface HoverContextType {
  hovered: Hover | null;
  updateHover: (ids: Hover | null) => void;
}

interface HoverProviderProps {
  children: ReactNode;
}

export const HoverContext = createContext<HoverContextType | null>(null);

export function HoverProvider(props: HoverProviderProps): JSX.Element {
  const { children } = props;
  const [hovered, setHovered] = useState<Hover | null>(null);

  const value = useMemo(() => {
    const updateHover = (hover: Hover | null) => {
      setHovered(hover);
    };
    return { hovered, updateHover };
  }, [hovered]);

  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>;
}

export function useHoverState() {
  const value = useContext(HoverContext);
  assert(value != null, 'missing hover provider');
  return value;
}
