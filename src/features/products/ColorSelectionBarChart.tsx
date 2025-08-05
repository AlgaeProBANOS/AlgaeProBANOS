import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { useMemo, useState } from 'react';
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

  const colorBarChartData = useMemo(() => {
    return Object.values(algaeColors).map((col) => {
      const colSpecies = filteredSpecies?.filter((spec) =>
        species[spec]?.color.includes(col.value),
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
    <div className="flex flex-col my-1">
      <div className="text-lg font-bold whitespace-nowrap mb-1">Algae Colors</div>
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
          <Bar dataKey="num" fill="#8884d8" barSize={30} minPointSize={5}>
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
            angle={45}
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
      {/* <div className="text-lg font-bold whitespace-nowrap mb-1">Algae Colors</div>
          {Object.values(algaeColors).map((color) => {
            const colorVariants = {
              green:
                'group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-[#33a02c] focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-[#33a02c]',
              brown:
                'group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-[#b15928] focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-[#b15928]',
              red: 'group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-[#e31a1c] focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-[#e31a1c]',
            };

            return (
              <Field className="flex items-center gap-2 cursor-pointer" key={color.value}>
                <Checkbox
                  key={`checkbox-${color.value}`}
                  checked={colorSelection[color.value]}
                  onChange={(val) => {
                    dispatch(setFilters({ type: 'colors', cat: color.value, val: val }));
                    updateColorSelection(color.value, val);
                  }}
                  defaultChecked
                  className={colorVariants[color.value]}
                >
                  <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
                </Checkbox>
                <Label className={'cursor-pointer select-none'}>{color.name}</Label>
              </Field>
            );
          })}*/}
    </div>
  );
}
