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
import EmailFooterForm from "./sidebar-editor-forms/email-footer";
import EmailStyleForm from "./sidebar-editor-forms/email-style";
import EmailTemplateForm from "./sidebar-editor-forms/email-templates";
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
  formType = "block",
  onBack,
  bgColor,
  onBgColorChange,
  onSelectTemplate,
  isInset,
  onIsInsetChange,
  emailBgColor,
  onEmailBgColorChange,
  defaultTextColor,
  onDefaultTextColorChange,
  defaultFont,
  onDefaultFontChange,
  emailId,
  footerData,
}: {
  selectedBlock?: Block;
  setSelectedBlockId?: (id: string | null) => void;
  onDeleteBlock?: (id: string) => void;
  onBlockUpdate?: (
    block: Block,
    addToHistory?: boolean,
    isDuplication?: boolean
  ) => void;
  formType?: "block" | "email-style" | "email-footer" | "email-templates";
  onBack?: () => void;
  bgColor?: string;
  onBgColorChange?: (color: string) => void;
  footerBgColor?: string;
  footerTextColor?: string;
  footerFont?: string;
  onFooterBgColorChange?: (color: string) => void;
  onFooterTextColorChange?: (color: string) => void;
  onFooterFontChange?: (font: string) => void;
  onSelectTemplate?: (templateId: string) => void;
  isInset?: boolean;
  onIsInsetChange?: (isInset: boolean) => void;
  emailBgColor?: string;
  onEmailBgColorChange?: (color: string) => void;
  defaultTextColor?: string;
  onDefaultTextColorChange?: (color: string) => void;
  defaultFont?: string;
  onDefaultFontChange?: (font: string) => void;
  emailId?: number;
  footerData?: any;
}) {
  const [isDeleteConfirmationExpanded, setIsDeleteConfirmationExpanded] =
    useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (setSelectedBlockId) {
      setSelectedBlockId(null);
    }
  };

  // Safe wrapper for onBlockUpdate
  const handleBlockUpdate = (block: Block) => {
    if (onBlockUpdate) {
      onBlockUpdate(block);
    }
  };

  // Safe wrapper for onDeleteBlock
  const handleDeleteBlock = (id: string) => {
    if (onDeleteBlock) {
      onDeleteBlock(id);
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-hidden h-full">
      <div className="flex gap-2 items-center">
        <Button
          className="px-1 py-0 h-7 text-muted-foreground gap-1"
          variant="ghost"
          onClick={handleBack}
        >
          <ChevronLeft />
          Back
        </Button>
      </div>
      <div className="h-full overflow-y-auto py-1">
        {/* Email specific forms */}
        {formType === "email-style" && (
          <EmailStyleForm
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
          />
        )}
        {formType === "email-footer" && (
          <EmailFooterForm emailId={emailId} footerData={footerData} />
        )}
        {formType === "email-templates" && (
          <EmailTemplateForm onSelectTemplate={onSelectTemplate} />
        )}

        {/* Block specific forms */}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "button" && (
            <ButtonForm
              block={selectedBlock as Block & { data?: ButtonBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "text" && <TextForm />}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "image" && (
            <ImageForm
              block={selectedBlock as Block & { data?: ImageBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "video" && (
            <VideoForm
              block={selectedBlock as Block & { data?: VideoBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "divider" && (
            <DividerForm
              block={selectedBlock as Block & { data?: DividerBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "file-download" && (
            <FileDownloadForm
              block={selectedBlock as Block & { data?: FileDownloadBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "cards" && (
            <CardsForm
              block={selectedBlock as Block & { data?: CardsBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "list" && (
            <ListForm
              block={selectedBlock as Block & { data?: ListBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "author" && (
            <AuthorForm
              block={selectedBlock as Block & { data?: AuthorBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
      </div>
      {selectedBlock && formType === "block" && (
        <div className="flex gap-2 items-center justify-end">
          <div className="flex items-center justify-center gap-2">
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
                    onClick={() =>
                      selectedBlock && handleDeleteBlock(selectedBlock.id)
                    }
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
            <Button
              variant="outline"
              className=" px-2 py-0 h-7 "
              onClick={() => {
                if (selectedBlock && onBlockUpdate) {
                  // Create a deep copy of the selected block with a new ID
                  const duplicatedBlock = {
                    ...JSON.parse(JSON.stringify(selectedBlock)), // Deep clone to avoid reference issues
                    id: crypto.randomUUID(), // Generate a new unique ID
                  };

                  // Find all blocks that need their order updated
                  // This is handled by the parent component that receives this duplicated block

                  // Call onBlockUpdate with the duplicated block and a special flag
                  // to indicate this is a duplication operation
                  onBlockUpdate(duplicatedBlock, true, true);
                }
              }}
            >
              Duplicate Block
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
