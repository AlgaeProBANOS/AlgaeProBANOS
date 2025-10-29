import { useI18n } from '@stefanprobst/next-i18n';

import { useOverlayState } from '@/app/context/overlay.context';

export default function Overlay(): JSX.Element {
  // const { t } = useI18n<'common'>();
  const { overlay, updateOverlay } = useOverlayState();

  if (overlay != null) {
    return (
      <div
        className="absolute left-0 top-0 z-[500] flex size-full items-center justify-center bg-apb-gray bg-opacity-80 hover:cursor-pointer"
        onClick={(e) => {
          updateOverlay(null);
          e.stopPropagation();
        }}
      >
        <div
          className="z-[600] max-h-[90%] max-w-[90%] rounded-md border-2 border-apb-green-light bg-white hover:cursor-default p-2"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {overlay}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
