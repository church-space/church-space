import type { Block, ListBlockData } from "@/types/blocks";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { AutosizeTextarea } from "@church-space/ui/auto-size-textarea";
import { useEffect, useState } from "react";
import ColorPicker from "../color-picker";

interface ListFormProps {
  block: Block & { data?: ListBlockData };
  onUpdate: (block: Block) => void;
}

export default function ListForm({ block, onUpdate }: ListFormProps) {
  const [localState, setLocalState] = useState<ListBlockData>({
    title: block.data?.title || "",
    subtitle: block.data?.subtitle || "",
    textColor: block.data?.textColor || "#000000",
    bulletColor: block.data?.bulletColor || "#000000",
    bulletType: "number",
    items: block.data?.items || [],
  });

  useEffect(() => {
    setLocalState({
      title: block.data?.title || "",
      subtitle: block.data?.subtitle || "",
      textColor: block.data?.textColor || "#000000",
      bulletColor: block.data?.bulletColor || "#000000",
      bulletType: "number",
      items: block.data?.items || [],
    });
  }, [block.data]);

  const handleChange = (field: string, value: any) => {
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

  const addItem = () => {
    const newItems = [...localState.items, { title: "", description: "" }];
    handleChange("items", newItems);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...localState.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange("items", newItems);
  };

  const removeItem = (index: number) => {
    const newItems = localState.items.filter((_, i) => i !== index);
    handleChange("items", newItems);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 px-2">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Details</Label>
        </div>
        <div className="grid grid-cols-3 items-center gap-x-2 gap-y-4">
          <Label>Title</Label>
          <Input
            className="col-span-2 bg-background"
            value={localState.title}
            placeholder="List Title"
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <Label>Subtitle</Label>
          <AutosizeTextarea
            className="col-span-2"
            value={localState.subtitle}
            placeholder="List Subtitle"
            onChange={(e) => handleChange("subtitle", e.target.value)}
            maxHeight={150}
          />

          <>
            <Label>Bullet Color</Label>
            <ColorPicker
              value={localState.bulletColor}
              onChange={(color) => handleChange("bulletColor", color)}
            />
          </>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <Label className="text-md font-bold">Items</Label>
          <Button size="sm" onClick={addItem}>
            Add Item
          </Button>
        </div>
        {localState.items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-3 items-center gap-x-2 gap-y-2 rounded-md border p-3"
          >
            <Label>Title</Label>
            <Input
              className="col-span-2 bg-background"
              value={item.title}
              placeholder="Item Title"
              onChange={(e) => updateItem(index, "title", e.target.value)}
            />
            <Label>Description</Label>
            <AutosizeTextarea
              className="col-span-2"
              value={item.description}
              placeholder="Item Description"
              onChange={(e) => updateItem(index, "description", e.target.value)}
              maxHeight={150}
            />
            <Button
              variant="ghost"
              onClick={() => removeItem(index)}
              className="col-span-3 hover:bg-destructive hover:text-white"
              size="sm"
            >
              Remove Item
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
