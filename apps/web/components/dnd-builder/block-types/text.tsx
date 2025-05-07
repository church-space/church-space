"use client";

import { Editor, EditorContent } from "@tiptap/react";
import { debounce } from "lodash";
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
  const contentOnFocusRef = useRef<string>("");
  const onContentChangeRef = useRef<typeof onContentChange | undefined>(
    undefined,
  );
  const isUndoRedoOperationRef = useRef(isUndoRedoOperation);

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  useEffect(() => {
    isUndoRedoOperationRef.current = isUndoRedoOperation;
  }, [isUndoRedoOperation]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // ---- NEW: single listener ------------------------------------
    const throttledSave = debounce(() => {
      if (isUndoRedoOperationRef.current) return;
      onContentChangeRef.current?.(editor.getHTML());
    }, 1000);

    const txnListener = () => throttledSave();

    editor.on("transaction", txnListener);

    // --------------------------------------------------------------

    // keep the focus listener (for contentOnFocusRef if you still need it)
    const focusListener = () => {
      contentOnFocusRef.current = editor.getHTML();
    };
    editor.on("focus", focusListener);

    return () => {
      if (!editor.isDestroyed) {
        editor.off("transaction", txnListener);
        editor.off("focus", focusListener);
      }
      throttledSave.cancel();
    };
  }, [editor]);

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
    if (editor && !editor.isDestroyed && isUndoRedoOperationRef.current) {
      contentOnFocusRef.current = editor.getHTML();
    }
  }, [editor]);

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
