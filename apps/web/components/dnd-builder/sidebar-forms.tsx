import {
  AuthorBlockData,
  Block,
  ButtonBlockData,
  CardsBlockData,
  DividerBlockData,
  FileDownloadBlockData,
  ImageBlockData,
  ListBlockData,
  VideoBlockData,
} from "@/types/blocks";
import { Button } from "@trivo/ui/button";
import { ChevronLeft } from "@trivo/ui/icons";
import AuthorForm from "./sidebar-editor-forms/author";
import ButtonForm from "./sidebar-editor-forms/buttons";
import CardsForm from "./sidebar-editor-forms/cards";
import DividerForm from "./sidebar-editor-forms/divider";
import FileDownloadForm from "./sidebar-editor-forms/file-download";
import ImageForm from "./sidebar-editor-forms/image";
import ListForm from "./sidebar-editor-forms/list";
import TextForm from "./sidebar-editor-forms/text";
import VideoForm from "./sidebar-editor-forms/video";
import { useState } from "react";

export default function DndBuilderSidebarForms({
  selectedBlock,
  setSelectedBlockId,
  onDeleteBlock,
  onBlockUpdate,
}: {
  selectedBlock: Block;
  setSelectedBlockId: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onBlockUpdate: (block: Block) => void;
}) {
  const [isDeleteConfirmationExpanded, setIsDeleteConfirmationExpanded] =
    useState(false);

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
      <div className="h-full overflow-y-auto py-1">
        {selectedBlock.type === "button" && (
          <ButtonForm
            block={selectedBlock as Block & { data?: ButtonBlockData }}
            onUpdate={onBlockUpdate}
          />
        )}
        {selectedBlock.type === "text" && <TextForm />}
        {selectedBlock.type === "image" && (
          <ImageForm
            block={selectedBlock as Block & { data?: ImageBlockData }}
            onUpdate={onBlockUpdate}
          />
        )}
        {selectedBlock.type === "video" && (
          <VideoForm
            block={selectedBlock as Block & { data?: VideoBlockData }}
            onUpdate={onBlockUpdate}
          />
        )}
        {selectedBlock.type === "divider" && (
          <DividerForm
            block={selectedBlock as Block & { data?: DividerBlockData }}
            onUpdate={onBlockUpdate}
          />
        )}
        {selectedBlock.type === "file-download" && (
          <FileDownloadForm
            block={selectedBlock as Block & { data?: FileDownloadBlockData }}
            onUpdate={onBlockUpdate}
          />
        )}
        {selectedBlock.type === "cards" && (
          <CardsForm
            block={selectedBlock as Block & { data?: CardsBlockData }}
            onUpdate={onBlockUpdate}
          />
        )}
        {selectedBlock.type === "list" && (
          <ListForm
            block={selectedBlock as Block & { data?: ListBlockData }}
            onUpdate={onBlockUpdate}
          />
        )}
        {selectedBlock.type === "author" && (
          <AuthorForm
            block={selectedBlock as Block & { data?: AuthorBlockData }}
            onUpdate={onBlockUpdate}
          />
        )}
      </div>
      <div className="flex gap-2 items-center justify-end">
        <div className="flex items-center justify-center ">
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${isDeleteConfirmationExpanded ? "w-[145px]" : "w-[102px]"}`}
          >
            {!isDeleteConfirmationExpanded ? (
              <Button
                variant="outline"
                className="text-destructive border-destructive px-2 py-0 h-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsDeleteConfirmationExpanded(true)}
              >
                Delete Block
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive px-2 py-0 h-7 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDeleteBlock(selectedBlock.id)}
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  className="  px-2 py-0 h-7 "
                  onClick={() => setIsDeleteConfirmationExpanded(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
