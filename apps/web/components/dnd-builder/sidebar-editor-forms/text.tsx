import { Label } from "@trivo/ui/label";
import ColorPicker from "../color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";

interface TextFormProps {
  defaultTextColor?: string;
  onDefaultTextColorChange?: (color: string) => void;
  defaultFont?: string;
  onDefaultFontChange?: (font: string) => void;
}

export default function TextForm({
  defaultTextColor = "#000000",
  onDefaultTextColorChange,
  defaultFont = "sans-serif",
  onDefaultFontChange,
}: TextFormProps) {
  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 items-center gap-2">
          <Label className="font-medium">Text Color</Label>

          <ColorPicker
            value={defaultTextColor}
            onChange={(color) => onDefaultTextColorChange?.(color)}
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
        <div className="text-sm text-muted-foreground">
          Add your content to the text block, and make chagnes to the formating
          using the toolbar above.
        </div>
      </div>
    </div>
  );
}
