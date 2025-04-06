import { useUser } from "@/stores/use-user";
import { Button } from "@church-space/ui/button";
import {
  Bluesky,
  Facebook,
  Instagram,
  Linkedin,
  LinkIcon,
  MailFilled,
  Threads,
  TikTok,
  Vimeo,
  XTwitter,
  Youtube,
} from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { Textarea } from "@church-space/ui/textarea";
import { AutosizeTextarea } from "@church-space/ui/auto-size-textarea";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import ColorPicker from "../color-picker";
import FileUpload from "../file-upload";
import { Separator } from "@church-space/ui/separator";

interface Link {
  icon: string;
  url: string;
}

// Define validation schemas
const urlSchema = z.string().url("Please enter a valid URL");
const emailSchema = z.string().email("Please enter a valid email address");
const requiredFieldSchema = z.string().min(1, "This field is required");

interface EmailFooterFormProps {
  footerData?: any;
  emailInset: boolean;
  onFooterChange?: (data: any) => void;
}

export default function EmailFooterForm({
  footerData,
  emailInset,
  onFooterChange,
}: EmailFooterFormProps) {
  const { organizationId } = useUser();
  const linkTimersRef = useRef<Record<number, NodeJS.Timeout | null>>({});

  // Local state with default values and validation errors
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
    links: Array.isArray(footerData?.links) ? footerData.links : [],
    socials_color: footerData?.socials_color || "#000000",
    socials_style: footerData?.socials_style || "icon-only",
    socials_icon_color: footerData?.socials_icon_color || "#ffffff",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {
      address: null,
      reason: null,
      copyright_name: null,
    },
  );

  // Validate required fields
  const validateRequiredField = (key: string, value: string): boolean => {
    try {
      requiredFieldSchema.parse(value);
      setFieldErrors((prev) => ({ ...prev, [key]: null }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFieldErrors((prev) => ({
          ...prev,
          [key]: error.errors[0].message,
        }));
        return false;
      }
      return true;
    }
  };

  // Update local state when footerData changes
  useEffect(() => {
    if (footerData) {
      const newState = {
        name: footerData.name || "",
        subtitle: footerData.subtitle || "",
        logo: footerData.logo || "",
        address: footerData.address || "",
        reason: footerData.reason || "",
        copyright_name: footerData.copyright_name || "",
        bg_color: footerData.bg_color || "#ffffff",
        text_color: footerData.text_color || "#000000",
        secondary_text_color: footerData.secondary_text_color || "#666666",
        links: Array.isArray(footerData.links) ? footerData.links : [],
        socials_color: footerData.socials_color || "#000000",
        socials_style: footerData.socials_style || "icon-only",
        socials_icon_color: footerData.socials_icon_color || "#ffffff",
      };

      setLocalState(newState);

      // Validate required fields
      validateRequiredField("address", newState.address);
      validateRequiredField("reason", newState.reason);
      validateRequiredField("copyright_name", newState.copyright_name);
    }
  }, [footerData]);

  // Validate all required fields before triggering onFooterChange
  const validateAndUpdateFooter = (newState: typeof localState) => {
    const isAddressValid = validateRequiredField("address", newState.address);
    const isReasonValid = validateRequiredField("reason", newState.reason);
    const isCopyrightValid = validateRequiredField(
      "copyright_name",
      newState.copyright_name,
    );

    if (isAddressValid && isReasonValid && isCopyrightValid && onFooterChange) {
      onFooterChange(newState);
    }
  };

  // Handle general state changes
  const handleChange = (key: string, value: any) => {
    // Create new state
    const newState = { ...localState, [key]: value };

    // Update local state immediately for responsive UI
    setLocalState(newState);

    // Validate required fields and update footer
    validateAndUpdateFooter(newState);
  };

  const addLink = () => {
    if (localState.links.length < 5) {
      const newLinks = [...localState.links, { icon: "", url: "" }];
      const newState = { ...localState, links: newLinks };

      // Update local state
      setLocalState(newState);

      // Trigger UI update and server update through prop
      if (onFooterChange) {
        onFooterChange(newState);
      }
    }
  };

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
      setFieldErrors((prev) => ({ ...prev, [type]: null }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set error message
        setFieldErrors((prev) => ({
          ...prev,
          [type]: error.errors[0].message,
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
      setFieldErrors((prev) => ({ ...prev, [newLinks[index].icon]: null }));

      // Clear any existing timer
      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
      }

      // Set a new timer to validate after typing stops
      linkTimersRef.current[index] = setTimeout(() => {
        setFieldErrors((prev) => ({ ...prev, [newLinks[index].icon]: null }));

        // Validate based on the icon type
        const isValid = validateLink(value, newLinks[index].icon, index);

        // Only update if valid
        if (isValid) {
          const newState = { ...localState, links: newLinks };

          // Update local state
          setLocalState(newState);

          // Trigger UI update and server update through prop
          if (onFooterChange) {
            onFooterChange(newState);
          }
        }
      }, 500);

      // Update local state immediately for responsive UI
      setLocalState((prev) => ({
        ...prev,
        links: newLinks,
      }));
    } else {
      // For icon changes, update immediately and clear any existing errors
      if (key === "icon") {
        setFieldErrors((prev) => ({ ...prev, [value]: null }));
      }

      const newState = { ...localState, links: newLinks };

      // Update local state
      setLocalState(newState);

      // Trigger UI update and server update through prop
      if (onFooterChange) {
        onFooterChange(newState);
      }
    }
  };

  const handleLinkBlur = (index: number) => {
    // When input loses focus, clear typing state and validate
    if (linkTimersRef.current[index]) {
      clearTimeout(linkTimersRef.current[index]);
      linkTimersRef.current[index] = null;
    }

    const link = localState.links[index];
    const isValid = validateLink(link.url, link.icon, index);

    if (isValid) {
      // No need to create a new state object since we're not changing anything
      // Just trigger the server update through the prop
      if (onFooterChange) {
        onFooterChange(localState);
      }
    }
  };

  const removeLink = (index: number) => {
    const newLinks = localState.links.filter(
      (_: Link, i: number) => i !== index,
    );

    const newState = { ...localState, links: newLinks };

    // Update local state
    setLocalState(newState);

    // Trigger UI update and server update through prop
    if (onFooterChange) {
      onFooterChange(newState);
    }

    // Clean up any errors or timers for this index
    setFieldErrors((prev) => {
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
    const newState = { ...localState, logo: path };

    // Update local state
    setLocalState(newState);

    // Trigger UI update and server update through prop
    if (onFooterChange) {
      onFooterChange(newState);
    }
  };

  const handleLogoRemove = () => {
    const newState = { ...localState, logo: "" };

    // Update local state
    setLocalState(newState);

    // Trigger UI update and server update through prop
    if (onFooterChange) {
      onFooterChange(newState);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(linkTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-6 px-1">
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
          className="col-span-2 bg-background"
          value={localState.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <Label>Subtitle</Label>
        <AutosizeTextarea
          className="col-span-2 bg-background"
          value={localState.subtitle}
          onChange={(e) => handleChange("subtitle", e.target.value)}
        />
        <Separator className="col-span-3 my-4" />
        <Label className="font-medium">Title Color</Label>
        <ColorPicker
          value={localState.text_color}
          onChange={(color) => handleChange("text_color", color)}
        />

        <Label className="font-medium">Accent Text Color</Label>
        <ColorPicker
          value={localState.secondary_text_color}
          onChange={(color) => handleChange("secondary_text_color", color)}
        />
        <Separator className="col-span-3 my-4" />
        <Label>Address</Label>
        <div className="col-span-2 flex flex-col gap-1">
          <Textarea
            className={
              fieldErrors.address
                ? "border-red-500 bg-background"
                : "bg-background"
            }
            value={localState.address}
            onChange={(e) => handleChange("address", e.target.value)}
            onBlur={() => validateRequiredField("address", localState.address)}
            placeholder="Enter address (required)"
            required
          />
          {fieldErrors.address && (
            <p className="text-xs text-red-500">{fieldErrors.address}</p>
          )}
        </div>
        <Label>Reason for Contact</Label>
        <div className="col-span-2 flex flex-col gap-1">
          <Textarea
            className={
              fieldErrors.reason
                ? "border-red-500 bg-background"
                : "bg-background"
            }
            value={localState.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            onBlur={() => validateRequiredField("reason", localState.reason)}
            placeholder="Enter reason for contact (required)"
            required
          />
          {fieldErrors.reason && (
            <p className="text-xs text-red-500">{fieldErrors.reason}</p>
          )}
        </div>
        <Label>Copyright Name</Label>
        <div className="col-span-2 flex flex-col gap-1">
          <Input
            className={
              fieldErrors.copyright_name
                ? "border-red-500 bg-background"
                : "bg-background"
            }
            value={localState.copyright_name}
            onChange={(e) => handleChange("copyright_name", e.target.value)}
            onBlur={() =>
              validateRequiredField("copyright_name", localState.copyright_name)
            }
            placeholder="Enter copyright name (required)"
            required
          />
          {fieldErrors.copyright_name && (
            <p className="text-xs text-red-500">{fieldErrors.copyright_name}</p>
          )}
        </div>
        {!emailInset && (
          <>
            <Label className="font-medium">Background Color</Label>
            <ColorPicker
              value={localState.bg_color}
              onChange={(color) => handleChange("bg_color", color)}
            />
          </>
        )}
        <Separator className="col-span-3 my-4" />
        <Label className="font-medium">Social Icon Style</Label>
        <Select
          value={localState.socials_style}
          onValueChange={(value) => handleChange("socials_style", value)}
        >
          <SelectTrigger className="col-span-2 bg-background">
            <SelectValue placeholder="Select icon style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="icon-only">Icon Only</SelectItem>
          </SelectContent>
        </Select>

        <Label className="font-medium">Icon Color</Label>
        <Select
          value={localState.socials_icon_color}
          onValueChange={(value) => handleChange("socials_icon_color", value)}
        >
          <SelectTrigger className="col-span-2 bg-background">
            <SelectValue placeholder="Select icon color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="#ffffff">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border bg-white dark:border-none" />
                White
              </div>
            </SelectItem>
            <SelectItem value="#c4c4c4">
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: "#c4c4c4" }}
                />
                Light Gray
              </div>
            </SelectItem>
            <SelectItem value="#404040">
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: "#404040" }}
                />
                Dark Gray
              </div>
            </SelectItem>
            <SelectItem value="#000000">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-black dark:border" />
                Black
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {localState.socials_style === "filled" && (
          <>
            <Label className="font-medium">Social Icon BG</Label>
            <ColorPicker
              value={localState.socials_color}
              onChange={(color) => handleChange("socials_color", color)}
            />
          </>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Social Links</Label>
          <Button
            onClick={addLink}
            disabled={localState.links.length >= 5}
            size="sm"
          >
            Add Link
          </Button>
        </div>
        {localState.links.map((link: Link, index: number) => (
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
                <SelectTrigger className="rounded-r-none bg-background">
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
                  <SelectItem value="vimeo">
                    <div className="flex flex-row gap-2">
                      <Vimeo height={"20"} width={"20"} /> Vimeo
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
                className="rounded-l-none border-l-0"
              >
                ×
              </Button>
            </div>
            <Label>{link.icon === "mail" ? "Email" : "URL"}</Label>
            <div className="col-span-2 flex flex-col gap-1">
              <Input
                className={
                  fieldErrors[link.icon] && !linkTimersRef.current[index]
                    ? "border-red-500 bg-background"
                    : "bg-background"
                }
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                onBlur={() => handleLinkBlur(index)}
                placeholder={
                  link.icon === "mail" ? "email@example.com" : "https://"
                }
              />
              {fieldErrors[link.icon] && !linkTimersRef.current[index] && (
                <p className="text-xs text-red-500">{fieldErrors[link.icon]}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
