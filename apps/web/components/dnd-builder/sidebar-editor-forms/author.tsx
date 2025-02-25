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
import { useCallback, useEffect, useState } from "react";
import FileUpload from "../file-upload";

interface AuthorFormProps {
  block: Block & { data?: AuthorBlockData };
  onUpdate: (block: Block) => void;
}

export default function AuthorForm({ block, onUpdate }: AuthorFormProps) {
  const { organizationId } = useUser();

  const [localState, setLocalState] = useState<AuthorBlockData>({
    name: block.data?.name || "",
    subtitle: block.data?.subtitle || "",
    avatar: block.data?.avatar || "",
    links: block.data?.links || [],
  });

  const debouncedUpdate = useCallback(
    debounce((newState: AuthorBlockData) => {
      console.log("Author form updating block:", {
        blockId: block.id,
        blockType: block.type,
        newState,
      });
      onUpdate({
        ...block,
        data: newState,
      });
    }, 500),
    [block, onUpdate]
  );

  useEffect(() => {
    setLocalState({
      name: block.data?.name || "",
      subtitle: block.data?.subtitle || "",
      avatar: block.data?.avatar || "",
      links: block.data?.links || [],
    });
  }, [block.data]);

  const handleChange = (key: keyof AuthorBlockData, value: any) => {
    const newState = { ...localState, [key]: value };
    setLocalState(newState);
    debouncedUpdate(newState);
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

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
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
          <Label>Avatar</Label>
          <div className="col-span-2">
            <FileUpload
              organizationId={organizationId}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Social Links</Label>
          <Button variant="outline" onClick={addLink}>
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
                    <MailFilled height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="link">
                    <LinkIcon height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="facebook">
                    <Facebook height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="youtube">
                    <Youtube height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="instagram">
                    <Instagram height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <TikTok height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="twitter">
                    <XTwitter height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="threads">
                    <Threads height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="bluesky">
                    <Bluesky height={"20"} width={"20"} />
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <Linkedin height={"20"} width={"20"} />
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
