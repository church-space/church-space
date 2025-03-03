"use client";

import { Editor, EditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";

interface TextBlockProps {
  editor: Editor | null;
  onContentChange?: (content: string) => void;
  font?: string;
  textColor?: string;
  linkColor?: string;
}

const TextBlock = ({
  editor,
  onContentChange,
  font,
  textColor,
  linkColor,
}: TextBlockProps) => {
  const prevFontRef = useRef(font);
  const prevTextColorRef = useRef(textColor);
  const prevLinkColorRef = useRef(linkColor);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Add an update listener to the editor
    const updateListener = () => {
      if (!editor.isDestroyed) {
        // Clear any pending timer
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
        }

        // Debounce the database update
        updateTimerRef.current = setTimeout(() => {
          if (onContentChange && !editor.isDestroyed) {
            onContentChange(editor.getHTML());
          }
        }, 500); // 500ms debounce
      }
    };

    editor.on("update", updateListener);

    return () => {
      if (!editor.isDestroyed) {
        editor.off("update", updateListener);
      }
      // Clear any pending timer on cleanup
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
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

    if (linkColor && linkColor !== prevLinkColorRef.current) {
      // Set link color using CSS custom property
      editor.view.dom.style.setProperty("--link-color", linkColor);
      prevLinkColorRef.current = linkColor;
    }
  }, [editor, font, textColor, linkColor]);

  if (!editor) {
    return <div className="text-muted-foreground">Loading editor...</div>;
  }

  if (editor.isDestroyed) {
    return (
      <div className="text-muted-foreground">
        Editor is being initialized...
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl relative mx-auto focus:outline-none"
      style={
        {
          fontFamily: font,
          color: textColor,
          "--link-color": linkColor,
        } as React.CSSProperties
      }
    >
      <style>{`
        .ProseMirror a {
          color: var(--link-color) !important;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextBlock;
