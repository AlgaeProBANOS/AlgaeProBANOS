import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import { Input, Label, Switch } from "@intavia/ui";
import { nanoid } from "@reduxjs/toolkit";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { useDateState } from "@/app/context/date.context";
import { useSearchState } from "@/app/context/search.context";
import { useI18n } from "@/app/i18n/use-i18n";
import { useAppDispatch, useAppSelector } from "@/app/store";

import { Button } from "./button";
import RegexTable from "./regex-table";
import { addTabBar, selectSetting, setSetting } from "./ui.slice";

export function Toolbar(): JSX.Element {
  const showAnnotationsSetting = useAppSelector((state) => {
    return selectSetting(state, "showAnnotations");
  });

  const alignScrollingSetting = useAppSelector((state) => {
    return selectSetting(state, "alignScrolling");
  });

  const [showAnnotations, setShowAnnotations] = useState<boolean>(
    showAnnotationsSetting,
  );
  const [alignScrolling, setAlignScrolling] = useState<boolean>(
    alignScrollingSetting,
  );
  const dateContext = useDateState();
  const { t } = useI18n<"common">();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dateContext.updateShowAnnotations(showAnnotations);
  }, [showAnnotations, dateContext]);

  useEffect(() => {
    dateContext.updateAlignScrolling(alignScrolling);
  }, [alignScrolling, dateContext]);

  return (
    <div className="flex w-full flex-wrap justify-between px-2">
      {/* <HistoryToolbar canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo} /> */}
      <div className="flex gap-5">
        <div className="flex items-center gap-x-2 p-1">
          <Switch
            id="show-annotations-switch"
            defaultChecked={showAnnotations}
            onCheckedChange={(check) => {
              setShowAnnotations(check);
              dispatch(
                setSetting({ setting: "showAnnotations", value: check }),
              );
              dateContext.updateShowAnnotations(check);
            }}
          />
          <Label htmlFor="show-annotations-switch">
            {t(["common", "documents", "show-annotations"])}
          </Label>
          <Switch
            id="align-scrolling-switch"
            defaultChecked={alignScrolling}
            onCheckedChange={(check) => {
              setAlignScrolling(check);
              dispatch(setSetting({ setting: "alignScrolling", value: check }));
              dateContext.updateAlignScrolling(check);
            }}
          />
          <Label htmlFor="align-scrolling-switch">
            {t(["common", "documents", "align-scrolling"])}
          </Label>
        </div>
        <SearchForm />
      </div>
      <div className="flex items-center gap-x-2 p-1">
        <Button
          onClick={() => {
            dispatch(addTabBar());
          }}
        >
          {t(["common", "documents", "add-column"])}{" "}
          <ViewColumnsIcon
            width={20}
            height={20}
            style={{ marginLeft: "5px" }}
          />
        </Button>
      </div>
    </div>
  );
}

function SearchForm(): JSX.Element {
  const searchContext = useSearchState();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState<string | null>(
    searchContext.searchTerm,
  );
  const [casing, setCasing] = useState<boolean>(
    searchContext.isCasing ?? false,
  );

  const { t } = useI18n<"common">();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchValue = searchRef.current?.value;

    searchContext.updateSearchTerm(searchValue as string);
    setSearchText(searchValue as string);
  }

  useEffect(() => {
    setSearchText(searchContext.searchTerm);
  }, [searchContext.searchTerm]);

  return (
    <div className="flex gap-1 py-1">
      <Button
        active={casing}
        onClick={() => {
          searchContext.updateCasing(!casing);
          setCasing(!casing);
        }}
      >
        Aa
      </Button>
      <form
        // className="px-4 py-4"
        autoComplete="off"
        name="search"
        noValidate
        onSubmit={onSubmit}
        role="search"
      >
        <Input
          ref={searchRef}
          aria-label="Search in texts"
          className="bg-neutral-50"
          key={`search-test-${nanoid(4)}`}
          placeholder={t(["common", "documents", "search-in-text"])}
          type="search"
          defaultValue={searchText != null ? searchText : ""}
        />
      </form>

      <Popover className="relative flex items-center">
        <div className="hover:text-memorise-blue-900">
          <PopoverButton>&#9432;</PopoverButton>
        </div>
        <PopoverPanel
          anchor={{ to: "bottom" }}
          transition
          className="z-[99998] flex p-1 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {() => {
            return (
              <div className="relative flex flex-col items-center">
                <div className="z-50 h-[12px] w-[24px]">
                  <div className="relative size-0 border-x-[12px] border-b-[12px] border-x-transparent border-b-memorise-black-600">
                    <div className="absolute left-[-11px] top-px size-0 border-x-[11px] border-b-[11px] border-x-transparent border-b-white"></div>
                  </div>
                </div>
                <div className="z-10 flex flex-col gap-1 rounded-md bg-white p-2 shadow-xl ring-1 ring-memorise-black-600 ">
                  <RegexTable />
                </div>
              </div>
            );
          }}
        </PopoverPanel>
      </Popover>
    </div>
  );
}
