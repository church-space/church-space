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
import { Slider } from "@church-space/ui/slider";
import { useRef, useState, useEffect } from "react";

interface EmailStyleFormProps {
  bgColor?: string;
  onBgColorChange?: (color: string) => void;
  isInset?: boolean;
  onIsInsetChange?: (isInset: boolean) => void;
  cornerRadius?: number;
  onCornerRadiusChange?: (cornerRadius: number) => void;
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
  blockSpacing?: number;
  onBlockSpacingChange?: (spacing: number) => void;
  footerTextColor?: string;
  onFooterTextColorChange?: (color: string) => void;
  footerSecondaryTextColor?: string;
  onFooterSecondaryTextColorChange?: (color: string) => void;
  footerData?: any;
  onFooterChange?: (data: any) => void;
}

export default function EmailStyleForm({
  bgColor = "#ffffff",
  onBgColorChange,
  isInset = false,
  onIsInsetChange,
  cornerRadius = 0,
  onCornerRadiusChange,
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
  blockSpacing = 20,
  onBlockSpacingChange,
  footerData,
  onFooterChange,
}: EmailStyleFormProps) {
  const colorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for footer properties
  const [localState, setLocalState] = useState({
    text_color: footerData?.text_color || "#000000",
    secondary_text_color: footerData?.secondary_text_color || "#666666",
  });

  // Update local state when footerData changes
  useEffect(() => {
    if (footerData) {
      setLocalState({
        text_color: footerData.text_color || "#000000",
        secondary_text_color: footerData.secondary_text_color || "#666666",
      });
    }
  }, [footerData]);

  // Handle color changes for footer styling
  const handleColorChange = (key: string, value: string) => {
    // Update local state immediately for responsive UI
    setLocalState((prev) => ({ ...prev, [key]: value }));

    // Clear any existing timer
    if (colorTimerRef.current) {
      clearTimeout(colorTimerRef.current);
    }

    // Set a new timer to update parent after user stops moving
    colorTimerRef.current = setTimeout(() => {
      if (onFooterChange) {
        onFooterChange({ ...footerData, [key]: value });
      }
    }, 150);
  };

  // Cleanup color timer on unmount
  useEffect(() => {
    return () => {
      if (colorTimerRef.current) {
        clearTimeout(colorTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 pr-1">
      <h2 className="text-lg font-semibold">Email Style</h2>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Card Style</Label>
        <Switch checked={isInset} onCheckedChange={onIsInsetChange} />
      </div>
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">
          {isInset ? "Card Color" : "Background"}
        </Label>

        <ColorPicker
          value={bgColor}
          onChange={(color) => onBgColorChange?.(color)}
        />
      </div>

      {isInset && (
        <div className="grid grid-cols-3 items-center gap-2">
          <Label className="font-medium">Background</Label>

          <ColorPicker
            value={emailBgColor}
            onChange={(color) => onEmailBgColorChange?.(color)}
          />
        </div>
      )}
      <div className="my-2 grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Rounded Corners</Label>
        <Slider
          max={100}
          min={0}
          step={1}
          value={[cornerRadius]}
          onValueChange={(value) => onCornerRadiusChange?.(value[0])}
          className="col-span-2"
        />
      </div>
      <div className="my-2 grid grid-cols-3 items-center gap-2">
        <Label>Block Spacing</Label>
        <Slider
          max={100}
          min={10}
          step={1}
          className="col-span-2"
          value={[blockSpacing]}
          onValueChange={(value) => onBlockSpacingChange?.(value[0])}
        />
      </div>
      <Separator className="my-4" />
      <Label className="text-lg font-semibold">Text</Label>
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
            <SelectItem
              value="'Courier New', monospace"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              Courier New
            </SelectItem>
            <SelectItem
              value="Helvetica, Arial, sans-serif"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Helvetica
            </SelectItem>
            <SelectItem
              value="'Lucida Sans Unicode', 'Lucida Grande', sans-serif"
              style={{
                fontFamily:
                  "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
              }}
            >
              Lucida Sans Unicode
            </SelectItem>
            <SelectItem
              value="Tahoma, Geneva, sans-serif"
              style={{ fontFamily: "Tahoma, Geneva, sans-serif" }}
            >
              Tahoma
            </SelectItem>
            <SelectItem
              value="'Times New Roman', Times, serif"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              Times New Roman
            </SelectItem>
            <SelectItem
              value="'Trebuchet MS', Helvetica, sans-serif"
              style={{ fontFamily: "'Trebuchet MS', Helvetica, sans-serif" }}
            >
              Trebuchet MS
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Text</Label>

        <ColorPicker
          value={defaultTextColor}
          onChange={(color) => onDefaultTextColorChange?.(color)}
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Accent Text</Label>
        <ColorPicker
          value={accentTextColor}
          onChange={(color) => onAccentTextColorChange?.(color)}
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Links</Label>

        <ColorPicker
          value={linkColor}
          onChange={(color) => onLinkColorChange?.(color)}
        />
      </div>

      <Separator className="my-4" />
      <Label className="text-lg font-semibold">Footer</Label>
      <div className="grid grid-cols-3 items-center gap-2">
        {!isInset && (
          <>
            <Label className="font-medium">Footer Background</Label>
            <ColorPicker
              value={footerData?.bg_color || "#ffffff"}
              onChange={(color) => handleColorChange("bg_color", color)}
            />
          </>
        )}
        <Label className="font-medium">Footer Title</Label>
        <ColorPicker
          value={localState.text_color}
          onChange={(color) => handleColorChange("text_color", color)}
        />

        <Label className="font-medium">Footer Text</Label>
        <ColorPicker
          value={localState.secondary_text_color}
          onChange={(color) => handleColorChange("secondary_text_color", color)}
        />
      </div>
    </div>
  );
}
