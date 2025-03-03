import { Label } from "@church-space/ui/label";
import { Slider } from "@church-space/ui/slider";
import type { Block, DividerBlockData } from "@/types/blocks";
import { useEffect, useState, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import ColorPicker from "../color-picker";

interface DividerFormProps {
  block: Block & { data?: DividerBlockData };
  onUpdate: (block: Block, addToHistory?: boolean) => void;
}

export default function DividerForm({ block, onUpdate }: DividerFormProps) {
  const [localState, setLocalState] = useState<DividerBlockData>({
    color: block.data?.color || "#e2e8f0",
    margin: block.data?.margin || 0,
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
      // Add to history
      onUpdate(
        {
          ...block,
          data: stateRef.current,
        },
        true,
      );
    }, 500),
    [block, onUpdate],
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
      false,
    );

    // Debounce the history update
    debouncedHistoryUpdate();
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
            min={1}
            step={1}
            className="col-span-2"
            onValueChange={handleMarginChange}
          />
        </div>
      </div>
    </div>
  );
}
