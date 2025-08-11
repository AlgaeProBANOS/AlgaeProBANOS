import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectSpecies, setFilters } from '@/app/store/apb.slice';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { isEmojiSupported } from 'is-emoji-supported';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ReactCountryFlag } from 'react-country-flag';
// import { getFlagEmoji, langUnicode } from "./Tooltip";

export default function NameSearchBar() {
  const [value, setValue] = useState(null);
  const species = useAppSelector(selectSpecies);
  const dispatch = useAppDispatch();

  const nameOptions = useMemo(() => {
    let tmpNameOptions: Array<{
      title: Species['scientificName'];
      value: Species['scientificName'];
    }> = [];
    if (species != null) {
      tmpNameOptions = Object.keys(species).map((key) => {
        return {
          title: species[key]?.scientificName,
          value: species[key]?.scientificName,
        };
      });
    }

    return tmpNameOptions;
  }, [species]);

  const label = 'Name Search';

  useEffect(() => {
    dispatch(setFilters({ type: 'name', cat: '', val: value !== '' ? value : null }));
  }, [value]);

  return (
    <Autocomplete
      value={value != null ? value : null}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;

        const filtered = options.filter((entry) => {
          if (entry.title.toLowerCase().includes(inputValue.toLowerCase())) {
            entry.found = null;
            return true;
          } else if (
            entry.all != null &&
            entry.all.toLowerCase().includes(inputValue.toLowerCase())
          ) {
            entry.found = [];
            if (entry.en != null && entry.en.toLowerCase().includes(inputValue.toLowerCase())) {
              entry.found.push('en');
            }

            if (entry.fr != null && entry.fr.toLowerCase().includes(inputValue.toLowerCase())) {
              entry.found.push('fr');
            }

            if (entry.es != null && entry.es.toLowerCase().includes(inputValue.toLowerCase())) {
              entry.found.push('es');
            }

            if (entry.de != null && entry.de.toLowerCase().includes(inputValue.toLowerCase())) {
              entry.found.push('de');
            }
            return true;
          } else {
            entry.found = null;
            return false;
          }
        });

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={nameOptions}
      getOptionLabel={(option) => {
        if (option.iso != null) {
          return `${option.title}`;
        }

        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }

        // Regular option
        return option.title;
      }}
      renderOption={(props, option) => {
        if (option.iso != null) {
          return (
            <li {...props}>
              <ReactCountryFlag
                style={{
                  fontSize: '1.5em',
                  lineHeight: '1.5em',
                }}
                countryCode={option.iso}
                svg={!isEmojiSupported('🇬🇧')}
              />
              &nbsp;
              {option.title}
            </li>
          );
        } else {
          return <li {...props}>{option.title}</li>;
        }
      }}
      sx={{ width: 250 }}
      freeSolo
      renderInput={(params) => {
        return (
          <div className="relative">
            {value != null && (
              <ReactCountryFlag
                className="absolute h-[1.6em] z-40 left-2"
                style={{
                  fontSize: '1.6em',
                  lineHeight: '1.6em',
                  height: '1.6em',
                }}
                countryCode={value.iso}
                svg={!isEmojiSupported('🇬🇧')}
              />
            )}
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
      style={{ display: 'table-cell', verticalAlign: 'middle' }}
    />
  );
}
