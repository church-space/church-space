import type { Block as BlockType } from "@/types/blocks";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import { Editor } from "@tiptap/react";
import { cn } from "@church-space/ui/cn";
import { motion } from "framer-motion";
import React, { useRef } from "react";
import Block from "./block";
import Footer from "./footer";
import { Layout } from "@church-space/ui/icons";

interface CanvasProps {
  blocks: BlockType[];
  bgColor: string;
  isInset?: boolean;
  isRounded?: boolean;
  emailBgColor?: string;
  onBlockSelect: (id: string | null) => void;
  selectedBlockId: string | null;
  editors: Record<string, Editor | null>;
  onTextContentChange?: (blockId: string, content: string) => void;
  setActiveForm: (
    form:
      | "default"
      | "block"
      | "email-style"
      | "email-footer"
      | "email-templates",
  ) => void;
  activeForm:
    | "default"
    | "block"
    | "email-style"
    | "email-footer"
    | "email-templates";
  footerData?: any;
  defaultFont?: string;
  defaultTextColor?: string;
  linkColor?: string;
}

export default function DndBuilderCanvas({
  blocks,
  bgColor,
  isInset = false,
  isRounded = true,
  emailBgColor = "#ffffff",
  onBlockSelect,
  selectedBlockId,
  editors,
  onTextContentChange,
  setActiveForm,
  activeForm,
  footerData,
  defaultFont,
  defaultTextColor,
  linkColor,
}: CanvasProps) {
  const { active, over } = useDndContext();
  const isDragging = Boolean(active);
  const isFromSidebar = active?.data?.current?.fromSidebar;
  const activeId = active?.id;

  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  // Store block heights
  const blockRefs = useRef<Record<string, HTMLDivElement>>({});
  const heightRef = useRef<number>(0);

  // When a block becomes active, store its height
  if (active && !heightRef.current && blockRefs.current[active.id]) {
    heightRef.current = blockRefs.current[active.id].offsetHeight;
  }
  // Reset the height when no block is being dragged
  if (!active) {
    heightRef.current = 0;
  }

  const getInsertionIndex = () => {
    if (!over || !active || !isFromSidebar) return -1;

    if (over.id === "canvas" && blocks.length === 0) {
      return 0;
    }

    // If hovering over a block
    const blockIndex = blocks.findIndex((block) => block.id === over.id);
    if (blockIndex !== -1) {
      const rect = over.rect as DOMRect;
      const mouseY = active.rect.current.translated?.top ?? 0;
      const threshold = rect.top + rect.height / 2;

      return mouseY < threshold ? blockIndex : blockIndex + 1;
    }

    return blocks.length;
  };

  const insertionIndex = isDragging ? getInsertionIndex() : -1;

  const renderBlock = (block: BlockType, isRounded: boolean) => {
    const isSelected = selectedBlockId === block.id;
    return (
      <Block
        key={block.id}
        id={block.id}
        type={block.type}
        isSelected={isSelected}
        onSelect={(e) => {
          e.stopPropagation();
          onBlockSelect(block.id);
        }}
        editor={editors[block.id]}
        block={block}
        onTextContentChange={onTextContentChange}
        defaultFont={defaultFont}
        defaultTextColor={defaultTextColor}
        isRounded={isRounded}
        linkColor={linkColor}
      />
    );
  };

  return (
    <div
      className={cn(
        "mx-auto mb-20 flex w-full flex-col items-center justify-center border shadow-sm md:mb-0",
        isInset ? "px-3 pt-3" : "",
        isRounded ? "rounded-md" : "rounded-none",
      )}
      style={
        isInset
          ? { backgroundColor: emailBgColor }
          : { backgroundColor: bgColor }
      }
      onClick={() => {
        onBlockSelect(null);
        setActiveForm("default");
      }}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "mx-auto flex w-full max-w-2xl flex-col gap-3 p-4",
          isInset && "mb-2 shadow-md",
          isRounded && "rounded-lg",
          blocks.length === 0 && "min-h-[102px]",
        )}
        style={{ backgroundColor: bgColor }}
      >
        {blocks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            {isDragging && isFromSidebar ? (
              <motion.div
                className="flex w-full max-w-2xl flex-col items-center justify-center gap-2 rounded-md border border-dashed border-blue-500 bg-blue-500/10 py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Layout height="5rem" width="5rem" fill="#3b82f6" />
                <div className="text-lg font-medium text-blue-500 text-foreground">
                  Drag blocks here
                </div>
                <div className="max-w-xs text-center text-sm text-blue-300 text-muted-foreground">
                  Drag and drop email blocks from the left panel to build your
                  email template
                </div>
              </motion.div>
            ) : (
              <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/50 bg-card/80 p-4 py-12">
                <Layout height="5rem" width="5rem" />
                <div className="text-lg font-medium text-foreground">
                  Drag blocks here
                </div>
                <div className="max-w-xs text-center text-sm text-muted-foreground">
                  Drag and drop email blocks from the left panel to build your
                  email template
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                {isDragging && isFromSidebar && insertionIndex === index && (
                  <motion.div
                    className="mx-auto h-20 w-full max-w-2xl rounded-md border border-dashed border-blue-500 bg-blue-500/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <motion.div
                  animate={{ y: 0 }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                  }}
                  className={cn("mx-auto w-full max-w-2xl")}
                  ref={(el) => {
                    if (el) blockRefs.current[block.id] = el;
                  }}
                >
                  {activeId === block.id ? (
                    <div style={{ height: `${heightRef.current}px` }} />
                  ) : (
                    renderBlock(block, isRounded)
                  )}
                </motion.div>
              </React.Fragment>
            ))}
            {isDragging &&
              isFromSidebar &&
              insertionIndex === blocks.length && (
                <motion.div
                  className="mx-auto h-20 w-full max-w-2xl rounded-md border border-dashed border-blue-500 bg-blue-500/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
          </>
        )}
      </div>
      <Footer
        onClick={(e) => {
          e.stopPropagation();
          onBlockSelect(null);
          setActiveForm("email-footer");
        }}
        isActive={activeForm === "email-footer"}
        footerData={footerData}
        emailInset={isInset}
        emailBgColor={emailBgColor}
        defaultFont={defaultFont}
      />
    </div>
  );
}
