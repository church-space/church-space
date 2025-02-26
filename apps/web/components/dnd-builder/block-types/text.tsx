"use client";

import { Editor, EditorContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

interface TextBlockProps {
  editor: Editor | null;
  onContentChange?: (content: string) => void;
  font?: string;
  textColor?: string;
}

const TextBlock = ({
  editor,
  onContentChange,
  font,
  textColor,
}: TextBlockProps) => {
  const prevFontRef = useRef(font);
  const prevTextColorRef = useRef(textColor);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Add an update listener to the editor
    const updateListener = () => {
      if (onContentChange && !editor.isDestroyed) {
        onContentChange(editor.getHTML());
      }
    };

    editor.on("update", updateListener);

    return () => {
      if (!editor.isDestroyed) {
        editor.off("update", updateListener);
      }
    };
  }, [editor, onContentChange]);

  // Update editor font and color when props change
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Only update font if it has changed
    if (font && font !== prevFontRef.current) {
      editor.commands.setFontFamily(font);
      prevFontRef.current = font;
    }

    // Only update color if it has changed
    if (textColor && textColor !== prevTextColorRef.current) {
      editor.commands.setColor(textColor);
      prevTextColorRef.current = textColor;
    }
  }, [editor, font, textColor]);

  if (!editor) {
    return <div className=" text-muted-foreground">Loading editor...</div>;
  }

  if (editor.isDestroyed) {
    return (
      <div className=" text-muted-foreground">
        Editor is being initialized...
      </div>
    );
  }

  return (
    <div
      className="relative prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
      style={{
        fontFamily: font,
        color: textColor,
      }}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextBlock;
