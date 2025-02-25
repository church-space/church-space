import type { Block } from "@/types/blocks";
import { DragOverlay, useDraggable } from "@dnd-kit/core";
import { cn } from "@trivo/ui/cn";
import {
  ArrowRight,
  Button as ButtonIcon,
  CircleUser,
  Divider,
  Download,
  Grid,
  Home,
  Image,
  List,
  Typography,
  Video,
} from "@trivo/ui/icons";
import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";
import { Separator } from "@trivo/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import DndBuilderSidebarForms from "./sidebar-forms";

interface DndBuilderSidebarProps {
  className?: string;
  type: "email" | "form";
  onBgColorChange?: (color: string) => void;
  bgColor?: string;
  onFooterBgColorChange?: (color: string) => void;
  footerBgColor?: string;
  onFooterTextColorChange?: (color: string) => void;
  footerTextColor?: string;
  onFooterFontChange?: (font: string) => void;
  footerFont?: string;
  selectedBlock?: Block | null;
  setSelectedBlockId: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onBlockUpdate: (block: Block) => void;
}

function DraggableBlock({
  block,
}: {
  block: { type: string; label: string; icon: any };
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `sidebar-${block.type}`,
      data: {
        type: block.type,
        fromSidebar: true,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : undefined,
      }
    : undefined;

  const BlockContent = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "flex flex-col items-center gap-1 bg-accent p-3 rounded-md cursor-grab border shadow-sm",
        className
      )}
    >
      <block.icon />
      <span>{block.label}</span>
    </div>
  );

  return (
    <>
      <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
        <BlockContent />
      </div>
      {isDragging && (
        <DragOverlay>
          <BlockContent className="z-20" />
        </DragOverlay>
      )}
    </>
  );
}

export const allBlockTypes = [
  { label: "Text", type: "text", icon: Typography },
  { label: "Image", type: "image", icon: Image },
  { label: "Button", type: "button", icon: ButtonIcon },
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

export default function DndBuilderSidebar({
  className,
  type,
  onBgColorChange,
  bgColor,
  onFooterBgColorChange,
  footerBgColor = "#ffffff",
  onFooterTextColorChange,
  footerTextColor = "#000000",
  onFooterFontChange,
  footerFont = "Inter",
  selectedBlock,
  setSelectedBlockId,
  onDeleteBlock,
  onBlockUpdate,
}: DndBuilderSidebarProps) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

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
              selectedBlock={selectedBlock as Block}
              setSelectedBlockId={setSelectedBlockId}
              onDeleteBlock={onDeleteBlock}
              onBlockUpdate={onBlockUpdate}
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
                <Label className="font-medium">Footer BG Color</Label>
                <Input
                  className="col-span-2"
                  type="color"
                  value={footerBgColor}
                  onChange={(e) => onFooterBgColorChange?.(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="font-medium">Footer Text Color</Label>
                <Input
                  className="col-span-2"
                  type="color"
                  value={footerTextColor}
                  onChange={(e) => onFooterTextColorChange?.(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="font-medium">Footer Font</Label>
                <Select
                  value={footerFont}
                  onValueChange={(value) => onFooterFontChange?.(value)}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">
                      Times New Roman
                    </SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
