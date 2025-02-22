import { BlockType } from "@/types/blocks";
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
}: {
  selectedBlock: { id: string; type: BlockType };
  setSelectedBlockId: (id: string | null) => void;
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
        {selectedBlock.type === "button" && <ButtonForm />}
        {selectedBlock.type === "text" && <TextForm />}
        {selectedBlock.type === "image" && <ImageForm />}
        {selectedBlock.type === "video" && <VideoForm />}
        {selectedBlock.type === "divider" && <DividerForm />}
        {selectedBlock.type === "file-download" && <FileDownloadForm />}
        {selectedBlock.type === "cards" && <CardsForm />}
        {selectedBlock.type === "list" && <ListForm />}
        {selectedBlock.type === "author" && <AuthorForm />}
      </div>
    </div>
  );
}
