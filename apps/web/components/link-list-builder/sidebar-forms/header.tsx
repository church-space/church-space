"use client";

import ColorPicker from "@/components/dnd-builder/color-picker";
import FileUpload from "@/components/dnd-builder/file-upload";
import { Label } from "@church-space/ui/label";
import { Separator } from "@church-space/ui/separator";
import { useState } from "react";
import { Input } from "@church-space/ui/input";
import { AutosizeTextarea } from "@church-space/ui/auto-size-textarea";

export default function HeaderForm() {
  const [bgColor, setBgColor] = useState("#000000");
  const [primaryTextColor, setPrimaryTextColor] = useState("#000000");
  const [secondaryTextColor, setSecondaryTextColor] = useState("#000000");
  const [buttonColor, setButtonColor] = useState("#000000");
  const [buttonTextColor, setButtonTextColor] = useState("#000000");
  const [name, setName] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <Label className="font-medium">Background Image</Label>
      <FileUpload
        organizationId={"12"}
        onUploadComplete={(path) => console.log(path)}
        type="image"
        initialFilePath={""}
        onRemove={() => {}}
      />
      <Label className="font-medium">Background Color</Label>
      <ColorPicker value={bgColor} onChange={(color) => setBgColor(color)} />
      <Label className="font-medium">Primary Text Color</Label>
      <ColorPicker
        value={primaryTextColor}
        onChange={(color) => setPrimaryTextColor(color)}
      />
      <Label className="font-medium">Secondary Text Color</Label>
      <ColorPicker
        value={secondaryTextColor}
        onChange={(color) => setSecondaryTextColor(color)}
      />
      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Logo</Label>
      <FileUpload
        organizationId={"12"}
        onUploadComplete={(path) => console.log(path)}
        type="image"
        initialFilePath={""}
        onRemove={() => {}}
      />
      <Label className="font-medium">Name</Label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="col-span-2"
      />
      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Title</Label>
      <AutosizeTextarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="col-span-2"
      />
      <Label className="font-medium">Description</Label>
      <AutosizeTextarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="col-span-2"
      />
      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Button Text</Label>
      <Input
        value={buttonText}
        onChange={(e) => setButtonText(e.target.value)}
        className="col-span-2"
      />
      <Label className="font-medium">Button Link</Label>
      <Input
        value={buttonLink}
        onChange={(e) => setButtonLink(e.target.value)}
        className="col-span-2"
      />
      <Label className="font-medium">Button Color</Label>
      <ColorPicker
        value={buttonColor}
        onChange={(color) => setButtonColor(color)}
      />
      <Label className="font-medium">Button Text Color</Label>
      <ColorPicker
        value={buttonTextColor}
        onChange={(color) => setButtonTextColor(color)}
      />
    </div>
  );
}
