import type { Document, Fragment } from '@/api/memorise-client';
import { useAppSelector } from '@/app/store';
import { selectFragmentContentForDocumentByID, selectFragmentIDsByDocument } from '@/app/store/memorise.slice';

interface Params {
  document: Document['id'];
}

export function useDocumentWords(params: Params): Record<string, Fragment | undefined> {
  const { document } = params;

  const frags = useAppSelector((state) => {
    return selectFragmentContentForDocumentByID(state, document);
  });

  return frags;
}

export function useDocumentWordsAsOneString(params: Params): string {
  const { document } = params;

  const frags = useAppSelector((state) => {
    return selectFragmentContentForDocumentByID(state, document);
  });

  return Object.values(frags).reduce((accumulator, currentValue) => {
    return accumulator + ' ' + currentValue!.text;
  }, '');
}

export function useCheckIfAllFragmentsAreFetched(params: Params): boolean {
  const {document} = params;
  const neededFragments = useAppSelector((state) => {
    return selectFragmentIDsByDocument(state, document);
  });

  const fetchedFragments = useAppSelector((state) => {
    return selectFragmentContentForDocumentByID(state, document);
  });
  
  if(neededFragments?.length === Object.keys(fetchedFragments).length) {
    return true;
  } else {
    return false;
  }
}