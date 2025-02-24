import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import { Slider } from "@trivo/ui/slider";
import { Switch } from "@trivo/ui/switch";
import { useUser } from "@/stores/use-user";
import FileUpload from "../file-upload";
import { Block, ImageBlockData } from "@/types/blocks";
import { useCallback, useState } from "react";
import debounce from "lodash/debounce";

interface ImageFormProps {
  block: Block & { data?: ImageBlockData };
  onUpdate: (block: Block) => void;
}

export default function ImageForm({ block, onUpdate }: ImageFormProps) {
  const { organizationId } = useUser();

  const [localState, setLocalState] = useState<ImageBlockData>({
    image: block.data?.image || "",
    size: block.data?.size || 33,
    link: block.data?.link || "",
    centered: block.data?.centered || false,
  });

  const debouncedUpdate = useCallback(
    debounce((newState: ImageBlockData) => {
      onUpdate({
        ...block,
        data: newState,
      });
    }, 200),
    [block, onUpdate]
  );

  const handleChange = (
    field: keyof ImageBlockData,
    value: string | number | boolean
  ) => {
    const newState = { ...localState, [field]: value };
    setLocalState(newState);

    // Immediately update for centering, debounce for other changes
    if (field === "centered") {
      onUpdate({
        ...block,
        data: newState,
      });
    } else {
      debouncedUpdate(newState);
    }
  };

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>Image</Label>
          <FileUpload
            organizationId={organizationId}
            onUploadComplete={(path) => handleChange("image", path)}
            type="image"
          />
          <Label>Size</Label>
          <Slider
            value={[localState.size]}
            max={100}
            min={40}
            step={1}
            className="col-span-2"
            onValueChange={(value) => handleChange("size", value[0])}
          />
          <Label>Link</Label>
          <Input
            className="col-span-2"
            placeholder="Link"
            value={localState.link}
            onChange={(e) => handleChange("link", e.target.value)}
          />
          <Label>Center Image</Label>
          <div className="col-span-2">
            <Switch
              checked={localState.centered}
              onCheckedChange={(checked) => handleChange("centered", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
