import type { Block } from "@/types/blocks";
import { DragOverlay, useDraggable } from "@dnd-kit/core";
import { cn } from "@trivo/ui/cn";
import {
  ArrowRight,
  Button as ButtonIcon,
  CircleUser,
  Divider,
  Download,
  FooterIcon,
  Grid,
  Home,
  Image,
  List,
  Palette,
  Redo,
  TemplatesIcon,
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
import { ChevronRight, Paintbrush } from "lucide-react";

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
  onBlockUpdate: (
    block: Block,
    addToHistory?: boolean,
    isDuplication?: boolean
  ) => void;
  isInset?: boolean;
  onIsInsetChange?: (isInset: boolean) => void;
  emailBgColor?: string;
  onEmailBgColorChange?: (color: string) => void;
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
  isInset = false,
  onIsInsetChange,
  emailBgColor = "#ffffff",
  onEmailBgColorChange,
}: DndBuilderSidebarProps) {
  const [hasMounted, setHasMounted] = React.useState(false);
  const [activeForm, setActiveForm] = React.useState<
    "default" | "block" | "email-style" | "email-footer" | "email-templates"
  >("default");

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Update activeForm when selectedBlock changes
  React.useEffect(() => {
    if (selectedBlock?.id) {
      setActiveForm("block");
    } else {
      setActiveForm("default");
    }
  }, [selectedBlock]);

  const handleBackFromForm = () => {
    setActiveForm("default");
  };

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
        "w-[400px] flex-shrink-0 bg-sidebar rounded-md h-[calc(100vh-5rem)] sticky top-16 p-4 overflow-hidden border shadow-sm",
        className
      )}
    >
      <AnimatePresence mode="sync">
        {activeForm !== "default" ? (
          <motion.div
            key={activeForm}
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
              formType={activeForm === "block" ? "block" : activeForm}
              onBack={handleBackFromForm}
              bgColor={bgColor}
              onBgColorChange={onBgColorChange}
              footerBgColor={footerBgColor}
              footerTextColor={footerTextColor}
              footerFont={footerFont}
              onFooterBgColorChange={onFooterBgColorChange}
              onFooterTextColorChange={onFooterTextColorChange}
              onFooterFontChange={onFooterFontChange}
              isInset={isInset}
              onIsInsetChange={onIsInsetChange}
              emailBgColor={emailBgColor}
              onEmailBgColorChange={onEmailBgColorChange}
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
            <div className="flex flex-col justify-between h-[calc(100vh-7rem)]">
              <div className="flex flex-col">
                <div className="gap-2 grid grid-cols-3">
                  {blockTypes.map((block) => (
                    <DraggableBlock key={block.type} block={block} />
                  ))}
                </div>
                <Separator className="my-6" />
                <div className="flex flex-col gap-4">
                  <div
                    className="flex rounded-md bg-accent pr-2 py-3 justify-between items-center w-full border shadow-sm text-sm pl-3 cursor-pointer hover:bg-accent/80 transition-colors"
                    onClick={() => setActiveForm("email-style")}
                  >
                    <div className="flex items-center gap-2">
                      <Palette />
                      Styles
                    </div>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  <div
                    className="flex rounded-md bg-accent pr-2 py-3 justify-between items-center w-full border shadow-sm text-sm pl-3 cursor-pointer hover:bg-accent/80 transition-colors"
                    onClick={() => setActiveForm("email-footer")}
                  >
                    <div className="flex items-center gap-2">
                      <FooterIcon />
                      Footer
                    </div>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  <div
                    className="flex rounded-md bg-accent pr-2 py-3 justify-between items-center w-full border shadow-sm text-sm pl-3 cursor-pointer hover:bg-accent/80 transition-colors"
                    onClick={() => setActiveForm("email-templates")}
                  >
                    <div className="flex items-center gap-2">
                      <TemplatesIcon />
                      Templates
                    </div>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Separator />
                <Label className="font-bold px-2 text-sm">Editors Online</Label>
                <div className="flex items-center gap-2"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
