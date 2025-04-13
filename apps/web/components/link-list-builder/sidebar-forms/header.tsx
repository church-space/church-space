"use client";

import { useRef, useState, useEffect } from "react";
import { z } from "zod";
import ColorPicker from "@/components/dnd-builder/color-picker";
import FileUpload from "@/components/dnd-builder/file-upload";
import { useUser } from "@/stores/use-user";
import { AutosizeTextarea } from "@church-space/ui/auto-size-textarea";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Separator } from "@church-space/ui/separator";
import { Switch } from "@church-space/ui/switch";

interface HeaderFormProps {
  headerBgColor: string;
  headerTextColor: string;
  headerSecondaryTextColor: string;
  headerButtonColor: string;
  headerButtonTextColor: string;
  headerName: string;
  headerTitle: string;
  headerDescription: string;
  headerButtonText: string;
  headerButtonLink: string;
  headerImage: string;
  logoImage: string;
  headerBlur: boolean;
  setHeaderBgColor: (color: string) => void;
  setHeaderTextColor: (color: string) => void;
  setHeaderSecondaryTextColor: (color: string) => void;
  setHeaderButtonColor: (color: string) => void;
  setHeaderButtonTextColor: (color: string) => void;
  setHeaderName: (name: string) => void;
  setHeaderTitle: (title: string) => void;
  setHeaderDescription: (description: string) => void;
  setHeaderButtonText: (buttonText: string) => void;
  setHeaderButtonLink: (buttonLink: string) => void;
  setHeaderImage: (image: string) => void;
  setLogoImage: (image: string) => void;
  setHeaderBlur: (blur: boolean) => void;
}

export default function HeaderForm({
  headerBgColor,
  headerTextColor,
  headerSecondaryTextColor,
  headerButtonColor,
  headerButtonTextColor,
  headerName,
  headerTitle,
  headerDescription,
  headerButtonText,
  headerButtonLink,
  headerImage,
  logoImage,
  headerBlur,
  setHeaderBgColor,
  setHeaderTextColor,
  setHeaderSecondaryTextColor,
  setHeaderButtonColor,
  setHeaderButtonTextColor,
  setHeaderName,
  setHeaderTitle,
  setHeaderDescription,
  setHeaderButtonText,
  setHeaderButtonLink,
  setHeaderImage,
  setLogoImage,
  setHeaderBlur,
}: HeaderFormProps) {
  const { organizationId } = useUser();

  // Local state for form values
  const [localName, setLocalName] = useState(headerName);
  const [localTitle, setLocalTitle] = useState(headerTitle);
  const [localDescription, setLocalDescription] = useState(headerDescription);
  const [localButtonText, setLocalButtonText] = useState(headerButtonText);
  const [localButtonLink, setLocalButtonLink] = useState(headerButtonLink);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Define the Zod schema for URL validation
  const urlSchema = z.string().superRefine((url, ctx) => {
    // Empty string is valid
    if (url === "") return;

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

  const validateUrl = (url: string): boolean => {
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

  const handleButtonLinkChange = (value: string) => {
    // Remove any spaces from the input
    const valueWithoutSpaces = value.replace(/\s/g, "");
    setLocalButtonLink(valueWithoutSpaces);
    setIsTyping(true);

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer to validate after typing stops
    debounceTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      const isValid = validateUrl(valueWithoutSpaces);

      // Only update parent if valid
      if (isValid) {
        handleTextChange("headerButtonLink", valueWithoutSpaces);
      }
    }, 800); // 800ms debounce
  };

  const handleButtonLinkBlur = () => {
    // When input loses focus, clear typing state and validate
    if (isTyping) {
      setIsTyping(false);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const isValid = validateUrl(localButtonLink);
      if (isValid) {
        handleTextChange("headerButtonLink", localButtonLink);
      }
    }
  };

  // Update local state when props change
  useEffect(() => {
    setLocalName(headerName);
    setLocalTitle(headerTitle);
    setLocalDescription(headerDescription);
    setLocalButtonText(headerButtonText);
    setLocalButtonLink(headerButtonLink);
  }, [
    headerName,
    headerTitle,
    headerDescription,
    headerButtonText,
    headerButtonLink,
  ]);

  // Debounced color update handlers
  const updateTimerRef = useRef<Record<string, NodeJS.Timeout | null>>({});

  // Handles debounced updates for text fields
  const handleTextChange = (field: string, value: string) => {
    // Store the current value for this field to use in the timeout closure
    const currentValue = value;

    // Clear any existing timer
    if (updateTimerRef.current[field]) {
      clearTimeout(updateTimerRef.current[field]);
    }

    // Set a new timer to update parent state after delay
    updateTimerRef.current[field] = setTimeout(() => {
      switch (field) {
        case "headerName":
          setHeaderName(currentValue);
          break;
        case "headerTitle":
          setHeaderTitle(currentValue);
          break;
        case "headerDescription":
          setHeaderDescription(currentValue);
          break;
        case "headerButtonText":
          setHeaderButtonText(currentValue);
          break;
        case "headerButtonLink":
          setHeaderButtonLink(currentValue);
          break;
      }
    }, 500); // 500ms debounce
  };

  // Handles debounced updates for color fields
  const handleColorChange = (field: string, value: string) => {
    // Store the current color for this field to use in the timeout closure
    const currentColor = value;

    // Clear any existing timer
    if (updateTimerRef.current[field]) {
      clearTimeout(updateTimerRef.current[field]);
    }

    // Set a new timer to update parent state after delay
    updateTimerRef.current[field] = setTimeout(() => {
      switch (field) {
        case "headerBgColor":
          setHeaderBgColor(currentColor);
          break;
        case "headerTextColor":
          setHeaderTextColor(currentColor);
          break;
        case "headerSecondaryTextColor":
          setHeaderSecondaryTextColor(currentColor);
          break;
        case "headerButtonColor":
          // Ensure button color changes are properly captured and saved
          if (setHeaderButtonColor) {
            setHeaderButtonColor(currentColor);
          }
          break;
        case "headerButtonTextColor":
          // Ensure button text color changes are properly captured and saved
          if (setHeaderButtonTextColor) {
            setHeaderButtonTextColor(currentColor);
          }
          break;
      }
    }, 300); // 300ms debounce for colors
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimerRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!organizationId) return null;

  return (
    <div className="grid grid-cols-3 items-center gap-2 pb-12 pr-1">
      <Label className="font-medium">Background Color</Label>
      <ColorPicker
        value={headerBgColor}
        onChange={(color) => handleColorChange("headerBgColor", color)}
      />
      <Label className="font-medium">Primary Text Color</Label>
      <ColorPicker
        value={headerTextColor}
        onChange={(color) => handleColorChange("headerTextColor", color)}
      />
      <Label className="font-medium">Secondary Text Color</Label>
      <ColorPicker
        value={headerSecondaryTextColor}
        onChange={(color) =>
          handleColorChange("headerSecondaryTextColor", color)
        }
      />
      <Label className="font-medium">Background Image</Label>
      <FileUpload
        organizationId={organizationId || ""}
        onUploadComplete={(path) => setHeaderImage(path)}
        type="image"
        initialFilePath={headerImage}
        onRemove={() => setHeaderImage("")}
        bucket="link-list-assets"
      />
      {headerImage && (
        <>
          <Label className="font-medium">Background Blur</Label>
          <div className="col-span-2 flex items-center gap-2">
            <Switch
              checked={headerBlur}
              onCheckedChange={(checked) => setHeaderBlur(checked)}
            />
          </div>
        </>
      )}
      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Logo</Label>
      <FileUpload
        organizationId={organizationId || ""}
        onUploadComplete={(path) => setLogoImage(path)}
        type="image"
        initialFilePath={logoImage}
        onRemove={() => setLogoImage("")}
        bucket="link-list-assets"
      />
      <Label className="font-medium">Name</Label>
      <Input
        value={localName}
        onChange={(e) => {
          setLocalName(e.target.value);
          handleTextChange("headerName", e.target.value);
        }}
        className="col-span-2 bg-background"
        placeholder="Name"
        maxLength={80}
      />
      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Title</Label>
      <AutosizeTextarea
        value={localTitle}
        onChange={(e) => {
          setLocalTitle(e.target.value);
          handleTextChange("headerTitle", e.target.value);
        }}
        className="col-span-2"
        placeholder="Title"
        maxLength={1000}
      />
      <Label className="font-medium">Description</Label>
      <AutosizeTextarea
        value={localDescription}
        onChange={(e) => {
          setLocalDescription(e.target.value);
          handleTextChange("headerDescription", e.target.value);
        }}
        className="col-span-2"
        placeholder="Description"
        maxLength={1000}
      />
      <Separator className="col-span-3 my-4" />
      <Label className="font-medium">Button Text</Label>
      <Input
        value={localButtonText}
        onChange={(e) => {
          setLocalButtonText(e.target.value);
          handleTextChange("headerButtonText", e.target.value);
        }}
        className="col-span-2 bg-background"
        placeholder="Button Text"
        maxLength={120}
      />
      <Label className="font-medium">Button Link</Label>
      <div className="col-span-2">
        <Input
          value={localButtonLink}
          onChange={(e) => handleButtonLinkChange(e.target.value)}
          onBlur={handleButtonLinkBlur}
          placeholder="https://www.example.com"
          className={`w-full bg-background ${linkError && !isTyping ? "border-red-500" : ""}`}
          maxLength={500}
        />
        {linkError && !isTyping && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {linkError}
          </p>
        )}
      </div>
      <Label className="font-medium">Button Color</Label>
      <ColorPicker
        value={headerButtonColor}
        onChange={(color) => handleColorChange("headerButtonColor", color)}
      />
      <Label className="font-medium">Button Text Color</Label>
      <ColorPicker
        value={headerButtonTextColor}
        onChange={(color) => handleColorChange("headerButtonTextColor", color)}
      />
    </div>
  );
}
