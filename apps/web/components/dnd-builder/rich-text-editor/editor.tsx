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
import { Mention } from "@tiptap/extension-mention";
import tippy, {
  Instance,
  Props,
  GetReferenceClientRect,
  SingleTarget,
} from "tippy.js";
import "tippy.js/dist/tippy.css";

// Add CSS styles for mentions
const mentionStyle = `
// .mention-suggestions {
//   background: #2d3748;


//   padding: 0.5rem;

// }

.mention-suggestions .items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 150px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
}

.mention-suggestions .item {
  display: block;
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: white;
  border-radius: 0.25rem;
}

.mention-suggestions .item.is-selected,
.mention-suggestions .item:hover {
  background: #555555;
}
`;

// Create and inject the style element
const styleElement = document.createElement("style");
styleElement.textContent = mentionStyle;
document.head.appendChild(styleElement);

interface SuggestionItem {
  label: string;
  id: string;
}

// Define the suggestion items
const suggestionItems: SuggestionItem[] = [
  {
    label: "First Name",
    id: "first-name",
  },
  {
    label: "Last Name",
    id: "last-name",
  },
  {
    label: "Email",
    id: "email",
  },
];

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
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          char: "@",
          startOfLine: false,
          allowSpaces: true,
          decorationClass: "mention-suggestion",
          items: ({ query }) => {
            // Always return all items initially
            return suggestionItems;
          },
          render: () => {
            let popup: Instance<Props> | null = null;
            let component: HTMLElement | null = null;
            let selectedIndex = 0;
            let currentProps: any = null;

            const selectItem = (index: number) => {
              if (currentProps && suggestionItems[index]) {
                currentProps.command({ id: suggestionItems[index].id });
                popup?.hide();
              }
            };

            const updateSelection = () => {
              if (!component) return;
              const buttons = component.querySelectorAll(".item");
              buttons.forEach((button, index) => {
                if (index === selectedIndex) {
                  button.classList.add("is-selected");
                } else {
                  button.classList.remove("is-selected");
                }
              });
            };

            return {
              onStart: (props) => {
                currentProps = props;
                component = document.createElement("div");
                component.classList.add("mention-suggestions");

                const element = document.createElement("div");
                document.body.appendChild(element);

                const getReferenceClientRect: GetReferenceClientRect = () => {
                  const rect = props.clientRect?.();
                  if (!rect) {
                    return new DOMRect(0, 0, 0, 0);
                  }
                  return rect;
                };

                popup = tippy(element as SingleTarget, {
                  getReferenceClientRect,
                  appendTo: () => document.body,
                  content: component,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                  theme: "mention",
                });

                // Show all items immediately
                component.innerHTML = `
                  <div class="items">
                    ${suggestionItems
                      .map(
                        (item: SuggestionItem, index: number) =>
                          `<button class="item ${index === 0 ? "is-selected" : ""}">${item.label}</button>`,
                      )
                      .join("")}
                  </div>
                `;

                // Add click handlers
                const buttons = component.querySelectorAll("button");
                buttons.forEach((button: Element, index: number) => {
                  button.addEventListener("click", () => {
                    selectItem(index);
                  });
                });
              },
              onUpdate: (props) => {
                if (!component || !popup) return;

                component.innerHTML = `
                  <div class="items">
                    ${props.items
                      .map(
                        (item: SuggestionItem, index: number) =>
                          `<button class="item ${index === 0 ? "is-selected" : ""}">${item.label}</button>`,
                      )
                      .join("")}
                  </div>
                `;

                // Add click handlers
                const buttons = component.querySelectorAll("button");
                buttons.forEach((button: Element, index: number) => {
                  button.addEventListener("click", () => {
                    selectItem(index);
                  });
                });

                const getReferenceClientRect: GetReferenceClientRect = () => {
                  const rect = props.clientRect?.();
                  if (!rect) {
                    return new DOMRect(0, 0, 0, 0);
                  }
                  return rect;
                };

                popup.setProps({
                  getReferenceClientRect,
                });
              },
              onKeyDown: (props) => {
                if (props.event.key === "Escape" && popup) {
                  popup.hide();
                  return true;
                }

                if (props.event.key === "ArrowUp") {
                  selectedIndex =
                    (selectedIndex + suggestionItems.length - 1) %
                    suggestionItems.length;
                  updateSelection();
                  return true;
                }

                if (props.event.key === "ArrowDown") {
                  selectedIndex = (selectedIndex + 1) % suggestionItems.length;
                  updateSelection();
                  return true;
                }

                if (props.event.key === "Enter") {
                  selectItem(selectedIndex);
                  return true;
                }

                return false;
              },
              onExit: () => {
                if (popup) {
                  popup.destroy();
                }
                if (component) {
                  component.remove();
                }
              },
            };
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
