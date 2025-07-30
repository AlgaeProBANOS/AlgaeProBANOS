import AgricultureIcon from '@mui/icons-material/Agriculture';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import FactoryIcon from '@mui/icons-material/Factory';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ParkIcon from '@mui/icons-material/Park';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Checkbox, Field, Label } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { Fragment, useState } from 'react';
import { MyCheckbox, MyCheckboxList } from './MyCheckbox';

export const getStaticProps = withDictionaries(['common']);

const applicationCategories = [
  {
    key: 'industrial',
    title: 'Industrial',
    description: 'Industrial applications and processes',
    color: '#2196f3',
    icon: FactoryIcon,
  },
  {
    key: 'agriculture',
    title: 'Agriculture',
    description: 'Agricultural and farming uses',
    color: '#4caf50',
    icon: AgricultureIcon,
  },
  {
    key: 'medicinal',
    title: 'Medicinal',
    description: 'Medical and pharmaceutical applications',
    color: '#f44336',
    icon: MedicalServicesIcon,
  },
  {
    key: 'cosmetics',
    title: 'Cosmetics',
    description: 'Beauty and personal care products',
    color: '#e91e63',
    icon: FaceRetouchingNaturalIcon,
  },
  {
    key: 'environmental',
    title: 'Environmental',
    description: 'Environmental solutions and applications',
    color: '#009688',
    icon: ParkIcon,
  },
  {
    key: 'humanConsumption',
    title: 'Human Consumption',
    description: 'Food and nutritional products',
    color: '#ff9800',
    icon: RestaurantIcon,
  },
];

const colors = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928',
];

const algaeColors = [
  { color: '#33a02c', name: 'Green', value: 'green' },
  { color: '#b15928', name: 'Brown', value: 'brown' },
  { color: '#e31a1c', name: 'Red', value: 'red' },
];

console.log('applicationCategories', applicationCategories);

export default function ProductFilter(): JSX.Element {
  // const { t } = useI18n<'common'>();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  const [colorSelection, setColorSelection] = useState<Record<string, boolean>>({
    brown: true,
    red: true,
    green: true,
  });

  const updateColorSelection = (colorName: string, val: boolean) => {
    const tmpColorSelection = { ...colorSelection };
    tmpColorSelection[colorName] = val;
    setColorSelection(tmpColorSelection);
  };

  return (
    <div className="grid h-min grid-cols-1 grid-rows-2">
      <div className="grid grid-cols-2 gap-4 p-4">
        {applicationCategories.map((category) => {
          /* Application Cards */
          const Icon = category.icon;
          const isSelected = selectedApplication === category.key;
          return (
            <div
              className={`rounded flex h-full cursor-pointer flex-col border-l-4 transition-all p-2 hover:shadow-md ${isSelected ? 'shadow-md' : ''}`}
              style={{
                borderColor: category.color,
                backgroundColor: isSelected ? `${category.color}22` : 'white',
              }}
              key={category.key}
              onClick={(e) => {
                setSelectedApplication(category.key);
              }}
            >
              <div className="flex h-full flex-col p-1">
                <div className="mb-1 flex items-center mb-2">
                  <Icon className="mr-1" style={{ color: category.color }} />
                  <span className="text-lg font-bold">{category.title}</span>
                </div>
                <span className="text-sm text-gray-500">{category.description}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col">
        {/* <MyCheckboxList /> */}
        {algaeColors.map((color) => {
          const colorVariants = {
            green:
              'group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-green-500 focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-green-500',
            brown:
              'group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-[#b15928] focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-[#b15928]',
            red: 'group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-red-500 focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-red-500',
          };

          return (
            <Field className="flex items-center gap-2 cursor-pointer" key={color.value}>
              <Checkbox
                key={`checkbox-${color.value}`}
                checked={colorSelection[color.value]}
                onChange={(val) => {
                  updateColorSelection(color.value, val);
                }}
                defaultChecked
                className={colorVariants[color.value]}
              >
                <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
              </Checkbox>
              <Label>{color.name}</Label>
            </Field>
          );
        })}
      </div>
    </div>
  );
}
