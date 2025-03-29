import React, { useRef, useState, useEffect } from "react";
import { Button } from "@church-space/ui/button";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import {
  MailFilled,
  LinkIcon,
  Facebook,
  Youtube,
  Instagram,
  TikTok,
  XTwitter,
  Threads,
  Bluesky,
  Linkedin,
  XIcon,
} from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import { z } from "zod";
import ColorPicker from "@/components/dnd-builder/color-picker";
import { SocialLink } from "../link-list-builder";
import { TooltipContent } from "@church-space/ui/tooltip";
import { socialIcons } from "../link-list-socials";
import { Tooltip, TooltipTrigger } from "@church-space/ui/tooltip";

interface LocalState {
  links: SocialLink[];
  socials_style: string;
}

interface SocialsFormProps {
  socialsStyle: "outline" | "filled" | "icon-only";
  socialsColor: string;
  socialsIconColor: string;
  socialLinks: SocialLink[];
  setSocialsStyle: (style: "outline" | "filled" | "icon-only") => void;
  setSocialsColor: (color: string) => void;
  setSocialsIconColor: (color: string) => void;
  setSocialLinks: (links: SocialLink[]) => void;
}
export default function SocialsForm({
  socialsStyle,
  socialsColor,
  socialsIconColor,
  socialLinks,
  setSocialsStyle,
  setSocialsColor,
  setSocialsIconColor,
  setSocialLinks,
}: SocialsFormProps) {
  // Track validation errors for links
  const [linkErrors, setLinkErrors] = useState<Record<number, string | null>>(
    {},
  );
  // Track which links are currently being typed
  const [typingLinks, setTypingLinks] = useState<Record<number, boolean>>({});
  // Debounce timers for link validation
  const linkTimersRef = useRef<Record<number, NodeJS.Timeout | null>>({});
  // Local state for social links
  const [localSocialLinks, setLocalSocialLinks] = useState(socialLinks);

  // Sync local social links with props when props change
  useEffect(() => {
    setLocalSocialLinks(socialLinks);
  }, [socialLinks]);

  const handleChange = (key: keyof LocalState, value: any) => {
    if (key === "socials_style") {
      setSocialsStyle(value as "outline" | "filled" | "icon-only");
    }
  };

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

  // Validate URL or email based on icon type
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

  // Add a new empty social link
  const addLink = () => {
    if (localSocialLinks.length < 5) {
      // Create new social links array with added empty link
      const newLinks = [
        ...localSocialLinks,
        { icon: "link" as keyof typeof socialIcons, url: "" },
      ];

      // Update local state for immediate UI feedback
      setLocalSocialLinks(newLinks);

      // Update parent state (triggers server update)
      setSocialLinks(newLinks);
    }
  };

  // Handle field updates with optimistic UI and debounced server updates
  const updateLink = (
    index: number,
    field: keyof SocialLink,
    value: string,
  ) => {
    // Create updated social links array
    const newLinks = [...localSocialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };

    // Update local state immediately for responsive UI
    setLocalSocialLinks(newLinks);

    // For URL field, validate immediately but debounce server update
    if (field === "url") {
      // Mark this link as being typed
      setTypingLinks((prev) => ({ ...prev, [index]: true }));

      // Clear any existing timer
      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
      }

      // Set a new timer to update parent state after typing stops
      linkTimersRef.current[index] = setTimeout(() => {
        // Clear typing flag
        setTypingLinks((prev) => ({ ...prev, [index]: false }));

        // Validate the URL/email value
        const isValid = validateLink(value, newLinks[index].icon, index);

        // If valid or empty, update parent state
        if (isValid) {
          // Update parent state (triggers server update)
          setSocialLinks(newLinks);
        }
      }, 800);
    } else {
      // For non-URL fields, still debounce but don't need validation
      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
      }

      linkTimersRef.current[index] = setTimeout(() => {
        // Update parent state (triggers server update)
        setSocialLinks(newLinks);
      }, 400);
    }

    // Always update the parent state immediately for optimistic UI
    // This allows the UI to update instantly while server updates are debounced
    setSocialLinks(newLinks);
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

      // Validate and update immediately on blur
      const link = localSocialLinks[index];
      const isValid = validateLink(link.url, link.icon, index);

      // Update parent state if valid
      if (isValid) {
        setSocialLinks(localSocialLinks);
      }
    }
  };

  // Remove a social link at specified index
  const removeLink = (index: number) => {
    // Create new social links array without the removed link
    const newLinks = localSocialLinks.filter((_, i) => i !== index);

    // Update local state for immediate UI feedback
    setLocalSocialLinks(newLinks);

    // Update parent state (triggers server update)
    setSocialLinks(newLinks);

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

  return (
    <div className="flex flex-col gap-8 px-1">
      <div className="grid grid-cols-3 items-center gap-2">
        <Label className="font-medium">Icon Style</Label>
        <Select
          value={socialsStyle}
          onValueChange={(value) => handleChange("socials_style", value)}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select icon style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="icon-only">Icon Only</SelectItem>
          </SelectContent>
        </Select>
        {socialsStyle === "filled" && (
          <>
            <Label className="font-medium">Background Color</Label>
            <ColorPicker
              value={socialsColor}
              onChange={(color) => setSocialsColor(color)}
            />
          </>
        )}
        <Label className="font-medium">Icon Color</Label>
        <ColorPicker
          value={socialsIconColor}
          onChange={(color) => setSocialsIconColor(color)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Social Links</Label>
          <Button
            variant="outline"
            onClick={addLink}
            disabled={localSocialLinks.length >= 5}
          >
            Add Link
          </Button>
        </div>

        {localSocialLinks.map((link, index) => (
          <div
            key={index}
            className="grid grid-cols-3 items-center gap-x-2 gap-y-2"
          >
            <Label>Icon</Label>
            <div className="col-span-2 flex">
              <Select
                value={link.icon}
                onValueChange={(value) => updateLink(index, "icon", value)}
              >
                <SelectTrigger className="rounded-r-none">
                  <SelectValue placeholder="Icon" />
                </SelectTrigger>
                <SelectContent className="min-w-20">
                  <SelectItem value="mail">
                    <div className="flex flex-row gap-2">
                      <MailFilled height={"20"} width={"20"} /> Email
                    </div>
                  </SelectItem>
                  <SelectItem value="link">
                    <div className="flex flex-row gap-2">
                      <LinkIcon height={"20"} width={"20"} /> Website
                    </div>
                  </SelectItem>
                  <SelectItem value="facebook">
                    <div className="flex flex-row gap-2">
                      <Facebook height={"20"} width={"20"} /> Facebook
                    </div>
                  </SelectItem>
                  <SelectItem value="youtube">
                    <div className="flex flex-row gap-2">
                      <Youtube height={"20"} width={"20"} /> Youtube
                    </div>
                  </SelectItem>
                  <SelectItem value="instagram">
                    <div className="flex flex-row gap-2">
                      <Instagram height={"20"} width={"20"} /> Instagram
                    </div>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <div className="flex flex-row gap-2">
                      <TikTok height={"20"} width={"20"} /> TikTok
                    </div>
                  </SelectItem>
                  <SelectItem value="x">
                    <div className="flex flex-row gap-2">
                      <XTwitter height={"20"} width={"20"} /> X
                    </div>
                  </SelectItem>
                  <SelectItem value="threads">
                    <div className="flex flex-row gap-2">
                      <Threads height={"20"} width={"20"} /> Threads
                    </div>
                  </SelectItem>
                  <SelectItem value="bluesky">
                    <div className="flex flex-row gap-2">
                      <Bluesky height={"20"} width={"20"} /> Bluesky
                    </div>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <div className="flex flex-row gap-2">
                      <Linkedin height={"20"} width={"20"} /> LinkedIn
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
            <Label>{link.icon === "mail" ? "Email" : "URL"}</Label>
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
                  link.icon === "mail" ? "email@example.com" : "https://"
                }
              />
              {linkErrors[index] && !typingLinks[index] && (
                <p className="text-xs text-red-500">{linkErrors[index]}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
