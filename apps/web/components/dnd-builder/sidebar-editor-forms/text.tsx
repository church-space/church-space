import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { InfoIcon } from "lucide-react";
import ColorPicker from "../color-picker";

interface TextFormProps {
  defaultTextColor?: string;
  onDefaultTextColorChange?: (color: string) => void;
  defaultFont?: string;
  onDefaultFontChange?: (font: string) => void;
  linkColor?: string;
  onLinkColorChange?: (color: string) => void;
}

export default function TextForm({
  defaultTextColor = "#000000",
  onDefaultTextColorChange,
  defaultFont = "sans-serif",
  onDefaultFontChange,
  linkColor = "#0000ff",
  onLinkColorChange,
}: TextFormProps) {
  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Details</Label>
        </div>
        <div className="grid grid-cols-3 items-center gap-2">
          <Label className="font-medium">Text Color</Label>

          <ColorPicker
            value={defaultTextColor}
            onChange={(color) => onDefaultTextColorChange?.(color)}
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-2">
          <Label className="font-medium">Link Color</Label>

          <ColorPicker
            value={linkColor}
            onChange={(color) => onLinkColorChange?.(color)}
          />
        </div>

        <div className="grid grid-cols-3 items-center gap-2">
          <Label className="font-medium">Font</Label>
          <Select value={defaultFont} onValueChange={onDefaultFontChange}>
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans-serif">Sans Serif</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="monospace">Monospace</SelectItem>
              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-md border bg-accent p-3 text-muted-foreground">
          <InfoIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <p>
              Add your content to the text block, and make changes to the
              formatting using the toolbar above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
