"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  FileTypeIcon as FontFamily,
  TextIcon as TextSize,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
} from "lucide-react";
import { Button } from "@trivo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@trivo/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@trivo/ui/popover";
import { useState, useEffect } from "react";
import { Input } from "@trivo/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@trivo/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@trivo/ui/tooltip";

const fontFamilies = [
  { name: "Default", value: "sans-serif" },
  { name: "Serif", value: "serif" },
  { name: "Monospace", value: "monospace" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
];

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  const [color, setColor] = useState("#000000");
  const [linkUrl, setLinkUrl] = useState("");
  const [_, setForceUpdate] = useState(0);

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

  return (
    <div className="flex-shrink-0 flex flex-wrap gap-2 p-2 border-b">
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

      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <FontFamily className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {fontFamilies.map((font) => (
                <DropdownMenuItem
                  key={font.value}
                  onClick={() =>
                    editor.chain().focus().setFontFamily(font.value).run()
                  }
                  className="flex justify-between items-center"
                >
                  <span style={{ fontFamily: font.value }}>{font.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>Font Family</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <TextSize className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {fontSizes.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() =>
                    editor.chain().focus().setFontSize(`${size}px`).run()
                  }
                >
                  {size}px
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>Font Size</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="flex flex-col gap-4">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    editor.chain().focus().setColor(e.target.value).run();
                  }}
                  className="w-full h-8"
                />
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "#000000",
                    "#ffffff",
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                    "#00ffff",
                    "#ff00ff",
                    "#888888",
                    "#cccccc",
                    "#ff8800",
                    "#88ff00",
                    "#0088ff",
                    "#ff0088",
                    "#00ff88",
                    "#8800ff",
                  ].map((presetColor) => (
                    <button
                      key={presetColor}
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: presetColor }}
                      onClick={() => {
                        setColor(presetColor);
                        editor.chain().focus().setColor(presetColor).run();
                      }}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent>Text Color</TooltipContent>
      </Tooltip>

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

      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Link className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
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
        </TooltipTrigger>
        <TooltipContent>Link</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Toolbar;
