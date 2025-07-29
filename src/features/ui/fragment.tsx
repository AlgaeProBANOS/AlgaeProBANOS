import { nanoid } from "@reduxjs/toolkit";
import { forwardRef, useMemo } from "react";

import type { Annotation, Fragment } from "@/api/memorise-client";
import { useSearchState } from "@/app/context/search.context";
import { useAppSelector } from "@/app/store";
import { selectFragmentById } from "@/app/store/memorise.slice";
import { baseAPIProject } from "~/config/memorise.config";

import { useDetailsForFragment } from "../common/data/use-fragment-details";

//UI Model fragment; Here we have all fragment information needed for the frontend, includes additional information like showAnnotations and selected
interface FragementElementProps {
  id: Fragment["id"];
  selected?: boolean;
  showAnnotation?: boolean | null;
}

// export const MapVis = forwardRef<MapRef, MapVisProps>(function MapVis(props, ref): JSX.Element {

export const FragmentElement = forwardRef<
  HTMLDivElement,
  FragementElementProps
>(function FragmentElement(props, ref): JSX.Element {
  const { id, selected, showAnnotation } = props;

  const fragment = useAppSelector((state) => {
    return selectFragmentById(state, id);
  });

  const searchContext = useSearchState();

  const loading = useDetailsForFragment({
    projectID: baseAPIProject,
    fragmentID: id,
    skip: fragment != null,
  });

  const fragementTextWithAnnotation = useMemo(() => {
    const contentArray = [];
    const annotsAndSearches: Array<Annotation> = [];

    if (fragment != null && fragment.text != null) {
      // Handle search context
      if (searchContext.searchTerm != null) {
        const regex =
          (searchContext.isCasing ?? false)
            ? new RegExp(`(?<!\\w)${searchContext.searchTerm}(?!\\w)`, "g")
            : new RegExp(`(?<!\\w)${searchContext.searchTerm}(?!\\w)`, "gi");
        const matches = [...fragment.text.matchAll(regex)];
        for (const match of matches) {
          annotsAndSearches.push({
            begin: match.index,
            end: match.index + match[0].length - 1,
            id: `search-${nanoid(5)}`,
            type: "search",
          } as Annotation);
        }
      }

      // Combine annotations and searches
      const allAnnotations = fragment.annotations
        ? [...annotsAndSearches, ...fragment.annotations]
        : annotsAndSearches;

      // Deduplicate and merge overlapping annotations
      const mergedAnnotations = allAnnotations
        .sort((a, b) => {
          return a.begin - b.begin;
        })
        .reduce<Array<Annotation>>((acc, current) => {
          const last = { ...acc.at(-1) };
          if (last.end != null && last.end >= current.begin) {
            // Merge overlapping or adjacent annotations
            last.end = Math.max(last.end, current.end);
            last.type = last.type === "search" ? last.type : current.type; // Prefer 'annotation' type
          } else {
            acc.push(current);
          }
          return acc;
        }, []);

      if (mergedAnnotations.length > 0) {
        // Process sorted and merged annotations
        for (let i = 0; i < mergedAnnotations.length; i++) {
          contentArray.push(
            fragment.text.substring(
              i > 0 ? mergedAnnotations[i - 1]!.end + 1 : 0,
              mergedAnnotations[i]!.begin,
            ),
          );

          const annotationContent = fragment.text.substring(
            mergedAnnotations[i]!.begin,
            mergedAnnotations[i]!.end + 1,
          );

          if (mergedAnnotations[i]!.type === "annotation") {
            if (showAnnotation ?? false) {
              contentArray.push(
                <a
                  key={`${id}-annotation-${i}`}
                  className="cursor-pointer text-[#41769b]"
                  href={mergedAnnotations[i]!.thesaurusLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  {annotationContent}
                </a>,
              );
            } else {
              contentArray.push(annotationContent);
            }
          } else {
            contentArray.push(
              <span
                key={`${mergedAnnotations[i]!.id}`}
                className="rounded bg-yellow-300 shadow-md"
              >
                {annotationContent}
              </span>,
            );
          }
        }

        // Add the remaining text after the last annotation
        contentArray.push(
          fragment.text.substring(mergedAnnotations.at(-1)!.end + 1),
        );
      } else {
        contentArray.push(fragment.text);
      }
    }

    return contentArray;
  }, [
    fragment,
    id,
    searchContext.searchTerm,
    searchContext.isCasing,
    showAnnotation,
  ]);

  const content = useMemo(() => {
    return (
      <>
        <div
          className={`mb-1 font-bold ${selected === true ? "bg-memorise-blue-100" : ""}`}
        >
          {fragment ? fragment.date : "No Date"}
        </div>
        <div>
          {fragment?.text != null ? fragementTextWithAnnotation : "No Text"}
        </div>
      </>
    );
  }, [fragment, selected, fragementTextWithAnnotation]);

  return (
    <div id={id} ref={ref} className="mt-5">
      {loading ? <div>Fetching ... </div> : content}
    </div>
  );
});
