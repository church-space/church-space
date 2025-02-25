import { Input } from "@trivo/ui/input";
import React, { useState } from "react";

export default function ColorPicker({
  onChange,
  value,
}: {
  onChange: (color: string) => void;
  value: string;
}) {
  const [color, setColor] = useState(value);

  return (
    <div className="col-span-2 flex items-center ">
      <Input
        type="color"
        className="w-[42px] h-9 border-r-0 rounded-r-none py-0.5 px-1"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          onChange(e.target.value);
        }}
      />
      <div className="relative">
        <Input
          type="text"
          className="w-full rounded-l-none ps-6"
          placeholder="ffffff"
          maxLength={6}
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            onChange(e.target.value);
          }}
        />
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
          #
        </span>
      </div>
    </div>
  );
}
