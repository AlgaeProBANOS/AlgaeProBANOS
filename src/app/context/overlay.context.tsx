import { assert } from '@stefanprobst/assert';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

export interface Overlay {
  entity: Array<string>;
  mode: string;
}

interface OverlayContextType {
  overlay: Overlay | null;
  updateOverlay: (overlay: Overlay | null) => void;
}

interface OverlayProviderProps {
  children: ReactNode;
}

export const OverlayContext = createContext<OverlayContextType | null>(null);

export function OverlayProvider(props: OverlayProviderProps): JSX.Element {
  const { children } = props;
  const [overlay, setOverlay] = useState<Overlay | null>(null);

  const value = useMemo(() => {
    const updateOverlay = (overlay: Overlay | null) => {
      setOverlay(overlay);
    };
    return { overlay, updateOverlay };
  }, [overlay]);

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlayState() {
  const value = useContext(OverlayContext);
  assert(value != null, 'missing overlay provider');
  return value;
}
