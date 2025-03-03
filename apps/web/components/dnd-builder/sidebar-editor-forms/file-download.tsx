import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { useUser } from "@/stores/use-user";
import FileUpload from "../file-upload";
import type { Block, FileDownloadBlockData } from "@/types/blocks";
import { useCallback, useState, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import ColorPicker from "../color-picker";

interface FileDownloadFormProps {
  block: Block & { data?: FileDownloadBlockData };
  onUpdate: (block: Block, addToHistory?: boolean) => void;
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

  // Create a ref to store the latest state for the debounced function
  const stateRef = useRef(localState);

  // Update the ref whenever localState changes
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);

  // Create a debounced function that only updates the history
  const debouncedHistoryUpdate = useCallback(
    debounce(() => {
      // Add to history
      onUpdate(
        {
          ...block,
          data: stateRef.current,
        },
        true
      );
    }, 500),
    [block, onUpdate]
  );

  const handleChange = (key: keyof FileDownloadBlockData, value: string) => {
    // Immediately update the local state for responsive UI
    const newState = { ...localState, [key]: value };
    setLocalState(newState);

    // Update the UI immediately without adding to history
    onUpdate(
      {
        ...block,
        data: newState,
      },
      false
    );

    // Debounce the history update
    debouncedHistoryUpdate();
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedHistoryUpdate.cancel();
    };
  }, [debouncedHistoryUpdate]);

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
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>File</Label>
          <FileUpload
            organizationId={organizationId}
            onUploadComplete={(path) => handleChange("file", path)}
            initialFilePath={localState.file}
            onRemove={onFileRemove}
          />
          <Label>Title</Label>
          <Input
            className="col-span-2"
            value={localState.title}
            onChange={(e) => handleChange("title", e.target.value)}
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
      </div>
    </div>
  );
}
