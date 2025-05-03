import { useUser } from "@/stores/use-user";
import type { Block, FileDownloadBlockData } from "@/types/blocks";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { useState } from "react";
import ColorPicker from "../color-picker";
import FileUpload from "../file-upload";
import { Tooltip } from "@church-space/ui/tooltip";
import { TooltipContent } from "@church-space/ui/tooltip";
import { TooltipTrigger } from "@church-space/ui/tooltip";
import { CircleInfo } from "@church-space/ui/icons";

interface FileDownloadFormProps {
  block: Block & { data?: FileDownloadBlockData };
  onUpdate: (block: Block) => void;
}

export default function FileDownloadForm({
  block,
  onUpdate,
}: FileDownloadFormProps) {
  const { organizationId } = useUser();

  const [localState, setLocalState] = useState<FileDownloadBlockData>({
    title: block.data?.title || "",
    file: block.data?.file || "",
    bgColor: block.data?.bgColor || "#f0f0f0",
    textColor: block.data?.textColor || "#000000",
  });

  const handleChange = (key: keyof FileDownloadBlockData, value: string) => {
    // Immediately update the local state for responsive UI
    const newState = { ...localState, [key]: value };
    setLocalState(newState);

    // Update the UI
    onUpdate({
      ...block,
      data: newState,
    });
  };

  if (!organizationId) {
    return null;
  }

  const onFileRemove = () => {
    // Update the file with an empty string
    handleChange("file", "");
  };

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Details</Label>
        </div>
        <div className="grid grid-cols-3 items-center gap-x-2 gap-y-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Label className="flex items-center gap-1">
                File <CircleInfo />
              </Label>
            </TooltipTrigger>
            <TooltipContent>
              Upload a file to be downloaded when someone clicks on the button.
            </TooltipContent>
          </Tooltip>
          <FileUpload
            organizationId={organizationId}
            onUploadComplete={(path) => handleChange("file", path)}
            initialFilePath={localState.file}
            onRemove={onFileRemove}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Label className="flex items-center gap-1">
                Title <CircleInfo />
              </Label>
            </TooltipTrigger>
            <TooltipContent>Label to be displayed on the block.</TooltipContent>
          </Tooltip>
          <Input
            className="col-span-2 bg-background"
            value={localState.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="File Name"
            maxLength={150}
          />
          <Label>BG Color</Label>
          <ColorPicker
            value={localState.bgColor}
            onChange={(color) => handleChange("bgColor", color)}
          />
          <Label>Text Color</Label>
          <ColorPicker
            value={localState.textColor}
            onChange={(color) => handleChange("textColor", color)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Please ensure that you do not upload and send sensitive data. If
          it&apos;s in an email, treat it as public information.
        </div>
      </div>
    </div>
  );
}
