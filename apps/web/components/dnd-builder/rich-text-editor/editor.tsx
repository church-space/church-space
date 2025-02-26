import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import FontSize from "@tiptap/extension-font-size";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import suggestion from "../rich-text-editor/suggestions";

export const createEditor = (
  initialContent?: string,
  defaultFont?: string,
  defaultTextColor?: string,
  preserveExistingStyles: boolean = false
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
      }),
      Color,
      TextStyle,
      FontFamily,
      Underline,
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion,
      }),
      Placeholder.configure({
        placeholder: "Start typing here...",
        showOnlyWhenEditable: true,
      }),
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

  return editor;
};
