import ColorPicker from "@/components/dnd-builder/color-picker";
import { Button } from "@church-space/ui/button";
import { LinkIcon, MailFilled, XIcon } from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { useRef, useState, useEffect } from "react";
import { z } from "zod";
import { Link } from "../link-list-builder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";

interface LinksFormProps {
  links: Link[];
  buttonColor: string;
  buttonTextColor: string;
  bgColor: string;
  setLinks: (links: Link[]) => void;
  setButtonColor: (color: string) => void;
  setButtonTextColor: (color: string) => void;
  setBgColor: (color: string) => void;
}

export default function LinksForm({
  links,
  buttonColor,
  buttonTextColor,
  bgColor,
  setLinks,
  setButtonColor,
  setButtonTextColor,
  setBgColor,
}: LinksFormProps) {
  // Track validation errors for links
  const [linkErrors, setLinkErrors] = useState<Record<number, string | null>>(
    {},
  );
  // Track which links are currently being typed
  const [typingLinks, setTypingLinks] = useState<Record<number, boolean>>({});
  // Debounce timers for link validation
  const linkTimersRef = useRef<Record<number, NodeJS.Timeout | null>>({});
  // Local links state for UI rendering
  const [localLinks, setLocalLinks] = useState(links);
  // Accordion open state
  const [openLink, setOpenLink] = useState<string | undefined>(undefined);

  // Debounced color update handlers
  const colorUpdateTimerRef = useRef<Record<string, NodeJS.Timeout | null>>({});

  // Sync local links with props when props change
  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

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

  // Email validation schema
  const emailSchema = z.string().superRefine((email, ctx) => {
    // Empty string is valid
    if (email === "") return;

    // Check for spaces
    if (email.trim() !== email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email cannot contain spaces",
      });
      return;
    }

    // Email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address",
      });
      return;
    }
  });

  // Validate URL or email based on type type
  const validateLink = (
    value: string,
    type: string,
    index: number,
  ): boolean => {
    try {
      if (type === "mail") {
        emailSchema.parse(value);
      } else {
        urlSchema.parse(value);
      }

      // Clear error if validation passes
      setLinkErrors((prev) => ({ ...prev, [index]: null }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set error message
        setLinkErrors((prev) => ({
          ...prev,
          [index]: error.errors[0].message,
        }));
        return false;
      }
      return true;
    }
  };

  // Handle field updates with optimistic UI and batched parent state updates
  const updateLink = (index: number, field: keyof Link, value: string) => {
    // Create updated links array
    const newLinks = [...localLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };

    // Update local state immediately for responsive UI
    setLocalLinks(newLinks);

    // For URL field, validate but don't immediately update parent
    if (field === "url") {
      // Mark this link as being typed
      setTypingLinks((prev) => ({ ...prev, [index]: true }));

      // Clear any existing timer
      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
      }

      // Set a new timer to validate after typing stops
      linkTimersRef.current[index] = setTimeout(() => {
        // Clear typing flag
        setTypingLinks((prev) => ({ ...prev, [index]: false }));

        // IMPORTANT: Use the current newLinks (not stale localLinks)
        // Validate the URL/email value
        validateLink(newLinks[index].url, newLinks[index].type, index);

        // Only update parent after typing has stopped
        setLinks(newLinks);
      }, 800);
    } else {
      // For non-URL fields, still debounce parent updates
      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
      }

      linkTimersRef.current[index] = setTimeout(() => {
        // Clear typing flag
        setTypingLinks((prev) => ({ ...prev, [index]: false }));

        // IMPORTANT: Use the current newLinks (not stale localLinks)
        // Only update parent after typing has stopped
        setLinks(newLinks);
      }, 400);
    }

    // DO NOT update parent state on every keystroke - this would cause thousands of writes
  };

  // Handle input blur events for URL/email fields
  const handleLinkBlur = (index: number) => {
    // If this link was being typed
    if (typingLinks[index]) {
      // Clear typing state
      setTypingLinks((prev) => ({ ...prev, [index]: false }));

      // Clear any pending timer
      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
        linkTimersRef.current[index] = null;
      }

      // Get a fresh reference to the current link state
      const currentLinks = [...localLinks];
      const link = currentLinks[index];

      // Validate the URL/email value
      const isValid = validateLink(link.url, link.type, index);

      // Only update parent state on blur if valid
      if (isValid) {
        setLinks(currentLinks);
      }
    }
  };

  // Add a new empty link
  const addLink = () => {
    if (localLinks.length < 50) {
      // Create new links array with added empty link
      const newLinks = [...localLinks, { type: "website", url: "", text: "" }];

      // Update local state for immediate UI feedback
      setLocalLinks(newLinks);

      // Update parent state - this is a deliberate user action (not a keystroke)
      // so it's appropriate to trigger a state update
      setLinks(newLinks);
    }
  };

  // Remove a link at specified index
  const removeLink = (index: number) => {
    // Create new links array without the removed link
    const newLinks = localLinks.filter((_, i) => i !== index);

    // Update local state for immediate UI feedback
    setLocalLinks(newLinks);

    // Update parent state - this is a deliberate user action (not a keystroke)
    // so it's appropriate to trigger a state update
    setLinks(newLinks);

    // Clean up associated state
    setLinkErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    // Clear any pending timer
    if (linkTimersRef.current[index]) {
      clearTimeout(linkTimersRef.current[index]);
      delete linkTimersRef.current[index];
    }
  };

  const handleColorChange = (colorField: string, color: string) => {
    // Store the current color to use in the timeout closure
    const currentColor = color;

    // Clear any existing timer
    if (colorUpdateTimerRef.current[colorField]) {
      clearTimeout(colorUpdateTimerRef.current[colorField]);
    }

    // Set a new timer to update parent state after delay
    colorUpdateTimerRef.current[colorField] = setTimeout(() => {
      switch (colorField) {
        case "bgColor":
          setBgColor(currentColor);
          break;
        case "buttonColor":
          setButtonColor(currentColor);
          break;
        case "buttonTextColor":
          setButtonTextColor(currentColor);
          break;
      }
    }, 300); // Short delay for color updates
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      // Clear any color update timers
      Object.values(colorUpdateTimerRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });

      // Clear any link timers
      Object.values(linkTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  return (
    <div className="flex flex-col gap-8 px-1">
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Background Color</Label>
        <ColorPicker
          value={bgColor}
          onChange={(color) => handleColorChange("bgColor", color)}
        />
        <Label className="font-medium">Button Color</Label>
        <ColorPicker
          value={buttonColor}
          onChange={(color) => handleColorChange("buttonColor", color)}
        />
        <Label className="font-medium">Button Text Color</Label>
        <ColorPicker
          value={buttonTextColor}
          onChange={(color) => handleColorChange("buttonTextColor", color)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Links</Label>
          <Button
            variant="outline"
            onClick={addLink}
            disabled={localLinks.length >= 50}
          >
            Add Link
          </Button>
        </div>
        <Accordion
          type="single"
          collapsible
          value={openLink}
          onValueChange={setOpenLink}
          className="space-y-2"
        >
          {localLinks.map((link, index) => (
            <AccordionItem key={index} value={index.toString()}>
              <AccordionTrigger>
                {link.text ? link.text : `Link ${index + 1}`}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 items-center gap-x-2 gap-y-2 py-1 pr-1">
                  <Label>Type</Label>
                  <div className="col-span-2 flex">
                    <Select
                      value={link.type}
                      onValueChange={(value) =>
                        updateLink(index, "type", value)
                      }
                    >
                      <SelectTrigger className="rounded-r-none">
                        <SelectValue placeholder="type" />
                      </SelectTrigger>
                      <SelectContent className="min-w-20">
                        <SelectItem value="website">
                          <div className="flex flex-row gap-2">
                            <LinkIcon height={"20"} width={"20"} /> Website
                          </div>
                        </SelectItem>
                        <SelectItem value="mail">
                          <div className="flex flex-row gap-2">
                            <MailFilled height={"20"} width={"20"} /> Email
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => removeLink(index)}
                          size="icon"
                          className="rounded-l-none border-l-0"
                        >
                          <XIcon height={"20"} width={"20"} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remove Link</TooltipContent>
                    </Tooltip>
                  </div>
                  <Label>Text</Label>
                  <Input
                    className="col-span-2"
                    value={link.text}
                    onChange={(e) => updateLink(index, "text", e.target.value)}
                    placeholder="Link text"
                  />
                  <Label>{link.type === "mail" ? "Email" : "URL"}</Label>
                  <div className="col-span-2 flex flex-col gap-1">
                    <Input
                      className={
                        linkErrors[index] && !typingLinks[index]
                          ? "border-red-500"
                          : ""
                      }
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                      onBlur={() => handleLinkBlur(index)}
                      placeholder={
                        link.type === "mail" ? "email@example.com" : "https://"
                      }
                    />
                    {linkErrors[index] && !typingLinks[index] && (
                      <p className="text-xs text-red-500">
                        {linkErrors[index]}
                      </p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
