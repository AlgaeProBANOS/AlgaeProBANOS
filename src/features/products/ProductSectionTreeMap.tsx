import { ApplicationType, Species } from '@/api/apb.client';
import { useI18n } from '@/app/i18n/use-i18n';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import { useElementDimensions } from '@/lib/use-element-dimensions';
import { useElementRef } from '@/lib/use-element-ref';
import * as d3 from 'd3';
import { useEffect, useMemo, useState } from 'react';
import { useTooltipState } from '../common/tooltip/tooltip-provider';
import { applicationCategories } from './utils';

export function ProductSectionTreeMap() {
  const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();
  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const filters = useAppSelector(selectFilters);
  const appplicationFilter = filters.applications;
  const { updateTooltip } = useTooltipState();

  const [containerElement, setContainerElement] = useElementRef();
  const containerSize = useElementDimensions({ element: containerElement });

  const PAD = 4;

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
          value: 1,
          children: specPerApp[entry.key].map((spec) => {
            return { name: spec, size: 1, value: 1 };
          }),
        };
      })
      .sort((a, b) => a.children.length - b.children.length);

    return { name: 'GenusSpecies', children: tmpTreeMapData };
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

  // Specify the chart’s dimensions.
  const width = containerSize?.width ?? 500;
  const height = containerSize?.height ?? 300;

  // Create the scales.
  const x = d3.scaleLinear().rangeRound([0, width]);
  const y = d3.scaleLinear().rangeRound([0, height]);

  // This custom tiling function adapts the built-in binary tiling function
  // for the appropriate aspect ratio when the treemap is zoomed-in.
  function tile(node, x0, y0, x1, y1) {
    d3.treemapBinary(node, 0, 0, width, height);
    for (const child of node.children) {
      child.x0 = x0 + (child.x0 / width) * (x1 - x0);
      child.x1 = x0 + (child.x1 / width) * (x1 - x0);
      child.y0 = y0 + (child.y0 / height) * (y1 - y0);
      child.y1 = y0 + (child.y1 / height) * (y1 - y0);
    }
  }

  const hierarchy = d3
    .hierarchy(treeMapData)
    .sum((d) => d.value)
    .sort((a, b) => a.value - b.value);

  const root = d3
    .treemap()
    .size([width, height])
    .paddingInner(8)
    .paddingTop(4)
    .paddingLeft(4)
    .tile(tile)(hierarchy);

  return (
    <div
      ref={setContainerElement}
      className="size-full border border-apb-gray p-1 rounded-md relative"
    >
      {root.children!.map((entry) => {
        const isSelected = selectedApplication?.includes(entry.data.name);
        const Icon = entry.data.icon;
        return (
          <div
            key={`treemap-node-section-${entry.data.name}`}
            className={`absolute rounded flex h-full cursor-pointer flex-col border-l-4 transition-all hover:shadow-md select-none overflow-hidden ${isSelected ? 'shadow-md' : ''}`}
            style={{
              position: 'absolute',
              top: entry.y0,
              left: entry.x0,
              width: entry.x1 - entry.x0,
              height: entry.y1 - entry.y0,
              backgroundColor: isSelected ? `${entry.data.color}22` : 'white',
              borderColor: entry.data.color,
            }}
            onPointerEnter={() => {
              updateTooltip(
                <div className="p-1 w-full overflow-hidden">
                  <span className="font-bold">{t(['common', 'products', entry.data.name])}: </span>
                  {entry.data.description}
                </div>,
              );
            }}
            onPointerLeave={() => {
              updateTooltip(null);
            }}
            onClick={(e) => {
              let oldApplications = selectedApplication != null ? [...selectedApplication] : [];
              switch (e.detail) {
                case 1:
                  if (oldApplications?.includes(entry.data.name)) {
                    var index = oldApplications.indexOf(entry.data.name);
                    if (index > -1) {
                      oldApplications.splice(index, 1);
                    }
                  } else {
                    oldApplications.push(entry.data.name);
                  }
                  break;
                default:
                  oldApplications = [entry.data.name];
              }
              setSelectedApplication(oldApplications);
            }}
          >
            <div className="flex h-full flex-col p-1">
              <div className="flex items-center mb-2">
                <Icon className="mr-1" style={{ color: entry.data.color, stroke: 'none' }} />
                <span className="font-bold">{t(['common', 'products', entry.data.name])}</span>
              </div>
              <span className="text-sm text-gray-500">{entry.data.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
