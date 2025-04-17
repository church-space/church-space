import type { Block, ListBlockData } from "@/types/blocks";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { AutosizeTextarea } from "@church-space/ui/auto-size-textarea";
import { useEffect, useState } from "react";
import ColorPicker from "../color-picker";
import { cn } from "@church-space/ui/cn";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";

interface ListFormProps {
  block: Block & { data?: ListBlockData };
  onUpdate: (block: Block) => void;
}

// Override accordion trigger styles for this component
const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionTrigger>
>((props, ref) => (
  <div className="flex w-full flex-1">
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full flex-1 items-center justify-between px-3 py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
        props.className,
      )}
      {...props}
    >
      <span className="truncate pr-2 text-sm">{props.children}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 transition-transform duration-200"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  </div>
));
CustomAccordionTrigger.displayName = "CustomAccordionTrigger";

// Create a sortable accordion item component
function SortableListItem({
  item,
  index,
  openItem,
  setOpenItem,
  updateItem,
  removeItem,
}: {
  item: any;
  index: number;
  openItem: string | undefined;
  setOpenItem: (value: string | undefined) => void;
  updateItem: (index: number, field: string, value: string) => void;
  removeItem: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        zIndex: isDragging ? 10 : 1,
      }
    : undefined;

  // Generate a stable ID from item properties
  const itemId = `item-${index}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 w-full rounded-lg border",
        isDragging ? "border-dashed bg-accent opacity-50" : "",
      )}
    >
      <div className="flex w-full items-center p-0.5 pr-1">
        <div
          className="flex cursor-grab touch-none items-center justify-center px-3 py-4"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={openItem === itemId ? itemId : undefined}
          onValueChange={(value) => setOpenItem(value)}
        >
          <AccordionItem value={itemId} className="border-0">
            <div
              onClick={() =>
                setOpenItem(openItem === itemId ? undefined : itemId)
              }
            >
              <CustomAccordionTrigger>
                {item.title ? item.title : `Item ${index + 1}`}
              </CustomAccordionTrigger>
            </div>
            <AccordionContent>
              <div className="flex w-full flex-col gap-y-2 py-1">
                <Label>Title</Label>
                <Input
                  className="col-span-2 mb-2 bg-background"
                  value={item.title}
                  placeholder="Item Title"
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  maxLength={150}
                />
                <Label>Description</Label>
                <AutosizeTextarea
                  className="col-span-2 mb-2"
                  value={item.description}
                  placeholder="Item Description"
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  maxHeight={1000}
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
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

  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  // Set up DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString());
      const newIndex = parseInt(over.id.toString());

      // Update the order of the items
      const reorderedItems = [...localState.items];
      const [movedItem] = reorderedItems.splice(oldIndex, 1);
      reorderedItems.splice(newIndex, 0, movedItem);

      // Update the order property for each item
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      // Update local state and parent
      handleChange("items", updatedItems);
    }
  };

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
    const newItems = [
      ...localState.items,
      {
        title: "",
        description: "",
        order: localState.items.length,
      },
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
            className="col-span-2 bg-background"
            value={localState.title}
            placeholder="List Title"
            onChange={(e) => handleChange("title", e.target.value)}
            maxLength={150}
          />
          <Label>Subtitle</Label>
          <AutosizeTextarea
            className="col-span-2"
            value={localState.subtitle}
            placeholder="List Subtitle"
            onChange={(e) => handleChange("subtitle", e.target.value)}
            maxHeight={1000}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localState.items.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="w-full px-2">
              {localState.items.map((item, index) => (
                <SortableListItem
                  key={index}
                  item={item}
                  index={index}
                  openItem={openItem}
                  setOpenItem={setOpenItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
