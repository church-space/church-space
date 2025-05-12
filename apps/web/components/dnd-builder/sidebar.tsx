import { useIsMobile } from "@/hooks/use-mobile";
import type { Block } from "@/types/blocks";
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import {
  ArrowRight,
  Button as ButtonIcon,
  ChevronRight,
  CirclePlus,
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
  Quiz as QuizIcon,
  Audio as AudioIcon,
} from "@church-space/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import { Separator } from "@church-space/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@church-space/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { DragOverlay, useDraggable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";
import DndBuilderSidebarForms from "./sidebar-forms";
import TemplateForm from "./sidebar-editor-forms/template-form";

interface DndBuilderSidebarProps {
  className?: string;
  type: "email" | "form" | "content";
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
  cornerRadius?: number;
  onCornerRadiusChange?: (cornerRadius: number) => void;
  linkColor?: string;
  onLinkColorChange?: (color: string) => void;
  accentTextColor?: string;
  onAccentTextColorChange?: (color: string) => void;
  emailBgColor?: string;
  onEmailBgColorChange?: (color: string) => void;
  blockSpacing?: number;
  onBlockSpacingChange?: (spacing: number) => void;
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
  courseId?: number;
  footerData?: any;
  onFooterChange?: (data: any) => void;
  onlineUsers?: Record<string, any>;
  organizationId?: string;
  isTemplate?: boolean;
  emailSubject?: string;
  onEmailSubjectChange?: (subject: string) => void;
  onDeleteTemplate?: () => void;
  onApplyToAllButtons: () => void;
  onApplyToAllDividers: () => void;
  handleAddBlockByType?: (type: Block["type"]) => void;
  mobilePopoverOpen?: boolean;
  setMobilePopoverOpen?: (open: boolean) => void;
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
        "flex cursor-grab flex-col items-center gap-1 rounded-md border bg-background p-3 shadow-sm hover:bg-accent/80",
        className,
      )}
    >
      <block.icon />
      <span>{block.label}</span>
    </div>
  );

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className={cn(block.type === "quiz" && "col-span-3 mt-4")}
      >
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

function ClickableBlock({
  block,
  onClickAdd,
}: {
  block: { type: string; label: string; icon: any };
  onClickAdd?: (type: Block["type"]) => void;
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
        "flex cursor-grab flex-col items-center gap-1 rounded-md border bg-background p-3 shadow-sm hover:bg-accent/80",
        className,
      )}
    >
      <block.icon />
      <span>{block.label}</span>
    </div>
  );

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className={cn(block.type === "quiz" && "col-span-3 mt-4")}
        onClick={() => {
          if (onClickAdd) {
            onClickAdd(block.type as Block["type"]);
          }
        }}
      >
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
  { label: "Audio", type: "audio", icon: AudioIcon },
  { label: "Quiz", type: "quiz", icon: QuizIcon },
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
  cornerRadius = 0,
  onCornerRadiusChange,
  blockSpacing = 20,
  onBlockSpacingChange,
  emailBgColor = "#ffffff",
  onEmailBgColorChange,
  activeForm,
  setActiveForm,
  emailId,
  courseId,
  footerData,
  linkColor,
  onLinkColorChange,
  onFooterChange,
  accentTextColor,
  onAccentTextColorChange,
  organizationId,
  isTemplate = false,
  onlineUsers = {},
  emailSubject,
  onEmailSubjectChange,
  onDeleteTemplate,
  onApplyToAllButtons,
  onApplyToAllDividers,
  handleAddBlockByType,
  mobilePopoverOpen,
  setMobilePopoverOpen,
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

  const contentBlockTypes = [
    "section",
    "text",
    "image",
    "button",
    "file-download",
    "divider",
    "video",
    "author",
    "list",
    "audio",
    "quiz",
  ];

  const blockTypes =
    type === "email"
      ? allBlockTypes.filter((block) => emailBlockTypes.includes(block.type))
      : type === "content"
        ? allBlockTypes.filter((block) =>
            contentBlockTypes.includes(block.type),
          )
        : allBlockTypes;

  return (
    <>
      <div className="hidden md:block">
        <div
          className={cn(
            "sticky top-16 h-[calc(100vh-5rem)] flex-shrink-0 overflow-hidden rounded-md border bg-sidebar shadow-sm md:w-[320px] md:p-1.5 lg:w-[400px] lg:p-4",
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
                  courseId={courseId}
                  footerData={footerData}
                  cornerRadius={cornerRadius}
                  onCornerRadiusChange={onCornerRadiusChange}
                  linkColor={linkColor}
                  onLinkColorChange={onLinkColorChange}
                  onFooterChange={onFooterChange}
                  accentTextColor={accentTextColor}
                  onAccentTextColorChange={onAccentTextColorChange}
                  setActiveForm={setActiveForm}
                  organizationId={organizationId}
                  blockSpacing={blockSpacing}
                  onBlockSpacingChange={onBlockSpacingChange}
                  onApplyToAllButtons={onApplyToAllButtons}
                  onApplyToAllDividers={onApplyToAllDividers}
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
                      {type === "email" && (
                        <>
                          <div
                            className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-background py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                            onClick={() => setActiveForm("email-style")}
                          >
                            <div className="flex items-center gap-2">
                              <Palette />
                              Styles
                            </div>
                            <ChevronRight />
                          </div>
                          <div
                            className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-background py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                            onClick={() => setActiveForm("email-footer")}
                          >
                            <div className="flex items-center gap-2">
                              <FooterIcon />
                              Footer
                            </div>
                            <ChevronRight />
                          </div>
                        </>
                      )}
                      <div
                        className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-background py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                        onClick={() => setActiveForm("email-templates")}
                      >
                        <div className="flex items-center gap-2">
                          <TemplatesIcon />
                          Templates
                        </div>
                        <ChevronRight />
                      </div>
                    </div>
                    {isTemplate && (
                      <TemplateForm
                        name={emailSubject || ""}
                        onNameChange={onEmailSubjectChange || (() => {})}
                        onDelete={onDeleteTemplate || (() => {})}
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    {Object.keys(onlineUsers).length > 0 && (
                      <>
                        <div className="mb-2 rounded-lg border border-destructive bg-destructive/20 p-2 px-2 text-sm">
                          You will not see the edits other users make until you
                          refresh. We recommend only having one person edit an
                          email at a time until we add real-time collaboration
                          features.
                        </div>
                        <Separator className="my-2" />
                        <div className="mb-2 px-2 text-sm font-bold">
                          Editors Online
                        </div>

                        <div className="flex flex-wrap items-center gap-2 px-1.5">
                          {Object.entries(onlineUsers).map(([key, presences]) =>
                            (presences as any[]).map((presence, index) => (
                              <div key={`${key}-${index}`} className="relative">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={presence.avatar_url} />
                                      <AvatarFallback>
                                        {presence.first_name?.charAt(0)}
                                        {presence.last_name?.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent align="start">
                                    {presence.first_name} {presence.last_name}
                                  </TooltipContent>
                                </Tooltip>
                                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-sidebar bg-green-500"></div>
                              </div>
                            )),
                          )}
                        </div>
                      </>
                    )}
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
          <Popover
            open={isMobile && mobilePopoverOpen}
            onOpenChange={setMobilePopoverOpen}
          >
            <PopoverTrigger asChild>
              <CirclePlus height="40px" width="40px" />
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-3rem)] p-0"
              sideOffset={16}
            >
              {isMobile && (
                <div className="grid grid-cols-3 gap-2 p-4">
                  {blockTypes.map((block) => (
                    <ClickableBlock
                      key={block.type}
                      block={block}
                      onClickAdd={handleAddBlockByType}
                    />
                  ))}
                </div>
              )}
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
                cornerRadius={cornerRadius}
                onCornerRadiusChange={onCornerRadiusChange}
                linkColor={linkColor}
                onLinkColorChange={onLinkColorChange}
                accentTextColor={accentTextColor}
                onAccentTextColorChange={onAccentTextColorChange}
                blockSpacing={blockSpacing}
                onBlockSpacingChange={onBlockSpacingChange}
                onApplyToAllButtons={onApplyToAllButtons}
                onApplyToAllDividers={onApplyToAllDividers}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
