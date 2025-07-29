import { memo, useEffect, useMemo, useState } from "react";
import stopwords from "stopwords-iso";

import { withDictionaries } from "@/app/i18n/with-dictionaries";
import { useElementDimensions } from "@/lib/use-element-dimensions";
import { useElementRef } from "@/lib/use-element-ref";

import DocumentWordcloudElement from "./document-wordcloud-element";
import stopwordAddition from "./stopword-additions.json";
import {
  useCheckIfAllFragmentsAreFetched,
  useDocumentWordsAsOneString,
} from "./use-document-words";

export const getStaticProps = withDictionaries(["common"]);

interface Props {
  id: string;
  text?: string;
}

export interface WordData {
  text: string;
  occurrances: number;
  fontSize: number;
}

const MAXFONTSIZE = 30;
const MINFONTSIZE = 8;

export function wordCount(input: string, stopWordList: Array<string>) {
  let cleanedInput = input;
  for (const toReplace of [...stopwordAddition["misc"]]) {
    cleanedInput = cleanedInput.replaceAll(toReplace, " ");
  }
  const words = cleanedInput.split(" ");

  const result: Record<string, number> = {};
  words.forEach((word) => {
    if (stopWordList.includes(word.toLocaleLowerCase()) === false) {
      result[word] = result[word] != null ? result[word] + 1 : 1;
    }
  });

  const finished: Record<string, { origKey: string; occurrence: number }> = {};

  Object.keys(result).forEach((key) => {
    const lowerCaseKey = key.toLocaleLowerCase();
    const currentOcc = result[key] ?? 0;

    if (finished[lowerCaseKey]) {
      // Get previous occurrence and original key
      const prevOcc = finished[lowerCaseKey].occurrence;
      const prevKey = finished[lowerCaseKey].origKey;

      // Merge occurrences into the one with higher frequency
      if (prevOcc >= currentOcc) {
        result[prevKey] = prevOcc + currentOcc;
        result[key] = 0;
      } else {
        result[key] = prevOcc + currentOcc;
        result[prevKey] = 0;
      }
    } else {
      // First time encountering this key
      finished[lowerCaseKey] = { origKey: key, occurrence: currentOcc };
    }
  });

  return result;
}

function setFontSizeOfWords(array: Array<WordData>) {
  let minElement = 0;
  let maxElement = 0;
  let minFontSize = MINFONTSIZE;
  let maxFontSize = MAXFONTSIZE;
  let translateInput = 0;
  let translateFontSize = 0;
  let lengthSingleElement;
  let fontSizeCorrector = false; //If all elements have the same value the calculation would make all elements of the lowest fond size in stead of the largest!
  const resultsArray = [];

  maxElement = (array[0] as WordData)["occurrances"]; // \ Array is sorted!
  minElement = (array[array.length - 1] as WordData)["occurrances"]; // /
  //Scale to an interval beginning at 0
  //Of the inputs
  translateInput = minElement; //How much the max and min have been translated (towards 0) (positiv)
  maxElement -= minElement;
  minElement = 0; //minElement -= minElement;
  //Of the FontSizes
  translateFontSize = minFontSize;
  maxFontSize -= minFontSize;
  minFontSize = 0;
  if (maxElement === 0) {
    //If 0 you would try to devide through 0 ; If this: Only elements of the same occurrence -> make em the biggest fond available
    maxElement++;
    fontSizeCorrector = true;
  } else {
    fontSizeCorrector = false;
  }

  //let lengthAllElements = 0;
  for (const element of array) {
    lengthSingleElement = element["occurrances"];
    //Scale
    lengthSingleElement -= translateInput;
    //Get the share of lengthSingleElement of the interval
    lengthSingleElement = lengthSingleElement / (Number(maxElement) * 1);

    if (fontSizeCorrector) {
      lengthSingleElement = 1;
    }

    //Get the share of it in the FontSizeInterval
    lengthSingleElement = lengthSingleElement * maxFontSize;
    //retranslate the value:
    lengthSingleElement += translateFontSize;

    //lengthAllElements += lengthSingleElement;
    resultsArray.push({
      text: element["text"],
      fontSize: lengthSingleElement,
      occurrances: element["occurrances"],
    });
  }

  /*
    //resize for few tags on a bigger screen
    let windowFactor = 0.5 * (parseInt($("#resultContent").css("width")) * parseInt($("#resultContent").css("height")) ) / 100; 
    if ( lengthAllElements < windowFactor){
      var reSizeValue =  windowFactor / lengthAllElements;
      for (var entry in resultsArray){
        resultsArray[entry]["size"] += reSizeValue;
      }
    }
*/

  return resultsArray;
}

const DocumentWordcloud = memo((props: Props) => {
  const { id } = props;
  const finishedLoadingTexts = useCheckIfAllFragmentsAreFetched({
    document: id,
  });

  const text = useDocumentWordsAsOneString({ document: id });

  const [language] = useState<keyof typeof stopwords>("de"); //Later to be extracted/given into the function
  const [isLoading, setLoading] = useState<boolean>(true);

  const stopWordList = useMemo(() => {
    const stopWordList = stopwords[language];

    stopwordAddition[language as keyof typeof stopwordAddition].forEach(
      (word) => {
        stopWordList.push(word);
      },
    );

    return stopWordList;
  }, [language]);

  const [containerElement, setContainerElement] = useElementRef();

  const rect = useElementDimensions({ element: containerElement });

  const words = useMemo(() => {
    const occs = wordCount(text, stopWordList);

    const sortedWords = Object.keys(occs).sort((a, b) => {
      if (occs[a] == null || occs[b] == null) return 0;
      else {
        return occs[b] - occs[a];
      }
    });

    let maxTags = 100;
    if (rect) {
      //This may result in worse performance, as it allows more than the previous static 100 tags. Consider going back to always 100 if long tag cloud loading times are noticed
      const w = rect.width ? rect.width : 0;
      const h = rect.height ? rect.height : 0;
      maxTags = ((h / 25) * w) / (5 * 10); //fontsize in average; guessed average characters in a tag
    }

    let sliced = sortedWords.slice(0, maxTags).map((e) => {
      return { text: e, occurrances: occs[e], fontSize: 0 };
    }) as Array<WordData>;

    sliced = setFontSizeOfWords(sliced);

    return sliced;
  }, [text, stopWordList, rect]);

  /*   const fontScale = useMemo(() => {
    return scaleLog({
      domain: [
        Math.min(
          ...words.map((w) => {
            return w.value;
          }),
        ),
        Math.max(
          ...words.map((w) => {
            return w.value;
          }),
        ),
      ],
      range: [25, 200],
    });
  }, [words]);

  const fontSizeSetter = useCallback(
    (datum: WordData) => {
      return fontScale(datum.value);
    },
    [fontScale],
  ); */

  const width = rect != null ? rect.width : 600;
  const height = rect != null ? rect.height : 200;

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div
      key={`document-wordcloud-wrapper-${id}`}
      ref={setContainerElement}
      className={"size-full bg-memorise-blue-100"}
    >
      {finishedLoadingTexts === false ? (
        <>There are still some texts loading ... </>
      ) : (
        <>
          {isLoading ? (
            <>Wordcloud rendering ... </>
          ) : (
            <DocumentWordcloudElement
              width={width as number}
              height={height as number}
              words={words}
            />
          )}
        </>
      )}
    </div>
  );
});

DocumentWordcloud.displayName = "DocumentWordcloud";

export default DocumentWordcloud;

{
  /* <DocumentWordcloudElement
          id={`wordl-element-${id}`}
          width={width}
          height={height}
          fontSizeSetter={fontSizeSetter}
          words={words}
        /> */
}
