import { useUser } from "@/stores/use-user";
import { AutosizeTextarea } from "@church-space/ui/auto-size-textarea";
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
  Spotify,
  Podcast,
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
import { Separator } from "@church-space/ui/separator";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import ColorPicker from "../color-picker";
import FileUpload from "../file-upload";
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

// Add 'id' to the existing link type definition
type LinkItem = Link & {
  id: string;
  order: number;
};

type ExtraLinkItem = {
  text: string;
  url: string;
  id: string;
  order: number;
};

// Define validation schemas
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

interface EmailFooterFormProps {
  footerData?: any;
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
  link: LinkItem;
  index: number;
  linkErrors: Record<string, string | null>;
  typingLinks: Record<string, boolean>;
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
  } = useSortable({ id: link.id });

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
    spotify: Spotify,
    podcast: Podcast,
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

        <AccordionItem value={link.id} className="w-full border-0">
          <AccordionTrigger className="flex w-full items-center justify-between rounded-sm px-2 py-3">
            <div className="flex w-full items-center gap-2">
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
              <div className="grid grid-cols-4 items-center gap-2">
                <Label className="col-span-1">Platform</Label>
                <Select
                  value={link.icon}
                  onValueChange={(value) => updateLink(index, "icon", value)}
                >
                  <SelectTrigger className="col-span-3 bg-background">
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
                    <SelectItem value="spotify">
                      <div className="flex flex-row gap-2">
                        <Spotify height={"20"} width={"20"} /> Spotify
                      </div>
                    </SelectItem>
                    <SelectItem value="podcast">
                      <div className="flex flex-row gap-2">
                        <Podcast height={"20"} width={"20"} /> Podcast
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label className="col-span-1">
                  {link.icon === "mail" ? "Email" : "URL"}
                </Label>
                <div className="col-span-3 flex flex-col gap-1">
                  <Input
                    className={cn(
                      "bg-background",
                      linkErrors[link.id] &&
                        !typingLinks[link.id] &&
                        "border-destructive",
                    )}
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                    onBlur={() => handleLinkBlur(index)}
                    placeholder={
                      link.icon === "mail" ? "email@example.com" : "https://"
                    }
                    maxLength={500}
                  />
                  {linkErrors[link.id] && !typingLinks[link.id] && (
                    <p className="text-xs text-destructive">
                      {linkErrors[link.id]}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => removeLink(index)}
                className="mt-3 h-7 w-full hover:bg-destructive hover:text-white"
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

function SortableExtraLinkItem({
  link,
  index,
  extraLinkErrors,
  typingExtraLinks,
  updateExtraLink,
  removeExtraLink,
  handleExtraLinkBlur,
}: {
  link: ExtraLinkItem;
  index: number;
  extraLinkErrors: Record<string, string | null>;
  typingExtraLinks: Record<string, boolean>;
  updateExtraLink: (index: number, key: "text" | "url", value: string) => void;
  removeExtraLink: (index: number) => void;
  handleExtraLinkBlur: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        zIndex: isDragging ? 10 : 1,
      }
    : undefined;

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

        <AccordionItem value={link.id} className="w-full border-0">
          <AccordionTrigger className="flex w-full items-center justify-between rounded-sm px-2 py-3">
            <div className="flex items-center gap-2">
              <span className="truncate pr-2 text-sm">
                {link.text ? link.text : `Link ${index + 1}`}
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div className="flex w-full flex-col gap-y-2">
                <Label className="col-span-1">Text</Label>
                <div className="col-span-2 mb-2 flex">
                  <Input
                    className="bg-background"
                    value={link.text}
                    onChange={(e) =>
                      updateExtraLink(index, "text", e.target.value)
                    }
                    onBlur={() => handleExtraLinkBlur(index)}
                    placeholder="Text"
                  />
                </div>

                <Label className="col-span-1">URL</Label>
                <div className="col-span-3 flex flex-col gap-1">
                  <Input
                    className={cn(
                      "bg-background",
                      extraLinkErrors[link.id] &&
                        !typingExtraLinks[link.id] &&
                        "border-destructive",
                    )}
                    value={link.url}
                    onChange={(e) =>
                      updateExtraLink(index, "url", e.target.value)
                    }
                    onBlur={() => handleExtraLinkBlur(index)}
                    placeholder="https://"
                    maxLength={500}
                  />
                  {extraLinkErrors[link.id] && !typingExtraLinks[link.id] && (
                    <p className="text-xs text-destructive">
                      {extraLinkErrors[link.id]}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => removeExtraLink(index)}
                className="mt-3 h-7 w-full hover:bg-destructive hover:text-white"
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

export default function DefaultEmailFooterForm({
  footerData,
  onFooterChange,
}: EmailFooterFormProps) {
  const { organizationId } = useUser();
  const linkTimersRef = useRef<Record<string, NodeJS.Timeout | null>>({});
  const extraLinkTimersRef = useRef<Record<string, NodeJS.Timeout | null>>({});
  const colorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track open accordion items
  const [openSocialLink, setOpenSocialLink] = useState<string | undefined>(
    undefined,
  );
  const [openExtraLink, setOpenExtraLink] = useState<string | undefined>(
    undefined,
  );

  // Track validation errors for links
  const [linkErrors, setLinkErrors] = useState<Record<string, string | null>>(
    {},
  );
  // Track which links are currently being typed
  const [typingLinks, setTypingLinks] = useState<Record<string, boolean>>({});

  // Track validation errors for extra links
  const [extraLinkErrors, setExtraLinkErrors] = useState<
    Record<string, string | null>
  >({});

  // Track which extra links are currently being typed
  const [typingExtraLinks, setTypingExtraLinks] = useState<
    Record<string, boolean>
  >({});

  // Local state with default values and validation errors
  const [localState, setLocalState] = useState<{
    name: string;
    subtitle: string;
    logo: string;
    links: LinkItem[];
    socials_color: string;
    socials_style: string;
    extra_links: ExtraLinkItem[];
    socials_icon_color: string;
  }>(() => {
    // Add IDs to links if they don't have them
    const initialLinks = Array.isArray(footerData?.links)
      ? footerData.links
      : [];
    const linksWithIds = initialLinks.map((link: any) => ({
      ...link,
      id: link.id || nanoid(),
    }));

    const initialExtraLinks = Array.isArray(footerData?.extra_links)
      ? footerData.extra_links
      : [];
    const extraLinksWithIds = initialExtraLinks.map((link: any) => ({
      ...link,
      id: link.id || nanoid(),
    }));

    return {
      name: footerData?.name || "",
      subtitle: footerData?.subtitle || "",
      logo: footerData?.logo || "",
      links: linksWithIds,
      extra_links: extraLinksWithIds,
      socials_color: footerData?.socials_color || "#000000",
      socials_style: footerData?.socials_style || "icon-only",
      socials_icon_color: footerData?.socials_icon_color || "#ffffff",
    };
  });

  // Update local state when footerData changes
  useEffect(() => {
    if (footerData) {
      // Add IDs to links if they don't have them
      const links = Array.isArray(footerData.links) ? footerData.links : [];
      const linksWithIds = links.map((link: any) => ({
        ...link,
        id: link.id || nanoid(),
      }));

      const extraLinks = Array.isArray(footerData.extra_links)
        ? footerData.extra_links
        : [];
      const extraLinksWithIds = extraLinks.map((link: any) => ({
        ...link,
        id: link.id || nanoid(),
      }));

      const newState = {
        name: footerData.name || "",
        subtitle: footerData.subtitle || "",
        logo: footerData.logo || "",
        links: linksWithIds,
        extra_links: extraLinksWithIds,
        socials_color: footerData.socials_color || "#000000",
        socials_style: footerData.socials_style || "icon-only",
        socials_icon_color: footerData.socials_icon_color || "#ffffff",
      };

      setLocalState(newState);
    }
  }, [footerData]);

  // Handle general state changes
  const handleChange = (key: string, value: any) => {
    // Create new state
    const newState = { ...localState, [key]: value };

    // Update local state immediately for responsive UI
    setLocalState(newState);

    // Validate required fields and update footer
    if (onFooterChange) {
      onFooterChange(newState);
    }
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
      // Check if the item is in the 'links' array
      let oldIndex = localState.links.findIndex(
        (link) => link.id === active.id,
      );
      let newIndex = localState.links.findIndex((link) => link.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder 'links'
        const reorderedLinks = [...localState.links];
        const [movedItem] = reorderedLinks.splice(oldIndex, 1);
        reorderedLinks.splice(newIndex, 0, movedItem);

        const updatedLinks = reorderedLinks.map((link, index) => ({
          ...link,
          order: index,
        }));

        handleChange("links", updatedLinks);
        return; // Exit if handled
      }

      // Check if the item is in the 'extra_links' array
      oldIndex = localState.extra_links.findIndex(
        (link) => link.id === active.id,
      );
      newIndex = localState.extra_links.findIndex(
        (link) => link.id === over.id,
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder 'extra_links'
        const reorderedExtraLinks = [...localState.extra_links];
        const [movedItem] = reorderedExtraLinks.splice(oldIndex, 1);
        reorderedExtraLinks.splice(newIndex, 0, movedItem);

        const updatedExtraLinks = reorderedExtraLinks.map((link, index) => ({
          ...link,
          order: index,
        }));

        handleChange("extra_links", updatedExtraLinks);
        return; // Exit if handled
      }

      // If neither list contains the items, log an error
      console.error(
        "Could not find items for DND update in either list:",
        active.id,
        over.id,
      );
    }
  };

  const addLink = () => {
    if (localState.links.length < 5) {
      const newLinkId = nanoid();
      const newLinks = [
        ...localState.links,
        { icon: "", url: "", order: localState.links.length, id: newLinkId },
      ];
      handleChange("links", newLinks);
      // Set this new link as the open accordion
      setOpenSocialLink(newLinkId);
    }
  };

  const addExtraLink = () => {
    if (localState.extra_links.length < 10) {
      const newLinkId = nanoid();
      const newExtraLinks = [
        ...localState.extra_links,
        {
          text: "",
          url: "",
          order: localState.extra_links.length,
          id: newLinkId,
        },
      ];
      handleChange("extra_links", newExtraLinks);
      // Set this new link as the open accordion
      setOpenExtraLink(newLinkId);
    }
  };

  const validateLink = (
    index: number,
    value: string,
    type: string,
  ): boolean => {
    try {
      const linkId = localState.links[index]?.id;
      if (!linkId) return false;

      if (type === "mail") {
        emailSchema.parse(value);
      } else {
        urlSchema.parse(value);
      }

      // Clear error if validation passes
      setLinkErrors((prev) => ({ ...prev, [linkId]: null }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set error message
        const linkId = localState.links[index]?.id;
        if (linkId) {
          setLinkErrors((prev) => ({
            ...prev,
            [linkId]: error.errors[0].message,
          }));
        }
        return false;
      }
      return true;
    }
  };

  const updateLink = (index: number, key: "icon" | "url", value: string) => {
    const newLinks = [...localState.links];
    newLinks[index] = { ...newLinks[index], [key]: value };
    const linkId = newLinks[index].id;

    // If updating the URL field
    if (key === "url") {
      // Mark as typing
      setTypingLinks((prev) => ({ ...prev, [linkId]: true }));

      // Clear any existing timer
      if (linkTimersRef.current[linkId]) {
        clearTimeout(linkTimersRef.current[linkId]);
      }

      // Set a new timer to validate after typing stops
      linkTimersRef.current[linkId] = setTimeout(() => {
        setTypingLinks((prev) => ({ ...prev, [linkId]: false }));

        // Validate based on the icon type
        const isValid = validateLink(index, value, newLinks[index].icon);

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
      }, 800); // 800ms debounce

      // Update local state immediately for responsive UI
      setLocalState((prev) => ({
        ...prev,
        links: newLinks,
      }));
    } else {
      // For icon changes, update immediately and clear any existing errors
      if (key === "icon") {
        setLinkErrors((prev) => ({ ...prev, [linkId]: null }));
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
    const linkId = localState.links[index]?.id;
    if (!linkId) return;

    if (typingLinks[linkId]) {
      setTypingLinks((prev) => ({ ...prev, [linkId]: false }));

      if (linkTimersRef.current[linkId]) {
        clearTimeout(linkTimersRef.current[linkId]);
        linkTimersRef.current[linkId] = null;
      }

      const link = localState.links[index];
      const isValid = validateLink(index, link.url, link.icon);

      if (isValid) {
        // No need to create a new state object since we're not changing anything
        // Just trigger the server update through the prop
        if (onFooterChange) {
          onFooterChange(localState);
        }
      }
    }
  };

  const removeLink = (index: number) => {
    const linkId = localState.links[index]?.id;
    if (!linkId) return;

    const newLinks = localState.links.filter(
      (_: LinkItem, i: number) => i !== index,
    );

    const newState = { ...localState, links: newLinks };

    // Update local state
    setLocalState(newState);

    // Trigger UI update and server update through prop
    if (onFooterChange) {
      onFooterChange(newState);
    }

    // Clean up any errors or timers for this index
    setLinkErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[linkId];
      return newErrors;
    });

    if (linkTimersRef.current[linkId]) {
      clearTimeout(linkTimersRef.current[linkId]);
      delete linkTimersRef.current[linkId];
    }
  };

  const updateExtraLink = (
    index: number,
    key: "text" | "url",
    value: string,
  ) => {
    const newExtraLinks = [...localState.extra_links];
    newExtraLinks[index] = { ...newExtraLinks[index], [key]: value };
    const linkId = newExtraLinks[index].id;

    // If updating the URL field
    if (key === "url") {
      // Mark as typing
      setTypingExtraLinks((prev) => ({ ...prev, [linkId]: true }));

      // Clear any existing timer
      if (extraLinkTimersRef.current[linkId]) {
        clearTimeout(extraLinkTimersRef.current[linkId]);
      }

      // Set a new timer to validate after typing stops
      extraLinkTimersRef.current[linkId] = setTimeout(() => {
        setTypingExtraLinks((prev) => ({ ...prev, [linkId]: false }));

        let isValid = false;
        try {
          urlSchema.parse(value);
          isValid = true;
          // Clear error if validation passes
          setExtraLinkErrors((prev) => ({ ...prev, [linkId]: null }));
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Set error message
            setExtraLinkErrors((prev) => ({
              ...prev,
              [linkId]: error.errors[0].message,
            }));
          }
        }

        // Only update if valid
        if (isValid) {
          const newState = { ...localState, extra_links: newExtraLinks };

          // Update local state
          setLocalState(newState);

          // Trigger UI update and server update through prop
          if (onFooterChange) {
            onFooterChange(newState);
          }
        }
      }, 800); // 800ms debounce

      // Update local state immediately for responsive UI
      setLocalState((prev) => ({
        ...prev,
        extra_links: newExtraLinks,
      }));
    } else {
      // For text changes, update immediately and clear any existing errors
      if (key === "text") {
        setExtraLinkErrors((prev) => ({ ...prev, [linkId]: null }));
      }

      const newState = { ...localState, extra_links: newExtraLinks };

      // Update local state
      setLocalState(newState);

      // Trigger UI update and server update through prop
      if (onFooterChange) {
        onFooterChange(newState);
      }
    }
  };

  const handleExtraLinkBlur = (index: number) => {
    // When input loses focus, clear typing state and validate
    const linkId = localState.extra_links[index]?.id;
    if (!linkId) return;

    if (typingExtraLinks[linkId]) {
      setTypingExtraLinks((prev) => ({ ...prev, [linkId]: false }));

      if (extraLinkTimersRef.current[linkId]) {
        clearTimeout(extraLinkTimersRef.current[linkId]);
        extraLinkTimersRef.current[linkId] = null;
      }

      const link = localState.extra_links[index];
      let isValid = false;
      try {
        urlSchema.parse(link.url);
        isValid = true;
        // Clear error if validation passes
        setExtraLinkErrors((prev) => ({ ...prev, [linkId]: null }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Set error message
          setExtraLinkErrors((prev) => ({
            ...prev,
            [linkId]: error.errors[0].message,
          }));
        }
      }

      if (isValid) {
        // No need to create a new state object since we're not changing anything
        // Just trigger the server update through the prop
        if (onFooterChange) {
          onFooterChange(localState);
        }
      }
    }
  };

  const removeExtraLink = (index: number) => {
    const linkId = localState.extra_links[index]?.id;
    if (!linkId) return;

    const newExtraLinks = localState.extra_links.filter(
      (_: ExtraLinkItem, i: number) => i !== index,
    );

    const newState = { ...localState, extra_links: newExtraLinks };

    // Update local state
    setLocalState(newState);

    // Trigger UI update and server update through prop
    if (onFooterChange) {
      onFooterChange(newState);
    }

    // Clean up any errors or timers for this index
    setExtraLinkErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[linkId];
      return newErrors;
    });

    if (extraLinkTimersRef.current[linkId]) {
      clearTimeout(extraLinkTimersRef.current[linkId]);
      delete extraLinkTimersRef.current[linkId];
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
      Object.values(extraLinkTimersRef.current).forEach((timer) => {
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

  return (
    <>
      <div className="flex flex-col gap-6 px-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Email Footer</h2>
        </div>
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
              items={localState.links.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={openSocialLink}
                onValueChange={setOpenSocialLink}
              >
                {localState.links.map((link: LinkItem, index: number) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    index={index}
                    linkErrors={linkErrors}
                    typingLinks={typingLinks}
                    updateLink={updateLink}
                    removeLink={removeLink}
                    handleLinkBlur={handleLinkBlur}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
        </div>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-md font-bold">Links</Label>
            <Button
              onClick={addExtraLink}
              disabled={localState.extra_links.length >= 10}
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
              items={localState.extra_links.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={openExtraLink}
                onValueChange={setOpenExtraLink}
              >
                {localState.extra_links.map(
                  (link: ExtraLinkItem, index: number) => (
                    <SortableExtraLinkItem
                      key={link.id}
                      link={link}
                      index={index}
                      extraLinkErrors={extraLinkErrors || {}}
                      typingExtraLinks={typingExtraLinks}
                      updateExtraLink={updateExtraLink}
                      removeExtraLink={removeExtraLink}
                      handleExtraLinkBlur={handleExtraLinkBlur}
                    />
                  ),
                )}
              </Accordion>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </>
  );
}
