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
import { getDbUser } from "@church-space/supabase/cached-queries/platform";
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";

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
      | "email-templates",
  ) => void;
  emailId?: number;
  footerData?: any;
  onFooterChange?: (data: any) => void;
  onlineUsers?: Record<string, any>;
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
        "flex cursor-grab flex-col items-center gap-1 rounded-md border bg-accent p-3 shadow-sm",
        className,
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
  onlineUsers = {},
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
            "sticky top-16 h-[calc(100vh-5rem)] flex-shrink-0 overflow-hidden rounded-md border bg-sidebar p-4 shadow-sm md:w-[320px] lg:w-[400px]",
            className,
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
                className="absolute inset-0 bg-sidebar p-4"
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
                <div className="flex h-[calc(100vh-7rem)] flex-col justify-between">
                  <div className="flex flex-col">
                    <div className="grid grid-cols-3 gap-2">
                      {blockTypes.map((block) => (
                        <DraggableBlock key={block.type} block={block} />
                      ))}
                    </div>
                    <Separator className="my-6" />
                    <div className="flex flex-col gap-4">
                      <div
                        className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                        onClick={() => setActiveForm("email-style")}
                      >
                        <div className="flex items-center gap-2">
                          <Palette />
                          Styles
                        </div>
                        <ChevronRight />
                      </div>
                      <div
                        className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                        onClick={() => setActiveForm("email-footer")}
                      >
                        <div className="flex items-center gap-2">
                          <FooterIcon />
                          Footer
                        </div>
                        <ChevronRight />
                      </div>
                      <div
                        className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
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
                    <Separator />
                    <div className="px-2 text-sm font-bold">Editors Online</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {Object.entries(onlineUsers).map(([key, presences]) =>
                        (presences as any[]).map((presence, index) => (
                          <div key={`${key}-${index}`} className="relative">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar>
                                  <AvatarImage src={presence.image_url} />
                                  <AvatarFallback>
                                    {presence.first_name?.charAt(0)}
                                    {presence.last_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent align="start">
                                Thomas Harmond
                              </TooltipContent>
                            </Tooltip>
                            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[3px] border-sidebar bg-green-500"></div>
                          </div>
                        )),
                      )}
                      {Object.keys(onlineUsers).length === 0 && (
                        <div className="text-xs text-muted-foreground">
                          No other editors online
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed bottom-4 left-20 right-20 z-50 flex items-center justify-between rounded-full bg-background p-2 px-3 text-center shadow-lg md:hidden">
        <Button
          variant="ghost"
          className="aspect-square flex-shrink-0 rounded-full p-0"
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
              <div className="grid grid-cols-3 gap-2 p-4">
                {blockTypes.map((block) => (
                  <div
                    key={block.type}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border bg-accent p-5 shadow-sm",
                      className,
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
          className="aspect-square flex-shrink-0 rounded-full p-0"
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
            className="h-[calc(100vh-10rem)] overflow-y-auto pt-3 md:hidden"
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
