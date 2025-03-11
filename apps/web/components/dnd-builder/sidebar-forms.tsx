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
import { Button } from "@church-space/ui/button";
import { ChevronLeft } from "@church-space/ui/icons";
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

export default function DndBuilderSidebarForms({
  selectedBlock,
  setSelectedBlockId,
  setActiveForm,
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
  isRounded,
  onIsRoundedChange,
  linkColor,
  onLinkColorChange,
  onFooterChange,
  accentTextColor,
  onAccentTextColorChange,
}: {
  selectedBlock?: Block;
  setSelectedBlockId?: (id: string | null) => void;
  onDeleteBlock?: (id: string) => void;
  onBlockUpdate?: (block: Block, isDuplication?: boolean) => void;
  formType?: "block" | "email-style" | "email-footer" | "email-templates";
  onBack?: () => void;
  bgColor?: string;
  onBgColorChange?: (color: string) => void;
  footerBgColor?: string;
  footerTextColor?: string;
  onFooterBgColorChange?: (color: string) => void;
  onFooterTextColorChange?: (color: string) => void;
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
  isRounded?: boolean;
  onIsRoundedChange?: (isRounded: boolean) => void;
  linkColor?: string;
  onLinkColorChange?: (color: string) => void;
  onFooterChange?: (data: any) => void;
  accentTextColor?: string;
  onAccentTextColorChange?: (color: string) => void;
  setActiveForm?: (
    form:
      | "default"
      | "email-style"
      | "block"
      | "email-footer"
      | "email-templates",
  ) => void;
}) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    }

    // Always set selectedBlockId to null when going back
    if (setSelectedBlockId) {
      setSelectedBlockId(null);
    }
  };

  // Safe wrapper for onBlockUpdate
  const handleBlockUpdate = (block: Block) => {
    if (onBlockUpdate) {
      onBlockUpdate(block, false);
    }
  };

  // Safe wrapper for onDeleteBlock
  const handleDeleteBlock = (id: string) => {
    if (onDeleteBlock) {
      onDeleteBlock(id);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mb-4 flex items-center gap-2">
        <Button
          className="hidden h-7 gap-1 px-1 py-0 text-muted-foreground md:flex"
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
            isRounded={isRounded}
            onIsRoundedChange={onIsRoundedChange}
            linkColor={linkColor}
            onLinkColorChange={onLinkColorChange}
            accentTextColor={accentTextColor}
            onAccentTextColorChange={onAccentTextColorChange}
          />
        )}
        {formType === "email-footer" && (
          <EmailFooterForm
            emailId={emailId}
            footerData={footerData}
            emailInset={isInset || false}
            onFooterChange={onFooterChange}
          />
        )}
        {formType === "email-templates" && (
          <EmailTemplateForm onSelectTemplate={onSelectTemplate} />
        )}

        {/* Block specific forms */}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "button" && (
            <ButtonForm
              key={selectedBlock.id}
              block={selectedBlock as Block & { data?: ButtonBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "text" && (
            <TextForm key={selectedBlock.id} setActiveForm={setActiveForm} />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "image" && (
            <ImageForm
              key={selectedBlock.id}
              block={selectedBlock as Block & { data?: ImageBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "video" && (
            <VideoForm
              key={selectedBlock.id}
              block={selectedBlock as Block & { data?: VideoBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "divider" && (
            <DividerForm
              key={selectedBlock.id}
              block={selectedBlock as Block & { data?: DividerBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "file-download" && (
            <FileDownloadForm
              key={selectedBlock.id}
              block={selectedBlock as Block & { data?: FileDownloadBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "cards" && (
            <CardsForm
              key={selectedBlock.id}
              block={selectedBlock as Block & { data?: CardsBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "list" && (
            <ListForm
              key={selectedBlock.id}
              block={selectedBlock as Block & { data?: ListBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
        {selectedBlock &&
          formType === "block" &&
          selectedBlock.type === "author" && (
            <AuthorForm
              key={selectedBlock.id}
              block={selectedBlock as Block & { data?: AuthorBlockData }}
              onUpdate={handleBlockUpdate}
            />
          )}
      </div>
      {selectedBlock && formType === "block" && (
        <div className="mb-8 flex items-center justify-end gap-2 border-t pt-2 md:mb-0 md:border-none">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              className="h-7 border-destructive px-2 py-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (selectedBlock) {
                  handleDeleteBlock(selectedBlock.id);
                }
              }}
            >
              Delete Block
            </Button>

            <Button
              variant="outline"
              className="h-7 px-2 py-0"
              onClick={() => {
                if (selectedBlock && onBlockUpdate) {
                  // Create a deep copy of the selected block with a new ID
                  const duplicatedBlock = {
                    ...JSON.parse(JSON.stringify(selectedBlock)), // Deep clone to avoid reference issues
                    id: crypto.randomUUID(), // Generate a new unique ID
                    duplicatedFromId: selectedBlock.id, // Store the original block's ID
                  };

                  onBlockUpdate(duplicatedBlock, true);
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
