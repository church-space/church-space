import { Extension } from "@tiptap/core";

export interface DynamicColorOptions {
  types: string[];
  defaultTextColorClass: string;
  accentTextColorClass: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    dynamicColor: {
      /**
       * Set text to use the default text color
       */
      setDefaultTextColor: () => ReturnType;
      /**
       * Set text to use the accent text color
       */
      setAccentTextColor: () => ReturnType;
      /**
       * Update all dynamic color references in the document
       */
      updateDynamicColors: (
        defaultColor: string,
        accentColor: string,
      ) => ReturnType;
    };
  }
}

export const DynamicColor = Extension.create<DynamicColorOptions>({
  name: "dynamicColor",

  addOptions() {
    return {
      types: ["textStyle"],
      defaultTextColorClass: "default-text-color",
      accentTextColorClass: "accent-text-color",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          dynamicColorType: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-color-type"),
            renderHTML: (attributes) => {
              if (!attributes.dynamicColorType) {
                return {};
              }

              return {
                "data-color-type": attributes.dynamicColorType,
                class:
                  attributes.dynamicColorType === "accent"
                    ? this.options.accentTextColorClass
                    : this.options.defaultTextColorClass,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setDefaultTextColor:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { dynamicColorType: "default" })
            .run();
        },
      setAccentTextColor:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { dynamicColorType: "accent" })
            .run();
        },
      updateDynamicColors:
        (defaultColor: string, accentColor: string) =>
        ({ editor }) => {
          // Update CSS variables in the editor DOM
          if (editor.view && editor.view.dom) {
            editor.view.dom.style.setProperty(
              "--default-text-color",
              defaultColor,
            );
            editor.view.dom.style.setProperty(
              "--accent-text-color",
              accentColor,
            );
          }
          return true;
        },
    };
  },
});
