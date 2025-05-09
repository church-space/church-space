import type { Block, ButtonBlockData } from "@/types/blocks";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { Switch } from "@church-space/ui/switch";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import ColorPicker from "../color-picker";
import { Button } from "@church-space/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { CircleInfo } from "@church-space/ui/icons";

interface ButtonFormProps {
  block: Block & { data?: ButtonBlockData };
  onUpdate: (block: Block) => void;
  onApplyToAllButtons: () => void;
}

export default function ButtonForm({
  block,
  onUpdate,
  onApplyToAllButtons,
}: ButtonFormProps) {
  const [localState, setLocalState] = useState<ButtonBlockData>({
    text: block.data?.text ?? "Button",
    link: block.data?.link || "",
    color: block.data?.color || "#000000",
    textColor: block.data?.textColor || "#FFFFFF",
    style: block.data?.style || "filled",
    size: block.data?.size || "fit",
    centered: block.data?.centered ?? true,
  });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Create a ref to store the latest state for the debounced function
  const stateRef = useRef(localState);

  // Update the ref whenever localState changes
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);

  useEffect(() => {
    setLocalState({
      text: block.data?.text ?? "Button",
      link: block.data?.link || "",
      color: block.data?.color || "#000000",
      textColor: block.data?.textColor || "#FFFFFF",
      style: block.data?.style || "filled",
      size: block.data?.size || "fit",
      centered: block.data?.centered ?? true,
    });
  }, [block.data]);

  // URL validation schema using Zod
  const urlSchema = z.string().superRefine((url, ctx) => {
    // Empty string is valid
    if (url === "") return;

    // Check for spaces
    if (url.trim() !== url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL cannot contain spaces",
      });
      return;
    }

    // Allow mailto links
    if (url.startsWith("mailto:")) {
      return;
    }

    // Domain and TLD pattern without requiring https://
    const urlPattern =
      /^(https?:\/\/)?[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(\/.*)?$/;
    if (!urlPattern.test(url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Please enter a valid URL with a domain and top-level domain (e.g., example.com)",
      });
      return;
    }
  });

  const validateUrl = (url: string) => {
    try {
      urlSchema.parse(url);
      setLinkError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setLinkError(error.errors[0].message);
        return false;
      }
      return true;
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    const newState = {
      ...localState,
      [field]: value,
    };

    // For link field, handle typing state
    if (field === "link") {
      setIsTyping(true);
      setLocalState(newState);

      // Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new timer to validate after typing stops
      debounceTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        const isValid = validateUrl(value as string);

        // Only update parent if valid
        if (isValid) {
          onUpdate({
            ...block,
            data: newState,
          });
        }
      }, 800); // 800ms debounce
    } else {
      // For other fields, update immediately
      setLocalState(newState);
      onUpdate({
        ...block,
        data: newState,
      });
    }
  };

  const handleBlur = () => {
    // When input loses focus, clear typing state and validate
    if (isTyping) {
      setIsTyping(false);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const isValid = validateUrl(localState.link);
      if (isValid) {
        onUpdate({
          ...block,
          data: localState,
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Details</Label>
        </div>
        <div className="grid grid-cols-3 items-center gap-x-2 gap-y-4">
          <Label>Text</Label>
          <Input
            className="col-span-2 bg-background"
            placeholder="Button text"
            value={localState.text}
            onChange={(e) => handleChange("text", e.target.value)}
            maxLength={100}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Label className="flex items-center gap-1">
                Link <CircleInfo />
              </Label>
            </TooltipTrigger>
            <TooltipContent>
              Link to a webpage when someone clicks on the button.
            </TooltipContent>
          </Tooltip>
          <div className="col-span-2 flex flex-col gap-1">
            <Input
              className={
                linkError && !isTyping
                  ? "border-red-500 bg-background"
                  : "bg-background"
              }
              placeholder="https://..."
              value={localState.link}
              onChange={(e) => handleChange("link", e.target.value)}
              onBlur={handleBlur}
              maxLength={500}
            />
            {linkError && !isTyping && (
              <p className="text-xs text-red-500">{linkError}</p>
            )}
          </div>
          <Label>Button Color</Label>
          <ColorPicker
            value={localState.color}
            onChange={(color) => handleChange("color", color)}
          />

          {localState.style !== "outline" && (
            <>
              <Label>Text Color</Label>

              <ColorPicker
                value={localState.textColor}
                onChange={(color) => handleChange("textColor", color)}
              />
            </>
          )}
          <Label>Style</Label>
          <Select
            value={localState.style}
            onValueChange={(value) => handleChange("style", value)}
          >
            <SelectTrigger className="col-span-2 bg-background">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
          <Label>Size</Label>
          <Select
            value={localState.size}
            onValueChange={(value) => handleChange("size", value)}
          >
            <SelectTrigger className="col-span-2 bg-background">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit Content</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="full">Full Width</SelectItem>
            </SelectContent>
          </Select>
          {localState.size !== "full" && (
            <>
              <Label>Centered</Label>
              <Switch
                checked={localState.centered}
                onCheckedChange={(checked) => handleChange("centered", checked)}
              />
            </>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={onApplyToAllButtons}
            >
              Apply style to all buttons
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Apply the current style of this button to all buttons in the email.
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
