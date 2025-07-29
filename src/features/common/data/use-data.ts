// import { skip } from 'node:test';

import { useGetFragmentsByProjectQuery } from '@/api/memorise.service';
import type { Project } from '@/api/memorise-client';
import { useAppSelector } from '@/app/store';
import { selectProjectsAndFragments } from '@/app/store/memorise.slice';
import { baseAPIProject } from '~/config/memorise.config';

interface UseFragmentsFromProjectParams {
  project: Project['id'];
}

/* interface UseFragmentsFromProjectResult {
  fragments: Array<Fragment['id']>;
} */

export function useFragmentsFromProject(params: UseFragmentsFromProjectParams): boolean {
  const { project } = params;

  const projects = useAppSelector(selectProjectsAndFragments);

  // Check for local fragments - since there might be fragments/projects already loaded into the local store
  // if not fetch the missing project fragments

  const fragmentsForProject = useGetFragmentsByProjectQuery(
    {
      project: project,
    },
    { skip: projects[project] != null },
  );

  return fragmentsForProject.isLoading;
}

export function useTestResponseType() {
  const { data: test } = useGetFragmentsByProjectQuery({
    project: baseAPIProject,
  });

  /* const { data: details } = useGetFragmentByIDQuery(
    { fragmentID: test != null ? test.fragments[0] : '', project: 'string7' },
    { skip: test == null },
  ); */

  return test;
}
