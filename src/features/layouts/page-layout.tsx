import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';

/* import {
  useGetDocumentsByProjectQuery,
  useGetFragmentsByProjectQuery,
} from '@/api/memorise.service'; */
import { useAppDispatch, useAppSelector } from '@/app/store';
import { AppBar } from '@/features/ui/app-bar';

import {
  resetState,
  selectSpecies,
  selectTimeStamp,
  setSpecies,
  setTimeStamp,
} from '@/app/store/apb.slice';
import allSpecies from '@/data/allSpecies.json';
import Overlay from '../ui/overlay';

export interface PageLayoutProps {
  children?: ReactNode;
}

export function PageLayout(props: PageLayoutProps): JSX.Element {
  const { children } = props;
  const dispatch = useAppDispatch();

  const timeStamp = useAppSelector(selectTimeStamp);

  const species = useAppSelector(selectSpecies);

  useEffect(() => {
    if (!timeStamp) return;

    const lastDate = new Date(timeStamp);
    if (isNaN(lastDate.getTime())) return;

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (Date.now() - lastDate.getTime() > ONE_DAY_MS) {
      // reset species in the store when the timestamp is older than one day
      dispatch(resetState());
    }
  }, [timeStamp]);

  const currentTime = new Date().toISOString();
  dispatch(setTimeStamp(currentTime));

  const skip = useMemo(() => {
    return Object.keys(species).length === 194;
  }, [species]);

  // dispatch((state) => useSearchSpeciesQuery({ q: 'allspecies' }, { skip }));

  useEffect(() => {
    if (skip === false && allSpecies) {
      dispatch(setSpecies(allSpecies));
    }
  }, []);

  return (
    <div className="relative grid h-screen max-h-screen grid-rows-[48px_1fr] bg-neutral-50 m-0">
      <AppBar />
      <main>{children}</main>
      <Overlay />
    </div>
  );
}
