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
  List,
  ListOrdered,
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
import { useState } from "react";
import { Input } from "@trivo/ui/input";

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

  return (
    <div className="border-b p-2 flex-shrink-0 flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-muted" : ""}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-muted" : ""}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "bg-muted" : ""}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-muted" : ""}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

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

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-muted" : ""}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-muted" : ""}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <AlignLeft className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="h-4 w-4 mr-2" />
            Left
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="h-4 w-4 mr-2" />
            Center
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="h-4 w-4 mr-2" />
            Right
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify className="h-4 w-4 mr-2" />
            Justify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </div>
  );
};

export default Toolbar;
