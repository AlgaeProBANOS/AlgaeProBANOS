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

export default function CountrySearchBar() {
  const dispatch = useAppDispatch();
  const [countriesDictionary, setCountriesDictionary] = useState(null);
  const species = useAppSelector(selectSpecies);
  const filters = useAppSelector(selectFilters);

  const [value, setValue] = useState<
    Record<
      string,
      { title: string; value: string; iso: string; type: string; found: boolean; iso3: string }
    >
  >(filters.countries);

  useEffect(() => {
    console.log('UPDATE ME HERE!');
  }, [filters.countries]);

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'countries',
        cat: 'countries',
        val: value,
      }),
    );
  }, [value]);

  useEffect(() => {
    fetch('/data/countryDictionary.json')
      .then((res) => res.json())
      .then(function (json) {
        setCountriesDictionary(json);
      });
  }, []);

  useEffect(() => {
    const places = {};
    const cont = {};
    for (const spec of Object.values(species)) {
      const pl = spec.geographicPosition.split(',');
      const countries =
        spec.emodnet_points != null ? spec.emodnet_points.map((e) => e.country) : [];
      for (const p of pl) {
        places[p.trim()] = places[p.trim()] != null ? places[p.trim()] + 1 : 1;
      }
      for (const con of countries) {
        cont[con] = cont[con] != null ? cont[con] + 1 : 1;
      }
    }
  }, [species]);

  const countryOptions = useMemo(() => {
    let tmpCountryOptions = [];
    if (countriesDictionary != null) {
      tmpCountryOptions = Object.keys(countriesDictionary)
        .filter((key) => {
          return (
            countriesDictionary[key].BGCI !== '' && countriesDictionary[key].BGCI !== 'replaceME'
          );
        })
        .map((e) => {
          return {
            title: countriesDictionary[e].BGCI,
            value: countriesDictionary[e].ROMNAM,
            iso: countriesDictionary[e].ISO2,
            iso3: countriesDictionary[e].ISO3,
            type: 'country',
          };
        })
        .sort((a, b) => {
          return (a.title > b.title) - (a.title < b.title);
        });
    }

    return tmpCountryOptions;
  }, [countriesDictionary]);

  const label = 'Country Search';

  return (
    <Autocomplete
      multiple
      id="countries-filter"
      options={countryOptions}
      limitTags={3}
      value={value != null ? Object.values(value) : []}
      // loading={countriesLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          className={value ? 'filterUsed' : ''}
          variant="outlined"
          // InputLabelProps={{ shrink: value != null ? true : false }}
          label="Country Search"
          placeholder="Select countries"
          size="small"
          // sx={{
          //   '& .MuiOutlinedInput-root': {
          //     '&:hover fieldset': {
          //       borderColor: '#1a4c59',
          //     },
          //     '&.Mui-focused fieldset': {
          //       borderColor: '#1a4c59',
          //     },
          //   },
          //   '& .MuiInputLabel-root.Mui-focused': {
          //     color: '#1a4c59',
          //   },
          // }}
        />
      )}
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
      getOptionLabel={(option) => {
        return option.title;
      }}
      onChange={(event, newValue) => {
        setValue(Object.fromEntries(newValue.map((e) => [e.title, e])));
      }}
      sx={{ width: 350 }}
    />
  );
}

{
  /* <Autocomplete
  value={value != null ? value : null}
  onChange={(event, newValue) => {
    setValue([newValue]);
  }}
  id="country-search-input"
  filterOptions={(options, params) => {
    const { inputValue } = params;

    const filtered = options.filter((entry) => {
      if (entry.title.toLowerCase().includes(inputValue.toLowerCase())) {
        entry.found = null;
        return true;
      } else if (entry.all != null && entry.all.toLowerCase().includes(inputValue.toLowerCase())) {
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
  options={countryOptions}
  getOptionLabel={(option) => {
    console.log(option);

    // if (option.iso != null) {
    //   return `${option.title}`;
    // }

    // // Value selected with enter, right from the input
    // if (typeof option === 'string') {
    //   return option;
    // }
    // // Add "xxx" option created dynamically
    // if (option.inputValue) {
    //   return option.inputValue;
    // }

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
  renderValue={(value, getItemProps) => {
    console.log('value', value);
    return <Chip label={value.title} {...getItemProps()} />;
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
          label="Country Search"
        />
      </div>
    );
  }}
  style={{ display: 'table-cell', verticalAlign: 'middle' }}
/>;
 */
}
