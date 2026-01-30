import { Species } from '@/api/apb.client';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useParams } from '@/app/route/use-params';
import { useAppSelector } from '@/app/store';
import { selectSpecies } from '@/app/store/apb.slice';
import { ImageCarousel } from '@/features/common/ImageCarousel';
import { useTooltipState } from '@/features/common/tooltip/tooltip-provider';
import { MacroIcon } from '@/features/products/MacroIcon';
import Map from '@/features/products/Map';
import { MicroIcon } from '@/features/products/MicroIcon';
import { algaeColors, applicationCategories } from '@/features/products/utils';
import { useElementDimensions } from '@/lib/use-element-dimensions';
import { useElementRef } from '@/lib/use-element-ref';
import { ArrowTopRightOnSquareIcon, LinkIcon } from '@heroicons/react/24/solid';
import { BusinessOutlined, WarningOutlined } from '@mui/icons-material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import Link from 'next/link';
import { Fragment, useEffect, useMemo, useState } from 'react';

export const getServerSideProps = withDictionaries(['common']);

export default function SpeciesDetails(): JSX.Element {
  const params = useParams();
  const speciesID = params?.get('id');
  const species = useAppSelector(selectSpecies);
  const [extraData, setExtraData] = useState<Record<Species['id'], any> | null>(null);
  const [producers, setProducers] = useState<Record<Species['id'], any> | null>(null);
  const [companies, setCompanies] = useState<Record<string, any> | null>(null);
  const { updateTooltip } = useTooltipState();

  useEffect(() => {
    fetch('/data/species_with_local_paths.json')
      .then((res) => res.json())
      .then(function (json) {
        setExtraData(json);
      });
    fetch('/data/producers.json')
      .then((res) => res.json())
      .then(function (json) {
        setProducers(json);
      });
    fetch('/data/companies.json')
      .then((res) => res.json())
      .then(function (json) {
        setCompanies(json);
      });
  }, []);

  const algae = species[speciesID ?? ''];
  if (speciesID == null || algae == null) return <>Select a species to see its details.</>;

  const [algaeProducers, algaeCompanies, algaeLinks] = useMemo(() => {
    let prods: Array<string> = [];
    const links: Record<string, string> = {};
    if (producers != null) {
      if (producers[algae.scientificName]) {
        const entry = producers[algae.scientificName];
        if (entry.Producers) {
          prods = entry.Producers.split(',').map((e) => e.trim());
        }

        if (entry['Wikipedia Links'] && entry['Wikipedia Links'] != null) {
          links['wikipedia'] = entry['Wikipedia Links'];
        }

        if (entry['Algae Base Links'] && entry['Algae Base Links'] != null) {
          links['algaeBase'] = entry['Algae Base Links'];
        }
      }
    }

    let algComps = [];
    if (companies != null) {
      for (const prod of prods) {
        if (Object.keys(companies).includes(prod)) {
          algComps.push(companies[prod]);
        }
      }
    }

    return [prods, algComps, links];
  }, [producers, companies, algae]);

  const gridElements = useMemo(() => {
    const gridElements = [];

    gridElements.push(
      <div className="details-card" key="map-details">
        <div className="size-full grid grid-rows-[400px_auto]">
          <Map
            key={`map-focus-${algae.scientificName.replaceAll(' ', '_')}`}
            focusSpecies={[algae.scientificName]}
          />
          {algae.geographicPosition != null && algae.geographicPosition !== 'Unknown' && (
            <>
              <span className="text-xl">Geographic Position</span>
              <span className="italic">{algae.geographicPosition}</span>
            </>
          )}
        </div>
      </div>,
    );

    gridElements.push(
      <div className="details-card" key="taxonomy-details">
        <span className="text-xl">Taxonomic Classification</span>
        {extraData != null && (
          <>
            {extraData[algae.scientificName].hierarchy.map((level, i) => {
              return (
                <div key={`hierarchy-entry-${i}`} className="flex justify-between">
                  <span style={{ paddingLeft: i * 12 + 'px' }}>{level.rank}:</span>
                  <span className={level.rank === 'Species' ? 'italic' : ''}>{level.name}</span>
                </div>
              );
            })}
            <a
              className="border rounded-md w-fit px-[4px] hover:bg-black hover:text-white"
              href={extraData[algae.scientificName].gbifUrl}
            >
              View on GBIF
            </a>
            <span className="text-sm">
              Taxonomy data provided by{' '}
              <a href="https://www.gbif.org">Global Biodiversity Information Facility (GBIF)</a>
            </span>
          </>
        )}
      </div>,
    );

    gridElements.push(
      <div className="details-card" key="info-details">
        <span className="text-xl">General Information</span>
        <div className="grid w-full grid-cols-2">
          <span className="text-sm">Water Type</span>
          <span className="text-sm">Habitat</span>
          <span className="">{algae.waterType}</span>
          <span className="">{algae.habitat}</span>
          <span className="text-sm col-span-2 mt-4">Geographic Requirements</span>
          <span className="col-span-2">{algae.geographicPosition}</span>
        </div>
      </div>,
    );

    gridElements.push(
      <div className="details-card" key="growth-details">
        <span className="text-xl">Growth Requirements</span>
        <div className="grid w-full grid-cols-2">
          <span className="text-sm">Water Temperature</span>
          <span className="text-sm">Optimal Temperature</span>
          <span className="">{algae.waterTemp}</span>
          <span className="">{algae.optimalTemp}</span>
          <span className="text-sm mt-4">Salinity</span>
          <span className="text-sm mt-4">Depth Range</span>
          <span className="">{algae.salinity}</span>
          <span className="">{algae.depthRange}</span>
        </div>
      </div>,
    );
    gridElements.push(
      <div className="details-card flex flex-col gap-2" key="certs-details">
        <span className="text-xl">Certifications & Market Status</span>
        <div className="flex w-full justify-between">
          <span>Already on market</span>
          <span
            className={
              algae.certifications.onMarket
                ? 'text-green-700 bg-green-100 px-2 rounded-lg'
                : 'text-red-700 bg-red-100 px-2 rounded-lg'
            }
          >
            {algae.certifications.onMarket ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex w-full justify-between">
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
        </div>
      </div>,
    );

    if (Object.values(algae.applications).filter((e) => e != null).length > 0) {
      gridElements.push(
        <div className="details-card flex gap-2 flex-col" key="applications-details">
          <span className="text-xl">Application & Uses</span>
          {applicationCategories.map((entry, i) => {
            if (algae.applications[entry.key] == null) {
              return <Fragment key={`applic-entry-${i}`}></Fragment>;
            } else {
              const Icon = entry.icon;
              return (
                <div
                  style={{
                    backgroundColor: `${entry.color}11`,
                    borderColor: `${entry.color}22`,
                  }}
                  className="p-2 rounded-md border grid grid-cols-[min-content_auto] w-full"
                  key={`applic-entry-${i}`}
                >
                  {<Icon className="mr-1" style={{ color: entry.color, stroke: 'none' }} />}
                  <span style={{ color: entry.color }} className="font-bold">
                    {entry.title}
                  </span>
                  <span className="col-start-2">{algae.applications[entry.key]}</span>
                </div>
              );
            }
          })}
        </div>,
      );
    }

    if (algaeCompanies.length > 0) {
      gridElements.push(
        <div className="details-card" key="companies-details">
          <span className="text-xl text-[#2196f3] flex items-center gap-1">
            <BusinessOutlined /> Algae Producers ({algaeCompanies.length})
          </span>
          <div className="w-full max-h-64 overflow-hidden overflow-y-scroll">
            {algaeCompanies.map((comp, i) => (
              <Link
                href={comp.Website}
                key={`complink-${i}`}
                target="_blank"
                className="p-1 w-min text-nowrap inline-block"
              >
                <div
                  className="flex items-center gap-1 text-sm rounded-md bg-slate-200 hover:bg-slate-300 px-1"
                  onMouseEnter={() => {
                    updateTooltip(
                      <div className="grid grid-cols-4 gap-1 p-1 max-w-[40vw] text-wrap w-fit">
                        <span className="col-span-4 font-bold text-lg">{comp.Producers}</span>
                        {comp['Headquarters'] !== '' && (
                          <>
                            <span className="">Headquarters: </span>
                            <span className="">{comp.Headquarters}</span>
                          </>
                        )}
                        {comp['Value chain'] !== '' && (
                          <>
                            <span className="">Value Chain:</span>
                            <span className="">{comp['Value chain'].replaceAll(',', ', ')}</span>
                          </>
                        )}
                        {comp['Founding year'] !== '' && (
                          <>
                            <span className="">Founding year:</span>
                            <span className="">{comp['Founding year']}</span>
                          </>
                        )}
                        {comp['Industry (Applications)'] !== '' && (
                          <>
                            <span className="">Industry (Applications):</span>
                            <span className="">
                              {comp['Industry (Applications)'].replaceAll(',', ', ')}
                            </span>
                          </>
                        )}
                      </div>,
                    );
                  }}
                  onMouseLeave={() => {
                    updateTooltip(null);
                  }}
                >
                  <LinkIcon className="size-3" />
                  {comp.Producers}
                </div>
              </Link>
            ))}
          </div>
        </div>,
      );
    }

    if (algae.nutritionalProfile != null) {
      gridElements.push(
        <div className="details-card" key="nutritional-details">
          <span className="text-xl flex items-center gap-1" style={{ color: '#ff9800' }}>
            <RestaurantIcon />
            Nutritional Profile
          </span>
          <span>{algae.nutritionalProfile}</span>
        </div>,
      );
    }

    if (algae.risks != null) {
      gridElements.push(
        <div className="details-card" key="risks-details">
          <span className="text-xl flex items-center gap-1" style={{ color: '#f44336' }}>
            <WarningOutlined />
            Risks
          </span>
          {algae.risks.medicinalHealth && (
            <>
              <span className="text-sm text-apb-gray">Medicinal / Health</span>
              <span>{algae.risks.medicinalHealth}</span>
            </>
          )}
          {algae.risks.flavorDiet && (
            <>
              <span className="text-sm text-apb-gray">Flavour / Diet</span>
              <span>{algae.risks.flavorDiet}</span>
            </>
          )}
          {algae.risks.other && (
            <>
              <span className="text-sm text-apb-gray">Other</span>
              <span>{algae.risks.other}</span>
            </>
          )}
        </div>,
      );
    }

    return gridElements;
  }, [algaeProducers, algaeCompanies]);

  const [containerElement, setContainerElement] = useElementRef();
  const containerWidth = useElementDimensions({ element: containerElement })?.width;

  const colNumber = useMemo(() => {
    if (containerWidth != null && containerWidth > 1280) {
      return 3;
    } else {
      return 2;
    }
  }, [containerWidth]);

  return (
    <div className="size-full grid grid-rows-[auto_1fr]" ref={setContainerElement}>
      <div className="grid grid-cols-[60%_40%] w-full p-4 shadow-md">
        <div className="flex flex-col gap-2 mb-14">
          <span className="text-4xl font-bold">{algae?.scientificName}</span>
          <span className="text-xl">{algae?.commonName}</span>
          <div className="flex gap-2">
            {algae != null &&
              Object.values(algaeColors)
                .filter((col) => algae.color.includes(col.value))
                .map((col, i) => {
                  return (
                    <div
                      className="px-2 rounded text-white"
                      key={`color-bar-${i}-${algae.species}`}
                      style={{ backgroundColor: col.color }}
                    >
                      {col.name}
                    </div>
                  );
                })}
            {algae != null && algae.division != null && (
              <div className="px-2 rounded bg-apb-blue-100">{algae.division}</div>
            )}
            {algae != null && algae.microMacro != null && (
              <div className="px-2 rounded bg-apb-blue-100 flex gap-1 items-center">
                {algae.microMacro}
                {algae.microMacro === 'Macro' && <MacroIcon size={20} fill={'black'} />}
                {algae.microMacro === 'Mico' && <MicroIcon size={20} fill={'black'} />}
              </div>
            )}
            {algae != null && algae.invasive != null && (
              <div
                className={
                  algae.invasive === 'no'
                    ? 'px-2 rounded text-green-700 bg-green-100'
                    : 'px-2 rounded text-red-700 bg-red-100'
                }
              >
                {algae.invasive === 'no' ? 'Non-invasive' : 'Invasive'}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {algaeLinks['wikipedia'] != null && (
              <Link href={algaeLinks['wikipedia']} target="_blank">
                <div className="px-2 rounded bg-slate-200 hover:bg-slate-300 flex items-center gap-1">
                  <ArrowTopRightOnSquareIcon className="size-4" />
                  Wikipedia
                </div>
              </Link>
            )}
            {algaeLinks['algaeBase'] != null && (
              <Link href={algaeLinks['algaeBase']} target="_blank">
                <div className="px-2 rounded bg-slate-200 hover:bg-slate-300 flex items-center gap-1">
                  <ArrowTopRightOnSquareIcon className="size-4" />
                  Algae Base
                </div>
              </Link>
            )}
          </div>
        </div>
        <div className="size-full overflow-hidden rounded-md">
          {extraData && extraData[algae.scientificName].images.length > 0 && (
            <ImageCarousel images={extraData[algae.scientificName].images} />
          )}
        </div>
      </div>
      <div className="relative overflow-hidden overflow-y-scroll">
        <div className="size-full absolute grid grid-cols-[40%_60%] xl:grid-cols-3 gap-3 p-3 pr-6">
          <div className="flex flex-col">{gridElements.filter((e, i) => i % colNumber === 0)}</div>
          <div className="flex flex-col">{gridElements.filter((e, i) => i % colNumber === 1)}</div>
          {colNumber === 3 && (
            <div className="flex flex-col">
              {gridElements.filter((e, i) => i % colNumber === 2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
