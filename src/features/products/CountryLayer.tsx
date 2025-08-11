import { useEffect, useState } from 'react';
import { Layer, Source } from '@vis.gl/react-maplibre';
import { useAppSelector } from '@/app/store';
import { Country, selectFilters } from '@/app/store/apb.slice';

export function CountryLayer() {
  const [data, setData] = useState(null);
  const countryFilter = useAppSelector(selectFilters).countries;
  const filteredCountryIsos =
    countryFilter != null ? Object.values(countryFilter).map((e: Country) => e.iso3) : null;

  useEffect(() => {
    fetch('/data/UN_Worldmap_FeaturesToJSON10percentCorrected.json')
      .then((res) => res.json())
      .then(function (json) {
        setData(json);
      });
  }, []);

  if (data != null) {
    return (
      <Source type="geojson" data={data}>
        <Layer
          beforeId="country"
          id="country-fill"
          type="fill"
          paint={{
            'fill-color': 'transparent',
            //   'fill-opacity': 0.8,
          }}
        />
        <Layer
          beforeId="country"
          id="country-line"
          type="line"
          paint={{
            'line-color': 'purple',
            'line-width': 2,
            'line-opacity': [
              'case',
              ['in', ['get', 'ISO3CD'], ['literal', filteredCountryIsos]],
              1.0,
              0.0,
            ],
          }}
        />
      </Source>
    );
  } else {
    return <></>;
  }
}
