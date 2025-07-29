import { useMemo } from 'react';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectDocumentByID,
  selectFragmentContentForDocumentByID,
  selectFragmentIDsByDocument,
  selectMaintenanceMode,
} from '@/app/store/memorise.slice';

import { useDetailsForFragment } from '../common/data/use-fragment-details';
import { useFragmentsByDocument } from '../common/data/useFragmentsByDocument';
import type { Tab } from './ui.slice';
import { createTabInTabBarWithDocumentID, selectTabBars } from './ui.slice';
// import { useTestResponseType } from '@/features/common/data/use-data';

export const getStaticProps = withDictionaries(['common']);

interface DocumentPreviewProps {
  id: string;
  projectID?: string;
}

export default function DocumentPreview(props: DocumentPreviewProps): JSX.Element {
  const { id, projectID } = props;

  const dispatch = useAppDispatch();

  const maintenanceMode = useAppSelector(selectMaintenanceMode);

  const tabBars = useAppSelector((state) => {
    return selectTabBars(state);
  });

  let tabBarID =
    Object.values(tabBars)[0] != null
      ? Object.values(tabBars).sort((a, b) => {
          return Object.values(a.tabs).length - Object.values(b.tabs).length;
        })[0]!.id
      : null;

  if (tabBarID != null) {
    if (tabBars[tabBarID] != null) {
      if (
        Object.values(tabBars[tabBarID]!.tabs).filter((e: Tab) => {
          return e.contentID === id;
        }).length > 0
      ) {
        tabBarID = Object.values(tabBars)[1] != null ? Object.values(tabBars)[1]!.id : null;
      }
    }
  }

  const clickHandler = () => {
    if (tabBarID != null)
      dispatch(createTabInTabBarWithDocumentID({ id: tabBarID, documentID: id }));
  };

  const document = useAppSelector((state) => {
    return selectDocumentByID(state, id);
  });

  useFragmentsByDocument({
    projectID: projectID as string,
    documentID: id,
    skip: document != null,
  });

  const fragments = useAppSelector((state) => {
    return selectFragmentIDsByDocument(state, id);
  });

  useDetailsForFragment({
    projectID: projectID as string,
    fragmentID: (fragments != null ? fragments[0] : '') as string,
    skip: document != null,
  });

  const fragmentsWithContent = useAppSelector((state) => {
    return selectFragmentContentForDocumentByID(state, id);
  });

  const onlySingleFragment = useMemo(() => {
    if (maintenanceMode) {
      if (fragments != null) {
        if (Object.keys(fragmentsWithContent).length === 1 && fragments.length > 1) {
          return true;
        }
      }
    }
    return false;
  }, [maintenanceMode, fragmentsWithContent, fragments]);

  const author = document?.author;
  const title = useMemo(() => {
    let title = '';
    if (author?.lastName != null) {
      title = author.lastName;
    }
    if (author?.firstName != null && title !== '') {
      title += ', ' + author.firstName;
    } else if (author?.firstName != null) {
      title = author.firstName;
    }
    if (title === '') {
      title = id.replace('DOCUMENT_', '');
    }

    return title;
  }, [author, id]);

  return (
    <div
      onClick={clickHandler}
      onKeyDown={clickHandler}
      role="menuitem"
      tabIndex={0}
      className="px-1 overflow-hidden text-ellipsis hover:cursor-pointer hover:bg-memorise-blue-100 dark:hover:text-memorise-dark dark:hover:bg-memorise-gold-100"
    >
      {title}{' '}
      {onlySingleFragment && (
        <span className="font-bold text-base text-memorise-pink-100">&#9888;</span>
      )}
    </div>
  );
}
