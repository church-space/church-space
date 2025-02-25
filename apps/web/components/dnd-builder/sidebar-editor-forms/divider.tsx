import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import { Slider } from "@trivo/ui/slider";
import type { Block, DividerBlockData } from "@/types/blocks";
import { useEffect, useState, useCallback, useRef } from "react";
import debounce from "lodash/debounce";

interface DividerFormProps {
  block: Block & { data?: DividerBlockData };
  onUpdate: (block: Block, addToHistory?: boolean) => void;
}

export default function DividerForm({ block, onUpdate }: DividerFormProps) {
  const [localState, setLocalState] = useState<DividerBlockData>({
    color: block.data?.color || "#e2e8f0",
    margin: block.data?.margin || 8,
  });

  // Create a ref to store the latest state for the debounced function
  const stateRef = useRef(localState);

  // Update the ref whenever localState changes
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);

  useEffect(() => {
    setLocalState({
      color: block.data?.color || "#e2e8f0",
      margin: block.data?.margin || 8,
    });
  }, [block.data]);

  // Create a debounced function that only updates the history
  const debouncedHistoryUpdate = useCallback(
    debounce(() => {
      console.log("Divider form updating block in history:", {
        blockId: block.id,
        blockType: block.type,
        newState: stateRef.current,
      });
      // Add to history
      onUpdate(
        {
          ...block,
          data: stateRef.current,
        },
        true
      );
    }, 500),
    [block, onUpdate]
  );

  const handleChange = (field: keyof DividerBlockData, value: any) => {
    // Immediately update the local state for responsive UI
    const newState = {
      ...localState,
      [field]: value,
    };
    setLocalState(newState);

    // Update the UI immediately without adding to history
    onUpdate(
      {
        ...block,
        data: newState,
      },
      false
    );

    // Debounce the history update
    debouncedHistoryUpdate();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange("color", e.target.value);
  };

  const handleMarginChange = (value: number[]) => {
    handleChange("margin", value[0]);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedHistoryUpdate.cancel();
    };
  }, [debouncedHistoryUpdate]);

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
