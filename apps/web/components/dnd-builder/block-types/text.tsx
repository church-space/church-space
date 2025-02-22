"use client";

import { Editor, EditorContent } from "@tiptap/react";

interface TextBlockProps {
  editor: Editor | null;
}

const TextBlock = ({ editor }: TextBlockProps) => {
  return <EditorContent editor={editor} />;
};

export default TextBlock;
