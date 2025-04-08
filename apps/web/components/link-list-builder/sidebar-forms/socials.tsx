import ColorPicker from "@/components/dnd-builder/color-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import {
  Bluesky,
  Facebook,
  Instagram,
  Linkedin,
  LinkIcon,
  MailFilled,
  Threads,
  TikTok,
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
import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { SocialLink } from "../link-list-builder";
import { socialIcons } from "../link-list-socials";

// Override accordion trigger styles for this component
const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionTrigger>
>((props, ref) => (
  <div className="flex w-full flex-1">
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full flex-1 items-center justify-between px-3 py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
        props.className,
      )}
      {...props}
    >
      <span className="truncate pr-2 text-sm">{props.children}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 transition-transform duration-200"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  </div>
));
CustomAccordionTrigger.displayName = "CustomAccordionTrigger";

// Create a sortable accordion item component for socials
function SortableSocialItem({
  link,
  index,
  openItem,
  setOpenItem,
  typingLinks,
  linkErrors,
  updateLink,
  removeLink,
  handleLinkBlur,
  getSocialDisplayName,
}: {
  link: SocialLink;
  index: number;
  openItem: string | undefined;
  setOpenItem: (value: string | undefined) => void;
  typingLinks: Record<number, boolean>;
  linkErrors: Record<number, string | null>;
  updateLink: (index: number, field: keyof SocialLink, value: string) => void;
  removeLink: (index: number) => void;
  handleLinkBlur: (index: number) => void;
  getSocialDisplayName: (iconType: string) => string;
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

  // Generate a stable ID from link properties
  const linkId = `social-${link.order}-${index}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 w-full rounded-md border",
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

        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={openItem === linkId ? linkId : undefined}
          onValueChange={(value) => setOpenItem(value)}
        >
          <AccordionItem value={linkId} className="border-0">
            <AccordionTrigger className="w-full rounded-sm px-2 py-3">
              <span className="truncate pr-2 text-sm">
                {getSocialDisplayName(link.icon)}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-4 items-center gap-x-2 gap-y-2 py-1 pr-2">
                <Label>Icon</Label>
                <div className="col-span-3 flex">
                  <Select
                    value={link.icon}
                    onValueChange={(value) => updateLink(index, "icon", value)}
                  >
                    <SelectTrigger className="bg-background">
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
                </div>
                <Label>{link.icon === "mail" ? "Email" : "URL"}</Label>
                <div className="col-span-3 flex flex-col gap-1">
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
              <Button
                variant="outline"
                onClick={() => removeLink(index)}
                className="col-span-4 mt-3 h-7 w-full hover:bg-destructive hover:text-white"
              >
                Remove Link
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

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
  // Accordion open state
  const [openSocial, setOpenSocial] = useState<string | undefined>(undefined);

  // Debounced color update handlers
  const colorUpdateTimerRef = useRef<Record<string, NodeJS.Timeout | null>>({});

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

      // Update the order of the social links
      const reorderedLinks = [...localSocialLinks];
      const [movedItem] = reorderedLinks.splice(oldIndex, 1);
      reorderedLinks.splice(newIndex, 0, movedItem);

      // Update the order property for each link
      const updatedLinks = reorderedLinks.map((link, index) => ({
        ...link,
        order: index,
      }));

      // Update local state
      setLocalSocialLinks(updatedLinks);

      // Update parent state after reordering
      setSocialLinks(updatedLinks);
    }
  };

  // Sync local social links with props when props change
  useEffect(() => {
    setLocalSocialLinks(socialLinks);
  }, [socialLinks]);

  const handleChange = (key: keyof LocalState, value: any) => {
    if (key === "socials_style") {
      // Update parent state directly - this is a dropdown selection, not a continuous input
      // so it's appropriate to trigger a state update
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
      const currentLinks = [...localSocialLinks];
      const link = currentLinks[index];

      // Validate the URL/email value
      const isValid = validateLink(link.url, link.icon, index);

      // Only update parent state on blur if valid
      if (isValid) {
        setSocialLinks(currentLinks);
      }
    }
  };

  // Add a new empty social link
  const addLink = () => {
    if (localSocialLinks.length < 5) {
      // Find the highest order value
      const maxOrder =
        localSocialLinks.length > 0
          ? Math.max(
              ...localSocialLinks.map((link) =>
                link.order !== undefined ? link.order : 0,
              ),
            )
          : -1;

      // Create new social links array with added empty link
      const newLinks = [
        ...localSocialLinks,
        {
          icon: "link" as keyof typeof socialIcons,
          url: "",
          order: maxOrder + 1,
        },
      ];

      // Update local state for immediate UI feedback
      setLocalSocialLinks(newLinks);

      // Update parent state - this is a deliberate user action (not a keystroke)
      // so it's appropriate to trigger a state update
      setSocialLinks(newLinks);

      // Open the newly created link
      setOpenSocial(`social-${maxOrder + 1}-${localSocialLinks.length}`);
    }
  };

  // Handle field updates with optimistic UI and batched parent state updates
  const updateLink = (
    index: number,
    field: keyof SocialLink,
    value: string,
  ) => {
    // Create updated social links array
    const newLinks = [...localSocialLinks];

    // If changing icon type, clear the URL field if switching between mail and non-mail
    if (field === "icon") {
      const oldType = newLinks[index].icon;
      const newType = value as keyof typeof socialIcons;
      if (
        (oldType === "mail" && newType !== "mail") ||
        (oldType !== "mail" && newType === "mail")
      ) {
        newLinks[index] = { ...newLinks[index], url: "", icon: newType };
      } else {
        newLinks[index] = { ...newLinks[index], icon: newType };
      }
    } else {
      newLinks[index] = { ...newLinks[index], [field]: value };
    }

    // Always update local state immediately for responsive UI
    setLocalSocialLinks(newLinks);

    // For URL field, handle validation and parent updates
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

        // Validate the URL/email value using the newLinks that contain the latest changes
        const isValid = validateLink(
          newLinks[index].url,
          newLinks[index].icon,
          index,
        );

        // Only update parent after typing has stopped and validation passes
        if (isValid) {
          setSocialLinks(newLinks);
        }
      }, 800);
    } else {
      // For non-URL fields, update parent state with a shorter debounce
      if (linkTimersRef.current[index]) {
        clearTimeout(linkTimersRef.current[index]);
      }

      linkTimersRef.current[index] = setTimeout(() => {
        setSocialLinks(newLinks);
      }, 400);
    }
  };

  // Remove a social link at specified index
  const removeLink = (index: number) => {
    // Create new social links array without the removed link
    const newLinks = localSocialLinks.filter((_, i) => i !== index);

    // Update order property for each link after removal
    const updatedLinks = newLinks.map((link, i) => ({
      ...link,
      order: i,
    }));

    // Update local state for immediate UI feedback
    setLocalSocialLinks(updatedLinks);

    // Update parent state - this is a deliberate user action (not a keystroke)
    // so it's appropriate to trigger a state update
    setSocialLinks(updatedLinks);

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
        case "socialsColor":
          setSocialsColor(currentColor);
          break;
        case "socialsIconColor":
          setSocialsIconColor(currentColor);
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

  // Function to get the display name for each social icon
  const getSocialDisplayName = (iconType: string): string => {
    switch (iconType) {
      case "facebook":
        return "Facebook";
      case "youtube":
        return "YouTube";
      case "instagram":
        return "Instagram";
      case "tiktok":
        return "TikTok";
      case "x":
        return "X";
      case "threads":
        return "Threads";
      case "bluesky":
        return "Bluesky";
      case "linkedin":
        return "LinkedIn";
      case "mail":
        return "Email";
      case "link":
      default:
        return "Website";
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-1">
      <div className="grid w-full grid-cols-3 items-center gap-2">
        <Label className="font-medium">Icon Style</Label>
        <Select
          value={socialsStyle}
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
        {socialsStyle === "filled" && (
          <>
            <Label className="font-medium">Background Color</Label>
            <ColorPicker
              value={socialsColor}
              onChange={(color) => handleColorChange("socialsColor", color)}
            />
          </>
        )}
        <Label className="font-medium">Icon Color</Label>
        <ColorPicker
          value={socialsIconColor}
          onChange={(color) => handleColorChange("socialsIconColor", color)}
        />
      </div>
      <div className="flex w-full flex-col gap-4">
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[
            (args) => ({
              ...args.transform,
              scaleX: 1,
              scaleY: 1,
            }),
          ]}
        >
          <SortableContext
            items={localSocialLinks.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="w-full">
              {localSocialLinks.map((link, index) => (
                <SortableSocialItem
                  key={index}
                  link={link}
                  index={index}
                  openItem={openSocial}
                  setOpenItem={setOpenSocial}
                  typingLinks={typingLinks}
                  linkErrors={linkErrors}
                  updateLink={updateLink}
                  removeLink={removeLink}
                  handleLinkBlur={handleLinkBlur}
                  getSocialDisplayName={getSocialDisplayName}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
