import type { Block, DividerBlockData } from "@/types/blocks";
import { Label } from "@church-space/ui/label";
import { Slider } from "@church-space/ui/slider";
import { useEffect, useState } from "react";
import ColorPicker from "../color-picker";
import { Button } from "@church-space/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { CircleInfo } from "@church-space/ui/icons";

interface DividerFormProps {
  block: Block & { data?: DividerBlockData };
  onUpdate: (block: Block) => void;
  onApplyToAllDividers: () => void;
}

export default function DividerForm({
  block,
  onUpdate,
  onApplyToAllDividers,
}: DividerFormProps) {
  const [localState, setLocalState] = useState<DividerBlockData>({
    color: block.data?.color || "#e2e8f0",
    margin: block.data?.margin || 0,
    thickness: block.data?.thickness || 1,
  });

  useEffect(() => {
    setLocalState({
      color: block.data?.color || "#e2e8f0",
      margin: block.data?.margin || 0,
      thickness: block.data?.thickness || 1,
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

  const handleThicknessChange = (value: number[]) => {
    handleChange("thickness", value[0]);
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
          <div className="col-span-3 my-2 grid grid-cols-3 items-center gap-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="flex items-center gap-1">
                  Thickness <CircleInfo />
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Thickness controls the height of the divider.
              </TooltipContent>
            </Tooltip>
            <Slider
              value={[localState.thickness]}
              max={10}
              className="col-span-2"
              onValueChange={handleThicknessChange}
            />
          </div>
          <div className="col-span-3 my-2 grid grid-cols-3 items-center gap-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="flex items-center gap-1">
                  Margin <CircleInfo />
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Margin controls the amount of space above and below the divider.
              </TooltipContent>
            </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={onApplyToAllDividers}
            >
              Apply style to all dividers
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Apply the current style of this divider to all dividers in the
            email.
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
