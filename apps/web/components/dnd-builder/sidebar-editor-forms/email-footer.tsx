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
import { useState, useRef, useEffect, useCallback } from "react";
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
import { useUpdateEmailFooter } from "../mutations/use-update-email-footer";

interface Link {
  icon: string;
  url: string;
}

// Define validation schemas
const urlSchema = z.string().url("Please enter a valid URL");
const emailSchema = z.string().email("Please enter a valid email address");

interface EmailFooterFormProps {
  emailId?: number;
  footerData?: any;
}

export default function EmailFooterForm({
  emailId,
  footerData,
}: EmailFooterFormProps) {
  const { organizationId } = useUser();
  const linkTimersRef = useRef<Record<number, NodeJS.Timeout | null>>({});
  const updateEmailFooter = useUpdateEmailFooter();

  // Local state with default values
  const [localState, setLocalState] = useState({
    name: footerData?.name || "",
    subtitle: footerData?.subtitle || "",
    logo: footerData?.logo || "",
    address: footerData?.address || "",
    reason: footerData?.reason || "",
    copyright_name: footerData?.copyright_name || "",
    bg_color: footerData?.bg_color || "#ffffff",
    text_color: footerData?.text_color || "#000000",
    secondary_text_color: footerData?.secondary_text_color || "#666666",
    font: footerData?.font || "Inter",
    links: Array.isArray(footerData?.links) ? footerData.links : [],
    socials_color: footerData?.socials_color || "#000000",
    socials_style: footerData?.socials_style || "icon-only",
    socials_icon_color: footerData?.socials_icon_color || "#ffffff",
  });

  // Update local state when footerData changes
  useEffect(() => {
    if (footerData) {
      setLocalState({
        name: footerData.name || "",
        subtitle: footerData.subtitle || "",
        logo: footerData.logo || "",
        address: footerData.address || "",
        reason: footerData.reason || "",
        copyright_name: footerData.copyright_name || "",
        bg_color: footerData.bg_color || "#ffffff",
        text_color: footerData.text_color || "#000000",
        secondary_text_color: footerData.secondary_text_color || "#666666",
        font: footerData.font || "Inter",
        links: Array.isArray(footerData.links) ? footerData.links : [],
        socials_color: footerData.socials_color || "#000000",
        socials_style: footerData.socials_style || "icon-only",
        socials_icon_color: footerData.socials_icon_color || "#ffffff",
      });
    }
  }, [footerData]);

  const [linkErrors, setLinkErrors] = useState<Record<number, string | null>>(
    {}
  );
  const [typingLinks, setTypingLinks] = useState<Record<number, boolean>>({});

  // Create a ref to store the latest state for the debounced function
  const stateRef = useRef(localState);

  // Update the ref whenever localState changes
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);

  // Handle general state changes
  const handleChange = (key: string, value: any) => {
    setLocalState((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Update immediately instead of debouncing for better responsiveness
    if (emailId && organizationId) {
      updateEmailFooter.mutate({
        emailId,
        organizationId,
        updates: {
          ...stateRef.current,
          [key]: value,
        },
      });
    }
  };

  const addLink = () => {
    if (localState.links.length < 5) {
      const newLinks = [...localState.links, { icon: "", url: "" }];

      // Update local state
      setLocalState((prev) => ({
        ...prev,
        links: newLinks,
      }));

      // Update server directly
      if (emailId && organizationId) {
        updateEmailFooter.mutate({
          emailId,
          organizationId,
          updates: {
            ...stateRef.current,
            links: newLinks,
          },
        });
      }
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
          // Update local state
          setLocalState((prev) => ({
            ...prev,
            links: newLinks,
          }));

          // Update server directly instead of calling handleChange which would trigger another debounce
          if (emailId && organizationId) {
            updateEmailFooter.mutate({
              emailId,
              organizationId,
              updates: {
                ...stateRef.current,
                links: newLinks,
              },
            });
          }
        }
      }, 500); // Reduced from 800ms to 500ms for better responsiveness

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

      // Update local state
      setLocalState((prev) => ({
        ...prev,
        links: newLinks,
      }));

      // Update server directly
      if (emailId && organizationId) {
        updateEmailFooter.mutate({
          emailId,
          organizationId,
          updates: {
            ...stateRef.current,
            links: newLinks,
          },
        });
      }
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
        // Update local state
        setLocalState((prev) => ({
          ...prev,
          links: localState.links,
        }));

        // Update server directly
        if (emailId && organizationId) {
          updateEmailFooter.mutate({
            emailId,
            organizationId,
            updates: {
              ...stateRef.current,
              links: localState.links,
            },
          });
        }
      }
    }
  };

  const removeLink = (index: number) => {
    const newLinks = localState.links.filter(
      (_: Link, i: number) => i !== index
    );

    // Update local state
    setLocalState((prev) => ({
      ...prev,
      links: newLinks,
    }));

    // Update server directly
    if (emailId && organizationId) {
      updateEmailFooter.mutate({
        emailId,
        organizationId,
        updates: {
          ...stateRef.current,
          links: newLinks,
        },
      });
    }

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

  const handleUploadComplete = (path: string) => {
    // Update local state
    setLocalState((prev) => ({
      ...prev,
      logo: path,
    }));

    // Update server directly
    if (emailId && organizationId) {
      updateEmailFooter.mutate({
        emailId,
        organizationId,
        updates: {
          ...stateRef.current,
          logo: path,
        },
      });
    }
  };

  const handleLogoRemove = () => {
    // Update local state
    setLocalState((prev) => ({
      ...prev,
      logo: "",
    }));

    // Update server directly
    if (emailId && organizationId) {
      updateEmailFooter.mutate({
        emailId,
        organizationId,
        updates: {
          ...stateRef.current,
          logo: "",
        },
      });
    }
  };

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(linkTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-lg font-semibold">Email Footer</h2>
      <div className="grid grid-cols-3 items-center gap-2">
        <Label>Logo</Label>
        <div className="col-span-2">
          <FileUpload
            organizationId={organizationId}
            initialFilePath={localState.logo}
            onUploadComplete={handleUploadComplete}
            onRemove={handleLogoRemove}
          />
        </div>
        <Label>Title</Label>
        <Input
          className="col-span-2"
          value={localState.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <Label>Subtitle</Label>
        <Textarea
          className="col-span-2"
          value={localState.subtitle}
          onChange={(e) => handleChange("subtitle", e.target.value)}
        />
        <Label>Address</Label>
        <Textarea
          className="col-span-2"
          value={localState.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
        <Label>Reason for Contact</Label>
        <Textarea
          className="col-span-2"
          value={localState.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
        />
        <Label>Copyright Name</Label>
        <Input
          className="col-span-2"
          value={localState.copyright_name}
          onChange={(e) => handleChange("copyright_name", e.target.value)}
        />
        <Label className="font-medium">Background Color</Label>
        <ColorPicker
          value={localState.bg_color}
          onChange={(color) => handleChange("bg_color", color)}
        />
        <Label className="font-medium">Text Color</Label>
        <ColorPicker
          value={localState.text_color}
          onChange={(color) => handleChange("text_color", color)}
        />
        <Label className="font-medium">Secondary Text Color</Label>
        <ColorPicker
          value={localState.secondary_text_color}
          onChange={(color) => handleChange("secondary_text_color", color)}
        />
        <Label className="font-medium">Font</Label>
        <Select
          value={localState.font}
          onValueChange={(value) => handleChange("font", value)}
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
        <Label className="font-medium">Social Icon Style</Label>
        <Select
          value={localState.socials_style}
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
        <Label className="font-medium">
          {localState.socials_style === "filled"
            ? "Social Icon BG"
            : "Social Icon Color"}
        </Label>
        <ColorPicker
          value={localState.socials_color}
          onChange={(color) => handleChange("socials_color", color)}
        />
        {localState.socials_style === "filled" && (
          <>
            <Label className="font-medium">Icon Color</Label>
            <ColorPicker
              value={localState.socials_icon_color}
              onChange={(color) => handleChange("socials_icon_color", color)}
            />
          </>
        )}
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
        {localState.links.map((link: Link, index: number) => (
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
