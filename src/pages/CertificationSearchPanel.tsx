import { useEffect, useState } from 'react';
import { Checkbox, Field, Label } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';
import { useAppDispatch } from '@/app/store';
import { setFilters } from '@/app/store/apb.slice';

export interface SwitchProps {
  setter: (v: any) => void;
  firstOption?: any;
  secondOption?: any;
  value: any;
}

export function Switch(props: SwitchProps): JSX.Element {
  const { value, firstOption = true, secondOption = false, setter } = props;

  const [val, setVal] = useState(value);

  useEffect(() => {
    if (setter != null) setter(val);
  }, [val]);

  console.log(val, value);

  return (
    <div
      className="flex cursor-pointer rounded-md w-min overflow-hidden select-none border"
      onClick={() => {
        if (val === firstOption) {
          setVal(secondOption);
        } else {
          setVal(firstOption);
        }
      }}
    >
      <div
        className="px-1 py-[1px] transition-colors duration-500"
        style={{
          backgroundColor: val === firstOption ? 'black' : 'white',
          color: val === firstOption ? 'white' : 'black',
        }}
      >
        {firstOption}
      </div>
      <div
        className="px-1 py-[1px] transition-colors duration-500"
        style={{
          backgroundColor: val === secondOption ? 'black' : 'white',
          color: val === secondOption ? 'white' : 'black',
        }}
      >
        {secondOption}
      </div>
    </div>
  );
}

export default function CertificationSearchPanel(): JSX.Element {
  const [onMarket, setOnMarket] = useState(false);
  const [novelFood, setNovelFood] = useState(false);
  const [foodList, setFoodList] = useState(false);
  const [polyCulture, setPolyCulture] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setFilters({ type: 'certifications', cat: 'onMarket', val: onMarket }));
  }, [onMarket]);

  useEffect(() => {
    dispatch(setFilters({ type: 'certifications', cat: 'novelFood', val: novelFood }));
  }, [novelFood]);

  useEffect(() => {
    dispatch(setFilters({ type: 'certifications', cat: 'foodList', val: foodList }));
  }, [foodList]);

  useEffect(() => {
    dispatch(setFilters({ type: 'certifications', cat: 'polyCulture', val: polyCulture }));
  }, [polyCulture]);

  return (
    <div className="grid grid-cols-2">
      <span className="col-span-2">Certifications & Market Status</span>
      <Field className="flex items-center gap-1 cursor-pointer">
        <Checkbox
          checked={onMarket}
          onChange={(val) => {
            setOnMarket(!onMarket);
          }}
          defaultChecked
          className="group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-apb-gray focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-apb-gray"
        >
          <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
        </Checkbox>
        <Label
          className={`text-sm cursor-pointer select-none ${onMarket ? 'text-black' : 'text-gray-400'}`}
        >
          Already on market
        </Label>
      </Field>{' '}
      <Field className="flex items-center gap-1 cursor-pointer">
        <Checkbox
          checked={novelFood}
          onChange={(val) => {
            setNovelFood(!novelFood);
          }}
          defaultChecked
          className="group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-apb-gray focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-apb-gray"
        >
          <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
        </Checkbox>
        <Label
          className={`text-sm cursor-pointer select-none ${novelFood ? 'text-black' : 'text-gray-400'}`}
        >
          Listed in EU Novel Food Catalogue
        </Label>
      </Field>{' '}
      <Field className="flex items-center gap-1 cursor-pointer">
        <Checkbox
          checked={foodList}
          onChange={(val) => {
            setFoodList(!foodList);
          }}
          defaultChecked
          className="group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-apb-gray focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-apb-gray"
        >
          <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
        </Checkbox>
        <Label
          className={`text-sm cursor-pointer select-none ${foodList ? 'text-black' : 'text-gray-400'}`}
        >
          In Union Novel Food List
        </Label>
      </Field>{' '}
      <Field className="flex items-center gap-1 cursor-pointer">
        <Checkbox
          checked={polyCulture}
          onChange={(val) => {
            setPolyCulture(!polyCulture);
          }}
          defaultChecked
          className="group size-4 rounded border bg-white dark:bg-white/5 data-[checked]:border-transparent data-[checked]:bg-apb-gray focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-apb-gray"
        >
          <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
        </Checkbox>
        <Label
          className={`text-sm cursor-pointer select-none ${polyCulture ? 'text-black' : 'text-gray-400'}`}
        >
          Can be grown in polyculture
        </Label>
      </Field>
      {/* <div className="flex w-full justify-between">
        <span>Already on market</span>
        <Switch mode="mini" value={onMarket} setter={setOnMarket} />
      </div> */}
      {/* <div className="flex w-full justify-between">
        <span>Listed in EU Novel Food Catalogue</span>
        <span
          className={
            algae.certifications.inNovelFoodCatalogue
              ? 'text-green-700 bg-green-100 px-2 rounded-lg'
              : 'text-red-700 bg-red-100 px-2 rounded-lg'
          }
        >
          {algae.certifications.inNovelFoodCatalogue ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="flex w-full justify-between">
        <span>In Union Novel Food List</span>
        <span
          className={
            algae.certifications.inUnionNovelFoodList
              ? 'text-green-700 bg-green-100 px-2 rounded-lg'
              : 'text-red-700 bg-red-100 px-2 rounded-lg'
          }
        >
          {algae.certifications.inUnionNovelFoodList ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="flex w-full justify-between">
        <span>Can be grown in polyculture</span>
        <span
          className={
            algae.certifications.canBeGrownInPolyculture
              ? 'text-green-700 bg-green-100 px-2 rounded-lg'
              : 'text-red-700 bg-red-100 px-2 rounded-lg'
          }
        >
          {algae.certifications.canBeGrownInPolyculture ? 'Yes' : 'No'}
        </span>
      </div> */}
    </div>
  );
}
