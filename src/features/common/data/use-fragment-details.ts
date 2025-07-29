import { useGetFragmentByIDQuery } from '@/api/memorise.service';

interface Params {
  projectID: string;
  fragmentID: string;
  skip?: boolean;
}

export function useDetailsForFragment(params: Params): boolean {
  const { projectID, fragmentID, skip = false } = params;

  const detailForFragment = useGetFragmentByIDQuery(
    {
      project: projectID,
      fragmentID: fragmentID,
    },
    { skip: skip },
  );

  return detailForFragment.isLoading;
}
