"use client";

import ColorPicker from "@/components/dnd-builder/color-picker";
import FileUpload from "@/components/dnd-builder/file-upload";
import { useUser } from "@/stores/use-user";
import { AutosizeTextarea } from "@church-space/ui/auto-size-textarea";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Separator } from "@church-space/ui/separator";
import { Switch } from "@church-space/ui/switch";

interface HeaderFormProps {
  headerBgColor: string;
  headerTextColor: string;
  headerSecondaryTextColor: string;
  headerButtonColor: string;
  headerButtonTextColor: string;
  headerName: string;
  headerTitle: string;
  headerDescription: string;
  headerButtonText: string;
  headerButtonLink: string;
  headerImage: string;
  logoImage: string;
  headerBlur: boolean;
  setHeaderBgColor: (color: string) => void;
  setHeaderTextColor: (color: string) => void;
  setHeaderSecondaryTextColor: (color: string) => void;
  setHeaderButtonColor: (color: string) => void;
  setHeaderButtonTextColor: (color: string) => void;
  setHeaderName: (name: string) => void;
  setHeaderTitle: (title: string) => void;
  setHeaderDescription: (description: string) => void;
  setHeaderButtonText: (buttonText: string) => void;
  setHeaderButtonLink: (buttonLink: string) => void;
  setHeaderImage: (image: string) => void;
  setLogoImage: (image: string) => void;
  setHeaderBlur: (blur: boolean) => void;
}

export default function HeaderForm({
  headerBgColor,
  headerTextColor,
  headerSecondaryTextColor,
  headerButtonColor,
  headerButtonTextColor,
  headerName,
  headerTitle,
  headerDescription,
  headerButtonText,
  headerButtonLink,
  headerImage,
  logoImage,
  headerBlur,
  setHeaderBgColor,
  setHeaderTextColor,
  setHeaderSecondaryTextColor,
  setHeaderButtonColor,
  setHeaderButtonTextColor,
  setHeaderName,
  setHeaderTitle,
  setHeaderDescription,
  setHeaderButtonText,
  setHeaderButtonLink,
  setHeaderImage,
  setLogoImage,
  setHeaderBlur,
}: HeaderFormProps) {
  const { organizationId } = useUser();

  if (!organizationId) return null;

  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <Label className="font-medium">Background Color</Label>
      <ColorPicker
        value={headerBgColor}
        onChange={(color) => setHeaderBgColor(color)}
      />
      <Label className="font-medium">Primary Text Color</Label>
      <ColorPicker
        value={headerTextColor}
        onChange={(color) => setHeaderTextColor(color)}
      />
      <Label className="font-medium">Secondary Text Color</Label>
      <ColorPicker
        value={headerSecondaryTextColor}
        onChange={(color) => setHeaderSecondaryTextColor(color)}
      />
      <Label className="font-medium">Background Image</Label>
      <FileUpload
        organizationId={organizationId || ""}
        onUploadComplete={(path) => setHeaderImage(path)}
        type="image"
        initialFilePath={headerImage}
        onRemove={() => setHeaderImage("")}
        bucket="link-list-assets"
      />

      <Label className="font-medium">Background Blur</Label>
      <div className="col-span-2 flex items-center gap-2">
        <Switch
          checked={headerBlur}
          onCheckedChange={(checked) => setHeaderBlur(checked)}
        />
      </div>

      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Logo</Label>
      <FileUpload
        organizationId={organizationId || ""}
        onUploadComplete={(path) => setLogoImage(path)}
        type="image"
        initialFilePath={logoImage}
        onRemove={() => setLogoImage("")}
        bucket="link-list-assets"
      />
      <Label className="font-medium">Name</Label>
      <Input
        value={headerName}
        onChange={(e) => setHeaderName(e.target.value)}
        className="col-span-2"
      />
      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Title</Label>
      <AutosizeTextarea
        value={headerTitle}
        onChange={(e) => setHeaderTitle(e.target.value)}
        className="col-span-2"
      />
      <Label className="font-medium">Description</Label>
      <AutosizeTextarea
        value={headerDescription}
        onChange={(e) => setHeaderDescription(e.target.value)}
        className="col-span-2"
      />
      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Button Text</Label>
      <Input
        value={headerButtonText}
        onChange={(e) => setHeaderButtonText(e.target.value)}
        className="col-span-2"
      />
      <Label className="font-medium">Button Link</Label>
      <Input
        value={headerButtonLink}
        onChange={(e) => setHeaderButtonLink(e.target.value)}
        className="col-span-2"
      />
      <Label className="font-medium">Button Color</Label>
      <ColorPicker
        value={headerButtonColor}
        onChange={(color) => setHeaderButtonColor(color)}
      />
      <Label className="font-medium">Button Text Color</Label>
      <ColorPicker
        value={headerButtonTextColor}
        onChange={(color) => setHeaderButtonTextColor(color)}
      />
    </div>
  );
}
