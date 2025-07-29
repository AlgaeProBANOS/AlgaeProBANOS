import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";

import { useDateState } from "@/app/context/date.context";
import { useTabbarState } from "@/app/context/tabbar.context";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectDocuments,
  selectFragmentContentForDocumentByID,
  selectFragmentIDsByDocument,
  selectMaintenanceMode,
} from "@/app/store/memorise.slice";

import type { Tab } from "./ui.slice";
import { removeTab } from "./ui.slice";

interface TabProps {
  tab: Tab;
}

export function TabElement(props: TabProps): JSX.Element {
  const { tab } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: tab.id,
  });

  const context = useTabbarState();
  const dateContext = useDateState();

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const dispatch = useAppDispatch();

  const maintenanceMode = useAppSelector(selectMaintenanceMode);

  const listOfFragmentIDs = useAppSelector((state) => {
    return selectFragmentIDsByDocument(state, tab.contentID) ?? [];
  });

  const fragmentsWithContent = useAppSelector((state) => {
    return selectFragmentContentForDocumentByID(state, tab.contentID);
  });

  const onlySingleFragment = useMemo(() => {
    if (maintenanceMode) {
      if (
        Object.keys(fragmentsWithContent).length === 1 &&
        listOfFragmentIDs.length > 1
      ) {
        return true;
      }
    }
    return false;
  }, [maintenanceMode, fragmentsWithContent, listOfFragmentIDs]);

  const documents = useAppSelector((state) => {
    return selectDocuments(state);
  });

  const clickHandler = () => {
    context.updateSelected(tab);
    dateContext.updateDirector(tab.contentID);
  };

  //${dateContext?.director === tab.contentID ? 'mb-[-4px] border-4 border-memorise-orange-500 p-0' : 'mb-[-2px] border-2 border-memorise-black-700 p-4'}
  let title = "";
  const author = documents[tab.contentID]?.author;
  if (author?.lastName != null) {
    title = author.lastName;
  }
  if (author?.firstName != null && title !== "") {
    title += ", " + author.firstName;
  } else if (author?.firstName != null) {
    title = author.firstName;
  }
  if (title === "") {
    if (tab.type === "document") {
      title = tab.contentID.replace("DOCUMENT_", "");
    } else {
      title = "Empty Tab";
    }
  }

  const visibleTitle = useMemo(() => {
    if (listOfFragmentIDs!.length > 0) {
      return `${title} (${listOfFragmentIDs!.length})`;
    } else {
      return title;
    }
  }, [listOfFragmentIDs, title]);

  return (
    <div
      key={tab.id}
      style={style}
      className={
        context.selected?.id === tab.id
          ? `box-border grid grid-cols-[auto_25px] content-center items-center overflow-hidden rounded-t-xl bg-neutral-50 ${dateContext.director === tab.contentID ? "mb-[-4px] border-4 border-b-0 border-memorise-orange-500 p-[2px]" : "mb-[-2px] border-2 border-b-0 border-memorise-black-700 p-[4px]"} z-50`
          : `box-border grid cursor-pointer grid-cols-[auto_25px] content-center items-center overflow-hidden rounded-t-xl border border-memorise-black-300 bg-neutral-50 hover:bg-slate-100`
      }
      ref={setNodeRef}
      {...attributes}
      onClick={clickHandler}
      onKeyDown={clickHandler}
      role="tab"
      tabIndex={0}
      {...listeners}
    >
      <div className="dark:text-white h-full items-center overflow-hidden text-ellipsis text-nowrap text-lg font-medium text-memorise-blue-700 ">
        {visibleTitle}{" "}
        {onlySingleFragment && (
          <span className="text-memorise-orange-900">&#9888;</span>
        )}
      </div>
      <button
        className="h-full"
        onClick={(e) => {
          context.updateSelected(null);
          e.stopPropagation();
          return dispatch(removeTab(tab.id));
        }}
      >
        <XMarkIcon className="size-5 text-memorise-orange-800 hover:bg-memorise-orange-800 hover:text-white" />
      </button>
    </div>
  );
}
