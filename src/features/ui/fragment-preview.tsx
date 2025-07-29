import { useMemo } from 'react';

import type { Fragment, Project } from '@/api/memorise-client';
import { useAppSelector } from '@/app/store';
import { selectFragmentById } from '@/app/store/memorise.slice';

import { useDetailsForFragment } from '../common/data/use-fragment-details';

interface FragementElementProps {
  id: Fragment['id'];
  project: Project['id'];
}

export function FragmentPreview(props: FragementElementProps): JSX.Element {
  const { id, project } = props;

  const fragment = useAppSelector((state) => {
    return selectFragmentById(state, id);
  });

  const loading = useDetailsForFragment({
    projectID: project,
    fragmentID: id,
    skip: fragment != null,
  });

  const content = useMemo(() => {
    if (loading) {
      return 'Loading...';
    } else {
      return <div> {id}</div>;
    }
  }, [loading, id]);

  return <>{content}</>;
}
