import { useEffect, useMemo, useRef, useState } from "react";
import { InView } from "react-intersection-observer";

import type { Fragment } from "@/api/memorise-client";
import { useDateState } from "@/app/context/date.context";
import { withDictionaries } from "@/app/i18n/with-dictionaries";
import { useAppSelector } from "@/app/store";
import {
  selectFragmentContentForDocumentByID,
  selectFragmentIDsByDocument,
} from "@/app/store/memorise.slice";
import { baseAPIProject } from "~/config/memorise.config";

import { useFragmentsByDocument } from "../common/data/useFragmentsByDocument";
import { FragmentElement } from "./fragment";

export const getStaticProps = withDictionaries(["common"]);

interface DocumentProps {
  id: string;
}

// export const DocumentElement = forwardRef<Element, DocumentProps>(
//   function DocumentElement(props, ref): JSX.Element {
export default function DocumentElement(props: DocumentProps): JSX.Element {
  const { id } = props;

  const [isLoading, setLoading] = useState<boolean>(true);

  const fragmentsByDocument = useAppSelector((state) => {
    return selectFragmentIDsByDocument(state, id);
  });

  const fragments = useAppSelector((state) => {
    return selectFragmentContentForDocumentByID(state, id);
  });

  useFragmentsByDocument({
    projectID: baseAPIProject,
    documentID: id,
    skip: Object.keys(fragments).length <= 1,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const [isScrollingDown, setScrollingDown] = useState<boolean>(true);

  const itemRefs = useRef<Record<string, HTMLElement | null>>({});

  const dateContext = useDateState();

  const sortedKeysByDates = useMemo(() => {
    const unsortedKeys = fragmentsByDocument as Array<Fragment["id"]>;
    return unsortedKeys.slice().sort((a, b) => {
      if (fragments[a]?.date != null || fragments[b]?.date != null) {
        return (
          new Date(fragments[a]?.date as string).getTime() -
          new Date(fragments[b]?.date as string).getTime()
        );
      } else {
        return 0;
      }
    });
  }, [fragments, fragmentsByDocument]);

  //Scroll to corresponding element in other tab
  useEffect(() => {
    if (dateContext.document !== id) {
      if (dateContext.date !== null) {
        for (const it of sortedKeysByDates) {
          if (isScrollingDown) {
            if (new Date(fragments[it]?.date as string) >= dateContext.date) {
              scrollTo(itemRefs.current[it]);
              break; //leave the search for the right sortedKeysByDates
            }
          } else {
            if (new Date(fragments[it]?.date as string) <= dateContext.date) {
              scrollTo(itemRefs.current[it]);
              break;
            }
          }
        }
      }
    }
  }, [
    id,
    sortedKeysByDates,
    fragments,
    dateContext.date,
    dateContext.document,
    dateContext,
    isScrollingDown,
  ]);

  const scrollTo = (element: HTMLElement | null | undefined) => {
    if (element != null) {
      element.scrollIntoView({
        behavior: "smooth", // Optional: for smooth scrolling
        block: "start", // Optional: align the item to the center of the container
      });
    }
  };

  /* const sortedKeys = useMemo(() => {
    const unsortedKeys = Object.keys(fragments);
    return unsortedKeys.sort((keyA, keyB) => {
      const a = fragments[keyA];
      const b = fragments[keyB];
      if (a != null && b != null) {
        const fragBDate = b.date != null ? new Date(b.date).getTime() : 0;

        const fragADate = a.date != null ? new Date(a.date).getTime() : 0;

        return fragADate - fragBDate;
      } else {
        return 0;
      }
    });
  }, [fragments]); //listening on change in fragArray; On change => execute stuff after useMemo() */

  // State to track current active section
  const [visibleFragment, setVisibleFragment] = useState(
    Object.values(sortedKeysByDates)[0],
  );

  // callback called when a section is in view
  const setInView = (inView: boolean, entry: IntersectionObserverEntry) => {
    if (inView) {
      const selID = entry.target.getAttribute("data-fragid");
      if (selID != null) {
        const selFrag = fragments[selID];

        if (
          selFrag &&
          id === dateContext.director &&
          dateContext.alignScrolling === true
        ) {
          if (containerRef.current != null) {
            const currentScrollPosition = containerRef.current.scrollTop;

            const lastScrollY = parseInt(
              containerRef.current.getAttribute("lastScrollY") ?? "0",
            );
            if (lastScrollY > currentScrollPosition) {
              setScrollingDown(false);
            } else {
              setScrollingDown(true);
            }
            containerRef.current.setAttribute(
              "lastScrollY",
              currentScrollPosition.toString(),
            );
          }

          const newDate = selFrag.date != null ? new Date(selFrag.date) : null;
          dateContext.updateDate(newDate, id);
          setVisibleFragment(selID);
        }
      }
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  //Register which elements are in the view port rn
  return (
    <div ref={containerRef} className="overflow-hidden overflow-y-scroll">
      {isLoading ? (
        <>Loading ...</>
      ) : (
        sortedKeysByDates.map((e) => {
          return (
            <InView
              root={containerRef.current}
              onChange={setInView}
              threshold={0.2}
              key={e}
            >
              {({ ref }) => {
                return (
                  <div data-fragid={e} ref={ref}>
                    <FragmentElement
                      key={`fragment-${e}`}
                      id={e}
                      ref={(el) => {
                        itemRefs.current[e] = el;
                      }}
                      /* project={fragments[e]!.projectID} */
                      selected={visibleFragment === e}
                      showAnnotation={dateContext.showAnnotations}
                      /* author={fragments[e]!.author} */
                    />
                  </div>
                );
              }}
            </InView>
          );
        })
      )}
    </div>
  );
}
