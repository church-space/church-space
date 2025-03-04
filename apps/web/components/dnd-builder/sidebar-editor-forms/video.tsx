import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Slider } from "@church-space/ui/slider";
import { Switch } from "@church-space/ui/switch";
import { Block, VideoBlockData } from "@/types/blocks";
import { useEffect, useState } from "react";

interface VideoFormProps {
  block: Block & { data?: VideoBlockData };
  onUpdate: (block: Block) => void;
}

export default function VideoForm({ block, onUpdate }: VideoFormProps) {
  // Initialize state from props
  const [localState, setLocalState] = useState<VideoBlockData>({
    url: block.data?.url || "",
    size: block.data?.size || 33,
    centered: block.data?.centered || false,
  });
  const [error, setError] = useState("");

  // Update local state if block props change from parent
  useEffect(() => {
    setLocalState({
      url: block.data?.url || "",
      size: block.data?.size || 33,
      centered: block.data?.centered || false,
    });
  }, [block.data]);

  const validateYouTubeUrl = (url: string) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/,
    ];

    return patterns.some((pattern) => pattern.test(url));
  };

  const handleChange = (field: keyof VideoBlockData, value: any) => {
    // For URL field, validate
    if (field === "url") {
      if (value && !validateYouTubeUrl(value)) {
        setError("Please enter a valid YouTube URL");
      } else {
        setError("");
      }
    }

    // Immediately update the local state for responsive UI
    const newState = { ...localState, [field]: value };
    setLocalState(newState);

    // Update the UI
    onUpdate({
      ...block,
      data: newState,
    });
  };

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Details</Label>
        </div>
        <div className="grid grid-cols-3 items-center gap-x-2 gap-y-4">
          <Label>YouTube URL</Label>
          <div className="col-span-2">
            <Input
              value={localState.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="YouTube URL"
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          <Label>Size</Label>
          <Slider
            value={[localState.size]}
            onValueChange={(value) => handleChange("size", value[0])}
            max={100}
            min={40}
            step={1}
            className="col-span-2"
          />
          <Label>Center Video</Label>
          <Switch
            checked={localState.centered}
            onCheckedChange={(checked) => handleChange("centered", checked)}
          />
        </div>
      </div>
    </div>
  );
}
