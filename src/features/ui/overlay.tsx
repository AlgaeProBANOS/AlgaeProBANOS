import { useI18n } from '@stefanprobst/next-i18n';

import { useOverlayState } from '@/app/context/overlay.context';

export default function Overlay(): JSX.Element {
  // const { t } = useI18n<'common'>();
  const { overlay, updateOverlay } = useOverlayState();

  console.log(overlay);

  if (overlay != null) {
    return (
      <div
        className="absolute left-0 top-0 z-[500] flex size-full items-center justify-center bg-memorise-gray bg-opacity-80 hover:cursor-pointer"
        onClick={(e) => {
          updateOverlay(null);
          e.stopPropagation();
        }}
      >
        <div
          className="z-[600] max-h-[90%] max-w-[90%] rounded-md border-4 border-memorise-blue-500 bg-white hover:cursor-default dark:border-memorise-gold-100 dark:bg-memorise-dark"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="grid grid-cols-2 grid-rows-[auto_min-content_min-content_min-content_min-content_auto] gap-4 p-4 font-mono dark:text-memorise-gold-100">
            <div className="col-span-2 text-2xl font-bold">{overlay.entity.title}</div>
            <div className="col-start-1">
              <span className="font-bold">Artist: </span>
              {overlay.entity.artist}
            </div>
            <div className="col-start-1">
              <span className="font-bold">Year: </span>
              {overlay.entity.dateStr}
            </div>
            <div className="col-start-1">
              <span className="font-bold">Camp: </span>
              {overlay.entity.camp}
            </div>
            <div className="col-start-1">
              <span className="font-bold">Caption: </span>
              {overlay.entity.caption}
            </div>
            <div className="col-start-2 row-span-5 row-start-2 flex w-full items-center">
              <img src={overlay.entity.img}></img>
            </div>
            <div className="col-start-2 grid w-4/5 grid-cols-[min-content_auto_min-content_auto] grid-rows-2 gap-2 text-memorise-blue-500 mt-2">
              <div className="rounded-md border p-1 px-2 hover:text-memorise-dark hover:bg-memorise-blue-500 hover:cursor-pointer">
                2D
              </div>
              <div className="content-center">Artwork Explorer</div>
              <div className="grid grid-cols-2 items-center justify-center gap-1 rounded-md border p-1 px-2 hover:text-memorise-dark hover:bg-memorise-blue-500 hover:cursor-pointer">
                <div className="h-4 w-2 bg-memorise-blue-500"></div>
                <div className="h-4 w-2 bg-memorise-blue-500"></div>
              </div>
              <div className="content-center">Comparative Document Reader</div>
              <div className="rounded-md border p-1 px-2 hover:text-memorise-dark hover:bg-memorise-blue-500 hover:cursor-pointer">
                3D
              </div>
              <div className="content-center">Artwork Explorer</div>
              <div className="flex items-center justify-center rounded-md border p-1 px-2 hover:text-memorise-dark hover:bg-memorise-blue-500 hover:cursor-pointer">
                <div className="size-4 rounded-full bg-memorise-blue-500 "></div>
              </div>
              <div className="content-center">Unheard Voices</div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
