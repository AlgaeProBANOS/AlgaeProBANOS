export type SectionType = 'selection' | 'treeMap';

export function Switch(props) {
  const { value, setValue, firstOption, secondOption, className } = props;

  return (
    <div
      className={`${className} flex cursor-pointer rounded-md w-min overflow-hidden`}
      onClick={() => {
        if (value === firstOption.val) {
          setValue(secondOption.val);
        } else {
          setValue(firstOption.val);
        }
      }}
    >
      <div
        className="px-1 py-[1px] transition-colors duration-500"
        style={{
          backgroundColor: value === firstOption.val ? 'black' : 'white',
          color: value === firstOption.val ? 'white' : 'black',
        }}
      >
        Selection
      </div>
      <div
        className="px-1 py-[1px] transition-colors duration-500"
        style={{
          backgroundColor: value === secondOption.val ? 'black' : 'white',
          color: value === secondOption.val ? 'white' : 'black',
        }}
      >
        TreeMap
      </div>
    </div>
  );
}
