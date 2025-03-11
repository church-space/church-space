import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { DynamicColor } from "./dynamic-color-extension";

export const createEditor = (
  initialContent?: string,
  defaultFont?: string,
  defaultTextColor?: string,
  preserveExistingStyles: boolean = false,
  accentTextColor?: string,
) => {
  // Use the provided content or empty string for placeholder to work
  const content =
    initialContent === null || initialContent === undefined
      ? ""
      : initialContent;

  // Create the editor with appropriate extensions
  const editor = new Editor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "heading",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "code-block",
          },
        },
      }),
      Color,
      TextStyle,
      FontFamily,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Start typing here...",
        showOnlyWhenEditable: true,
      }),
      DynamicColor,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  // Apply default styles if needed and not preserving existing styles
  if (!preserveExistingStyles) {
    if (defaultTextColor) {
      editor.commands.setColor(defaultTextColor);
    }

    if (defaultFont) {
      editor.commands.setFontFamily(defaultFont);
    }
  }

  // Set up dynamic color CSS variables
  if (defaultTextColor) {
    editor.view.dom.style.setProperty("--default-text-color", defaultTextColor);
  }

  if (accentTextColor) {
    editor.view.dom.style.setProperty("--accent-text-color", accentTextColor);
  }

  return editor;
};

// Add a function to update dynamic colors in an existing editor
export const updateEditorColors = (
  editor: Editor | null,
  defaultTextColor?: string,
  accentTextColor?: string,
) => {
  if (!editor || editor.isDestroyed) return;

  if (defaultTextColor) {
    editor.view.dom.style.setProperty("--default-text-color", defaultTextColor);
  }

  if (accentTextColor) {
    editor.view.dom.style.setProperty("--accent-text-color", accentTextColor);
  }

  // Use the dynamic color extension command to update colors
  editor.commands.updateDynamicColors(
    defaultTextColor || "#000000",
    accentTextColor || "#666666",
  );
};
