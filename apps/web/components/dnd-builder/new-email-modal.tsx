import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Email,
  TemplatesIcon,
} from "@church-space/ui/icons";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { Switch } from "@church-space/ui/switch";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useState } from "react";
import ArticleSvgPath from "./article.svg";
import UpdatesSvgPath from "./updates.svg";
import { EmailStyles, HistoryState } from "./use-block-state-manager"; // Import HistoryState
import type { Block as BlockType, BlockData } from "@/types/blocks"; // Import Block types

type View = "main" | "templates" | "recent";

const pallets = [
  {
    name: "Black on White",
    colors: {
      blocksBgColor: "#ffffff",
      bgColor: "#f2f2f2",
      textColor: "#000000",
      linkColor: "#4c72ff",
      accentTextColor: "#757575",
      footerBgColor: "#f2f2f2",
      footerTextColor: "#000000",
      footerAccentTextColor: "#525252",
    },
  },
  {
    name: "White on Black",
    colors: {
      blocksBgColor: "#000000",
      bgColor: "#1b1a1a",
      textColor: "#ffffff",
      linkColor: "#4c72ff",
      accentTextColor: "#9e9e9e",
      footerBgColor: "#121212",
      footerTextColor: "#ffffff",
      footerAccentTextColor: "#b7b7b7",
    },
  },
  {
    name: "Blue and Cream",
    colors: {
      blocksBgColor: "#eee5d8",
      bgColor: "#f0edea",
      textColor: "#000000",
      linkColor: "#4c72ff",
      accentTextColor: "#4c72ff",
      footerBgColor: "#eee5d8",
      footerTextColor: "#000000",
      footerAccentTextColor: "#212121",
    },
  },
  {
    name: "Green and Cream",
    colors: {
      blocksBgColor: "#3a7245",
      bgColor: "#26492b",
      textColor: "#ebd7bb",
      linkColor: "#e4a148",
      accentTextColor: "#ebd7bb",
      footerBgColor: "#3a7245",
      footerTextColor: "#ffffff",
      footerAccentTextColor: "#e3e3e3",
    },
  },
  {
    name: "Blue and Yellow",
    colors: {
      blocksBgColor: "#303E87",
      bgColor: "#57609e",
      textColor: "#ffffff",
      linkColor: "#ffb400",
      accentTextColor: "#ffb400",
      footerBgColor: "#57609e",
      footerTextColor: "#ffffff",
      footerAccentTextColor: "#e3e3e3",
    },
  },
  {
    name: "Red and Yellow",
    colors: {
      blocksBgColor: "#873030",
      bgColor: "#eeeeee",
      textColor: "#ffffff",
      linkColor: "#ffb400",
      accentTextColor: "#ffb400",
      footerBgColor: "#eeeeee",
      footerTextColor: "#000000",
      footerAccentTextColor: "#232323",
    },
  },
  {
    name: "Purple and Blue",
    colors: {
      blocksBgColor: "#1a185a",
      bgColor: "#976bce",
      textColor: "#ffffff",
      linkColor: "#bdcbff",
      accentTextColor: "#bdcbff",
      footerBgColor: "#976bce",
      footerTextColor: "#ffffff",
      footerAccentTextColor: "#e3e3e3",
    },
  },
  {
    name: "Orange and Brown",
    colors: {
      blocksBgColor: "#d87c13",
      bgColor: "#3a2100",
      textColor: "#ffffff",
      linkColor: "#692b00",
      accentTextColor: "#3a2100",
      footerBgColor: "#3a2100",
      footerTextColor: "#ffffff",
      footerAccentTextColor: "#e3e3e3",
    },
  },
];

interface NewEmailModalProps {
  onFooterChange?: (data: any) => void; // Keep this for separate DB updates if needed
  onAllStyleChanges?: (styleUpdates: Partial<EmailStyles>) => void; // Keep this for separate DB updates if needed
  // setCurrentState?: (stateUpdater: (prevState: any) => any) => void; // Remove old prop
  setManagedState?: (
    newStateOrFn: HistoryState | ((prevState: HistoryState) => HistoryState),
  ) => void; // Use new prop type
}

export default function NewEmailModal({
  onFooterChange,
  onAllStyleChanges,
  // setCurrentState, // Remove old prop
  setManagedState, // Use new prop
}: NewEmailModalProps) {
  const [newEmailModalOpen = false, setNewEmailModalOpen] = useQueryState(
    "newEmail",
    parseAsBoolean,
  );
  const [view, setView] = useState<View>("main");

  const [selectedFont, setSelectedFont] = useState<string>("sans-serif");
  const [selectedColor, setSelectedColor] = useState<string>("Black on White");
  const [isInset, setIsInset] = useState<boolean>(true);
  const [selectedEmailType, setSelectedEmailType] = useState<string>("updates");

  const handleBack = () => setView("main");

  const handleCreate = async () => {
    // Get the selected color palette
    const selectedPallet = pallets.find(
      (pallet) => pallet.name === selectedColor,
    );

    if (selectedPallet) {
      // Create style updates object
      const styleUpdates: EmailStyles = {
        // Ensure full EmailStyles type
        bgColor: selectedPallet.colors.bgColor,
        emailBgColor: selectedPallet.colors.blocksBgColor,
        defaultTextColor: selectedPallet.colors.textColor,
        linkColor: selectedPallet.colors.linkColor,
        accentTextColor: selectedPallet.colors.accentTextColor,
        defaultFont: selectedFont,
        isInset: isInset,
        cornerRadius: 0, // Default or get from state if you add a control for it
        blockSpacing: 20, // Default or get from state
      };

      // Create footer updates object
      const footerUpdates = {
        text_color: selectedPallet.colors.footerTextColor,
        secondary_text_color: selectedPallet.colors.footerAccentTextColor,
        bg_color: selectedPallet.colors.footerBgColor,
        // Add other default footer properties if needed
      };

      // --- Template Blocks Logic ---
      let templateBlocks: BlockType[] = [];

      if (selectedEmailType === "updates") {
        const textContent = `<h1 class="heading" style="text-align: left">Heading One</h1><p style="text-align: left">"In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not."</p><p style="text-align: left">John 1:1-5 KJV</p>`;

        templateBlocks = [
          {
            id: crypto.randomUUID(),
            type: "image",
            order: 0,
            data: { image: "", size: 100, link: "", centered: true },
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 1,
            data: {
              font: "'Courier New', monospace",
              content: textContent,
              textColor: styleUpdates.defaultTextColor,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "button",
            order: 2,
            data: {
              text: "Learn More",
              link: "",
              color: styleUpdates.defaultTextColor,
              textColor: styleUpdates.emailBgColor,
              style: "filled",
              size: "full",
              centered: false,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "divider",
            order: 3,
            data: {
              color: styleUpdates.defaultTextColor,
              margin: 40,
              thickness: 2,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "image",
            order: 4,
            data: { image: "", size: 100, link: "", centered: true },
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 5,
            data: {
              font: "'Courier New', monospace",
              content: textContent,
              textColor: styleUpdates.defaultTextColor,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "button",
            order: 6,
            data: {
              text: "Learn More",
              link: "",
              color: styleUpdates.defaultTextColor,
              textColor: styleUpdates.emailBgColor,
              style: "filled",
              size: "full",
              centered: false,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "divider",
            order: 7,
            data: {
              color: styleUpdates.defaultTextColor,
              margin: 40,
              thickness: 2,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "image",
            order: 8,
            data: { image: "", size: 100, link: "", centered: true },
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 9,
            data: {
              font: "'Courier New', monospace",
              content: textContent,
              textColor: styleUpdates.defaultTextColor,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "button",
            order: 10,
            data: {
              text: "Learn More",
              link: "",
              color: styleUpdates.defaultTextColor,
              textColor: styleUpdates.emailBgColor,
              style: "filled",
              size: "full",
              centered: false,
            },
          },
        ];
      } else if (selectedEmailType === "article") {
        const textContent1 = `<h1 class="heading">Heading One</h1><p style="text-align: left">"In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not."</p><p style="text-align: left"></p><p style="text-align: left">There was a man sent from God, whose name was John.</p><p>The same came for a witness, to bear witness of the Light, that all men through him might believe. He was not that Light, but was sent to bear witness of that Light. That was the true Light, which lighteth every man that cometh into the world. He was in the world, and the world was made by him, and the world knew him not. He came unto his own, and his own received him not. But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name: Which were born, not of blood, nor of the flesh, nor of the will of man, but of God.</p>`;
        const textContent2 = `<p style="text-align: left">"In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not."</p><p style="text-align: left"></p><p style="text-align: left">There was a man sent from God, whose name was John.</p><p>The same came for a witness, to bear witness of the Light, that all men through him might believe. He was not that Light, but was sent to bear witness of that Light. That was the true Light, which lighteth every man that cometh into the world. He was in the world, and the world was made by him, and the world knew him not. He came unto his own, and his own received him not. But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name: Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.</p>`;

        templateBlocks = [
          {
            id: crypto.randomUUID(),
            type: "image",
            order: 0,
            data: { image: "", size: 100, link: "", centered: true },
          },
          {
            id: crypto.randomUUID(),
            type: "author",
            order: 1,
            data: {
              name: "Author Name",
              subtitle: "Author Title",
              avatar: "",
              textColor: styleUpdates.defaultTextColor,
              links: [],
              linkColor: styleUpdates.linkColor,
              hideAvatar: false,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 2,
            data: {
              font: styleUpdates.defaultFont,
              content: textContent1,
              textColor: styleUpdates.defaultTextColor,
            },
          },
          {
            id: crypto.randomUUID(),
            type: "divider",
            order: 3,
            data: { color: "#5c5c5c", margin: 24, thickness: 1 }, // Specific color from SQL
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 4,
            data: {
              font: styleUpdates.defaultFont,
              content: textContent2,
              textColor: styleUpdates.defaultTextColor,
            },
          },
        ];
      }
      // --- End Template Blocks Logic ---

      // Use the new setManagedState function to update blocks, styles, and footer at once
      if (setManagedState) {
        // Provide the full state object expected by HistoryState
        setManagedState({
          blocks: templateBlocks, // Set the new blocks directly
          styles: styleUpdates, // Set the new styles
          footer: footerUpdates, // Set the new footer
        });
      }

      // These might still be useful if they trigger specific DB updates
      // not covered by the general state management hooks reacting to state change.
      // If setManagedState handles all necessary updates (UI + history + triggering DB saves via useEffects),
      // these might become redundant. Review EmailDndProvider's useEffects.
      // For now, keep them to ensure separate DB update logic isn't missed.
      onAllStyleChanges?.(styleUpdates);
      onFooterChange?.(footerUpdates);

      // Note: Adding blocks to the DB will be handled by the email-dnd-provider
      // when it detects the new blocks with UUIDs in its state (triggered by the state change from setManagedState).
    }

    // Close the modal
    setNewEmailModalOpen(null);
  };

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      position: "absolute" as const,
    }),
  };

  // Determine direction for animation
  const direction = view === "main" ? -1 : 1;

  return (
    <Dialog
      open={newEmailModalOpen ?? false}
      onOpenChange={(open) => {
        if (!open) {
          setNewEmailModalOpen(null); // Close modal using query state
          setTimeout(() => setView("main"), 300); // Reset view after close animation
        } else {
          setNewEmailModalOpen(true);
        }
      }}
    >
      <DialogContent
        className="flex max-w-screen-md flex-col overflow-hidden"
        style={{ height: "550px", maxHeight: "550px" }}
      >
        <DialogHeader>
          <DialogTitle>
            {view === "main" && "How do you want to start?"}
            {view === "templates" && "My Templates"}
            {view === "recent" && "Recently Sent Emails"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative my-2 flex-1 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={view}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.2 },
                opacity: { duration: 0.1 },
                layout: { duration: 0.3 },
              }}
              layout
              className="h-full w-full space-y-4 overflow-y-auto px-2"
            >
              {view === "main" && (
                <>
                  <div className="flex flex-col gap-8 rounded-lg border bg-muted p-5 shadow-sm md:flex-row">
                    <div className="flex flex-col gap-2">
                      <Label>Email Type</Label>
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            className={`rounded-lg border ${selectedEmailType === "updates" ? "bg-primary/30 outline-none ring-2 ring-primary" : "bg-background"} p-4 transition-all duration-300 hover:bg-primary/30`}
                            onClick={() => setSelectedEmailType("updates")}
                          >
                            <img
                              src={UpdatesSvgPath.src}
                              alt="Updates Template"
                              style={{ width: "120px", height: "auto" }}
                            />
                          </button>
                          <span className="w-full text-center text-sm font-medium">
                            Updates
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <button
                            className={`rounded-lg border ${selectedEmailType === "article" ? "bg-primary/30 outline-none ring-2 ring-primary" : "bg-background"} p-4 transition-all duration-300 hover:bg-primary/30`}
                            onClick={() => setSelectedEmailType("article")}
                          >
                            <img
                              src={ArticleSvgPath.src}
                              alt="Article Template"
                              style={{ width: "120px", height: "auto" }}
                            />
                          </button>
                          <span className="w-full text-center text-sm font-medium">
                            Article
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <Label>Color Scheme</Label>
                        <Select
                          value={selectedColor}
                          onValueChange={setSelectedColor}
                        >
                          <SelectTrigger className="h-20 bg-background">
                            <SelectValue placeholder="Select a color scheme" />
                          </SelectTrigger>
                          <SelectContent>
                            {pallets.map((pallet) => (
                              <SelectItem
                                key={pallet.name}
                                value={pallet.name}
                                className="rounded-none border-b"
                              >
                                <div className="flex flex-col items-start gap-0.5 font-semibold">
                                  {pallet.name}
                                  <div className="flex gap-1.5">
                                    <div
                                      className="h-8 w-8 rounded-full border"
                                      style={{
                                        backgroundColor: pallet.colors.bgColor,
                                      }}
                                    />
                                    <div
                                      className="h-8 w-8 rounded-full border"
                                      style={{
                                        backgroundColor:
                                          pallet.colors.textColor,
                                      }}
                                    />
                                    <div
                                      className="h-8 w-8 rounded-full border"
                                      style={{
                                        backgroundColor:
                                          pallet.colors.accentTextColor,
                                      }}
                                    />
                                    <div
                                      className="h-8 w-8 rounded-full border"
                                      style={{
                                        backgroundColor:
                                          pallet.colors.footerBgColor,
                                      }}
                                    />
                                    <div
                                      className="h-8 w-8 rounded-full border"
                                      style={{
                                        backgroundColor:
                                          pallet.colors.linkColor,
                                      }}
                                    />
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label>Font</Label>
                        <Select
                          value={selectedFont}
                          onValueChange={setSelectedFont}
                        >
                          <SelectTrigger
                            className="col-span-2 bg-background"
                            style={{
                              fontFamily: selectedFont,
                            }}
                          >
                            <SelectValue placeholder="Select a font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="sans-serif"
                              style={{ fontFamily: "sans-serif" }}
                            >
                              Sans Serif
                            </SelectItem>
                            <SelectItem
                              value="serif"
                              style={{ fontFamily: "serif" }}
                            >
                              Serif
                            </SelectItem>

                            <SelectItem
                              value="Arial, sans-serif"
                              style={{ fontFamily: "Arial, sans-serif" }}
                            >
                              Arial
                            </SelectItem>
                            <SelectItem
                              value="Georgia, serif"
                              style={{ fontFamily: "Georgia, serif" }}
                            >
                              Georgia
                            </SelectItem>
                            <SelectItem
                              value="Verdana, sans-serif"
                              style={{ fontFamily: "Verdana, sans-serif" }}
                            >
                              Verdana
                            </SelectItem>
                            <SelectItem
                              value="'Courier New', monospace"
                              style={{ fontFamily: "'Courier New', monospace" }}
                            >
                              Courier New
                            </SelectItem>
                            <SelectItem
                              value="Helvetica, Arial, sans-serif"
                              style={{
                                fontFamily: "Helvetica, Arial, sans-serif",
                              }}
                            >
                              Helvetica
                            </SelectItem>
                            <SelectItem
                              value="'Lucida Sans Unicode', 'Lucida Grande', sans-serif"
                              style={{
                                fontFamily:
                                  "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
                              }}
                            >
                              Lucida Sans Unicode
                            </SelectItem>
                            <SelectItem
                              value="Tahoma, Geneva, sans-serif"
                              style={{
                                fontFamily: "Tahoma, Geneva, sans-serif",
                              }}
                            >
                              Tahoma
                            </SelectItem>
                            <SelectItem
                              value="'Times New Roman', Times, serif"
                              style={{
                                fontFamily: "'Times New Roman', Times, serif",
                              }}
                            >
                              Times New Roman
                            </SelectItem>
                            <SelectItem
                              value="'Trebuchet MS', Helvetica, sans-serif"
                              style={{
                                fontFamily:
                                  "'Trebuchet MS', Helvetica, sans-serif",
                              }}
                            >
                              Trebuchet MS
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mt-1.5 flex flex-row items-center gap-2">
                        <Switch
                          checked={isInset}
                          onCheckedChange={setIsInset}
                        />
                        <Label>Inset</Label>
                      </div>
                    </div>
                  </div>
                  <button
                    className="group flex w-full items-center justify-between rounded-lg border bg-muted p-2 px-3 font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => setView("templates")}
                  >
                    <span className="flex items-center gap-2">
                      <TemplatesIcon />
                      My Templates
                    </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <ChevronRight />
                    </span>
                  </button>
                  <button
                    className="group flex w-full items-center justify-between rounded-lg border bg-muted p-2 px-3 font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => setView("recent")}
                  >
                    <span className="flex items-center gap-2">
                      <Email />
                      Recently Sent Emails
                    </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <ChevronRight />
                    </span>
                  </button>
                </>
              )}

              {view === "templates" && (
                <div>
                  {/* Placeholder for Templates content */}
                  <p>Templates list will go here.</p>
                </div>
              )}

              {view === "recent" && (
                <div>
                  {/* Placeholder for Recently Sent Emails content */}
                  <p>Recently Sent Emails list will go here.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="mt-0">
          {view !== "main" && (
            <Button variant="outline" onClick={handleBack} className="mr-auto">
              <ChevronLeft /> Back
            </Button>
          )}
          {view === "main" && (
            <Button
              variant="outline"
              onClick={() =>
                setManagedState?.({
                  blocks: [],
                  styles: initialStyles,
                  footer: initialFooter,
                })
              }
            >
              Start from scratch
            </Button>
          )}
          <Button onClick={handleCreate}>
            {view === "main" ? "Create" : "Select"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Need to define initialStyles and initialFooter or get them from context/props
// For simplicity, defining defaults here, but ideally they should match useBlockStateManager defaults
const initialStyles: EmailStyles = {
  bgColor: "#ffffff",
  isInset: false,
  emailBgColor: "#eeeeee",
  defaultTextColor: "#000000",
  accentTextColor: "#666666",
  defaultFont: "sans-serif",
  cornerRadius: 0,
  linkColor: "#0000ff",
  blockSpacing: 20,
};
const initialFooter = null;
