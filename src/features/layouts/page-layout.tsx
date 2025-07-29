import type { ReactNode } from 'react';
import { useEffect } from 'react';

import {
  useGetDocumentsByProjectQuery,
  useGetFragmentsByProjectQuery,
} from '@/api/memorise.service';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectMaintenanceMode, setData } from '@/app/store/memorise.slice';
import { AppBar } from '@/features/ui/app-bar';
import { baseAPIProject } from '~/config/memorise.config';

import Overlay from '../ui/overlay';

export interface PageLayoutProps {
  children?: ReactNode;
}

export function PageLayout(props: PageLayoutProps): JSX.Element {
  const { children } = props;
  const dispatch = useAppDispatch();

  const maintenanceMode = useAppSelector(selectMaintenanceMode);

  useEffect(() => {
    if (maintenanceMode) {
      // dispatch(setData(DefaultData));
    }
  }, [dispatch, maintenanceMode]);

  useGetDocumentsByProjectQuery({ project: baseAPIProject });
  useGetFragmentsByProjectQuery({ project: baseAPIProject });

  return (
    <div className="relative grid h-screen max-h-screen grid-rows-[auto_1fr] bg-neutral-50">
      <AppBar maintenanceMode />
      <main>{children}</main>
      <Overlay></Overlay>
    </div>
  );
}
