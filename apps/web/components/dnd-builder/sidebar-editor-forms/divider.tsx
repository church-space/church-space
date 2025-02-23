import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import { Slider } from "@trivo/ui/slider";
import type { Block, DividerBlockData } from "@/types/blocks";
import { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";

interface DividerFormProps {
  block: Block & { data?: DividerBlockData };
  onUpdate: (block: Block) => void;
}

export default function DividerForm({ block, onUpdate }: DividerFormProps) {
  const [localState, setLocalState] = useState<DividerBlockData>({
    color: block.data?.color || "#e2e8f0",
    margin: block.data?.margin || 8,
  });

  useEffect(() => {
    setLocalState({
      color: block.data?.color || "#e2e8f0",
      margin: block.data?.margin || 8,
    });
  }, [block.data]);

  // Debounced update function for margin changes
  const debouncedUpdate = useCallback(
    debounce((newState: typeof localState) => {
      onUpdate({
        ...block,
        data: newState,
      });
    }, 100),
    [block, onUpdate]
  );

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newState = {
      ...localState,
      color: e.target.value,
    };
    setLocalState(newState);
    onUpdate({
      ...block,
      data: newState,
    });
  };

  const handleMarginChange = (value: number[]) => {
    const newState = {
      ...localState,
      margin: value[0],
    };
    setLocalState(newState);
    debouncedUpdate(newState);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center ">
          <Label>Color</Label>
          <Input
            className="col-span-2"
            type="color"
            value={localState.color}
            onChange={handleColorChange}
          />
          <Label>Margin</Label>
          <Slider
            value={[localState.margin]}
            max={100}
            min={0}
            step={1}
            className="col-span-2"
            onValueChange={handleMarginChange}
          />
        </div>
      </div>
    </div>
  );
}
