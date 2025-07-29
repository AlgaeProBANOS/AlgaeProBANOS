import { type ReactNode, useMemo } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  size?: 'default' | 'large' | 'small';
  color?: 'red' | 'green';
  style?: object;
}

export function Button(props: ButtonProps): JSX.Element {
  const { children, onClick, disabled = false, size, active = false, style, color } = props;

  const sizeValue = useMemo(() => {
    let returnValue = 2;

    switch (size) {
      case 'small':
        returnValue = 1.75;
        break;
      case 'large':
        returnValue = 2.25;
        break;
      case 'default':
      case undefined:
      default:
        break;
    }
    return returnValue;
  }, [size]);

  const classStr = useMemo(() => {
    if (disabled) {
      return `rounded-full flex items-center justify-center shadow-md py-1 px-3 ${color === 'red' ? 'bg-memorise-orange-900 text-white' : color === 'green' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-300 dark:bg-memorise-gold-100 dark:text-memorise-black'}`;
    } else if (active) {
      return `rounded-full flex items-center justify-center py-1 px-3 shadow-md ${color === 'red' ? 'bg-memorise-orange-700 text-white hover:bg-memorise-orange-900 hover:text-black' : color === 'green' ? 'bg-green-400 text-white hover:bg-green-700' : 'bg-black text-white hover:bg-slate-600  dark:bg-memorise-gold-100 dark:text-memorise-black'}`;
    } else {
      return `rounded-full flex items-center justify-center py-1 px-3 shadow-md hover:bg-slate-100 dark:hover:bg-memorise-gold-50 ${color === 'red' ? 'bg-memorise-orange-700 text-white  hover:bg-memorise-orange-900' : color === 'green' ? 'bg-green-400 text-white hover:bg-green-700' : 'bg-white text-black  dark:bg-memorise-gold-100 dark:text-memorise-black'}`;
    }
  }, [active, disabled, color]);

  return (
    <button
      onClick={onClick}
      className={classStr}
      style={{
        ...style,
        width: size != null ? `${sizeValue}rem` : 'unset',
        height: size != null ? `${sizeValue}rem` : 'unset',
      }}
    >
      {children}
    </button>
  );
}
