import { useState } from 'react';

const colors = [{ name: 'green' }, { name: 'red' }, { name: 'brown' }];

function MyCheckbox(props) {
  const [isChecked, setChecked] = useState();
  const { onChange, color = 'green', key } = props;

  console.log(key, color);

  const colorVariants = {
    green: 'h-5 w-5 accent-green-500 rounded border-gray-300 focus:ring-green-500',
    red: 'accent-[#e31a1c]',
    brown: 'accent-[#b15928]',
  };

  //   return <input type="checkbox" checked={isChecked} onChange={onChange} className="bg-green-500" />;
  return (
    <input
      type="checkbox"
      key={key}
      checked={isChecked}
      onChange={onChange}
      className={`${colorVariants[color]}`}
    />
  );
}

export function MyCheckboxList() {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  return (
    <div className="space-y-4">
      {colors.map((color, i) => {
        const isChecked = selectedColors.includes(color.name);
        return (
          <MyCheckbox
            key={`checkbox-${i}`}
            color={color.name}
            onChange={() => {
              console.log('GO!');
            }}
          />
        );
      })}
    </div>
  );
}
