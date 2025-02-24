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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedBlockId(null)}
        >
          <ChevronLeft />
        </Button>
        <span className="font-medium">Edit {selectedBlock.type}</span>
      </div>
      <div className="flex-1">
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
        {selectedBlock.type === "author" && (
          <AuthorForm block={selectedBlock} onUpdate={onBlockUpdate} />
        )}
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
