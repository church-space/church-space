import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import { useUser } from "@/stores/use-user";
import FileUpload from "../file-upload";
import type { Block, FileDownloadBlockData } from "@/types/blocks";
import { useCallback, useState } from "react";
import debounce from "lodash/debounce";

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
    title: block.data?.title || "File Name",
    file: block.data?.file || "",
    bgColor: block.data?.bgColor || "#ffffff",
    textColor: block.data?.textColor || "#000000",
  });

  const debouncedUpdate = useCallback(
    debounce((newState: FileDownloadBlockData) => {
      onUpdate({
        ...block,
        data: newState,
      });
    }, 500),
    [block, onUpdate]
  );

  const handleChange = (key: keyof FileDownloadBlockData, value: string) => {
    const newState = { ...localState, [key]: value };
    setLocalState(newState);
    debouncedUpdate(newState);
  };

  if (!organizationId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>Title</Label>
          <Input
            className="col-span-2"
            value={localState.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <Label>File</Label>
          <FileUpload
            organizationId={organizationId}
            onUploadComplete={(path) => handleChange("file", path)}
          />
          <Label>BG Color</Label>
          <Input
            className="col-span-2"
            type="color"
            value={localState.bgColor}
            onChange={(e) => handleChange("bgColor", e.target.value)}
          />
          <Label>Text Color</Label>
          <Input
            className="col-span-2"
            type="color"
            value={localState.textColor}
            onChange={(e) => handleChange("textColor", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
