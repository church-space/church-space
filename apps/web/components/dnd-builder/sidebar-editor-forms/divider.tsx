import type { Block, DividerBlockData } from "@/types/blocks";
import { Label } from "@church-space/ui/label";
import { Slider } from "@church-space/ui/slider";
import { useEffect, useState } from "react";
import ColorPicker from "../color-picker";

interface DividerFormProps {
  block: Block & { data?: DividerBlockData };
  onUpdate: (block: Block) => void;
}

export default function DividerForm({ block, onUpdate }: DividerFormProps) {
  const [localState, setLocalState] = useState<DividerBlockData>({
    color: block.data?.color || "#e2e8f0",
    margin: block.data?.margin || 0,
  });

  useEffect(() => {
    setLocalState({
      color: block.data?.color || "#e2e8f0",
      margin: block.data?.margin || 0,
    });
  }, [block.data]);

  const handleChange = (field: keyof DividerBlockData, value: any) => {
    // Immediately update the local state for responsive UI
    const newState = {
      ...localState,
      [field]: value,
    };
    setLocalState(newState);

    // Update the UI
    onUpdate({
      ...block,
      data: newState,
    });
  };

  const handleMarginChange = (value: number[]) => {
    handleChange("margin", value[0]);
  };

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Details</Label>
        </div>
        <div className="grid grid-cols-3 items-center gap-x-2 gap-y-4">
          <Label>Color</Label>
          <ColorPicker
            value={localState.color}
            onChange={(color) => handleChange("color", color)}
          />
          <Label>Margin</Label>
          <Slider
            value={[localState.margin]}
            max={100}
            min={5}
            step={1}
            className="col-span-2"
            onValueChange={handleMarginChange}
          />
        </div>
      </div>
    </div>
  );
}
