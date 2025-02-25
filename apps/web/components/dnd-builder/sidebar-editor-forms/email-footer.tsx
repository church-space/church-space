import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";

interface EmailFooterFormProps {
  footerBgColor?: string;
  footerTextColor?: string;
  footerFont?: string;
  onFooterBgColorChange?: (color: string) => void;
  onFooterTextColorChange?: (color: string) => void;
  onFooterFontChange?: (font: string) => void;
}

export default function EmailFooterForm({
  footerBgColor = "#ffffff",
  footerTextColor = "#000000",
  footerFont = "Inter",
  onFooterBgColorChange,
  onFooterTextColorChange,
  onFooterFontChange,
}: EmailFooterFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Email Footer</h2>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Background Color</Label>
        <Input
          className="col-span-2"
          type="color"
          value={footerBgColor}
          onChange={(e) => onFooterBgColorChange?.(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Text Color</Label>
        <Input
          className="col-span-2"
          type="color"
          value={footerTextColor}
          onChange={(e) => onFooterTextColorChange?.(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Font</Label>
        <Select
          value={footerFont}
          onValueChange={(value) => onFooterFontChange?.(value)}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
