import { ColorSelectionBarChart } from './ColorSelectionBarChart';
import SpeciesList from './SpeciesList';
import { SpeciesTreeMap } from './SpeciesTreeMap';

import TabArea from '../common/TabArea';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectFilteredSpecies, setFilters } from '@/app/store/apb.slice';
import NameSearchBar from './NameSearchBar';
import { MicroIcon } from './MicroIcon';
import { MacroIcon } from './MacroIcon';
import { AlgaeIcon } from './AlgaeIcon';

const tabs = [
  {
    key: 'speciesTreeMapTab',
    title: 'Tree Map',
    content: <SpeciesTreeMap key={'speciesTreeMap'} />,
  },
  {
    key: 'speciesNameListTab',
    title: 'Names',
    content: <SpeciesList />,
  },
  {
    key: 'colorsTab',
    title: 'Colors',
    content: <ColorSelectionBarChart />,
  },
];

export default function SpeciesScreen(): JSX.Element {
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const dispatch = useAppDispatch();

  return (
    <div className="size-full border border-apb-gray/70 rounded">
      <TabArea
        tabs={tabs}
        titleElement={
          <div className="flex items-center gap-1">
            <span className="font-bold">{filteredSpecies?.length}</span>
            <AlgaeIcon size={20} />
            Selected Species
            <div
              onClick={() => {
                dispatch(setFilters({ type: 'species', cat: 'genus', val: null }));
                dispatch(setFilters({ type: 'species', cat: 'species', val: null }));
                dispatch(setFilters({ type: 'species', cat: 'type', val: null }));
                dispatch(
                  setFilters({
                    type: 'colors',
                    cat: 'reset',
                    val: true,
                  }),
                );
              }}
              className="row-span-2 items-center flex hover:bg-apb-aubergine bg-apb-aubergine/80 text-white px-2 rounded-md cursor-pointer h-full"
            >
              Reset
            </div>
          </div>
        }
      />
    </div>
  );
}
