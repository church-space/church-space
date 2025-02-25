import { useUser } from "@/stores/use-user";
import type { AuthorBlockData, Block } from "@/types/blocks";
import { Button } from "@trivo/ui/button";
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
} from "@trivo/ui/icons";
import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import FileUpload from "../file-upload";
import { z } from "zod";
import ColorPicker from "../color-picker";

interface AuthorFormProps {
  block: Block & { data?: AuthorBlockData };
  onUpdate: (block: Block, addToHistory?: boolean) => void;
}

export default function AuthorForm({ block, onUpdate }: AuthorFormProps) {
  const { organizationId } = useUser();

  const [localState, setLocalState] = useState<AuthorBlockData>({
    name: block.data?.name || "",
    subtitle: block.data?.subtitle || "",
    avatar: block.data?.avatar || "",
    links: block.data?.links || [],
    textColor: block.data?.textColor || "#000000",
  });

  // Create a ref to store the latest state for the debounced function
  const stateRef = useRef(localState);

  // Track validation errors for links
  const [linkErrors, setLinkErrors] = useState<Record<number, string | null>>(
    {}
  );
  // Track which links are currently being typed
  const [typingLinks, setTypingLinks] = useState<Record<number, boolean>>({});
  // Debounce timers for link validation
  const linkTimersRef = useRef<Record<number, NodeJS.Timeout | null>>({});

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

  // Update the ref whenever localState changes
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(linkTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  // Create a debounced function that only updates the history
  const debouncedHistoryUpdate = useCallback(
    debounce(() => {
      console.log("Author form updating block in history:", {
        blockId: block.id,
        blockType: block.type,
        newState: stateRef.current,
      });
      // Add to history
      onUpdate(
        {
          ...block,
          data: stateRef.current,
        },
        true
      );
    }, 500),
    [block, onUpdate]
  );

  useEffect(() => {
    setLocalState({
      name: block.data?.name || "",
      subtitle: block.data?.subtitle || "",
      avatar: block.data?.avatar || "",
      links: block.data?.links || [],
      textColor: block.data?.textColor || "#000000",
    });
  }, [block.data]);

  const handleChange = (key: keyof AuthorBlockData, value: any) => {
    // Immediately update the local state for responsive UI
    const newState = { ...localState, [key]: value };
    setLocalState(newState);

    // Update the UI immediately without adding to history
    onUpdate(
      {
        ...block,
        data: newState,
      },
      false
    );

    // Debounce the history update
    debouncedHistoryUpdate();
  };

  const handleUploadComplete = (path: string) => {
    // Update the avatar with the file path
    handleChange("avatar", path);
  };

  const addLink = () => {
    if (localState.links.length < 5) {
      const newLinks = [...localState.links, { icon: "", url: "" }];
      handleChange("links", newLinks);
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

  const onImageRemove = () => {
    console.log("Removing avatar image");
    // Update the avatar with an empty string
    handleChange("avatar", "");

    // Force an update to history to ensure the change is saved
    debouncedHistoryUpdate();
  };

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>Avatar</Label>
          <div className="col-span-2">
            <FileUpload
              organizationId={organizationId}
              onUploadComplete={handleUploadComplete}
              initialFilePath={localState.avatar}
              onRemove={onImageRemove}
            />
          </div>
          <Label>Name</Label>
          <Input
            className="col-span-2"
            value={localState.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <Label>Title</Label>
          <Input
            className="col-span-2"
            value={localState.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
          />
          <Label>Text Color</Label>
          <ColorPicker
            value={localState.textColor}
            onChange={(color) => handleChange("textColor", color)}
          />
        </div>
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
