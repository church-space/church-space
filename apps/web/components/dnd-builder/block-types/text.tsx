"use client";

import { Editor, EditorContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

interface TextBlockProps {
  editor: Editor | null;
}

const TextBlock = ({ editor }: TextBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setIsReady] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const isUpdatingRef = useRef(false);

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

            // Force a refresh to ensure styles are applied
            editor.view.updateState(editor.view.state);

            // Clean up any existing observer
            if (observerRef.current) {
              observerRef.current.disconnect();
              observerRef.current = null;
            }

            // Set up a mutation observer for general DOM changes
            const observer = new MutationObserver(() => {
              // Prevent recursive updates
              if (isUpdatingRef.current) return;

              try {
                isUpdatingRef.current = true;
                // Remove call to applyColorToMarkers
              } finally {
                isUpdatingRef.current = false;
              }
            });

            // Start observing the editor content
            if (containerRef.current) {
              observer.observe(containerRef.current, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["style", "class"],
              });

              observerRef.current = observer;
            }

            setIsReady(true);
          }
        }
      }, 0);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
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
      <div ref={containerRef} className="styled-editor-container" />
      <EditorContent editor={editor} className="styled-editor-content" />
    </div>
  );
};

export default TextBlock;
