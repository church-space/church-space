import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";
import { Switch } from "@trivo/ui/switch";

interface EmailStyleFormProps {
  bgColor?: string;
  onBgColorChange?: (color: string) => void;
  isInset?: boolean;
  onIsInsetChange?: (isInset: boolean) => void;
  emailBgColor?: string;
  onEmailBgColorChange?: (color: string) => void;
}

export default function EmailStyleForm({
  bgColor = "#ffffff",
  onBgColorChange,
  isInset = false,
  onIsInsetChange,
  emailBgColor = "#eeeeee",
  onEmailBgColorChange,
}: EmailStyleFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Email Style</h2>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Blocks BG Color</Label>
        <Input
          className="col-span-2"
          type="color"
          value={bgColor}
          onChange={(e) => onBgColorChange?.(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Inset Email</Label>
        <Switch checked={isInset} onCheckedChange={onIsInsetChange} />
      </div>
      {isInset && (
        <div className="grid grid-cols-3 items-center gap-2">
          <Label className="font-medium">Email BG Color</Label>
          <Input
            className="col-span-2"
            type="color"
            value={emailBgColor}
            onChange={(e) => onEmailBgColorChange?.(e.target.value)}
            disabled={!isInset}
          />
        </div>
      )}
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Default Text Color</Label>
        <Input
          className="col-span-2"
          type="color"
          value={bgColor}
          onChange={(e) => onBgColorChange?.(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Default Font</Label>
        <Select defaultValue="Inter">
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
