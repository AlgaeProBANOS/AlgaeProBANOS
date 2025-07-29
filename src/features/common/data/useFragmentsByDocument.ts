import { useGetFragmentsByDocumentQuery } from '@/api/memorise.service';

interface Params {
  projectID: string;
  documentID: string;
  skip?: boolean;
}

export function useFragmentsByDocument(params: Params): boolean {
  const { projectID, documentID, skip = false } = params;

  const fragmentsByDocument = useGetFragmentsByDocumentQuery(
    {
      project: projectID,
      documentID: documentID,
    },
    { skip: skip },
  );

  return fragmentsByDocument.isLoading;
}
