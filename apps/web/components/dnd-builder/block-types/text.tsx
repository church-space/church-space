"use client";

import { Editor, EditorContent } from "@tiptap/react";

interface TextBlockProps {
  editor: Editor | null;
}

const TextBlock = ({ editor }: TextBlockProps) => {
  if (!editor) return null;
  return <EditorContent editor={editor} />;
};

export default TextBlock;
