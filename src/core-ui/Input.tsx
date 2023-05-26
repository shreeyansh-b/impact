import React, { useState } from "react";

interface Props {
  value: number;
  onBlur: (val: number) => void;
}

const Input = ({ value, onBlur }: Props) => {
  const [modifiedValue, setModifiedValue] = useState(value);
  return (
    <input
      className="w-full h-full p-2 text-center bg-transparent border-2 border-gray-300 rounded dark:border-gray-700"
      type="number"
      value={modifiedValue}
      onChange={(e) => {
        const value = e.target.value;
        if (value.trim().length > 0) {
          setModifiedValue(Number(value));
        }
      }}
      onBlur={() => onBlur(modifiedValue)}
    />
  );
};

export { Input };
