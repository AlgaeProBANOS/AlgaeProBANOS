import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectFilters, selectSpecies, setFilters } from '@/app/store/apb.slice';
import { Chip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { isEmojiSupported } from 'is-emoji-supported';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ReactCountryFlag } from 'react-country-flag';
// import { getFlagEmoji, langUnicode } from "./Tooltip";

export interface Region {
  title: string;
  center: [number, number];
  zoom: number;
}

export const regionOptions = [
  { title: 'North Sea', center: [55.0, 3.0], zoom: 6 },
  { title: 'Baltic Sea', center: [58.0, 20.0], zoom: 6 },
  { title: 'Mediterranean', center: [38.0, 15.0], zoom: 5 },
  { title: 'British Isles & Ireland', center: [54.5, -4.5], zoom: 6 },
  { title: 'Adriatic Sea', center: [43.0, 16.0], zoom: 7 },
  { title: 'White Sea', center: [65.5, 37.5], zoom: 6 },
  { title: 'North Atlantic', center: [45.0, -20.0], zoom: 4 },
];

export const regionCountries: { [key: string]: string[] } = {
  'North Sea': [
    'Belgium',
    'Denmark',
    'France',
    'Germany',
    'Netherlands',
    'Norway',
    'United Kingdom',
  ],
  'Baltic Sea': [
    'Denmark',
    'Estonia',
    'Finland',
    'Germany',
    'Latvia',
    'Lithuania',
    'Poland',
    'Russia',
    'Sweden',
  ],
  Mediterranean: [
    'Albania',
    'Bosnia and Herzegovina',
    'Croatia',
    'Cyprus',
    'France',
    'Greece',
    'Italy',
    'Malta',
    'Monaco',
    'Montenegro',
    'Slovenia',
    'Spain',
    'Turkey',
  ],
  'British Isles & Ireland': ['Ireland', 'United Kingdom'],
  'Adriatic Sea': [
    'Albania',
    'Bosnia and Herzegovina',
    'Croatia',
    'Italy',
    'Montenegro',
    'Slovenia',
  ],
  'White Sea': ['Russia'],
  'North Atlantic': [
    'Belgium',
    'Denmark',
    'France',
    'Germany',
    'Iceland',
    'Ireland',
    'Netherlands',
    'Norway',
    'Portugal',
    'Spain',
    'United Kingdom',
  ],
};

export default function AreaSearchBar() {
  const dispatch = useAppDispatch();

  const [value, setValue] = useState<Region | null>(null);

  useEffect(() => {
    console.log('CHANGE', value);

    dispatch(
      setFilters({
        type: 'region',
        cat: 'region',
        val: value,
      }),
    );
  }, [value]);

  const label = 'Region Search';

  return (
    <Autocomplete
      id="countries-filter"
      options={regionOptions}
      limitTags={3}
      value={value}
      // loading={countriesLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          className={value ? 'filterUsed' : ''}
          variant="outlined"
          label={label}
          placeholder="Select countries"
          size="small"
        />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props} key={`region-search-entry-${option.title.replaceAll(' ', '')}`}>
            {option.title}
          </li>
        );
      }}
      getOptionLabel={(option) => {
        return option.title;
      }}
      onChange={(event, newValue) => {
        setValue(newValue);
        // setValue(Object.fromEntries(newValue.map((e) => [e.title, e])));
      }}
      sx={{ width: 350 }}
    />
  );
}
