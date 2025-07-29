import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { ActionCreators as UndoActionCreators } from 'redux-undo';

import { DateProvider } from '@/app/context/date.context';
import { TabbarProvider } from '@/app/context/tabbar.context';
import type { RootState } from '@/app/store';
import { useAppDispatch, useAppSelector } from '@/app/store';

import { TabBarAndContent } from './tab-bar-and-content';
import { Toolbar } from './toolbar';
import { moveTabToTabBar, selectTabBars } from './ui.slice';

/* interface HompageTabsProps {
  id: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
} */

function HomepageTabs(/* props: HompageTabsProps */): JSX.Element {
  /* const {} = props; */
  const tabBars = useAppSelector(selectTabBars);
  const dispatch = useAppDispatch();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor),
  );

  function handleDragStart() {
    setIsDragging(true);
  }
  function handleDragEnd(event : DragEndEvent) {
    setIsDragging(false);

    const { active, over } = event;

    if (over != null)
      dispatch(
        moveTabToTabBar({ tabId: active.id as string, destinationTabBar: over.id as string }),
      );

    /* if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    } */
  }

  /* function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over != null)
      dispatch(
        moveTabToTabBar({ tabId: active.id as string, destinationTabBar: over.id as string }),
      );
  } */

  // count of found words shoukd be visible

  const className = useMemo(() => {return `grid w-full grid-flow-col grid-cols-${Object.keys(tabBars).length} grid-rows-1 gap-1`;}, [tabBars]);

  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      <DndContext
        autoScroll={false}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={Object.values(tabBars)} strategy={verticalListSortingStrategy}>
          {/* <DndContext onDragEnd={handleDragEnd}> */}
          <DateProvider>
            <Toolbar />
            <div className={className}>
              {Object.values(tabBars).map((tabBar) => {
                return (
                  <TabbarProvider
                    key={`tabbar-${tabBar.id}-comboprovider`}
                    initialValue={Object.values(tabBar.tabs)[0]}
                  >
                    <TabBarAndContent
                      key={`tabbar-${tabBar.id}-combo`}
                      id={tabBar.id}
                      tabs={tabBar.tabs}
                    />
                  </TabbarProvider>
                );
              })}
            </div>
          </DateProvider>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function mapStateToProps(state: RootState) {
  return { canUndo: state.ui.past.length > 0, canRedo: state.ui.future.length > 0 };
}

const mapDispatchToProps = {
  onUndo: UndoActionCreators.undo,
  onRedo: UndoActionCreators.redo,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomepageTabs);
