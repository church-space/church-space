"use client";

import { Editor, EditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";

interface TextBlockProps {
  editor: Editor | null;
  onContentChange?: (content: string) => void;
  font?: string;
  textColor?: string;
  linkColor?: string;
  accentTextColor?: string;
  isUndoRedoOperation?: boolean;
}

const TextBlock = ({
  editor,
  onContentChange,
  font,
  textColor,
  linkColor,
  accentTextColor,
  isUndoRedoOperation = false,
}: TextBlockProps) => {
  const prevLinkColorRef = useRef(linkColor);
  const prevAccentTextColorRef = useRef(accentTextColor);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentOnFocusRef = useRef<string>("");

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Add focus event listener to capture initial content state
    const focusListener = () => {
      contentOnFocusRef.current = editor.getHTML();
    };

    // Add blur event listener to save content when editor loses focus
    const blurListener = () => {
      // Clear any pending debounced updates
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }

      // Always save on blur if we have changes
      const currentContent = editor.getHTML();
      if (currentContent !== contentOnFocusRef.current && onContentChange) {
        onContentChange(currentContent);
        contentOnFocusRef.current = currentContent;
      }
    };

    // Add an update listener to the editor for regular typing
    const updateListener = () => {
      if (!editor.isDestroyed && !isUndoRedoOperation) {
        // const currentContent = editor.getHTML(); // Removed from here

        // Start / reset a 300 ms debounce so rapid typing collapses into 1 save
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
        }

        updateTimerRef.current = setTimeout(() => {
          if (onContentChange && !editor.isDestroyed) {
            const currentContent = editor.getHTML(); // Added here
            onContentChange(currentContent);
            contentOnFocusRef.current = currentContent;
          }
        }, 300);
      }
    };

    // Initialize the content ref
    contentOnFocusRef.current = editor.getHTML();

    // Set up all listeners
    editor.on("focus", focusListener);
    editor.on("update", updateListener);
    editor.on("blur", blurListener);

    return () => {
      if (!editor.isDestroyed) {
        editor.off("focus", focusListener);
        editor.off("update", updateListener);
        editor.off("blur", blurListener);
      }
      // Clear any pending timer on cleanup
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [editor, onContentChange, isUndoRedoOperation]);

  // Update editor font and color when props change
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    if (linkColor && linkColor !== prevLinkColorRef.current) {
      editor.view.dom.style.setProperty("--link-color", linkColor);
      prevLinkColorRef.current = linkColor;
    }

    if (accentTextColor && accentTextColor !== prevAccentTextColorRef.current) {
      // Set accent text color using CSS custom property
      editor.view.dom.style.setProperty("--accent-text-color", accentTextColor);
      prevAccentTextColorRef.current = accentTextColor;
    }
  }, [editor, linkColor, accentTextColor]);

  // Update contentOnFocusRef when editor content is set externally (e.g., during undo/redo)
  useEffect(() => {
    if (editor && !editor.isDestroyed && isUndoRedoOperation) {
      contentOnFocusRef.current = editor.getHTML();
    }
  }, [editor, isUndoRedoOperation]);

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
          "--accent-text-color": accentTextColor,
        } as React.CSSProperties
      }
    >
      <style>{`
        .ProseMirror a {
          color: var(--link-color) !important;
        }
        
        .ProseMirror [style*="color: var(--accent-text-color)"] {
          color: var(--accent-text-color) !important;
        }

        .ProseMirror .default-text-color {
          color: var(--default-text-color) !important;
        }
        
        .ProseMirror .accent-text-color {
          color: var(--accent-text-color) !important;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextBlock;
