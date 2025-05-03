"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@church-space/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { Input } from "@church-space/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@church-space/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link,
  Strikethrough,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Text,
  List,
  ListOrdered,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ExtraLargeText, Palette, XIcon } from "@church-space/ui/icons";
import { cn } from "@church-space/ui/cn";
import { z } from "zod";

interface ToolbarProps {
  editor: Editor | null;
  defaultTextColor?: string;
  accentTextColor?: string;
}

// Define validation schema
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

  // Allow mailto links
  if (url.startsWith("mailto:")) {
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

const Toolbar = ({
  editor,
  defaultTextColor = "#000000",
  accentTextColor = "#666666",
}: ToolbarProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [, setForceUpdate] = useState(0);
  const [currentHeadingLevel, setCurrentHeadingLevel] = useState<number | null>(
    null,
  );
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isTypingLink, setIsTypingLink] = useState(false);
  const linkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set default alignment to left when editor is initialized
  useEffect(() => {
    if (!editor) return;

    // Only set default alignment if it's not already set
    if (
      !editor.isActive({ textAlign: "left" }) &&
      !editor.isActive({ textAlign: "center" }) &&
      !editor.isActive({ textAlign: "right" }) &&
      !editor.isActive({ textAlign: "justify" })
    ) {
      editor.commands.setTextAlign("left");
    }
  }, [editor]);

  // Force re-render when editor state changes to update toggle states
  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      setForceUpdate((prev) => prev + 1);

      // Update current heading level when selection changes
      if (editor.isActive("heading", { level: 1 })) {
        setCurrentHeadingLevel(1);
      } else if (editor.isActive("heading", { level: 2 })) {
        setCurrentHeadingLevel(2);
      } else if (editor.isActive("heading", { level: 3 })) {
        setCurrentHeadingLevel(3);
      } else if (editor.isActive("heading", { level: 4 })) {
        setCurrentHeadingLevel(4);
      } else {
        setCurrentHeadingLevel(null);
      }

      // Get current link URL if a link is selected
      if (editor.isActive("link")) {
        const attributes = editor.getAttributes("link");
        if (attributes.href) {
          setLinkUrl(attributes.href);
        }
      } else {
        setLinkUrl("");
      }
    };

    // Immediate update for toggle state
    const handleClick = () => {
      // Use setTimeout to ensure this runs after the editor state has updated
      setTimeout(updateHandler, 0);
    };

    editor.on("selectionUpdate", updateHandler);
    editor.on("update", updateHandler);

    // Add click event listener to the document to catch all clicks
    document.addEventListener("click", handleClick);

    return () => {
      editor.off("selectionUpdate", updateHandler);
      editor.off("update", updateHandler);
      document.removeEventListener("click", handleClick);
    };
  }, [editor]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (linkTimerRef.current) {
        clearTimeout(linkTimerRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    // Validate URL before setting
    try {
      urlSchema.parse(linkUrl);

      if (linkUrl === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl })
          .run();
      }
      setLinkUrl("");
      setLinkError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setLinkError(error.errors[0].message);
      }
    }
  };

  const handleLinkChange = (value: string) => {
    setLinkUrl(value);
    setIsTypingLink(true);

    // Clear any existing timer
    if (linkTimerRef.current) {
      clearTimeout(linkTimerRef.current);
    }

    // Set a new timer to validate after typing stops
    linkTimerRef.current = setTimeout(() => {
      setIsTypingLink(false);

      try {
        urlSchema.parse(value);
        setLinkError(null);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setLinkError(error.errors[0].message);
        }
      }
    }, 800); // 800ms debounce
  };

  const handleLinkBlur = () => {
    // When input loses focus, clear typing state and validate
    if (isTypingLink) {
      setIsTypingLink(false);

      if (linkTimerRef.current) {
        clearTimeout(linkTimerRef.current);
        linkTimerRef.current = null;
      }

      try {
        urlSchema.parse(linkUrl);
        setLinkError(null);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setLinkError(error.errors[0].message);
        }
      }
    }
  };

  // Get current text alignment
  const textAlign = editor.isActive({ textAlign: "left" })
    ? "left"
    : editor.isActive({ textAlign: "center" })
      ? "center"
      : editor.isActive({ textAlign: "right" })
        ? "right"
        : editor.isActive({ textAlign: "justify" })
          ? "justify"
          : "left";

  // Get heading level display text
  const getHeadingDisplayText = () => {
    if (currentHeadingLevel === 1) return "Heading 1";
    if (currentHeadingLevel === 2) return "Heading 2";
    if (currentHeadingLevel === 3) return "Heading 3";
    if (currentHeadingLevel === 4) return "Extra Large";
    return "Normal Text";
  };

  // Get heading icon based on current level
  const getHeadingIcon = () => {
    if (currentHeadingLevel === 1) return <Heading1 className="h-5 w-5" />;
    if (currentHeadingLevel === 2) return <Heading2 className="h-5 w-5" />;
    if (currentHeadingLevel === 3) return <Heading3 className="h-5 w-5" />;
    if (currentHeadingLevel === 4)
      return <ExtraLargeText height="20" width="20" strokewidth={1.5} />;
    return <Text className="h-5 w-5" />;
  };

  return (
    <div className="flex flex-shrink-0 flex-wrap gap-2 px-2 pt-1.5">
      <ToggleGroup type="multiple" className="flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="bold"
              data-state={editor.isActive("bold") ? "on" : "off"}
              onClick={() => {
                editor.chain().focus().toggleBold().run();
                setForceUpdate((prev) => prev + 1); // Force immediate update
              }}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={
                editor.isActive("bold")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="italic"
              data-state={editor.isActive("italic") ? "on" : "off"}
              onClick={() => {
                editor.chain().focus().toggleItalic().run();
                setForceUpdate((prev) => prev + 1); // Force immediate update
              }}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={
                editor.isActive("italic")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="underline"
              data-state={editor.isActive("underline") ? "on" : "off"}
              onClick={() => {
                editor.chain().focus().toggleUnderline().run();
                setForceUpdate((prev) => prev + 1); // Force immediate update
              }}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className={
                editor.isActive("underline")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Underline className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Underline</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="strike"
              data-state={editor.isActive("strike") ? "on" : "off"}
              onClick={() => {
                editor.chain().focus().toggleStrike().run();
                setForceUpdate((prev) => prev + 1); // Force immediate update
              }}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={
                editor.isActive("strike")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Strikethrough className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="bulletList"
              data-state={editor.isActive("bulletList") ? "on" : "off"}
              onClick={() => {
                editor.chain().focus().toggleBulletList().run();
                setForceUpdate((prev) => prev + 1);
              }}
              disabled={!editor.can().chain().focus().toggleBulletList().run()}
              className={
                editor.isActive("bulletList")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="orderedList"
              data-state={editor.isActive("orderedList") ? "on" : "off"}
              onClick={() => {
                editor.chain().focus().toggleOrderedList().run();
                setForceUpdate((prev) => prev + 1);
              }}
              disabled={!editor.can().chain().focus().toggleOrderedList().run()}
              className={
                editor.isActive("orderedList")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <ListOrdered className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Numbered List</TooltipContent>
        </Tooltip>
      </ToggleGroup>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 px-2"
              >
                {getHeadingIcon()}
                <span className="text-xs">{getHeadingDisplayText()}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Text Style</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              setCurrentHeadingLevel(null);
            }}
            className={
              currentHeadingLevel === null
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Text className="mr-2 h-4 w-4" />
            Normal Text
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              setCurrentHeadingLevel(
                editor.isActive("heading", { level: 1 }) ? 1 : null,
              );
            }}
            className={
              currentHeadingLevel === 1
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Heading1 className="mr-2 h-4 w-4" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              setCurrentHeadingLevel(
                editor.isActive("heading", { level: 2 }) ? 2 : null,
              );
            }}
            className={
              currentHeadingLevel === 2
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Heading2 className="mr-2 h-4 w-4" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              setCurrentHeadingLevel(
                editor.isActive("heading", { level: 3 }) ? 3 : null,
              );
            }}
            className={
              currentHeadingLevel === 3
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Heading3 className="mr-2 h-4 w-4" />
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().setHeading({ level: 4 }).run();
              setCurrentHeadingLevel(4);
            }}
            className={
              currentHeadingLevel === 4
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <ExtraLargeText height="20" width="20" strokewidth={1.5} />
            Extra Large
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToggleGroup type="single" value={textAlign} className="flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="left"
              data-state={editor.isActive({ textAlign: "left" }) ? "on" : "off"}
              onClick={() => {
                editor.chain().focus().setTextAlign("left").run();
                setForceUpdate((prev) => prev + 1); // Force immediate update
              }}
              className={
                editor.isActive({ textAlign: "left" })
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="center"
              data-state={
                editor.isActive({ textAlign: "center" }) ? "on" : "off"
              }
              onClick={() => {
                editor.chain().focus().setTextAlign("center").run();
                setForceUpdate((prev) => prev + 1); // Force immediate update
              }}
              className={
                editor.isActive({ textAlign: "center" })
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="right"
              data-state={
                editor.isActive({ textAlign: "right" }) ? "on" : "off"
              }
              onClick={() => {
                editor.chain().focus().setTextAlign("right").run();
                setForceUpdate((prev) => prev + 1); // Force immediate update
              }}
              className={
                editor.isActive({ textAlign: "right" })
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="justify"
              data-state={
                editor.isActive({ textAlign: "justify" }) ? "on" : "off"
              }
              onClick={() => {
                editor.chain().focus().setTextAlign("justify").run();
                setForceUpdate((prev) => prev + 1); // Force immediate update
              }}
              className={
                editor.isActive({ textAlign: "justify" })
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <AlignJustify className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Justify</TooltipContent>
        </Tooltip>
      </ToggleGroup>

      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  editor.isActive("link")
                    ? "bg-accent text-accent-foreground"
                    : "",
                )}
              >
                <Link className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Link</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Input
                type="url"
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => handleLinkChange(e.target.value)}
                onBlur={handleLinkBlur}
                className={cn(
                  linkError && !isTypingLink && "border-destructive",
                )}
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setLink();
                  }
                }}
              />
              {linkError && !isTypingLink && (
                <p className="text-xs text-destructive">{linkError}</p>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                onClick={setLink}
                disabled={linkError !== null && !isTypingLink}
                className="flex-1"
              >
                {editor.isActive("link") ? "Update Link" : "Add Link"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setLinkUrl("");
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .unsetLink()
                    .run();
                }}
                className="h-9 w-9"
              >
                <XIcon />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Palette />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Text Color</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().setColor(defaultTextColor).run();
              editor.chain().focus().setDefaultTextColor().run();
              setForceUpdate((prev) => prev + 1);
            }}
          >
            <div
              className="mr-2 h-5 w-5 rounded-full"
              style={{ backgroundColor: defaultTextColor }}
            />
            Default
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().setColor(accentTextColor).run();
              editor.chain().focus().setAccentTextColor().run();
              setForceUpdate((prev) => prev + 1);
            }}
          >
            <div
              className="mr-2 h-5 w-5 rounded-full"
              style={{ backgroundColor: accentTextColor }}
            />
            Accent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Toolbar;
