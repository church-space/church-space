import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";
import ColorPicker from "../color-picker";
import FileUpload from "../file-upload";
import { useUser } from "@/stores/use-user";
import { Input } from "@trivo/ui/input";
import { Textarea } from "@trivo/ui/textarea";
import { useState, useRef } from "react";
import { Button } from "@trivo/ui/button";
import { z } from "zod";
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
} from "@trivo/ui/icons";

interface Link {
  icon: string;
  url: string;
}

// Define validation schemas
const urlSchema = z.string().url("Please enter a valid URL");
const emailSchema = z.string().email("Please enter a valid email address");

export default function EmailFooterForm() {
  const { organizationId } = useUser();
  const linkTimersRef = useRef<Record<number, NodeJS.Timeout | null>>({});

  // Local state
  const [localState, setLocalState] = useState({
    footerBgColor: "#000000",
    footerTextColor: "#000000",
    footerFont: "Inter",
    links: [] as Link[],
  });
  const [linkErrors, setLinkErrors] = useState<Record<number, string | null>>(
    {}
  );
  const [typingLinks, setTypingLinks] = useState<Record<number, boolean>>({});

  // Handle general state changes
  const handleChange = (key: string, value: any) => {
    setLocalState((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Here you would also update the parent component or store if needed
  };

  const addLink = () => {
    if (localState.links.length < 5) {
      const newLinks = [...localState.links, { icon: "", url: "" }];
      handleChange("links", newLinks);
    }
  };

  const validateLink = (
    value: string,
    type: string,
    index: number
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

  const updateLink = (index: number, key: "icon" | "url", value: string) => {
    const newLinks = [...localState.links];
    newLinks[index] = { ...newLinks[index], [key]: value };

    // If updating the URL field
    if (key === "url") {
      // Mark as typing
      setTypingLinks((prev) => ({ ...prev, [index]: true }));

      // Clear any existing timer
      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
      }

      // Set a new timer to validate after typing stops
      linkTimersRef.current[index] = setTimeout(() => {
        setTypingLinks((prev) => ({ ...prev, [index]: false }));

        // Validate based on the icon type
        const isValid = validateLink(value, newLinks[index].icon, index);

        // Only update if valid
        if (isValid) {
          handleChange("links", newLinks);
        }
      }, 800); // 800ms debounce

      // Update local state immediately for responsive UI
      setLocalState((prev) => ({
        ...prev,
        links: newLinks,
      }));
    } else {
      // For icon changes, update immediately and clear any existing errors
      if (key === "icon") {
        setLinkErrors((prev) => ({ ...prev, [index]: null }));
      }
      handleChange("links", newLinks);
    }
  };

  const handleLinkBlur = (index: number) => {
    // When input loses focus, clear typing state and validate
    if (typingLinks[index]) {
      setTypingLinks((prev) => ({ ...prev, [index]: false }));

      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
        linkTimersRef.current[index] = null;
      }

      const link = localState.links[index];
      const isValid = validateLink(link.url, link.icon, index);

      if (isValid) {
        handleChange("links", localState.links);
      }
    }
  };

  const removeLink = (index: number) => {
    const newLinks = localState.links.filter((_, i) => i !== index);
    handleChange("links", newLinks);

    // Clean up any errors or timers for this index
    setLinkErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    if (linkTimersRef.current[index]) {
      clearTimeout(linkTimersRef.current[index]);
      delete linkTimersRef.current[index];
    }
  };

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-lg font-semibold">Email Footer</h2>
      <div className="grid grid-cols-3 items-center gap-2">
        <Label>Logo</Label>
        <FileUpload organizationId={organizationId} />
        <Label>Title</Label>
        <Input className="col-span-2" />
        <Label>Subtitle</Label>
        <Textarea className="col-span-2" />
        <Label>Address</Label>
        <Textarea className="col-span-2" />
        <Label>Reason for Contact</Label>
        <Textarea className="col-span-2" />
        <Label>Copyright Name</Label>
        <Input className="col-span-2" />
        <Label className="font-medium">Background Color</Label>
        <ColorPicker
          value={localState.footerBgColor}
          onChange={(color) => handleChange("footerBgColor", color)}
        />
        <Label className="font-medium">Text Color</Label>
        <ColorPicker
          value={localState.footerTextColor}
          onChange={(color) => handleChange("footerTextColor", color)}
        />
        <Label className="font-medium">Font</Label>
        <Select
          value={localState.footerFont}
          onValueChange={(value) => handleChange("footerFont", value)}
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Social Links</Label>
          <Button
            variant="outline"
            onClick={addLink}
            disabled={localState.links.length >= 5}
          >
            Add Link
          </Button>
        </div>
        {localState.links.map((link, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-y-2 gap-x-2 items-center"
          >
            <Label>Icon</Label>
            <div className="col-span-2 flex gap-2">
              <Select
                value={link.icon}
                onValueChange={(value) => updateLink(index, "icon", value)}
              >
                <SelectTrigger>
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
                  <SelectItem value="twitter">
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
              <Button
                variant="outline"
                onClick={() => removeLink(index)}
                size="icon"
              >
                ×
              </Button>
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
