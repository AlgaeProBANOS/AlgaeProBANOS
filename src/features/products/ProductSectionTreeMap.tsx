import { ApplicationType, Species } from '@/api/apb.client';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { Children, useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';
import { applicationCategories } from './utils';
import { useI18n } from '@/app/i18n/use-i18n';

export function ProductSectionTreeMap() {
  const { t } = useI18n<'common'>();
  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const filters = useAppSelector(selectFilters);
  const appplicationFilter = filters.applications;

  const treeMapData = useMemo(() => {
    const specPerApp: Record<ApplicationType, Array<Species['id']>> = {
      agriculture: [],
      cosmetics: [],
      environmental: [],
      humanConsumption: [],
      industrial: [],
      medicinal: [],
    };

    if (filteredSpecies) {
      for (const spec of Object.keys(species)) {
        let hit = false;
        for (const appl of applicationCategories) {
          if (species[spec]?.applications[appl.key] != null) {
            specPerApp[appl.key]!.push(spec);
            hit = true;
          }
        }
      }
    }

    const tmpTreeMapData = applicationCategories
      .map((entry) => {
        return {
          name: entry.key,
          color: entry.color,
          icon: entry.icon,
          description: entry.description,
          children: specPerApp[entry.key].map((spec) => {
            return { name: spec, size: 1 };
          }),
        };
      })
      .sort((a, b) => a.children.length - b.children.length);

    return tmpTreeMapData;
  }, [filteredSpecies, species]);

  const [selectedApplication, setSelectedApplication] = useState<Array<ApplicationType> | null>(
    appplicationFilter,
  );

  useEffect(() => {
    setSelectedApplication(appplicationFilter);
  }, [appplicationFilter]);

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'applications',
        cat: 'applications',
        val: selectedApplication != null ? selectedApplication : null,
      }),
    );
  }, [selectedApplication]);

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;
    const padding = { x: 4, y: 4 };
    const isSelected =
      selectedApplication != null ? selectedApplication.includes(name as ApplicationType) : false;
    const element = root.children[index];
    const Icon = element.icon;

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
          <foreignObject
            x={x + padding.x}
            y={y + padding.y}
            width={width - padding.x * 2}
            height={height - padding.y * 2}
          >
            <div
              // className="size-full items-center flex justify-center overflow-hidden text-ellipsis cursor-pointer p-1 rounded-md"
              className={`rounded flex h-full cursor-pointer flex-col border-l-4 transition-all hover:shadow-md select-none ${isSelected ? 'shadow-md' : ''}`}
              style={{
                borderColor: element.color,
                backgroundColor: isSelected ? `${root.children[index].color}22` : 'white',
              }}
              onClick={(e) => {
                let oldApplications = selectedApplication != null ? [...selectedApplication] : [];
                switch (e.detail) {
                  case 1:
                    if (oldApplications?.includes(element.name)) {
                      var index = oldApplications.indexOf(element.name);
                      if (index > -1) {
                        oldApplications.splice(index, 1);
                      }
                    } else {
                      oldApplications.push(element.name);
                    }
                    break;
                  default:
                    oldApplications = [element.name];
                }

                setSelectedApplication(oldApplications);
              }}
            >
              <div className="flex h-full flex-col p-1">
                <div className="flex items-center mb-2">
                  <Icon className="mr-1" style={{ color: element.color, stroke: 'none' }} />
                  <span className="font-bold">{t(['common', 'products', element.name])}</span>
                </div>
                <span className="text-sm text-gray-500">{element.description}</span>
              </div>
              {/* <p className="w-full overflow-hidden text-ellipsistext-sm italic">
                {t(['common', 'products', name])}
              </p> */}
            </div>
          </foreignObject>
        ) : null}
      </g>
    );
  };

  const dispatch = useAppDispatch();

  return (
    <div className="size-full border border-apb-gray p-1 rounded-md">
      {/* {selectedGenus && (
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
      )} */}
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          width={400}
          height={200}
          data={treeMapData}
          dataKey="size"
          aspectRatio={15 / 6}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
          isAnimationActive={false}
          // animationDuration={200}
        />
      </ResponsiveContainer>
    </div>
  );
}
