import { useCallback, useEffect } from "react";

import { useDateState } from "@/app/context/date.context";
import { useTabbarState } from "@/app/context/tabbar.context";
import { useAppDispatch } from "@/app/store";

import DocumentElement from "./document";
import DocumentWordcloud from "./document-wordcloud";
import { TabBar } from "./tab-bar";
import { setTabRendered, type Tab } from "./ui.slice";

interface TabProps {
  id: string;
  tabs: Record<string, Tab>;
}

export function TabBarAndContent(props: TabProps): JSX.Element {
  const { id, tabs } = props;
  const context = useTabbarState();
  const dateContext = useDateState();

  const clickHandler = useCallback(() => {
    dateContext.updateDirector(
      context.selected != null ? context.selected.contentID : null,
    );
  }, [context, dateContext]);

  if (context.selected == null) {
    const firstTabKey = Object.keys(tabs)[0];
    if (firstTabKey != null) {
      context.updateSelected(tabs[firstTabKey] as Tab);
    }
  }

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (context.selected != null) {
      dispatch(setTabRendered({ tabID: context.selected.id, rendered: true }));
    }
  }, [context.selected, dispatch]);

  useEffect(() => {
    for (const tab of Object.values(tabs)) {
      if (context.selected?.id !== tab.id) {
        dispatch(setTabRendered({ tabID: tab.id, rendered: false }));
      }
    }
  }, []);

  return (
    <div className="h-full ">
      <div className="grid h-full grid-rows-[min-content_1fr]">
        <TabBar key={`tabbar-${id}`} id={id} tabs={tabs} />
        <div
          className="relative h-0 min-h-full overflow-hidden"
          onClick={clickHandler}
          onKeyDown={clickHandler}
          role="menuitem"
          tabIndex={0}
        >
          {Object.values(tabs)
            .filter((e) => {
              return e.rendered === true;
            })
            .map((t) => {
              return (
                <div
                  key={`document-view-${t.id}`}
                  className={
                    dateContext.director != null &&
                    context.selected?.contentID === dateContext.director
                      ? "absolute left-0 top-0 box-border size-full overflow-auto border-4 border-solid border-memorise-orange-500 p-[2px]"
                      : "absolute left-0 top-0 box-border size-full overflow-auto border-2 border-solid border-memorise-black-700 p-[4px]"
                  }
                  style={{
                    visibility:
                      t.contentID === context.selected?.contentID
                        ? "visible"
                        : "hidden",
                    zIndex:
                      t.contentID === context.selected?.contentID ? 40 : -10,
                  }}
                >
                  {t.type === "document" && (
                    <div className="grid h-full grid-rows-[1fr_200px]">
                      <DocumentElement id={t.contentID} />

                      <div className="grid max-h-[200px] grid-cols-1 overflow-hidden">
                        {/* <DocumentTimewheel id={context.selected.contentID} width={200} height={200} /> */}
                        <DocumentWordcloud
                          key={`${t.id}-wordl`}
                          id={t.contentID}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
