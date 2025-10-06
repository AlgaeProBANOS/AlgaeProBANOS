import { useI18n } from '@/app/i18n/use-i18n';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  resetSpeciesFilters,
  selectFilteredSpecies,
  selectSpecies,
  selectSpeciesPhotos,
  setFilters,
  setSpeciesPhotos,
} from '@/app/store/apb.slice';
import { useElementDimensions } from '@/lib/use-element-dimensions';
import { useElementRef } from '@/lib/use-element-ref';
import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTooltipState } from '../common/tooltip/tooltip-provider';

function flattenObj(obj) {
  // console.log('Flatten OBJ', obj);
  if (obj.children != null) {
    return { name: obj.name, children: Object.values(obj.children).map((e) => flattenObj(e)) };
  } else {
    return obj;
  }
}

function getNodeTooltip(node) {
  switch (node.depth) {
    case 1:
      return `Type: ${node.data.name}`;
    case 2:
      return `Genus: ${node.data.name}`;
    case 3:
      return `Species: ${node.data.name}`;
    default:
      break;
  }
  // {node.depth > 1 ? 'Species' : 'Genus'}: {entry.data.name}
}

export function SpeciesTreeMap() {
  const { t } = useI18n<'common'>();
  const dispatch = useAppDispatch();
  const species = useAppSelector(selectSpecies);
  const filteredSpecies = useAppSelector(selectFilteredSpecies);
  const speciesPhotos = useAppSelector(selectSpeciesPhotos);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedGenus, setSelectedGenus] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  function resetSelected(level) {
    switch (level) {
      case 'everything':
        setSelectedType(null);
        setSelectedGenus(null);
        setSelectedSpecies(null);
        dispatch(setFilters({ type: 'species', cat: 'genus', val: null }));
        dispatch(setFilters({ type: 'species', cat: 'species', val: null }));
        dispatch(setFilters({ type: 'species', cat: 'type', val: null }));
      case 'type':
        setSelectedGenus(null);
        setSelectedSpecies(null);
        dispatch(setFilters({ type: 'species', cat: 'genus', val: null }));
        dispatch(setFilters({ type: 'species', cat: 'species', val: null }));
        break;
      case 'genus':
        setSelectedSpecies(null);
        dispatch(setFilters({ type: 'species', cat: 'species', val: null }));
        break;
      case 'species':
        break;
      default:
        break;
    }
    dispatch(
      setFilters({
        type: 'name',
        cat: null,
        val: null,
      }),
    );
  }

  const [containerElement, setContainerElement] = useElementRef();
  const containerSize = useElementDimensions({ element: containerElement });

  const microMacro = useMemo(() => {
    const tmpGenus = {};
    const tmpMicroMacro = {};

    if (filteredSpecies != null) {
      for (const spec of filteredSpecies) {
        const genusName = species[spec]?.genus as string;
        if (genusName === '' || genusName == null) {
          continue;
        }
        let speciesName = species[spec]?.species;
        if (speciesName?.trim() === '' || speciesName == null) {
          speciesName = 'spp.';
        }

        const type = species[spec]?.microMacro;

        const photo = speciesPhotos[spec];

        const speciesObj = { name: speciesName, size: 1, value: 1, photo, type };

        if (Object.keys(tmpMicroMacro).includes(type)) {
          if (Object.keys(tmpMicroMacro[type].children).includes(genusName)) {
            tmpMicroMacro[type].children[genusName].children[speciesName] = {
              name: speciesName,
              size: 1,
              value: 1,
              photo,
              type,
            };
            // tmpGenus[genusName].children.push({ name: speciesName, size: 1, value: 1, photo, type });
          } else {
            tmpMicroMacro[type].children[genusName] = {
              name: genusName,
              children: { [speciesName]: { name: speciesName, size: 1, value: 1, photo, type } },
            };
            // tmpGenus[genusName] = {
            //   name: genusName,
            //   children: [{ name: speciesName, size: 1, value: 1, photo, type }],
            // };
          }
        } else {
          tmpMicroMacro[type] = {
            name: type,
            children: { [genusName]: { name: genusName, children: { [speciesName]: speciesObj } } },
          };
        }
      }
    }

    return {
      name: 'MicroMacro',
      children: tmpMicroMacro,
    };
  }, [species, filteredSpecies]);

  // Specify the chart’s dimensions.
  const width = containerSize?.width ?? 500;
  const height = containerSize?.height ?? 300;

  // This custom tiling function adapts the built-in binary tiling function
  // for the appropriate aspect ratio when the treemap is zoomed-in.
  function tile(node, x0, y0, x1, y1) {
    d3.treemapBinary(node, 0, 0, width, height);
    for (const child of node.children) {
      child.x0 = x0 + (child.x0 / width) * (x1 - x0);
      child.x1 = x0 + (child.x1 / width) * (x1 - x0);
      child.y0 = y0 + (child.y0 / height) * (y1 - y0);
      child.y1 = y0 + (child.y1 / height) * (y1 - y0);
    }
  }

  const root = useMemo(() => {
    const hierarchy = d3
      .hierarchy(flattenObj(microMacro))
      .sum((d) => d.value)
      .sort((a, b) => a.value - b.value);
    return d3.treemap().size([width, height]).tile(tile)(hierarchy);
  }, [microMacro]);

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'species',
        cat: 'species',
        val: selectedSpecies?.data.name ?? null,
      }),
    );
  }, [selectedSpecies]);

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'species',
        cat: 'genus',
        val: selectedGenus?.data.name ?? null,
      }),
    );
  }, [selectedGenus]);

  useEffect(() => {
    dispatch(
      setFilters({
        type: 'species',
        cat: 'type',
        val: selectedType?.data.name ?? null,
      }),
    );
  }, [selectedType]);

  return (
    <div className="size-full grid grid-rows-[min-content_1fr]">
      <div className="cursor-pointer">
        <div>
          <div className="grid grid-cols-[min-content_min-content_min-content_min-content] p-1 gap-x-6">
            {selectedType && (
              <>
                <div
                  onClick={() => {
                    resetSelected('everything');
                  }}
                  className="row-span-2 items-center flex"
                >
                  Reset
                </div>
                <div
                  onClick={() => {
                    resetSelected('type');
                  }}
                >
                  <div className="speciesTreemapHeaderType">Type</div>
                  <div>{selectedType?.data?.name ?? ''}</div>
                </div>
              </>
            )}
            {selectedGenus && (
              <div
                onClick={() => {
                  resetSelected('genus');
                }}
              >
                <div className="speciesTreemapHeaderType">Genus</div>
                <div className="italic">{selectedGenus?.data?.name ?? ''}</div>
              </div>
            )}
            {selectedSpecies && (
              <div
                onClick={() => {
                  resetSelected('species');
                }}
              >
                <div className="speciesTreemapHeaderType">Species</div>
                <div className="italic">{selectedSpecies?.data?.name ?? ''}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        ref={setContainerElement}
        className="size-full border border-apb-gray rounded-md relative overflow-hidden"
      >
        <TreeMapLevel
          rootNode={root}
          width={width}
          height={height}
          sel={selectedType}
          onClick={setSelectedType}
          showDecendants={true}
        />
        <TreeMapLevel
          rootNode={selectedType}
          width={width}
          height={height}
          sel={selectedGenus}
          onClick={setSelectedGenus}
        />
        <TreeMapLevel
          rootNode={selectedGenus}
          width={width}
          height={height}
          sel={selectedSpecies}
          onClick={setSelectedSpecies}
        />
        <TreeMapLevel
          rootNode={selectedSpecies}
          sel={null}
          width={width}
          height={height}
          onClick={() => {}}
        />
        {/* {sel != null && sel.depth > 0 && renderTreeMapLevel(sel)} */}
      </div>
    </div>
  );
}

function TreeMapLevel(props) {
  const {
    rootNode,
    width,
    height,
    onClick: myOnClick,
    sel,
    showDecendants = false,
    preview = false,
  } = props;
  const { updateTooltip } = useTooltipState();

  useEffect(() => {
    if (
      rootNode != null &&
      rootNode.children != null &&
      rootNode.children.length === 1 &&
      myOnClick &&
      (sel == null || (sel != null && sel.data.name !== rootNode.children[0].data.name))
    ) {
      // console.log(
      //   'HERREH',
      //   rootNode,
      //   rootNode.children[0],
      //   sel,
      //   rootNode.children[0].data.name,
      //   // sel.data.name !== rootNode.children[0].data.name,
      // );
      myOnClick(rootNode.children[0]);
    }
  }, [rootNode]);

  // Create the scales.
  const x = d3.scaleLinear().rangeRound([0, width]);
  const y = d3.scaleLinear().rangeRound([0, height]);
  if (rootNode) {
    x.domain([rootNode.x0, rootNode.x1]);
    y.domain([rootNode.y0, rootNode.y1]);
  }

  const origView = {
    tx: 0,
    ty: 0,
    scale: 1,
  };
  const [view, setView] = useState<typeof origView | null>(null);

  useEffect(() => {
    if (sel == null) {
      setView(origView);
    }
  }, [sel]);

  const getPhotoUrl = useCallback((entry) => {
    if (entry.children != null) {
      const found = entry.children.find((e) => e.data.photo != null);
      return found != null ? found.data.photo : null;
    } else {
      return entry.data != null ? entry.data.photo : null;
    }
  }, []);

  const getZoomTransform = useCallback(
    (node) => {
      const viewW = width;
      const viewH = height;

      const nodeW = node.x1 - node.x0;
      const nodeH = node.y1 - node.y0;

      // console.log(viewW / nodeW, viewH / nodeH);

      const k = Math.max(viewW / nodeW, viewH / nodeH);
      const tx = -(node.x0 + nodeW / 2) * k + viewW / 2;
      const ty = -(node.y0 + nodeH / 2) * k + viewH / 2;

      // const tx = -node.x0;
      // const ty = -node.y0;

      return { tx, ty, scale: k };
    },
    [width, height],
  );

  return rootNode != null ? (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        transform: view ? `translate(${view.tx}px, ${view.ty}px) scale(${view.scale}) ` : '',
        transition: view ? 'transform .75s ease-in-out' : '',
        transformOrigin: 'top left',
      }}
    >
      {(rootNode.children != null ? rootNode.children : [rootNode]).map((entry, i) => {
        const photo = getPhotoUrl(entry);
        return (
          <div
            key={`treemap-node-genusspecies-${entry.data.name}-${entry.depth}-${showDecendants}-${preview}`}
            className="size-full items-center flex justify-center overflow-hidden relative treeMapLevel"
            style={{
              animation: 'fade-in .5s',
              position: 'absolute',
              top: y(entry.y0),
              left: x(entry.x0),
              width: x(entry.x1) - x(entry.x0),
              height: y(entry.y1) - y(entry.y0),
              overflow: 'hidden',
              backgroundColor: 'lightgray',
              cursor: rootNode.children ? 'pointer' : '',
              border: preview ? 'none' : '2px solid white',
            }}
            onPointerEnter={
              preview == false
                ? (e) => {
                    if (sel != null) {
                      updateTooltip(
                        <div className="p-1">
                          Species: {sel.data.name} {entry.data.name}
                        </div>,
                      );
                    } else {
                      updateTooltip(<div className="p-1">{getNodeTooltip(entry)}</div>);
                    }
                    e.preventDefault();
                  }
                : undefined
            }
            onPointerLeave={
              preview == false
                ? (e) => {
                    updateTooltip(null);
                    e.preventDefault();
                  }
                : undefined
            }
            onClick={
              preview == false
                ? (e) => {
                    if (rootNode.children) {
                      const { tx, ty, scale } = getZoomTransform(entry);
                      setView({ tx, ty, scale });
                      updateTooltip(null);
                      myOnClick(entry);
                    }
                  }
                : undefined
            }
          >
            {photo != null && (
              // <div
              //   style={{
              //     backgroundImage: `url("${photo.url}")`,
              //     width: '100px',
              //     height: '100px',
              //   }}
              // ></div>
              <img
                src={photo.url}
                alt=""
                // width={100}
                // height={100}
                loading="lazy"
                decoding="async" /*  */
                className={entry.depth > 2 ? 'size-full object-cover' : 'size-full'}
              />
            )}
            {showDecendants && rootNode.children && (
              <TreeMapLevel
                rootNode={entry}
                width={entry.x1 - entry.x0}
                height={entry.y1 - entry.y0}
                // sel={selectedType}
                // onClick={setSelectedType}
                preview={true}
              />
            )}
            {rootNode.children && preview == false && (
              <p className="absolute w-full top-[2px] left-[2px] bg-apb-gray bg-opacity-20 rounded-sm text-apb-gray-light text-shadow-md overflow-hidden text-ellipsis text-sm italic">
                {entry.data.name}
              </p>
            )}
          </div>
        );
      })}
    </div>
  ) : (
    <></>
  );
}
