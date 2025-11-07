export type SectionType = 'selection' | 'treeMap';

interface Option {
  value: string;
  title: string;
}

interface SwitchProps {
  value: any;
  setValue: (v) => void;
  firstOption: Option;
  secondOption: Option;
  className?: string;
  disabled?: boolean;
}

export function Switch(props: SwitchProps) {
  const { value, setValue, firstOption, secondOption, className, disabled = false } = props;

  return (
    <div
      className={`${className} flex cursor-pointer rounded-md overflow-hidden`}
      onClick={() => {
        if (!disabled) {
          if (value === firstOption.value) {
            setValue(secondOption.value);
          } else {
            setValue(firstOption.value);
          }
        }
      }}
    >
      <div
        aria-selected={value === firstOption.value}
        className={`px-1 py-[1px] transition-colors duration-500 bg-white select-none ${disabled ? 'bg-slate-100 text-gray-600' : 'aria-selected:bg-black aria-selected:text-white hover:bg-gray-400 hover:text-white'}`}
      >
        {firstOption.title}
      </div>
      <div
        aria-selected={value === secondOption.value}
        className={`px-1 py-[1px] transition-colors duration-500 bg-white select-none ${disabled ? 'bg-slate-100 text-gray-600' : 'aria-selected:bg-black aria-selected:text-white hover:bg-gray-400 hover:text-white'}`}
        // className="px-1 py-[1px] transition-colors duration-500 bg-white aria-selected:bg-black aria-selected:text-white hover:bg-gray-400 hover:text-white select-none"
      >
        {secondOption.title}
      </div>
    </div>
  );
}
