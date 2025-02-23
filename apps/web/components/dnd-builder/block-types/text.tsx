"use client";

import { Editor, EditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";

interface TextBlockProps {
  editor: Editor | null;
}

const TextBlock = ({ editor }: TextBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Wait for next frame to ensure React has finished DOM updates
    const frame = requestAnimationFrame(() => {
      // Additional timeout to ensure all React updates are complete
      setTimeout(() => {
        if (containerRef.current && editor && !editor.isDestroyed) {
          const content = editor.getHTML();

          // Only update if necessary
          if (editor.options.element !== containerRef.current) {
            editor.setOptions({
              element: containerRef.current,
            });

            // Restore content if needed
            if (content) {
              editor.commands.setContent(content);
            }
          }
        }
      }, 0);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  if (editor.isDestroyed) {
    return <div>Editor is destroyed</div>;
  }

  return (
    <div className="relative prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none">
      <div ref={containerRef} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextBlock;
