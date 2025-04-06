import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { Switch } from "@church-space/ui/switch";
import ColorPicker from "../color-picker";
import { Separator } from "@church-space/ui/separator";
import { CircleInfo } from "@church-space/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";

interface EmailStyleFormProps {
  bgColor?: string;
  onBgColorChange?: (color: string) => void;
  isInset?: boolean;
  onIsInsetChange?: (isInset: boolean) => void;
  isRounded?: boolean;
  onIsRoundedChange?: (isRounded: boolean) => void;
  emailBgColor?: string;
  onEmailBgColorChange?: (color: string) => void;
  defaultTextColor?: string;
  onDefaultTextColorChange?: (color: string) => void;
  defaultFont?: string;
  onDefaultFontChange?: (font: string) => void;
  linkColor?: string;
  onLinkColorChange?: (color: string) => void;
  accentTextColor?: string;
  onAccentTextColorChange?: (color: string) => void;
}

export default function EmailStyleForm({
  bgColor = "#ffffff",
  onBgColorChange,
  isInset = false,
  onIsInsetChange,
  isRounded = false,
  onIsRoundedChange,
  emailBgColor = "#eeeeee",
  onEmailBgColorChange,
  defaultTextColor = "#000000",
  onDefaultTextColorChange,
  defaultFont = "sans-serif",
  onDefaultFontChange,
  linkColor = "#0000ff",
  onLinkColorChange,
  accentTextColor = "#666666",
  onAccentTextColorChange,
}: EmailStyleFormProps) {
  return (
    <div className="flex flex-col gap-4 pr-1">
      <h2 className="text-lg font-semibold">Email Style</h2>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Inset Email</Label>
        <Switch checked={isInset} onCheckedChange={onIsInsetChange} />
      </div>
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">
          {isInset ? "Content BG Color" : "Background Color"}
        </Label>

        <ColorPicker
          value={bgColor}
          onChange={(color) => onBgColorChange?.(color)}
        />
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
        <Label className="font-medium">Rounded Corners</Label>
        <Switch checked={isRounded} onCheckedChange={onIsRoundedChange} />
      </div>
      <Separator className="my-4" />
      <Label className="text-lg font-semibold">Text</Label>
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
        <Label className="font-medium">Accent Text Color</Label>
        <ColorPicker
          value={accentTextColor}
          onChange={(color) => onAccentTextColorChange?.(color)}
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="flex items-center gap-1">
              Font <CircleInfo />
            </Label>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              Custom fonts are not support in most major email clients, so we do
              not support them at this time.
            </p>
          </TooltipContent>
        </Tooltip>

        <Select value={defaultFont} onValueChange={onDefaultFontChange}>
          <SelectTrigger
            className="col-span-2 bg-background"
            style={{ fontFamily: defaultFont }}
          >
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sans-serif" style={{ fontFamily: "sans-serif" }}>
              Sans Serif
            </SelectItem>
            <SelectItem value="serif" style={{ fontFamily: "serif" }}>
              Serif
            </SelectItem>

            <SelectItem
              value="Arial, sans-serif"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Arial
            </SelectItem>
            <SelectItem
              value="Georgia, serif"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Georgia
            </SelectItem>
            <SelectItem
              value="Verdana, sans-serif"
              style={{ fontFamily: "Verdana, sans-serif" }}
            >
              Verdana
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
