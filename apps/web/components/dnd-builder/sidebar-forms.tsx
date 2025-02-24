import { Block, BlockType } from "@/types/blocks";
import React from "react";
import ButtonForm from "./sidebar-editor-forms/buttons";
import TextForm from "./sidebar-editor-forms/text";
import ImageForm from "./sidebar-editor-forms/image";
import VideoForm from "./sidebar-editor-forms/video";
import DividerForm from "./sidebar-editor-forms/divider";
import FileDownloadForm from "./sidebar-editor-forms/file-download";
import CardsForm from "./sidebar-editor-forms/cards";
import ListForm from "./sidebar-editor-forms/list";
import AuthorForm from "./sidebar-editor-forms/author";
import { Button } from "@trivo/ui/button";
import { ChevronLeft } from "@trivo/ui/icons";

export default function DndBuilderSidebarForms({
  selectedBlock,
  setSelectedBlockId,
  onDeleteBlock,
  onBlockUpdate,
}: {
  selectedBlock: { id: string; type: BlockType };
  setSelectedBlockId: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onBlockUpdate: (block: Block) => void;
}) {
  return (
    <div className="flex flex-col gap-4 overflow-hidden h-full">
      <div className="flex gap-2 items-center">
        <Button
          className="px-1 py-0 h-7 text-muted-foreground gap-1"
          variant="ghost"
          onClick={() => setSelectedBlockId(null)}
        >
          <ChevronLeft />
          Back
        </Button>
      </div>
      <div className="h-full overflow-y-auto">
        {selectedBlock.type === "button" && (
          <ButtonForm block={selectedBlock} onUpdate={onBlockUpdate} />
        )}
        {selectedBlock.type === "text" && <TextForm />}
        {selectedBlock.type === "image" && <ImageForm />}
        {selectedBlock.type === "video" && <VideoForm />}
        {selectedBlock.type === "divider" && (
          <DividerForm block={selectedBlock} onUpdate={onBlockUpdate} />
        )}
        {selectedBlock.type === "file-download" && <FileDownloadForm />}
        {selectedBlock.type === "cards" && <CardsForm />}
        {selectedBlock.type === "list" && (
          <ListForm block={selectedBlock} onUpdate={onBlockUpdate} />
        )}
        {selectedBlock.type === "author" && <AuthorForm />}
      </div>
      <div className="flex gap-2 items-center justify-end">
        <Button
          variant="outline"
          className="text-destructive border-destructive px-2 py-0 h-7 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDeleteBlock(selectedBlock.id)}
        >
          Delete Block
        </Button>
      </div>
    </div>
  );
}
