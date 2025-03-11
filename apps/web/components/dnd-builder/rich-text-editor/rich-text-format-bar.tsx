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
} from "lucide-react";
import { useEffect, useState } from "react";
import { Palette } from "@church-space/ui/icons";

interface ToolbarProps {
  editor: Editor | null;
  defaultTextColor?: string;
  accentTextColor?: string;
}

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
      } else {
        setCurrentHeadingLevel(null);
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

  if (!editor) {
    return null;
  }

  const setLink = () => {
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
    return "Normal Text";
  };

  // Get heading icon based on current level
  const getHeadingIcon = () => {
    if (currentHeadingLevel === 1) return <Heading1 className="h-5 w-5" />;
    if (currentHeadingLevel === 2) return <Heading2 className="h-5 w-5" />;
    if (currentHeadingLevel === 3) return <Heading3 className="h-5 w-5" />;
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
              <Button variant="ghost" size="icon">
                <Link className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Link</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-4">
            <Input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <Button onClick={setLink}>
              {editor.isActive("link") ? "Update Link" : "Add Link"}
            </Button>
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
