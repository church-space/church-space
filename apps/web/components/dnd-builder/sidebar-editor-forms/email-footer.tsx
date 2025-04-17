import { useUser } from "@/stores/use-user";
import { Button } from "@church-space/ui/button";
import {
  Bluesky,
  Facebook,
  Instagram,
  Linkedin,
  LinkIcon,
  MailFilled,
  Refresh,
  Save,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@church-space/ui/dialog";
import { updateDefaultEmailFooterAction } from "@/actions/update-default-email-footer";
import { getDefaultEmailFooter } from "@/actions/get-default-email-footer";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@church-space/ui/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";

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

// Create a sortable link item component
function SortableLinkItem({
  link,
  index,
  linkErrors,
  typingLinks,
  updateLink,
  removeLink,
  handleLinkBlur,
}: {
  link: any;
  index: number;
  linkErrors: Record<string, string | null>;
  typingLinks: Record<number, boolean>;
  updateLink: (index: number, key: "icon" | "url", value: string) => void;
  removeLink: (index: number) => void;
  handleLinkBlur: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        zIndex: isDragging ? 10 : 1,
      }
    : undefined;

  const socialIcons = {
    mail: MailFilled,
    link: LinkIcon,
    facebook: Facebook,
    youtube: Youtube,
    instagram: Instagram,
    tiktok: TikTok,
    twitter: XTwitter,
    vimeo: Vimeo,
    threads: Threads,
    bluesky: Bluesky,
    linkedin: Linkedin,
  };

  const IconComponent = socialIcons[link.icon as keyof typeof socialIcons];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 w-full rounded-lg border",
        isDragging ? "border-dashed bg-accent opacity-50" : "",
      )}
    >
      <div className="flex w-full items-center p-0.5 pr-1">
        <div
          className="flex cursor-grab touch-none items-center justify-center px-3 py-4"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <AccordionItem value={index.toString()} className="w-full border-0">
          <AccordionTrigger className="flex w-full items-center justify-between rounded-sm px-2 py-3">
            <div className="flex items-center gap-2">
              {IconComponent && <IconComponent height="16" width="16" />}
              <span className="truncate pr-2 text-sm">
                {link.icon
                  ? link.icon.charAt(0).toUpperCase() + link.icon.slice(1)
                  : "Select Platform"}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div className="flex w-full flex-col gap-y-2">
                <Label className="col-span-1">Platform</Label>
                <Select
                  value={link.icon}
                  onValueChange={(value) => updateLink(index, "icon", value)}
                >
                  <SelectTrigger className="col-span-3 mb-2 bg-background">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
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

                <Label className="col-span-1">
                  {link.icon === "mail" ? "Email" : "URL"}
                </Label>
                <div className="col-span-3">
                  <Input
                    className={
                      linkErrors[link.icon] && !typingLinks[index]
                        ? "border-red-500 bg-background"
                        : "bg-background"
                    }
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                    onBlur={() => handleLinkBlur(index)}
                    placeholder={
                      link.icon === "mail" ? "email@example.com" : "https://"
                    }
                    maxLength={500}
                  />
                  {linkErrors[link.icon] && !typingLinks[index] && (
                    <p className="mt-1 text-xs text-red-500">
                      {linkErrors[link.icon]}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => removeLink(index)}
                className="h-7 w-full hover:bg-destructive hover:text-white"
              >
                Remove Link
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </div>
    </div>
  );
}

export default function EmailFooterForm({
  footerData,
  emailInset,
  onFooterChange,
}: EmailFooterFormProps) {
  const { organizationId } = useUser();
  const linkTimersRef = useRef<Record<number, NodeJS.Timeout | null>>({});
  const colorTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [savingAsDefault, setSavingAsDefault] = useState(false);
  const [revertingToDefault, setRevertingToDefault] = useState(false);

  const [revertToDefaultDialogOpen, setRevertToDefaultDialogOpen] =
    useState(false);
  const [saveAsDefaultDialogOpen, setSaveAsDefaultDialogOpen] = useState(false);

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

  // Separate handler for color changes to avoid unnecessary validation
  const handleColorChange = (key: string, value: string) => {
    // Update local state immediately for responsive UI
    setLocalState((prev) => ({ ...prev, [key]: value }));

    // Clear any existing timer
    if (colorTimerRef.current) {
      clearTimeout(colorTimerRef.current);
    }

    // Set a new timer to update parent after user stops moving
    colorTimerRef.current = setTimeout(() => {
      if (onFooterChange) {
        onFooterChange({ ...localState, [key]: value });
      }
    }, 150);
  };

  // Set up DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString());
      const newIndex = parseInt(over.id.toString());

      // Update the order of the links
      const reorderedLinks = [...localState.links];
      const [movedItem] = reorderedLinks.splice(oldIndex, 1);
      reorderedLinks.splice(newIndex, 0, movedItem);

      // Update the order property for each link
      const updatedLinks = reorderedLinks.map((link, index) => ({
        ...link,
        order: index,
      }));

      // Update local state and parent
      handleChange("links", updatedLinks);
    }
  };

  const addLink = () => {
    if (localState.links.length < 5) {
      const newLinks = [
        ...localState.links,
        { icon: "", url: "", order: localState.links.length },
      ];
      handleChange("links", newLinks);
    }
  };

  const validateLink = (value: string, type: string): boolean => {
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
        const isValid = validateLink(value, newLinks[index].icon);

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
    const isValid = validateLink(link.url, link.icon);

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

  // Cleanup color timer on unmount
  useEffect(() => {
    return () => {
      if (colorTimerRef.current) {
        clearTimeout(colorTimerRef.current);
      }
    };
  }, []);

  if (!organizationId) return null;

  const handleSaveAsDefault = async () => {
    try {
      setSavingAsDefault(true);
      console.log("Saving footer as default:", {
        organization_id: organizationId,
        footer_data: localState,
      });
      await updateDefaultEmailFooterAction({
        organization_id: organizationId,
        footer_data: localState,
      });
      console.log("Successfully saved footer as default");
      setSaveAsDefaultDialogOpen(false);
    } catch (error) {
      console.error("Error saving footer as default:", error);
    } finally {
      setSavingAsDefault(false);
    }
  };

  const handleRevertToDefault = async () => {
    try {
      setRevertingToDefault(true);
      const result = await getDefaultEmailFooter({
        organizationId: organizationId,
      });

      const footer = result?.data?.footer;
      if (footer) {
        const defaultFooter = {
          name: footer.name || "",
          subtitle: footer.subtitle || "",
          logo: footer.logo || "",
          address: footer.address || "",
          reason: footer.reason || "",
          copyright_name: footer.copyright_name || "",
          bg_color: "#ffffff", // Default value
          text_color: "#000000", // Default value
          secondary_text_color: "#666666", // Default value
          links: Array.isArray(footer.links) ? footer.links : [],
          socials_color: footer.socials_color || "#000000",
          socials_style: footer.socials_style || "icon-only",
          socials_icon_color: footer.socials_icon_color || "#ffffff",
        };

        setLocalState(defaultFooter);

        // Trigger UI update and server update through prop
        if (onFooterChange) {
          onFooterChange(defaultFooter);
        }
      }

      setRevertToDefaultDialogOpen(false);
    } catch (error) {
      console.error("Error reverting to default:", error);
    } finally {
      setRevertingToDefault(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 px-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Email Footer</h2>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevertToDefaultDialogOpen(true)}
                >
                  <Refresh />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Revert to Default</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveAsDefaultDialogOpen(true)}
                >
                  <Save />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save as Default</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-2">
          <Label>Logo</Label>
          <div className="col-span-2">
            <FileUpload
              organizationId={organizationId}
              initialFilePath={localState.logo}
              onUploadComplete={handleUploadComplete}
              onRemove={handleLogoRemove}
              type="image"
            />
          </div>
          <Label>Title</Label>
          <Input
            className="col-span-2 bg-background"
            value={localState.name}
            onChange={(e) => handleChange("name", e.target.value)}
            maxLength={200}
          />
          <Label>Subtitle</Label>
          <AutosizeTextarea
            className="col-span-2 bg-background"
            value={localState.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            maxLength={1000}
          />
          <Separator className="col-span-3 my-4" />
          <Label className="font-medium">Title Color</Label>
          <ColorPicker
            value={localState.text_color}
            onChange={(color) => handleColorChange("text_color", color)}
          />

          <Label className="font-medium">Accent Text Color</Label>
          <ColorPicker
            value={localState.secondary_text_color}
            onChange={(color) =>
              handleColorChange("secondary_text_color", color)
            }
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
              onBlur={() =>
                validateRequiredField("address", localState.address)
              }
              placeholder="Enter address (required)"
              required
              maxLength={1000}
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
              maxLength={1000}
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
                validateRequiredField(
                  "copyright_name",
                  localState.copyright_name,
                )
              }
              placeholder="Enter copyright name (required)"
              required
              maxLength={150}
            />
            {fieldErrors.copyright_name && (
              <p className="text-xs text-red-500">
                {fieldErrors.copyright_name}
              </p>
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
                onChange={(color) => handleColorChange("socials_color", color)}
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localState.links.map((_: Link, i: number) => i.toString())}
              strategy={verticalListSortingStrategy}
            >
              <Accordion type="single" collapsible className="w-full">
                {localState.links.map((link: Link, index: number) => (
                  <SortableLinkItem
                    key={index}
                    link={link}
                    index={index}
                    linkErrors={fieldErrors}
                    typingLinks={Object.fromEntries(
                      Object.entries(linkTimersRef.current || {}).map(
                        ([key]) => [key, true],
                      ),
                    )}
                    updateLink={updateLink}
                    removeLink={removeLink}
                    handleLinkBlur={handleLinkBlur}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <Dialog
        open={revertToDefaultDialogOpen}
        onOpenChange={setRevertToDefaultDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revert to Default</DialogTitle>
            <DialogDescription>
              Are you sure you want to revert to the default footer? This will
              overwrite any changes you have made.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevertToDefaultDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevertToDefault}
              disabled={revertingToDefault}
            >
              {revertingToDefault ? "Reverting..." : "Revert to Default"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={saveAsDefaultDialogOpen}
        onOpenChange={setSaveAsDefaultDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Default</DialogTitle>
            <DialogDescription>
              Are you sure you want to save the current footer as the default?
              This will overwrite your current default footer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveAsDefaultDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAsDefault} disabled={savingAsDefault}>
              {savingAsDefault ? "Saving..." : "Save as Default"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
