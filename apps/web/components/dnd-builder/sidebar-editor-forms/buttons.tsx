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
import { useEffect, useState, useRef, useCallback } from "react";
import { z } from "zod";
import debounce from "lodash/debounce";
import ColorPicker from "../color-picker";

interface ButtonFormProps {
  block: Block & { data?: ButtonBlockData };
  onUpdate: (block: Block, addToHistory?: boolean) => void;
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
    });
  }, [block.data]);

  // Create a debounced function that only updates the history
  const debouncedHistoryUpdate = useCallback(
    debounce(() => {
      // Add to history
      onUpdate(
        {
          ...block,
          data: stateRef.current,
        },
        true
      );
    }, 500),
    [block, onUpdate]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debouncedHistoryUpdate.cancel();
    };
  }, [debouncedHistoryUpdate]);

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
          // Update UI immediately without adding to history
          onUpdate(
            {
              ...block,
              data: newState,
            },
            false
          );

          // Debounce the history update
          debouncedHistoryUpdate();
        }
      }, 800); // 800ms debounce
    } else {
      // For other fields, update immediately
      setLocalState(newState);

      // Update UI immediately without adding to history
      onUpdate(
        {
          ...block,
          data: newState,
        },
        false
      );

      // Debounce the history update
      debouncedHistoryUpdate();
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
        // Update UI immediately without adding to history
        onUpdate(
          {
            ...block,
            data: localState,
          },
          false
        );

        // Debounce the history update
        debouncedHistoryUpdate();
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
