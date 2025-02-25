import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import { Slider } from "@trivo/ui/slider";
import { Switch } from "@trivo/ui/switch";
import { Block, VideoBlockData } from "@/types/blocks";
import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash/debounce";

interface VideoFormProps {
  block: Block & { data?: VideoBlockData };
  onUpdate: (block: Block, addToHistory?: boolean) => void;
}

export default function VideoForm({ block, onUpdate }: VideoFormProps) {
  // Initialize state from props
  const [localState, setLocalState] = useState<VideoBlockData>({
    url: block.data?.url || "",
    size: block.data?.size || 33,
    centered: block.data?.centered || false,
  });
  const [error, setError] = useState("");

  // Create a ref to store the latest state for the debounced function
  const stateRef = useRef(localState);

  // Update the ref whenever localState changes
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);

  // Create a debounced function that only updates the history
  const debouncedHistoryUpdate = useCallback(
    debounce(() => {
      console.log("Video form updating block in history:", {
        blockId: block.id,
        blockType: block.type,
        newState: stateRef.current,
      });
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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedHistoryUpdate.cancel();
    };
  }, [debouncedHistoryUpdate]);

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
              value={localState.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="YouTube URL"
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
