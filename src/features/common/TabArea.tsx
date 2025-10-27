import { useState } from 'react';

interface TabAreaProps {
  tabs: Array<{ title: string; key: string; content: JSX.Element }>;
  titleElement?: JSX.Element;
}

export default function TabArea(props: TabAreaProps): JSX.Element {
  const { tabs, titleElement } = props;

  const [selectedTab, setSelectedTab] = useState<string | null>(tabs[0]?.key ?? null);

  return (
    <div className="size-full flex p-1">
      <div className="size-full grid grid-rows-[auto_1fr]">
        <div className="flex justify-between w-full">
          <div className="flex gap-1">
            {tabs.map((e) => (
              <button
                key={e.key}
                aria-selected={selectedTab === e.key}
                className="rounded-t-md px-3 py-1 text-sm/6 font-semibold bg-apb-gray-light border-apb-gray-light border aria-selected:bg-apb-green aria-selected:text-white hover:bg-apb-green-light/50 outline-none text-nowrap"
                onClick={() => {
                  setSelectedTab(e.key);
                }}
              >
                {e.title}
              </button>
            ))}
          </div>
          {titleElement ? titleElement : <div></div>}
        </div>
        <div className="size-full border border-apb-gray-light rounded-b-md relative">
          {tabs.map((e) => (
            <div
              key={e.key}
              className={`size-full absolute bg-white ${selectedTab === e.key ? 'z-50' : 'z-0'}`}
            >
              {e.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
