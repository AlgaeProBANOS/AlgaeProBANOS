import { Species } from '@/api/apb.client';
import { withDictionaries } from '@/app/i18n/with-dictionaries';
import { useParams } from '@/app/route/use-params';
import { useAppSelector } from '@/app/store';
import { selectSpecies } from '@/app/store/apb.slice';
import { ImageCarousel } from '@/features/common/ImageCarousel';
import ProductMap from '@/features/products/Map';
import { algaeColors, applicationCategories } from '@/features/products/utils';
import { Fragment, useEffect, useState } from 'react';

export const getServerSideProps = withDictionaries(['common']);

export default function SpeciesDetails(): JSX.Element {
  const params = useParams();
  const speciesID = params?.get('id');
  const species = useAppSelector(selectSpecies);
  const [extraData, setExtraData] = useState<Record<Species['id'], any> | null>(null);

  useEffect(() => {
    fetch('/data/species.json')
      .then((res) => res.json())
      .then(function (json) {
        setExtraData(json);
      });
  }, []);

  const algae = species[speciesID ?? ''];
  console.log('AGL', algae);

  if (speciesID == null || algae == null) return <>Select a species to see its details.</>;

  if (extraData != null) console.log(extraData[algae.scientificName]);

  return (
    <div className="size-full grid grid-rows-[auto_1fr]">
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
              <div className="px-2 rounded bg-apb-blue-100">{algae.microMacro}</div>
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
        </div>
        <div className="size-full overflow-hidden rounded-md">
          {extraData && extraData[algae.scientificName].images.length > 0 && (
            <ImageCarousel images={extraData[algae.scientificName].images} />
          )}
        </div>
      </div>
      <div className="relative overflow-hidden overflow-y-scroll">
        <div className="grid grid-cols-[40%_60%] gap-4 p-4 w-full absolute">
          <div className="flex flex-col gap-4">
            <div className="details-card">
              <span className="text-xl">Taxonomic Classification</span>
              {extraData != null && (
                <>
                  {extraData[algae.scientificName].hierarchy.map((level, i) => {
                    return (
                      <div key={`hierarchy-entry-${i}`} className="flex justify-between">
                        <span style={{ paddingLeft: i * 6 + 'px' }}>{level.rank}:</span>
                        <span className={level.rank === 'Species' ? 'italic' : ''}>
                          {level.name}
                        </span>
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
                    <a href="https://www.gbif.org">
                      Global Biodiversity Information Facility (GBIF)
                    </a>
                  </span>
                </>
              )}
            </div>
            <div className="details-card">
              <span className="text-xl">General Information</span>
              <div className="grid w-full grid-cols-2">
                <span className="text-sm">Water Type</span>
                <span className="text-sm">Habitat</span>
                <span className="">{algae.waterType}</span>
                <span className="">{algae.habitat}</span>
                <span className="text-sm col-span-2 mt-4">Geographic Requirements</span>
                <span className="col-span-2">{algae.geographicPosition}</span>
              </div>
            </div>
            <div className="details-card">
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
            </div>
          </div>
          <div className="flex flex-col gap-4 pr-4">
            {Object.values(algae.applications).filter((e) => e != null).length > 0 && (
              <div className="details-card">
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
              </div>
            )}
            <div className="details-card">
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
            </div>
            {algae.nutritionalProfile != null && (
              <div className="details-card">
                <span className="text-xl">Nutritional Profile</span>
                <span>{algae.nutritionalProfile}</span>
              </div>
            )}
            <div className="details-card h-96">
              <ProductMap
                key={`map-focus-${algae.scientificName.replaceAll(' ', '_')}`}
                focusSpecies={[algae.scientificName]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    // <div className="grid grid-cols-[40%_60%] gap-4 p-4 overflow-hidden w-full">

    // </div>
  );
}
