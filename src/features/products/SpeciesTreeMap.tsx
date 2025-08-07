import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectFilteredSpecies, selectSpecies, setFilters } from '@/app/store/apb.slice';
import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';

export function SpeciesTreeMap() {
  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const [selectedGenus, setSelectedGenus] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  const genus = useMemo(() => {
    const tmpGenus = {};

    if (filteredSpecies != null) {
      for (const spec of filteredSpecies) {
        const genusName = species[spec]?.genus as string;
        const speciesName = species[spec]?.species;

        if (Object.keys(tmpGenus).includes(genusName)) {
          tmpGenus[genusName].children.push({ name: speciesName, size: 1 });
        } else {
          tmpGenus[genusName] = { name: genusName, children: [{ name: speciesName, size: 1 }] };
        }
      }
    }
    return tmpGenus;
  }, [species, filteredSpecies]);

  //   const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];
  const COLORS = ['#2983c2', '#2f8cce', '#3494da', '#3a9de6', '#40a6f3', '#46afff'];

  const CustomizedContent = (props) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

    return (
      <g>
        {/* <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            // fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : '#ffffff00',
            fill: depth < 2 ? colors[index % colors.length] : '#ffffff00',
            // stroke: depth < 2 ? colors[index % colors.length] : '#ffffff00',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        /> */}
        {depth === 1 ? (
          <foreignObject x={x} y={y} width={width} height={height}>
            <div
              className="size-full items-center flex justify-center overflow-hidden text-ellipsis cursor-pointer p-[2px] border border-apb-gray"
              style={{
                backgroundColor: depth < 2 ? colors[index % colors.length] : '#ffffff00',
              }}
              onClick={(e) => {
                if (root.children != null) {
                  if (root.children[index].children != null) {
                    setSelectedGenus(name);
                  } else {
                    setSelectedSpecies(name);
                  }
                  e.preventDefault();
                }
              }}
            >
              <p className="overflow-hidden text-ellipsis text-apb-gray text-sm italic">{name}</p>
              {/* <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                  fill: depth < 2 ? colors[index % colors.length] : '#ffffff00',
                }}
              ></rect>
              <text
                x={x + width / 2}
                y={y + height / 2 + 7}
                textAnchor="middle"
                fill="#fff"
                fontSize={14}
                className="cursor-pointer"
              >
                {name}
              </text> */}
            </div>
          </foreignObject>
        ) : null}
        {/* {depth === 1 ? (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: 'transparent',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              if (root.children != null) {
                if (root.children[index].children != null) {
                  setSelectedGenus(name);
                } else {
                  setSelectedSpecies(name);
                }
                e.preventDefault();
              }
            }}
          ></rect>
        ) : null} */}
      </g>
    );
  };

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'name',
        cat: '',
        val: `${selectedGenus ?? ''} ${selectedSpecies ?? ''}`.trim(),
      }),
    );
  }, [selectedGenus, selectedSpecies]);

  return (
    <div className="size-full">
      {selectedGenus && (
        <div
          className="cursor-pointer font-bold italic"
          onClick={() => {
            if (selectedSpecies != null) {
              setSelectedSpecies(null);
            } else {
              setSelectedGenus(null);
            }
          }}
        >
          {selectedGenus} {selectedSpecies}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          width={400}
          height={200}
          data={selectedGenus != null ? genus[selectedGenus].children : Object.values(genus)}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent colors={COLORS} />}
          // isAnimationActive={false}
          animationDuration={200}
        />
      </ResponsiveContainer>
    </div>
  );
}
