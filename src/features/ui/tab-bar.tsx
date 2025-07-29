import { useDroppable } from "@dnd-kit/core";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@intavia/ui";
import { useState } from "react";

import { useI18n } from "@/app/i18n/use-i18n";
import { useAppDispatch } from "@/app/store";

import { Button } from "./button";
import { TabElement } from "./tab";
import { deleteTabBar, type Tab } from "./ui.slice";

// import { useAppSelector } from '@/app/store';

interface TabBarProps {
  id: string;
  tabs: Record<string, Tab>;
}

export function TabBar(props: TabBarProps): JSX.Element {
  const { id, tabs } = props;
  const { setNodeRef } = useDroppable({
    id: id,
  });
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const { t } = useI18n<"common">();

  return (
    <div
      ref={setNodeRef}
      className="grid grid-flow-col grid-rows-[36px] overflow-visible rounded-md border-memorise-blue-600 bg-memorise-blue-200"
    >
      {Object.values(tabs).map((tab) => {
        return <TabElement key={`tab-${tab.id}`} tab={tab} />;
      })}
      <Button
        style={{ justifySelf: "end" }}
        key={"deleteTabBar"}
        onClick={() => {
          setOpenDialog(true);
        }}
      >
        <span className="font-bold text-memorise-orange-800">-</span>
      </Button>
      <Dialog
        open={openDialog}
        onOpenChange={() => {
          setOpenDialog(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(["common", "form", "delete-tab-bar"])}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              color="red"
              onClick={() => {
                setOpenDialog(false);
              }}
            >
              {t(["common", "form", "cancel"])}
            </Button>
            <Button
              color="green"
              onClick={() => {
                dispatch(deleteTabBar({ tabBar: id }));
                /* const newElement = { ...tmpElement, properties: tmpProperties };
                onSave(newElement as Visualization);
                onClose(); */
              }}
            >
              {t(["common", "form", "yes"])}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
