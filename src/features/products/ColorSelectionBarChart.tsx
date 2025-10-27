import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis } from 'recharts';
import { algaeColors } from './utils';

export function ColorSelectionBarChart() {
  const dispatch = useAppDispatch();

  const species = useAppSelector(selectSpecies);
  const filters = useAppSelector(selectFilters);
  const colorFilters = filters.colors;

  const [colorSelection, setColorSelection] = useState<Record<string, boolean> | null>(
    colorFilters,
  );

  const filteredSpecies = useAppSelector(selectFilteredSpecies);

  const updateColorSelection = (colorName: string, val: boolean) => {
    const tmpColorSelection = { ...colorSelection };
    tmpColorSelection[colorName] = val;
    setColorSelection(tmpColorSelection);
  };

  useEffect(() => {
    console.log(colorFilters, colorSelection);

    if (colorFilters != null) {
      // for (const c of Object.keys(colorFilters)) {
      if (JSON.stringify(colorSelection) !== JSON.stringify(colorFilters)) {
        setColorSelection(colorFilters);
      }
      // }
    }
  }, [colorFilters]);

  const colorBarChartData = useMemo(() => {
    return Object.values(algaeColors).map((col) => {
      const colSpecies = filteredSpecies?.filter((spec) =>
        species[spec]?.color.toLowerCase().includes(col.value),
      );
      return {
        name: col.name,
        color: col.color,
        num: colSpecies?.length,
        species: colSpecies,
        value: col.value,
      };
    });
  }, [filteredSpecies]);

  return (
    <div className="flex flex-col my-1 size-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={150}
          height={60}
          data={colorBarChartData}
          margin={{
            top: 1,
            right: 1,
            left: 1,
            bottom: 1,
          }}
        >
          <Bar dataKey="num" fill="#8884d8" barSize={'10%'} minPointSize={5}>
            {colorBarChartData.map((entry, index) => {
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    colorSelection != null
                      ? colorSelection[entry.value]
                        ? entry.color
                        : 'gray'
                      : entry.color
                  }
                  className="cursor-pointer"
                  onClick={() => {
                    dispatch(
                      setFilters({
                        type: 'colors',
                        cat: entry.value,
                        val: !(colorSelection![entry.value] as boolean),
                      }),
                    );
                    updateColorSelection(entry.value, !(colorSelection![entry.value] as boolean));
                  }}
                />
              );
            })}
          </Bar>
          <XAxis
            dataKey="name"
            angle={0}
            fontSize={12}
            onClick={(e) => {
              const col = e.value.toLowerCase();
              const oldVal = colorSelection![e.value.toLowerCase()] as boolean;

              dispatch(
                setFilters({
                  type: 'colors',
                  cat: e.value.toLowerCase(),
                  val: !(colorSelection![e.value.toLowerCase()] as boolean),
                }),
              );
              updateColorSelection(col, !oldVal);
            }}
            className="cursor-pointer"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
