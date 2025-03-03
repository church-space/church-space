import type { Block } from "@/types/blocks";
import { cn } from "@church-space/ui/cn";
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
  TemplatesIcon,
  Typography,
  Video,
  CirclePlus,
  ChevronRight,
} from "@church-space/ui/icons";
import { X } from "lucide-react";
import { Separator } from "@church-space/ui/separator";
import { DragOverlay, useDraggable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import DndBuilderSidebarForms from "./sidebar-forms";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@church-space/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@church-space/ui/button";

interface DndBuilderSidebarProps {
  className?: string;
  type: "email" | "form";
  onBgColorChange?: (color: string) => void;
  bgColor?: string;
  onFooterBgColorChange?: (color: string) => void;
  footerBgColor?: string;
  onFooterTextColorChange?: (color: string) => void;
  footerTextColor?: string;
  defaultTextColor?: string;
  onDefaultTextColorChange?: (color: string) => void;
  defaultFont?: string;
  onDefaultFontChange?: (font: string) => void;
  selectedBlock?: Block | null;
  setSelectedBlockId: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onBlockUpdate: (block: Block) => void;
  isInset?: boolean;
  onIsInsetChange?: (isInset: boolean) => void;
  isRounded?: boolean;
  onIsRoundedChange?: (isRounded: boolean) => void;
  linkColor?: string;
  onLinkColorChange?: (color: string) => void;
  emailBgColor?: string;
  onEmailBgColorChange?: (color: string) => void;
  activeForm:
    | "default"
    | "block"
    | "email-style"
    | "email-footer"
    | "email-templates";
  setActiveForm: (
    form:
      | "default"
      | "block"
      | "email-style"
      | "email-footer"
      | "email-templates"
  ) => void;
  emailId?: number;
  footerData?: any;
  onFooterChange?: (data: any) => void;
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
  defaultTextColor,
  onDefaultTextColorChange,
  defaultFont,
  onDefaultFontChange,
  selectedBlock,
  setSelectedBlockId,
  onDeleteBlock,
  onBlockUpdate,
  isInset = false,
  onIsInsetChange,
  isRounded = false,
  onIsRoundedChange,
  emailBgColor = "#ffffff",
  onEmailBgColorChange,
  activeForm,
  setActiveForm,
  emailId,
  footerData,
  linkColor,
  onLinkColorChange,
  onFooterChange,
}: DndBuilderSidebarProps) {
  const [hasMounted, setHasMounted] = React.useState(false);

  const isMobile = useIsMobile();

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleBackFromForm = () => {
    setActiveForm("default");
    setSelectedBlockId(null);
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
    <>
      <div className="hidden md:block">
        <div
          className={cn(
            "md:w-[320px] lg:w-[400px] flex-shrink-0 bg-sidebar rounded-md h-[calc(100vh-5rem)] sticky top-16 p-4 overflow-hidden border shadow-sm",
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
                  isInset={isInset}
                  onIsInsetChange={onIsInsetChange}
                  emailBgColor={emailBgColor}
                  onEmailBgColorChange={onEmailBgColorChange}
                  defaultTextColor={defaultTextColor}
                  onDefaultTextColorChange={onDefaultTextColorChange}
                  defaultFont={defaultFont}
                  onDefaultFontChange={onDefaultFontChange}
                  emailId={emailId}
                  footerData={footerData}
                  isRounded={isRounded}
                  onIsRoundedChange={onIsRoundedChange}
                  linkColor={linkColor}
                  onLinkColorChange={onLinkColorChange}
                  onFooterChange={onFooterChange}
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
                        <ChevronRight />
                      </div>
                      <div
                        className="flex rounded-md bg-accent pr-2 py-3 justify-between items-center w-full border shadow-sm text-sm pl-3 cursor-pointer hover:bg-accent/80 transition-colors"
                        onClick={() => setActiveForm("email-footer")}
                      >
                        <div className="flex items-center gap-2">
                          <FooterIcon />
                          Footer
                        </div>
                        <ChevronRight />
                      </div>
                      <div
                        className="flex rounded-md bg-accent pr-2 py-3 justify-between items-center w-full border shadow-sm text-sm pl-3 cursor-pointer hover:bg-accent/80 transition-colors"
                        onClick={() => setActiveForm("email-templates")}
                      >
                        <div className="flex items-center gap-2">
                          <TemplatesIcon />
                          Templates
                        </div>
                        <ChevronRight />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* <Separator />
                    <Label className="font-bold px-2 text-sm">
                      Editors Online
                    </Label>
                    <div className="flex items-center gap-2"></div> */}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed bottom-4 left-20 right-20 p-2 px-3 bg-background flex  items-center justify-between rounded-full shadow-lg z-50 text-center md:hidden">
        <Button
          variant="ghost"
          className="p-0 flex-shrink-0 aspect-square rounded-full"
          onClick={() => setActiveForm("email-style")}
        >
          <Palette height="22px" width="22px" />
        </Button>
        <div className="">
          <Popover>
            <PopoverTrigger asChild>
              <CirclePlus height="40px" width="40px" />
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-3rem)] p-0"
              sideOffset={16}
            >
              <div className="gap-2 grid grid-cols-3 p-4">
                {blockTypes.map((block) => (
                  <div
                    key={block.type}
                    className={cn(
                      "flex flex-col items-center gap-1 bg-accent p-5 rounded-md border shadow-sm",
                      className
                    )}
                  >
                    <block.icon />
                    <span>{block.label}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant="ghost"
          className="p-0 flex-shrink-0 aspect-square rounded-full"
          onClick={() => setActiveForm("email-footer")}
        >
          <FooterIcon height="40px" width="40px" />
        </Button>
      </div>
      <div className="md:hidden">
        <Sheet
          open={
            isMobile &&
            // Don't open for text blocks
            ((selectedBlock ? selectedBlock.type !== "text" : false) ||
              // Open for special forms
              activeForm === "email-style" ||
              activeForm === "email-footer" ||
              activeForm === "email-templates")
          }
          onOpenChange={(open) => {
            if (!open) {
              setSelectedBlockId(null);
              if (
                activeForm === "email-style" ||
                activeForm === "email-footer" ||
                activeForm === "email-templates"
              ) {
                setActiveForm("default");
              }
            }
            if (
              open &&
              activeForm !== "email-style" &&
              activeForm !== "email-footer" &&
              activeForm !== "email-templates"
            ) {
              setActiveForm("default");
            }
          }}
          modal={false}
        >
          <SheetContent
            className="md:hidden pt-3 h-[calc(100vh-10rem)] overflow-y-auto"
            side="bottom"
          >
            <SheetHeader>
              <SheetTitle>Edit </SheetTitle>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-0 rounded-sm opacity-70 hover:opacity-100"
                  onClick={() => {
                    // Explicitly reset form state when closing
                    setSelectedBlockId(null);
                    if (
                      activeForm === "email-style" ||
                      activeForm === "email-footer" ||
                      activeForm === "email-templates"
                    ) {
                      setActiveForm("default");
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetClose>
            </SheetHeader>
            {activeForm !== "default" && (
              <DndBuilderSidebarForms
                selectedBlock={selectedBlock as Block}
                setSelectedBlockId={setSelectedBlockId}
                onDeleteBlock={onDeleteBlock}
                onBlockUpdate={onBlockUpdate}
                formType={activeForm === "block" ? "block" : activeForm}
                onBack={handleBackFromForm}
                bgColor={bgColor}
                onBgColorChange={onBgColorChange}
                isInset={isInset}
                onIsInsetChange={onIsInsetChange}
                emailBgColor={emailBgColor}
                onEmailBgColorChange={onEmailBgColorChange}
                defaultTextColor={defaultTextColor}
                onDefaultTextColorChange={onDefaultTextColorChange}
                defaultFont={defaultFont}
                onDefaultFontChange={onDefaultFontChange}
                emailId={emailId}
                footerData={footerData}
                onFooterChange={onFooterChange}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
