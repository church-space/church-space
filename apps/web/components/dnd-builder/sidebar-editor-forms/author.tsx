import { useUser } from "@/stores/use-user";
import type { AuthorBlockData, Block } from "@/types/blocks";
import { Button } from "@church-space/ui/button";
import {
  Bluesky,
  Facebook,
  Instagram,
  Linkedin,
  Spotify,
  Podcast,
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
import { useRef, useState } from "react";
import { z } from "zod";
import FileUpload from "../file-upload";
import { Switch } from "@church-space/ui/switch";
import { cn } from "@church-space/ui/cn";
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
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";
import { nanoid } from "nanoid";

// Add 'id' to the existing link type definition
type LinkItem = AuthorBlockData["links"][number] & {
  id: string;
};

interface AuthorFormProps {
  block: Block & { data?: AuthorBlockData };
  onUpdate: (block: Block) => void;
}

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

// Create a sortable accordion item component
function SortableLinkItem({
  link,
  index,
  linkId,
  openItem,
  setOpenItem,
  typingLinks,
  linkErrors,
  updateLink,
  removeLink,
  handleLinkBlur,
}: {
  link: LinkItem;
  index: number;
  linkId: string;
  openItem: string | undefined;
  setOpenItem: (value: string | undefined) => void;
  typingLinks: Record<string, boolean>;
  linkErrors: Record<string, string | null>;
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
    x: XTwitter,
    vimeo: Vimeo,
    threads: Threads,
    bluesky: Bluesky,
    spotify: Spotify,
    podcast: Podcast,
    linkedin: Linkedin,
  };

  const Icon = link.icon
    ? socialIcons[link.icon as keyof typeof socialIcons]
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

        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={openItem === linkId ? linkId : undefined}
          onValueChange={(value) => setOpenItem(value)}
        >
          <AccordionItem value={linkId} className="my-0.5 border-0">
            <div
              onClick={() =>
                setOpenItem(openItem === linkId ? undefined : linkId)
              }
            >
              <CustomAccordionTrigger>
                <div className="flex items-center gap-2">
                  {Icon && <Icon height="20" width="20" />}
                  {link.icon
                    ? link.icon.charAt(0).toUpperCase() + link.icon.slice(1)
                    : `Link ${index + 1}`}
                </div>
              </CustomAccordionTrigger>
            </div>
            <AccordionContent>
              <div className="flex w-full flex-col gap-y-2 py-1">
                <Label>Icon</Label>
                <div className="col-span-2 mb-2 flex">
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
                <Label>{link.icon === "mail" ? "Email" : "URL"}</Label>
                <div className="col-span-2 mb-2 flex flex-col gap-1">
                  <Input
                    className={
                      linkErrors[linkId] && !typingLinks[linkId]
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
                  {linkErrors[linkId] && !typingLinks[linkId] && (
                    <p className="text-xs text-red-500">{linkErrors[linkId]}</p>
                  )}
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
        </Accordion>
      </div>
    </div>
  );
}

export default function AuthorForm({ block, onUpdate }: AuthorFormProps) {
  const { organizationId } = useUser();
  const [openLink, setOpenLink] = useState<string | undefined>(undefined);

  const [localState, setLocalState] = useState<
    Omit<AuthorBlockData, "links"> & { links: LinkItem[] }
  >(() => {
    const initialLinks = block.data?.links || [];
    const linksWithIds = initialLinks.map((link: any) => ({
      ...link,
      id: link.id || nanoid(),
    }));
    return {
      name: block.data?.name || "",
      subtitle: block.data?.subtitle || "",
      avatar: block.data?.avatar || "",
      links: linksWithIds,
      textColor: block.data?.textColor || "#000000",
      hideAvatar: block.data?.hideAvatar || false,
      linkColor: block.data?.linkColor || "#000000",
    };
  });

  // Track validation errors for links
  const [linkErrors, setLinkErrors] = useState<Record<string, string | null>>(
    {},
  );
  // Track which links are currently being typed
  const [typingLinks, setTypingLinks] = useState<Record<string, boolean>>({});
  // Debounce timers for link validation
  const linkTimersRef = useRef<Record<string, NodeJS.Timeout | null>>({});

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
      const oldIndex = localState.links.findIndex(
        (link) => link.id === active.id,
      );
      const newIndex = localState.links.findIndex(
        (link) => link.id === over.id,
      );

      if (oldIndex === -1 || newIndex === -1) {
        console.error(
          "Could not find links for DND update:",
          active.id,
          over.id,
        );
        return;
      }

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
    linkId: string,
  ): boolean => {
    try {
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
        setLinkErrors((prev) => ({
          ...prev,
          [linkId]: error.errors[0].message,
        }));
        return false;
      }
      return true;
    }
  };

  const handleChange = (key: keyof AuthorBlockData, value: any) => {
    // Immediately update the local state for responsive UI
    const newState = { ...localState, [key]: value };
    setLocalState(newState);

    // Update the UI
    onUpdate({
      ...block,
      data: newState as AuthorBlockData, // Cast back for onUpdate
    });
  };

  const handleUploadComplete = (path: string) => {
    // Update the avatar with the file path
    handleChange("avatar", path);
  };

  const addLink = () => {
    if (localState.links.length < 5) {
      const newLinkId = nanoid();
      const newLinks = [
        ...localState.links,
        { icon: "", url: "", order: localState.links.length, id: newLinkId },
      ];
      handleChange("links", newLinks);
      setOpenLink(newLinkId);
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
        const isValid = validateLink(value, newLinks[index].icon, linkId);

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
        setLinkErrors((prev) => ({ ...prev, [linkId]: null }));
      }
      handleChange("links", newLinks);
    }
  };

  const handleLinkBlur = (index: number) => {
    // When input loses focus, clear typing state and validate
    const linkId = localState.links[index].id;

    if (typingLinks[linkId]) {
      setTypingLinks((prev) => ({ ...prev, [linkId]: false }));

      if (linkTimersRef.current[linkId]) {
        clearTimeout(linkTimersRef.current[linkId]);
        linkTimersRef.current[linkId] = null;
      }

      const link = localState.links[index];
      const isValid = validateLink(link.url, link.icon, linkId);

      if (isValid) {
        handleChange("links", localState.links);
      }
    }
  };

  const removeLink = (index: number) => {
    const newLinks = localState.links.filter((_, i) => i !== index);
    const removedLinkId = localState.links[index].id;
    handleChange("links", newLinks);

    // Clean up any errors or timers for this index
    setLinkErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[removedLinkId];
      return newErrors;
    });

    setTypingLinks((prev) => {
      const newTyping = { ...prev };
      delete newTyping[removedLinkId];
      return newTyping;
    });

    if (linkTimersRef.current[removedLinkId]) {
      clearTimeout(linkTimersRef.current[removedLinkId]);
      delete linkTimersRef.current[removedLinkId];
    }
  };

  const onImageRemove = () => {
    // Update the avatar with an empty string
    handleChange("avatar", "");
  };

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 items-center gap-x-2 gap-y-4">
          <Label>Picture</Label>
          <div className="col-span-2">
            <FileUpload
              organizationId={organizationId}
              onUploadComplete={handleUploadComplete}
              initialFilePath={localState.avatar}
              onRemove={onImageRemove}
              type="image"
            />
          </div>
          <Label className="mt-0.5">Hide Picture</Label>
          <div className="col-span-2 mt-2">
            <Switch
              checked={localState.hideAvatar}
              onCheckedChange={(checked) => handleChange("hideAvatar", checked)}
            />
          </div>
          <Label>Name</Label>
          <Input
            className="col-span-2 bg-background"
            value={localState.name}
            placeholder="Name"
            onChange={(e) => handleChange("name", e.target.value)}
            maxLength={150}
          />
          <Label>Title</Label>
          <Input
            className="col-span-2 bg-background"
            value={localState.subtitle}
            placeholder="Pastor, Deacon, etc."
            onChange={(e) => handleChange("subtitle", e.target.value)}
            maxLength={150}
          />

          <Label className="font-medium">Icon Color</Label>
          <Select
            value={localState.linkColor}
            onValueChange={(value) => handleChange("linkColor", value)}
          >
            <SelectTrigger className="col-span-2 bg-background">
              <SelectValue placeholder="Select icon color" />
            </SelectTrigger>
            <SelectContent>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-md font-bold">Social Links</Label>
          <Button
            size="sm"
            onClick={addLink}
            disabled={localState.links.length >= 5}
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
            <div className="w-full">
              {localState.links.map((link, index) => (
                <SortableLinkItem
                  key={index}
                  link={link}
                  index={index}
                  linkId={link.id}
                  openItem={openLink}
                  setOpenItem={setOpenLink}
                  typingLinks={typingLinks}
                  linkErrors={linkErrors}
                  updateLink={updateLink}
                  removeLink={removeLink}
                  handleLinkBlur={handleLinkBlur}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
