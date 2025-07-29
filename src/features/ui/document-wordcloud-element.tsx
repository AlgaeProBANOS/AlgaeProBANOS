import { Text } from '@visx/text';
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';
import { memo, useCallback, useMemo } from 'react';

import { useHoverState } from '@/app/context/hover.context';
import { useSearchState } from '@/app/context/search.context';
import { useI18n } from '@/app/i18n/use-i18n';
import { withDictionaries } from '@/app/i18n/with-dictionaries';

import { useTooltipState } from '../common/tooltip/tooltip-provider';
import type { WordData } from './document-wordcloud';

export const getStaticProps = withDictionaries(['common']);

interface Props {
  words: Array<WordData>;
  width?: number;
  height?: number;
}

interface OwnWord extends WordData {
  occurrances: number;
}

const colors = ['#d4e3f1', '#849dd0', '#4b5988'];

const DocumentWordcloudElement = memo((props: Props) => {
  const { words, width = 200, height = 200 } = props;

  const { t } = useI18n<'common'>();

  const searchContext = useSearchState();
  const hoverContext = useHoverState();
  const tooltipContext = useTooltipState();

  const wordSizes = useMemo(() => {
    const newSizes = {} as Record<string, number>;
    for (const word of words) {
      newSizes[word.text] = word.fontSize;
    }
    return newSizes;
  }, [words]);

  const sizeSetter = useCallback(
    (datum: WordData) => {
      return wordSizes[datum.text] as number;
    },
    [wordSizes],
  );

  return (
    <Wordcloud
      words={words}
      width={width as number}
      height={height as number}
      fontSize={sizeSetter}
      font={'Roboto'}
      fontWeight={750}
      padding={3}
      spiral={'rectangular'}
      rotate={0}
    >
      {(cloudWords) => {
        return cloudWords.map((w, i) => {
          const strokeColor =
            ((searchContext.isCasing ?? false) ? w.text : w.text?.toLowerCase()) ===
            ((searchContext.isCasing ?? false)
              ? searchContext.searchTerm
              : searchContext.searchTerm?.toLowerCase())
              ? 'stroke-yellow-300'
              : (hoverContext.hovered?.words?.includes(w.text as string) ?? false)
                ? 'stroke-memorise-black-700 fill-memorise-blue-200'
                : '';
          return (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor={'middle'}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontWeight={w.weight}
              fontFamily={w.font}
              className={`cursor-pointer ${strokeColor} stroke-[4]`}
              paintOrder="stroke"
              onMouseEnter={() => {
                hoverContext.updateHover({
                  entities: [],
                  words: [w.text as string],
                });
                tooltipContext.updateTooltip(
                  <>
                    <div className="text-lg">
                      {w.text} ({(w as OwnWord).occurrances})
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      <span
                        style={{
                          marginRight: '2px',
                          fontStyle: 'italic',
                          fontSynthesis: 'initial',
                        }}
                      >
                        {t(['common', 'vis', 'click-to-search'], {
                          values: { value: `${w.text}` },
                        })}
                      </span>
                    </div>
                  </>,
                );
              }}
              onMouseLeave={() => {
                hoverContext.updateHover(null);
                tooltipContext.updateTooltip(null);
              }}
              onClick={() => {
                searchContext.updateSearchTerm(w.text as string);
              }}
            >
              {w.text}
            </Text>
          );
        });
      }}
    </Wordcloud>
  );
});

DocumentWordcloudElement.displayName = 'DocumentWordcloudElement';

export default DocumentWordcloudElement;
