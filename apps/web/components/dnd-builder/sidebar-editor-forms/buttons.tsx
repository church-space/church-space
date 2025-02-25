import type { Block, ButtonBlockData } from "@/types/blocks";
import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";
import { useEffect, useState, useRef } from "react";
import { z } from "zod";

interface ButtonFormProps {
  block: Block & { data?: ButtonBlockData };
  onUpdate: (block: Block) => void;
}

export default function ButtonForm({ block, onUpdate }: ButtonFormProps) {
  const [localState, setLocalState] = useState<ButtonBlockData>({
    text: block.data?.text ?? "Button",
    link: block.data?.link || "",
    color: block.data?.color || "#000000",
    textColor: block.data?.textColor || "#FFFFFF",
    style: block.data?.style || "filled",
    size: block.data?.size || "fit",
  });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalState({
      text: block.data?.text ?? "Button",
      link: block.data?.link || "",
      color: block.data?.color || "#000000",
      textColor: block.data?.textColor || "#FFFFFF",
      style: block.data?.style || "filled",
      size: block.data?.size || "fit",
    });
  }, [block.data]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

  const handleChange = (field: string, value: string) => {
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
        const isValid = validateUrl(value);

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
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>Text</Label>
          <Input
            className="col-span-2"
            placeholder="Button text"
            value={localState.text}
            onChange={(e) => handleChange("text", e.target.value)}
          />
          <Label>Link</Label>
          <div className="col-span-2 flex flex-col gap-1">
            <Input
              className={linkError && !isTyping ? "border-red-500" : ""}
              placeholder="https://..."
              value={localState.link}
              onChange={(e) => handleChange("link", e.target.value)}
              onBlur={handleBlur}
            />
            {linkError && !isTyping && (
              <p className="text-xs text-red-500">{linkError}</p>
            )}
          </div>
          <Label>Background</Label>
          <Input
            className="col-span-2"
            type="color"
            value={localState.color}
            onChange={(e) => handleChange("color", e.target.value)}
          />

          {localState.style !== "outline" && (
            <>
              <Label>Text Color</Label>
              <Input
                type="color"
                value={localState.textColor}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="col-span-2"
              />
            </>
          )}
          <Label>Style</Label>
          <Select
            value={localState.style}
            onValueChange={(value) => handleChange("style", value)}
          >
            <SelectTrigger className="col-span-2">
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
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit Content</SelectItem>
              <SelectItem value="full">Full Width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
