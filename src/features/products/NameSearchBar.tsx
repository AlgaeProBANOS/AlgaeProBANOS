import { Species } from '@/api/apb.client';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectFilteredSpecies, selectSpecies, setFilters } from '@/app/store/apb.slice';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useEffect, useMemo, useState } from 'react';
// import { getFlagEmoji, langUnicode } from "./Tooltip";

export interface NameSearchEntry {
  value: string;
  title: string;
}

export default function NameSearchBar() {
  const [value, setValue] = useState<NameSearchEntry | null>(null);
  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const filters = useAppSelector(selectSpecies);
  const dispatch = useAppDispatch();

  const groupedGenusSpecies = useMemo(() => {
    const genusSpecies: Record<Species['genus'], Array<Species>> = {};

    for (const specObj of Object.values(species)) {
      if (filteredSpecies?.includes(specObj.scientificName)) {
        if (genusSpecies[specObj.genus] != null) {
          genusSpecies[specObj.genus]?.push(specObj);
        } else {
          genusSpecies[specObj.genus] = [specObj];
        }
      }
    }
    return genusSpecies;
  }, [species]);

  const sortedGenusKeys = Object.keys(groupedGenusSpecies).sort();

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'name',
        cat: 'name',
        val: value,
      }),
    );
  }, [value]);

  useEffect(() => {
    if (value !== filters.name) {
      setValue(filters.name);
    }
  }, [filters.name]);

  const nameOptions = useMemo(() => {
    let tmpNameOptions: Array<{
      title: Species['scientificName'];
      value: Species['scientificName'];
      commonName: Species['commonName'];
      found: 'commonName' | 'name';
      genus: boolean;
    }> = [];

    if (groupedGenusSpecies != null) {
      tmpNameOptions = sortedGenusKeys.flatMap((genusKey) => {
        const speciesEntries = groupedGenusSpecies[genusKey]
          .filter((e) => e.species != null)
          ?.map((spec) => {
            return {
              title: spec.scientificName,
              value: spec.scientificName,
              commonName: spec.commonName,
              genus: !(spec.species != null),
              found: null,
            };
          });

        return [
          {
            title: !genusKey.trim().endsWith('p.') ? genusKey + ' spp.' : genusKey,
            value: genusKey,
            commonName: genusKey,
            genus: !(species[genusKey]?.species != null),
            found: null,
          },
          ...speciesEntries,
        ];
      });
    }

    return tmpNameOptions;
  }, [sortedGenusKeys, groupedGenusSpecies, filteredSpecies]);

  const label = 'Name Search';

  useEffect(() => {
    dispatch(setFilters({ type: 'name', cat: '', val: value !== '' ? value : null }));
  }, [value]);

  const [currentValue, setCurrentValue] = useState<string | null>();

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
      onInputChange={(e, v) => {
        setCurrentValue(v);
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;
        const tmpOptions = [];

        options.map((entry) => {
          if (inputValue === '' || inputValue == null) {
            tmpOptions.push({ ...entry, found: 'name' });
          } else if (entry.title.toLowerCase().includes(inputValue.toLowerCase())) {
            tmpOptions.push({ ...entry });
          } else if (
            entry.commonName != null &&
            entry.commonName.toLowerCase().includes(inputValue.toLowerCase())
          ) {
            tmpOptions.push({ ...entry, found: 'commonName' });
          } else if (
            entry.all != null &&
            entry.all.toLowerCase().includes(inputValue.toLowerCase())
          ) {
            entry.found = [];
            if (entry.en != null && entry.en.toLowerCase().includes(inputValue.toLowerCase())) {
              // entry.found.push('en');
            }

            if (entry.fr != null && entry.fr.toLowerCase().includes(inputValue.toLowerCase())) {
              // entry.found.push('fr');
            }

            if (entry.es != null && entry.es.toLowerCase().includes(inputValue.toLowerCase())) {
              // entry.found.push('es');
            }

            if (entry.de != null && entry.de.toLowerCase().includes(inputValue.toLowerCase())) {
              // entry.found.push('de');
            }
            // return true;
          } else {
            // entry.found = null;
            // return false;
          }
        });

        return tmpOptions;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={nameOptions}
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
            <div className="flex flex-col">
              <div className={option.genus ? 'font-bold italic' : 'italic'}>
                {highlightText(option.title, currentValue)}
              </div>
              {option.found === 'commonName' && (
                <div className="text-sm">{highlightText(option.commonName, currentValue)}</div>
              )}
            </div>
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
