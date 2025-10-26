import { ColorSelectionBarChart } from './ColorSelectionBarChart';
import SpeciesList from './SpeciesList';
import { SpeciesTreeMap } from './SpeciesTreeMap';

import TabArea from '../common/TabArea';
import { useAppSelector } from '@/app/store';
import { selectFilteredSpecies } from '@/app/store/apb.slice';

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

  return (
    <TabArea
      tabs={tabs}
      titleElement={<div className="flex items-center">{filteredSpecies?.length} Species</div>}
    />
  );
}
