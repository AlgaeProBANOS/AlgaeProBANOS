import { memo, useEffect, useMemo, useState } from 'react';
import stopwords from 'stopwords-iso';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useElementDimensions } from '@/lib/use-element-dimensions';
import { useElementRef } from '@/lib/use-element-ref';

import DocumentWordcloudElement from '../ui/document-wordcloud-element';
import stopwordAddition from '../ui/stopword-additions.json';

export const getStaticProps = withDictionaries(['common']);

interface Props {
  text?: string;
  documentsAsStrings?: Record<string, string>;
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
  for (const toReplace of [...stopwordAddition['misc']]) {
    cleanedInput = cleanedInput.replaceAll(toReplace, ' ');
  }
  const words = cleanedInput.split(' ');

  const result: Record<string, number> = {};
  words.forEach((word) => {
    if (stopWordList.includes(word.toLocaleLowerCase()) === false) {
      result[word] = result[word] != null ? result[word] + 1 : 1;
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

  maxElement = array[0] != null ? (array[0] as WordData)['occurrances'] : 0; // \ Array is sorted!
  minElement =
    array[array.length - 1] != null ? (array[array.length - 1] as WordData)['occurrances'] : 0; // /
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
    lengthSingleElement = element['occurrances'];
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
      text: element['text'],
      fontSize: lengthSingleElement,
      occurrances: element['occurrances'],
    });
  }

  return resultsArray;
}

const Wordcloud = memo((props: Props) => {
  const { text = '', documentsAsStrings } = props;

  const [language] = useState<keyof typeof stopwords>('de'); //Later to be extracted/given into the function
  const [isLoading, setLoading] = useState<boolean>(true);

  const stopWordList = useMemo(() => {
    const stopWordList = stopwords[language];

    stopwordAddition[language as keyof typeof stopwordAddition].forEach((word) => {
      stopWordList.push(word);
    });

    return stopWordList;
  }, [language]);

  const [containerElement, setContainerElement] = useElementRef();

  const rect = useElementDimensions({ element: containerElement });

  const words = useMemo(() => {
    let textToAnalyze = text;
    if (text === '' && documentsAsStrings != null) {
      textToAnalyze = Object.values(documentsAsStrings).join(' ');
    }

    const occs = wordCount(textToAnalyze, stopWordList);

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

  const width = rect != null ? rect.width : 600;
  const height = rect != null ? rect.height : 200;

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div ref={setContainerElement} className={'size-full rounded-xl pt-3'}>
      {isLoading ? (
        <>Wordcloud rendering ... </>
      ) : (
        <DocumentWordcloudElement width={width as number} height={height as number} words={words} />
      )}
    </div>
  );
});

Wordcloud.displayName = 'Wordcloud';

export default Wordcloud;
