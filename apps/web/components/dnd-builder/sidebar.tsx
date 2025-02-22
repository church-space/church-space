import { cn } from "@trivo/ui/cn";
import {
  ArrowRight,
  Button,
  CircleUser,
  Divider,
  Download,
  Grid,
  Home,
  Image,
  Typography,
  Video,
  Section,
  List,
} from "@trivo/ui/icons";
import { useDraggable } from "@dnd-kit/core";
import { Label } from "@trivo/ui/label";
import { Input } from "@trivo/ui/input";
import { Separator } from "@trivo/ui/separator";
import { Select, SelectTrigger, SelectValue } from "@trivo/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { BlockType } from "@/types/blocks";
import DndBuilderSidebarForms from "./sidebar-forms";
import React from "react";

interface DndBuilderSidebarProps {
  className?: string;
  type: "email" | "form";
  onBgColorChange?: (color: string) => void;
  bgColor?: string;
  selectedBlock?: {
    id: string | null;
    type: BlockType | null;
  } | null;
  setSelectedBlockId: (id: string | null) => void;
}

function DraggableBlock({
  block,
}: {
  block: { type: string; label: string; icon: any };
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-${block.type}`,
    data: { type: block.type, fromSidebar: true },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex flex-col items-center gap-1 bg-accent p-3 rounded-md cursor-grab border shadow-sm"
    >
      <block.icon />
      <span>{block.label}</span>
    </div>
  );
}

export default function DndBuilderSidebar({
  className,
  type,
  onBgColorChange,
  bgColor,
  selectedBlock,
  setSelectedBlockId,
}: DndBuilderSidebarProps) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const allBlockTypes = [
    { label: "Text", type: "text", icon: Typography },
    { label: "Image", type: "image", icon: Image },
    { label: "Button", type: "button", icon: Button },
    { label: "File", type: "file-download", icon: Download },
    { label: "Divider", type: "divider", icon: Divider },
    { label: "Video", type: "video", icon: Video },
    { label: "Cards", type: "cards", icon: Grid },
    { label: "List", type: "list", icon: List },
    { label: "Author", type: "author", icon: CircleUser },
    { label: "Input", type: "input", icon: Home },
    { label: "Select", type: "select", icon: ArrowRight },
    { label: "Textarea", type: "textarea", icon: Home },
    { label: "Radio Buttons", type: "radio-buttons", icon: ArrowRight },
    { label: "Checkboxes", type: "checkboxes", icon: Home },
    { label: "File Upload", type: "file-upload", icon: ArrowRight },
    { label: "Rating", type: "rating", icon: Home },
    { label: "Address", type: "address", icon: ArrowRight },
  ];

  const emailBlockTypes = [
    "section",
    "text",
    "image",
    "button",
    "file-download",
    "divider",
    "video",
    "cards",
    "author",
    "list",
  ];

  const blockTypes =
    type === "email"
      ? allBlockTypes.filter((block) => emailBlockTypes.includes(block.type))
      : allBlockTypes;

  return (
    <div
      className={cn(
        "w-[400px] flex-shrink-0 bg-sidebar rounded-md h-[calc(100vh-5rem)] sticky top-16 p-4 overflow-hidden",
        className
      )}
    >
      <AnimatePresence mode="sync">
        {selectedBlock?.id ? (
          <motion.div
            key="selected-block"
            initial={{ x: hasMounted ? 400 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
            className="absolute inset-0 p-4 bg-sidebar"
          >
            <DndBuilderSidebarForms
              selectedBlock={selectedBlock as { id: string; type: BlockType }}
              setSelectedBlockId={setSelectedBlockId}
            />
          </motion.div>
        ) : (
          <motion.div
            key="default-content"
            initial={{ x: hasMounted ? -400 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
          >
            <div className="gap-2 grid grid-cols-3">
              {blockTypes.map((block) => (
                <DraggableBlock key={block.type} block={block} />
              ))}
            </div>
            <Separator className="my-6" />
            <Label className="font-bold px-2 text-lg">Style</Label>
            <div className="flex flex-col gap-4 px-2 mt-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="font-medium">BG Color</Label>
                <Input
                  className="col-span-2"
                  type="color"
                  onChange={(e) => onBgColorChange?.(e.target.value)}
                  value={bgColor}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="font-medium">Default Text Color</Label>
                <Input className="col-span-2" type="color" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="font-medium">Default Font</Label>
                <Select>
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="font-medium">Footer BG Color</Label>
                <Input className="col-span-2" type="color" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="font-medium">Footer Text Color</Label>
                <Input className="col-span-2" type="color" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="font-medium">Footer Font</Label>
                <Select>
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
