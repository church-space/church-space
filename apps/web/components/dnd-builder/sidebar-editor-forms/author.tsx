import { useUser } from "@/stores/use-user";
import type { AuthorBlockData, Block } from "@/types/blocks";
import { Button } from "@trivo/ui/button";
import {
  Bluesky,
  Facebook,
  Instagram,
  Linkedin,
  LinkIcon,
  MailFilled,
  Threads,
  TikTok,
  XTwitter,
  Youtube,
} from "@trivo/ui/icons";
import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import FileUpload from "../file-upload";

interface AuthorFormProps {
  block: Block & { data?: AuthorBlockData };
  onUpdate: (block: Block, addToHistory?: boolean) => void;
}

export default function AuthorForm({ block, onUpdate }: AuthorFormProps) {
  const { organizationId } = useUser();

  const [localState, setLocalState] = useState<AuthorBlockData>({
    name: block.data?.name || "",
    subtitle: block.data?.subtitle || "",
    avatar: block.data?.avatar || "",
    links: block.data?.links || [],
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
      console.log("Author form updating block in history:", {
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

  useEffect(() => {
    setLocalState({
      name: block.data?.name || "",
      subtitle: block.data?.subtitle || "",
      avatar: block.data?.avatar || "",
      links: block.data?.links || [],
      textColor: block.data?.textColor || "#000000",
    });
  }, [block.data]);

  const handleChange = (key: keyof AuthorBlockData, value: any) => {
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

  const handleUploadComplete = (path: string) => {
    // Update the avatar with the file path
    handleChange("avatar", path);
  };

  const addLink = () => {
    if (localState.links.length < 5) {
      const newLinks = [...localState.links, { icon: "", url: "" }];
      handleChange("links", newLinks);
    }
  };

  const updateLink = (index: number, key: "icon" | "url", value: string) => {
    const newLinks = [...localState.links];
    newLinks[index] = { ...newLinks[index], [key]: value };
    handleChange("links", newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = localState.links.filter((_, i) => i !== index);
    handleChange("links", newLinks);
  };

  const onImageRemove = () => {
    console.log("Removing avatar image");
    // Update the avatar with an empty string
    handleChange("avatar", "");

    // Force an update to history to ensure the change is saved
    debouncedHistoryUpdate();
  };

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>Avatar</Label>
          <div className="col-span-2">
            <FileUpload
              organizationId={organizationId}
              onUploadComplete={handleUploadComplete}
              initialFilePath={localState.avatar}
              onRemove={onImageRemove}
            />
          </div>
          <Label>Name</Label>
          <Input
            className="col-span-2"
            value={localState.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <Label>Subtitle</Label>
          <Input
            className="col-span-2"
            value={localState.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
          />
          <Label>Text Color</Label>
          <Input
            type="color"
            value={localState.textColor}
            onChange={(e) => handleChange("textColor", e.target.value)}
            className="col-span-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Social Links</Label>
          <Button
            variant="outline"
            onClick={addLink}
            disabled={localState.links.length >= 5}
          >
            Add Link
          </Button>
        </div>
        {localState.links.map((link, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-y-2 gap-x-2 items-center"
          >
            <Label>Icon</Label>
            <div className="col-span-2 flex gap-2">
              <Select
                value={link.icon}
                onValueChange={(value) => updateLink(index, "icon", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Icon" />
                </SelectTrigger>
                <SelectContent className="min-w-20">
                  <SelectItem value="mail">
                    <div className="flex flex-row gap-2">
                      <MailFilled height={"20"} width={"20"} /> Email
                    </div>
                  </SelectItem>
                  <SelectItem value="link">
                    <div className="flex flex-row gap-2">
                      <LinkIcon height={"20"} width={"20"} /> Website
                    </div>
                  </SelectItem>
                  <SelectItem value="facebook">
                    <div className="flex flex-row gap-2">
                      <Facebook height={"20"} width={"20"} /> Facebook
                    </div>
                  </SelectItem>
                  <SelectItem value="youtube">
                    <div className="flex flex-row gap-2">
                      <Youtube height={"20"} width={"20"} /> Youtube
                    </div>
                  </SelectItem>
                  <SelectItem value="instagram">
                    <div className="flex flex-row gap-2">
                      <Instagram height={"20"} width={"20"} /> Instagram
                    </div>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <div className="flex flex-row gap-2">
                      <TikTok height={"20"} width={"20"} /> TikTok
                    </div>
                  </SelectItem>
                  <SelectItem value="twitter">
                    <div className="flex flex-row gap-2">
                      <XTwitter height={"20"} width={"20"} /> X
                    </div>
                  </SelectItem>
                  <SelectItem value="threads">
                    <div className="flex flex-row gap-2">
                      <Threads height={"20"} width={"20"} /> Threads
                    </div>
                  </SelectItem>
                  <SelectItem value="bluesky">
                    <div className="flex flex-row gap-2">
                      <Bluesky height={"20"} width={"20"} /> Bluesky
                    </div>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <div className="flex flex-row gap-2">
                      <Linkedin height={"20"} width={"20"} /> LinkedIn
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => removeLink(index)}
                size="icon"
              >
                ×
              </Button>
            </div>
            <Label>URL</Label>
            <Input
              className="col-span-2"
              value={link.url}
              onChange={(e) => updateLink(index, "url", e.target.value)}
              placeholder="https://"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
