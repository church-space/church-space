import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";
import { Switch } from "@trivo/ui/switch";
import ColorPicker from "../color-picker";

interface EmailStyleFormProps {
  bgColor?: string;
  onBgColorChange?: (color: string) => void;
  isInset?: boolean;
  onIsInsetChange?: (isInset: boolean) => void;
  emailBgColor?: string;
  onEmailBgColorChange?: (color: string) => void;
  defaultTextColor?: string;
  onDefaultTextColorChange?: (color: string) => void;
  defaultFont?: string;
  onDefaultFontChange?: (font: string) => void;
}

export default function EmailStyleForm({
  bgColor = "#ffffff",
  onBgColorChange,
  isInset = false,
  onIsInsetChange,
  emailBgColor = "#eeeeee",
  onEmailBgColorChange,
  defaultTextColor = "#000000",
  onDefaultTextColorChange,
  defaultFont = "Inter",
  onDefaultFontChange,
}: EmailStyleFormProps) {
  return (
    <div className="flex flex-col gap-4 pr-1">
      <h2 className="text-lg font-semibold">Email Style</h2>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Blocks BG Color</Label>

        <ColorPicker
          value={bgColor}
          onChange={(color) => onBgColorChange?.(color)}
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Inset Email</Label>
        <Switch checked={isInset} onCheckedChange={onIsInsetChange} />
      </div>
      {isInset && (
        <div className="grid grid-cols-3 items-center gap-2">
          <Label className="font-medium">Email BG Color</Label>

          <ColorPicker
            value={emailBgColor}
            onChange={(color) => onEmailBgColorChange?.(color)}
          />
        </div>
      )}
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Default Text Color</Label>

        <ColorPicker
          value={defaultTextColor}
          onChange={(color) => onDefaultTextColorChange?.(color)}
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Default Font</Label>
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
    </div>
  );
}
