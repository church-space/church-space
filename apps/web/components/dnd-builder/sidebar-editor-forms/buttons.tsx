import type { Block, ButtonBlockData } from "@/types/blocks";
import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";

interface ButtonFormProps {
  block: Block & { data?: ButtonBlockData };
  onUpdate: (block: Block) => void;
}

export default function ButtonForm({ block, onUpdate }: ButtonFormProps) {
  const [localState, setLocalState] = useState<ButtonBlockData>({
    text: block.data?.text || "Button",
    link: block.data?.link || "",
    color: block.data?.color || "#000000",
    textColor: block.data?.textColor || "#FFFFFF",
    style: block.data?.style || "filled",
    size: block.data?.size || "fit",
  });

  useEffect(() => {
    setLocalState({
      text: block.data?.text || "Button",
      link: block.data?.link || "",
      color: block.data?.color || "#000000",
      textColor: block.data?.textColor || "#FFFFFF",
      style: block.data?.style || "filled",
      size: block.data?.size || "fit",
    });
  }, [block.data]);

  // Debounced update function for text fields
  const debouncedUpdate = useCallback(
    debounce((newState: ButtonBlockData) => {
      onUpdate({
        ...block,
        data: newState,
      });
    }, 150),
    [block, onUpdate]
  );

  const handleChange = (field: string, value: string) => {
    const newState = {
      ...localState,
      [field]: value,
    };
    setLocalState(newState);

    // Use debounced update for text and link fields
    if (field === "text" || field === "link") {
      debouncedUpdate(newState);
    } else {
      // Immediate update for other fields
      onUpdate({
        ...block,
        data: newState,
      });
    }
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
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>Text</Label>
          <Input
            className="col-span-2"
            placeholder="Button text"
            value={localState.text}
            onChange={(e) => handleChange("text", e.target.value)}
          />
          <Label>Link</Label>
          <Input
            className="col-span-2"
            placeholder="https://..."
            value={localState.link}
            onChange={(e) => handleChange("link", e.target.value)}
          />
          <Label>Background</Label>
          <Input
            className="col-span-2"
            type="color"
            value={localState.color}
            onChange={(e) => handleChange("color", e.target.value)}
          />

          {localState.style !== "outline" && (
            <>
              <Label>Text Color</Label>
              <Input
                type="color"
                value={localState.textColor}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="col-span-2"
              />
            </>
          )}
          <Label>Style</Label>
          <Select
            value={localState.style}
            onValueChange={(value) => handleChange("style", value)}
          >
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
          <Label>Size</Label>
          <Select
            value={localState.size}
            onValueChange={(value) => handleChange("size", value)}
          >
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit Content</SelectItem>
              <SelectItem value="full">Full Width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
