import { GradientLightgreenGreen } from '@visx/gradient';
import { Group } from '@visx/group';
import { scaleBand, scaleRadial } from '@visx/scale';
import { Arc } from '@visx/shape';
import { Text } from '@visx/text';
import { useMemo, useState } from 'react';

import type { Document } from '@/api/memorise-client';
import { useAppSelector } from '@/app/store';
import { selectFragmentContentForDocumentByID } from '@/app/store/memorise.slice';

interface LetterFrequency {
  letter: string;
  frequency: number;
  month: number;
  year: number;
}

const getLetter = (d: LetterFrequency) => {
  return d.letter;
};
const getLetterFrequency = (d: LetterFrequency) => {
  return Number(d.frequency) * 100;
};

/* const frequencySort = (a: LetterFrequency, b: LetterFrequency) => {
  return b.frequency - a.frequency;
};

const alphabeticalSort = (a: LetterFrequency, b: LetterFrequency) => {
  return a.letter.localeCompare(b.letter);
}; */

const dateSort = (a: LetterFrequency, b: LetterFrequency) => {
  const diff = a.year - b.year;

  if (diff !== 0) {
    return diff;
  } else {
    return a.month - b.month;
  }
};

const toRadians = (x: number) => {
  return (x * Math.PI) / 180;
};
const toDegrees = (x: number) => {
  return (x * 180) / Math.PI;
};

const barColor = '#93F9B9';
const margin = { top: 12, bottom: 12, left: 12, right: 12 };

export type RadialBarsProps = {
  width: number;
  height: number;
  showControls?: boolean;
  id: Document['id'];
};

export default function DocumentTimewheel({
  id,
  width,
  height,
  showControls = false,
}: RadialBarsProps) {
  const [rotation, setRotation] = useState(0);
  const [sortAlphabetically, setSortAlphabetically] = useState(true);

  const fragments = useAppSelector((state) => {
    return selectFragmentContentForDocumentByID(state, id);
  });

  const data = useMemo(() => {
    const result: Record<string, number> = {};
    for (const frag of Object.values(fragments)) {
      if (frag.date != null) {
        const month = new Date(frag!.date).getMonth() + 1;
        const year = new Date(frag!.date).getFullYear() - 1900 + 1;

        const dateString = `${month}/${year}`;

        result[dateString] = result[dateString] != null ? result[dateString] + 1 : 1;
      }
    }
    return Object.entries(result).map(([k, v]) => {
      const splitted = k.split('/');
      return {
        letter: k,
        frequency: v,
        month: parseInt(splitted[0] as string),
        year: parseInt(splitted[1] as string),
      };
    });
  }, [fragments]);

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const radiusMax = Math.min(xMax, yMax) / 2;

  const innerRadius = radiusMax / 5;

  const xDomain = useMemo(() => {
    // return data.sort(sortAlphabetically ? alphabeticalSort : frequencySort).map(getLetter);
    return data.sort(dateSort).map(getLetter);
  }, [data]);

  const xScale = useMemo(() => {
    return scaleBand<string>({
      range: [0 + rotation, 2 * Math.PI + rotation],
      domain: xDomain,
      padding: 0.2,
    });
  }, [rotation, xDomain]);

  const yScale = useMemo(() => {
    return scaleRadial<number>({
      range: [innerRadius, radiusMax],
      domain: [0, Math.max(...data.map(getLetterFrequency))],
    });
  }, [innerRadius, radiusMax, data]);

  return width < 10 ? null : (
    <>
      <svg width={width} height={height}>
        <GradientLightgreenGreen id="radial-bars-green" />
        <rect width={width} height={height} fill="url(#radial-bars-green)" rx={12} />
        <Group top={yMax / 2 + margin.top} left={xMax / 2 + margin.left}>
          {data.map((d) => {
            const letter = getLetter(d);
            const startAngle = xScale(letter);
            const midAngle = startAngle ?? 0 + xScale.bandwidth() / 2;
            const endAngle = startAngle ?? 0 + xScale.bandwidth();

            const outerRadius = yScale(getLetterFrequency(d));

            // convert polar coordinates to cartesian for drawing labels
            const textRadius = outerRadius + 4;
            const textX = textRadius * Math.cos(midAngle - Math.PI / 2);
            const textY = textRadius * Math.sin(midAngle - Math.PI / 2);

            return (
              <>
                <Arc
                  key={`bar-${letter}`}
                  cornerRadius={4}
                  startAngle={startAngle}
                  endAngle={endAngle}
                  outerRadius={outerRadius}
                  innerRadius={innerRadius}
                  fill={barColor}
                />
                <Text
                  x={textX}
                  y={textY}
                  dominantBaseline="end"
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight="bold"
                  fill={barColor}
                  angle={toDegrees(midAngle)}
                >
                  {letter}
                </Text>
              </>
            );
          })}
        </Group>
      </svg>
      {showControls && (
        <div className="controls">
          <label>
            <strong>Rotate</strong>&nbsp;
            <input
              type="range"
              min="0"
              max="360"
              value={toDegrees(rotation)}
              onChange={(e) => {
                return setRotation(toRadians(Number(e.target.value)));
              }}
            />
            &nbsp;{toDegrees(rotation).toFixed(0)}°
          </label>
          <br />
          <div>
            <strong>Sort bars</strong>&nbsp;&nbsp;&nbsp;
            <label>
              <input
                type="radio"
                checked={sortAlphabetically}
                onChange={() => {
                  return setSortAlphabetically(true);
                }}
              />
              Alphabetically&nbsp;&nbsp;&nbsp;
            </label>
            <label>
              <input
                type="radio"
                checked={!sortAlphabetically}
                onChange={() => {
                  return setSortAlphabetically(false);
                }}
              />
              By frequency
            </label>
          </div>
          <br />
        </div>
      )}
    </>
  );
}
