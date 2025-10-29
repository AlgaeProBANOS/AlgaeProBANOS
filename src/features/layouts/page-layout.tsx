import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';

/* import {
  useGetDocumentsByProjectQuery,
  useGetFragmentsByProjectQuery,
} from '@/api/memorise.service'; */
import { useAppDispatch, useAppSelector } from '@/app/store';
import { AppBar } from '@/features/ui/app-bar';

import Overlay from '../ui/overlay';
import { useRequestAllSpeciesProducts } from '../products/useRequestAllSpeciesProducts';
import { selectSpecies, setSpecies } from '@/app/store/apb.slice';
import { useSearchSpeciesQuery } from '@/api/apb.service';

export interface PageLayoutProps {
  children?: ReactNode;
}

export function PageLayout(props: PageLayoutProps): JSX.Element {
  const { children } = props;
  const dispatch = useAppDispatch();

  const species = useAppSelector(selectSpecies);
  const skip = useMemo(() => {
    return Object.keys(species).length === 194;
  }, [species]);

  // dispatch((state) => useSearchSpeciesQuery({ q: 'allspecies' }, { skip }));

  useEffect(() => {
    if (skip === false) {
      fetch('/data/allSpecies.json')
        .then((res) => res.json())
        .then(function (json) {
          dispatch(setSpecies(json));
        });
    }
  }, [skip]);

  return (
    <div className="relative grid h-screen max-h-screen grid-rows-[48px_1fr] bg-neutral-50 m-0">
      <AppBar maintenanceMode />
      <main>{children}</main>
      <Overlay></Overlay>
    </div>
  );
}
