import React, { useState } from "react";
import { Label } from "@trivo/ui/label";
import { Input } from "@trivo/ui/input";
import { Button } from "@trivo/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@trivo/ui/select";
import {
  MailFilled,
  Instagram,
  Facebook,
  Linkedin,
  Bluesky,
  LinkIcon,
  Threads,
  TikTok,
  XTwitter,
  Youtube,
} from "@trivo/ui/icons";
import FileUpload from "../file-upload";
export default function AuthorForm() {
  const [links, setLinks] = useState<Array<{ icon: string; url: string }>>([]);

  const addLink = () => {
    if (links.length < 5) {
      setLinks([...links, { icon: "", url: "" }]);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: "icon" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center ">
          <Label>Name</Label>
          <Input className="col-span-2" placeholder="Name" />
          <Label>Title</Label>
          <Input className="col-span-2" placeholder="Title" />
          <Label>Image</Label>
          <FileUpload />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Links</Label>
          <Button
            variant="outline"
            onClick={addLink}
            disabled={links.length >= 5}
          >
            Add Link
          </Button>
        </div>
        {links.map((link, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-y-4 gap-x-2 items-center"
          >
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
            <div className="col-span-2 flex gap-2">
              <Input
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                placeholder="Link"
              />
              <Button
                variant="outline"
                onClick={() => removeLink(index)}
                size="icon"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
