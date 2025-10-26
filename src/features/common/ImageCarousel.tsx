import { useOverlayState } from '@/app/context/overlay.context';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Fragment, useState } from 'react';

export function ImageCarousel(props): JSX.Element {
  const { updateOverlay } = useOverlayState();
  const { images, startIndex, overlayMode } = props;
  const [currentImage, setCurrentImage] = useState<number>(startIndex ?? 0);
  return (
    <div className="size-full flex flex-col">
      <div className={`${overlayMode !== true ? 'h-full' : 'h-[90%]'} w-full relative select-none`}>
        {images != null && (
          <>
            {images.map((e, i) => {
              return (
                <Fragment key={`carousel-wrapper-${i}-${overlayMode}`}>
                  <img
                    className="absolute top-0 left-0 size-full object-cover cursor-pointer"
                    onClick={() => {
                      if (overlayMode !== true) {
                        updateOverlay(
                          <div className="w-[80vw] h-[80vh] relative">
                            <ImageCarousel images={images} startIndex={i} overlayMode />
                          </div>,
                        );
                      }
                    }}
                    src={e.url}
                    style={{ display: i === currentImage ? 'block' : 'none' }}
                  />
                  <div
                    className="w-full absolute left-0 bottom-0 text-xs text-white text-center px-2"
                    style={{ display: i === currentImage ? 'block' : 'none' }}
                  >
                    <a
                      className="cursor-pointer hover:underline bg-slate-400 bg-opacity-50 px-2 rounded-md"
                      target="_blank"
                      href={e.url}
                    >
                      &copy; {e.rightsHolder}
                    </a>
                  </div>
                </Fragment>
              );
            })}
            <div
              className="hover:bg-slate-100 hover:bg-opacity-60 w-8 absolute left-0 top-0 h-full flex items-center cursor-pointer"
              onClick={() => {
                setCurrentImage((currentImage - 1) % images.length);
              }}
            >
              <ChevronLeftIcon className="w-full scale-y-[200%] scale-x-[150%] p-0 m-0 stroke-gray-800 stroke-[0.5px] fill-white" />
            </div>
            <div
              className="hover:bg-slate-100 hover:bg-opacity-60 w-8 absolute right-0 top-0 h-full flex items-center cursor-pointer p-0 m-0"
              onClick={() => {
                setCurrentImage((currentImage + 1) % images.length);
              }}
            >
              <ChevronRightIcon className="w-full scale-y-[200%] scale-x-[150%] p-0 m-0 stroke-gray-800 stroke-[0.5px] fill-white" />
            </div>
          </>
        )}
      </div>
      {overlayMode != null && (
        <div className="p-2 w-full h-[20%] relative bottom-0 left-0 flex flex-row gap-3 overflow-hidden. overflow-x-scroll">
          {images.map((e, i) => {
            return (
              <img
                src={e.url}
                className="size-20 cursor-pointer"
                onClick={() => {
                  setCurrentImage(i);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
