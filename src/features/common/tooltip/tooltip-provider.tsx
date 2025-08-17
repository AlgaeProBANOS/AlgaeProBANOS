import { assert } from '@stefanprobst/assert';
import { defaultStyles, TooltipWithBounds, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export type TooltipProps = {
  width: number;
  height: number;
};

type TooltipData = JSX.Element | null;

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: 'rgba(248,248,248,0.9)',
  color: '#171717',
  padding: 6,
  WebkitBoxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  MozBoxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

interface TooltipProviderProps {
  children: ReactNode;
}

export interface TooltipContextType {
  updateTooltip: (content: JSX.Element | null) => void;
}

export const TooltipContext = createContext<TooltipContextType | null>(null);

export function TooltipProvider(props: TooltipProviderProps): JSX.Element {
  const { children } = props;
  const [content, setContent] = useState<JSX.Element | null>(null);

  const value = useMemo(() => {
    const updateTooltip = (content: JSX.Element | null) => {
      setContent(content);
    };
    return { content, updateTooltip };
  }, [content]);

  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  const {
    showTooltip,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<TooltipData>({
    // initial tooltip state
    tooltipOpen: true,
    tooltipLeft: 0,
    tooltipTop: 0,
    tooltipData: null,
  });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // coordinates should be relative to the container in which Tooltip is rendered
      const containerX = ('clientX' in event ? event.clientX : 0) - containerBounds.left;
      const containerY = ('clientY' in event ? event.clientY : 0) - containerBounds.top;
      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY,
        tooltipData: content,
      });
    },
    [showTooltip, containerBounds],
  );

  const TooltipComponent = TooltipInPortal;

  return (
    <TooltipContext.Provider value={value}>
      {/* <div
        id="tooltipProviderWrapper"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          overflow: 'hidden',
        }}
      >*/}
      <div
        id="tooltipProvider"
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="w-full h-full overflow-hidden z-[40]"
      >
        <TooltipComponent
          key={Math.random()} // needed for bounds to update correctly
          left={tooltipLeft}
          top={tooltipTop}
          style={tooltipStyles}
          className={`z-[41] ${content != null ? 'visible' : 'hidden'}`}
        >
          {content}
        </TooltipComponent>
        {children}
        {/* </div> */}
      </div>
    </TooltipContext.Provider>
  );
}

export function useTooltipState() {
  const value = useContext(TooltipContext);
  assert(value != null, 'missing tabbar provider');
  return value;
}
