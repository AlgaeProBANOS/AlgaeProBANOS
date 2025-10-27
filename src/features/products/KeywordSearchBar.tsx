import { Species } from '@/api/apb.client';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  selectFilteredSpecies,
  selectFilters,
  selectSpecies,
  setFilters,
} from '@/app/store/apb.slice';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useEffect, useMemo, useState } from 'react';
// import { getFlagEmoji, langUnicode } from "./Tooltip";

export interface NameSearchEntry {
  value: string;
  title: string;
}

export default function KeywordSearchBar() {
  const [value, setValue] = useState<string | null>(null);
  const species = useAppSelector(selectSpecies);
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'keyword',
        cat: 'keyword',
        val: value,
      }),
    );
  }, [value]);

  useEffect(() => {
    if (value !== filters.keyword) {
      setValue(filters.keyword);
    }
  }, [filters.keyword]);

  const searchOptions = useMemo(() => {
    let tmpSearchOptions: Array<{
      title: string;
      value: string;
    }> = [];
    return tmpSearchOptions;
  }, [[]]);

  const label = 'Product Search';

  function highlightText(text, searchTerm) {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={i} className="bg-yellow-300">
          {part}
        </span>
      ) : (
        part
      ),
    );
  }

  return (
    <Autocomplete
      value={value != null ? value : null}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      // onInputChange={(e, v) => {
      //   setCurrentValue(v);
      // }}
      //   filterOptions={(options, params) => {
      //     const { inputValue } = params;

      //     return true;
      //   }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={searchOptions}
      getOptionLabel={(option) => {
        // if (option.iso != null) {
        //   return `${option.title}`;
        // }

        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }

        // Regular option
        return option.title;
      }}
      renderOption={(props, option) => {
        return (
          <li {...props} key={props.key}>
            {option.title}
          </li>
        );
      }}
      sx={{ width: 250 }}
      freeSolo
      renderInput={(params) => {
        return (
          <div className="relative">
            <TextField
              {...params}
              className={value ? 'filterUsed' : ''}
              size="small"
              variant="outlined"
              // InputLabelProps={{ shrink: value != null ? true : false }}
              label={label}
            />
          </div>
        );
      }}
      style={{ display: 'table-cell', verticalAlign: 'middle', width: '100%' }}
    />
  );
}
