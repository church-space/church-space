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
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Add an update listener to the editor
    const updateListener = () => {
      if (onContentChange && !editor.isDestroyed) {
        onContentChange(editor.getHTML());
      }
    };

    editor.on("update", updateListener);
    setIsEditorReady(true);

    return () => {
      if (!editor.isDestroyed) {
        editor.off("update", updateListener);
      }
    };
  }, [editor, onContentChange]);

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
