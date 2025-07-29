import type { JSX } from 'react/jsx-runtime';

import { Button } from '../ui/button';

interface HistoryToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function HistoryToolbar(props: HistoryToolbarProps): JSX.Element {
  const { onRedo, onUndo, canUndo, canRedo } = props;

  return (
    <div className="flex flex-wrap justify-center gap-5">
      <Button onClick={onUndo} disabled={!canUndo}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
          />
        </svg>
      </Button>
      <Button onClick={onRedo} disabled={!canRedo}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
          />
        </svg>
      </Button>
    </div>
  );
}
