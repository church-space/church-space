import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import { Slider } from "@trivo/ui/slider";
import { Switch } from "@trivo/ui/switch";
import { Block, VideoBlockData } from "@/types/blocks";
import { useEffect, useState } from "react";

interface VideoFormProps {
  block: Block & { data?: VideoBlockData };
  onUpdate: (block: Block) => void;
}

export default function VideoForm({ block, onUpdate }: VideoFormProps) {
  const [url, setUrl] = useState(block.data?.url || "");
  const [size, setSize] = useState(block.data?.size || 33);
  const [centered, setCentered] = useState(block.data?.centered || false);
  const [error, setError] = useState("");

  const validateYouTubeUrl = (url: string) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/,
    ];

    return patterns.some((pattern) => pattern.test(url));
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl && !validateYouTubeUrl(newUrl)) {
      setError("Please enter a valid YouTube URL");
    } else {
      setError("");
    }
  };

  useEffect(() => {
    onUpdate({
      ...block,
      data: {
        url,
        size,
        centered,
      },
    });
  }, [url, size, centered]);

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>YouTube URL</Label>
          <div className="col-span-2">
            <Input
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="YouTube URL"
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <Label>Size</Label>
          <Slider
            value={[size]}
            onValueChange={(value) => setSize(value[0])}
            max={100}
            min={40}
            step={1}
            className="col-span-2"
          />
          <Label>Center Video</Label>
          <Switch checked={centered} onCheckedChange={setCentered} />
        </div>
      </div>
    </div>
  );
}
