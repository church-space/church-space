import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import FontSize from "@tiptap/extension-font-size";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Editor, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import suggestion from "../rich-text-editor/suggestions";

// Helper function to apply marker colors
function applyMarkerColorsToDOM(dom: HTMLElement) {
  const listItems = dom.querySelectorAll("li");

  listItems.forEach((item: Element, index: number) => {
    // Find colored elements within the list item
    const coloredElements = item.querySelectorAll('[style*="color"]');
    let color = "";

    // Try to get color from the first colored element
    if (coloredElements.length > 0) {
      const style = window.getComputedStyle(coloredElements[0]);
      color = style.color;
    }

    // If no colored elements found, try to get color from spans
    if (!color || color === "rgb(0, 0, 0)") {
      const spans = item.querySelectorAll("span");
      for (let i = 0; i < spans.length; i++) {
        const spanStyle = window.getComputedStyle(spans[i]);
        if (spanStyle.color && spanStyle.color !== "rgb(0, 0, 0)") {
          color = spanStyle.color;
          break;
        }
      }
    }

    // If we found a color, apply it to the list item
    if (color && color !== "rgb(0, 0, 0)") {
      // Add a unique class to the list item
      const uniqueClass = `marker-${index}`;
      item.classList.add(uniqueClass);

      // Create a style element for this marker if it doesn't exist
      let styleEl = document.getElementById(`style-${uniqueClass}`);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = `style-${uniqueClass}`;
        document.head.appendChild(styleEl);
      }

      // Set the style content
      styleEl.textContent = `.${uniqueClass}::marker { color: ${color} !important; }`;

      // Also set the color directly on the list item
      (item as HTMLElement).style.color = color;
    }
  });
}

// Custom extension to handle list marker colors
const ListMarkerColor = Extension.create({
  name: "listMarkerColor",

  addOptions() {
    return {
      types: ["bulletList", "orderedList", "listItem"],
    };
  },

  onCreate() {
    // Apply marker colors when the editor is created
    setTimeout(() => {
      if (this.editor && this.editor.view && this.editor.view.dom) {
        applyMarkerColorsToDOM(this.editor.view.dom);
      }
    }, 100);
  },

  onUpdate() {
    // Apply marker colors when the editor content changes
    if (this.editor && this.editor.view && this.editor.view.dom) {
      applyMarkerColorsToDOM(this.editor.view.dom);
    }
  },

  onSelectionUpdate() {
    // Apply marker colors when the selection changes
    if (this.editor && this.editor.view && this.editor.view.dom) {
      applyMarkerColorsToDOM(this.editor.view.dom);
    }
  },
});

export const createEditor = () => {
  return new Editor({
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
    ],
    content: "<p>Hello, start typing here...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });
};
