import { Cog8ToothIcon } from '@heroicons/react/24/solid';
import type { Entity, Event } from '@intavia/api-client';
import { Dialog } from '@intavia/ui';
import { useMemo, useState } from 'react';

import { useAppDispatch } from '@/app/store';
import { useElementDimensions } from '@/lib/use-element-dimensions';
import { useElementRef } from '@/lib/use-element-ref';

import { editVisualization, type Visualization } from '../common/visualization.slice';
import { GeoMapWrapper } from '../geo-map/geo-map-wrapper';
import { TimelineComponent } from '../timeline/timelineComponent';
import { ComponentPropertiesDialog } from './visualization-property-dialog';

interface VisualisationComponentProps {
  type: 'map' | 'timeline';
  visualization: Visualization;
  entities?: Record<Entity['id'], Entity>;
  events?: Record<Event['id'], Event>;
  showToolbar?: boolean;
}

export default function VisualisationComponent(props: VisualisationComponentProps): JSX.Element {
  const { type, visualization, entities, events, showToolbar = true } = props;
  const [containerElement, setContainerElement] = useElementRef();

  const dispatch = useAppDispatch();

  const [editElement, setEditElement] = useState<Visualization | null>(null);

  const handleClose = () => {
    setEditElement(null);
  };

  const handleSave = (element: Visualization) => {
    dispatch(editVisualization(element));
  };

  const rect = useElementDimensions({ element: containerElement });

  const width = rect != null ? rect.width : 50;
  const height = rect != null ? rect.height : 50;

  const visualizationContent = useMemo(() => {
    switch (type) {
      case 'map':
        return (
          <GeoMapWrapper
            visualization={visualization}
            highlightedByVis={{ entities: [], events: [] }}
            entities={entities}
            events={events}
          />
        );

      case 'timeline':
        return (
          <TimelineComponent
            entities={entities}
            events={events}
            width={width}
            height={height}
            highlightedByVis={{ entities: [], events: [] }}
            properties={visualization.properties}
          />
        );

      default:
        return <></>;
    }
  }, [type, entities, visualization]);

  return (
    <div
      ref={setContainerElement}
      className={`relative grid size-full grid-cols-1 overflow-auto ${showToolbar ? 'grid-rows-[32px_1fr]' : 'grid-rows-1'}`}
    >
      {showToolbar && (
        <div className="sticky right-0 flex flex-nowrap justify-end gap-1 p-1">
          <button
            aria-label="Edit"
            className="grid size-6 place-items-center rounded-full transition hover:bg-neutral-200 hover:text-neutral-700"
            onClick={() => {
              setEditElement(visualization);
              /* if (setVisualizationEditElement !== undefined) {
                setVisualizationEditElement(visualization as Visualization);
              } */
            }}
          >
            <Cog8ToothIcon className="size-5" />
          </button>
        </div>
      )}
      {visualizationContent}
      {editElement !== null ? (
        <Dialog onOpenChange={handleClose}>
          <ComponentPropertiesDialog
            onClose={handleClose}
            element={editElement}
            onSave={handleSave}
          />
        </Dialog>
      ) : null}
    </div>
  );
}
