import type { Block, ListBlockData } from "@/types/blocks";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Textarea } from "@church-space/ui/textarea";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
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
    bulletType: block.data?.bulletType || "number",
    items: block.data?.items || [],
  });

  useEffect(() => {
    setLocalState({
      title: block.data?.title || "",
      subtitle: block.data?.subtitle || "",
      textColor: block.data?.textColor || "#000000",
      bulletColor: block.data?.bulletColor || "#000000",
      bulletType: block.data?.bulletType || "number",
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
    const newItems = [
      ...localState.items,
      { title: "New Item", description: "Description" },
    ];
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
            className="col-span-2"
            value={localState.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <Label>Subtitle</Label>
          <Textarea
            className="col-span-2"
            value={localState.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
          />

          <Label>Bullet Type</Label>
          <Select
            value={localState.bulletType}
            onValueChange={(value) => handleChange("bulletType", value)}
          >
            <SelectTrigger className="col-span-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="bullet">Bullet</SelectItem>
            </SelectContent>
          </Select>
          {localState.bulletType === "number" && (
            <>
              <Label>Bullet Color</Label>
              <ColorPicker
                value={localState.bulletColor}
                onChange={(color) => handleChange("bulletColor", color)}
              />
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <Label className="text-md font-bold">Items</Label>
          <Button variant="outline" onClick={addItem}>
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
              className="col-span-2"
              value={item.title}
              onChange={(e) => updateItem(index, "title", e.target.value)}
            />
            <Label>Description</Label>
            <Textarea
              className="col-span-2"
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => removeItem(index)}
              className="col-span-3 mt-2"
            >
              Remove Item
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
