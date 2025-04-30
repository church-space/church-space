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
import { EmailStyles } from "./use-block-state-manager";

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
  onFooterChange?: (data: any) => void;
  onAllStyleChanges?: (styleUpdates: Partial<EmailStyles>) => void;
  setCurrentState?: (state: any) => void;
  onTemplateBlocks?: (blocks: any[]) => void;
}

export default function NewEmailModal({
  onFooterChange,
  onAllStyleChanges,
  setCurrentState,
  onTemplateBlocks,
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
    console.log("Create button clicked, email type:", selectedEmailType);

    // Get the selected color palette
    const selectedPallet = pallets.find(
      (pallet) => pallet.name === selectedColor,
    );

    if (selectedPallet) {
      console.log("Selected palette:", selectedPallet.name);

      // Create style updates object
      const styleUpdates = {
        bgColor: selectedPallet.colors.bgColor,
        emailBgColor: selectedPallet.colors.blocksBgColor,
        defaultTextColor: selectedPallet.colors.textColor,
        linkColor: selectedPallet.colors.linkColor,
        accentTextColor: selectedPallet.colors.accentTextColor,
        defaultFont: selectedFont,
        isInset: isInset,
        cornerRadius: 11,
        blockSpacing: 20,
      };
      console.log("Style updates:", styleUpdates);

      // Create footer updates object
      const footerUpdates = {
        text_color: selectedPallet.colors.footerTextColor,
        secondary_text_color: selectedPallet.colors.footerAccentTextColor,
        bg_color: selectedPallet.colors.footerBgColor,
      };
      console.log("Footer updates:", footerUpdates);

      // Create template blocks based on selected email type
      const templateBlocks: Array<{
        id: string;
        type: string;
        order: number;
        data: any;
      }> = [];

      if (selectedEmailType === "updates") {
        // Updates email template blocks
        templateBlocks.push(
          // Image block (order 0)
          {
            id: crypto.randomUUID(),
            type: "image",
            order: 0,
            data: {
              image: "",
              size: 100,
              link: "",
              centered: true,
            },
          },
          // Text block (order 1)
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 1,
            data: {
              font: "'Courier New', monospace",
              content:
                '<h1 class="heading" style="text-align: left">Heading One</h1><p style="text-align: left">"In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not."</p><p style="text-align: left">John 1:1-5 KJV</p>',
              textColor: "#000000",
            },
          },
          // Button block (order 2)
          {
            id: crypto.randomUUID(),
            type: "button",
            order: 2,
            data: {
              link: "",
              size: "large",
              text: "Learn More",
              color: "#000000",
              style: "filled",
              centered: false,
              textColor: "#ffffff",
            },
          },
          // Divider block (order 3)
          {
            id: crypto.randomUUID(),
            type: "divider",
            order: 3,
            data: {
              color: "#000000",
              margin: 40,
              thickness: 2,
            },
          },
          // Image block (order 4)
          {
            id: crypto.randomUUID(),
            type: "image",
            order: 4,
            data: {
              image: "",
              size: 100,
              link: "",
              centered: true,
            },
          },
          // Text block (order 5)
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 5,
            data: {
              font: "'Courier New', monospace",
              content:
                '<h1 class="heading" style="text-align: left">Heading One</h1><p style="text-align: left">"In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not."</p><p style="text-align: left">John 1:1-5 KJV</p>',
              textColor: "#000000",
            },
          },
          // Button block (order 6)
          {
            id: crypto.randomUUID(),
            type: "button",
            order: 6,
            data: {
              link: "",
              size: "large",
              text: "Learn More",
              color: "#000000",
              style: "filled",
              centered: false,
              textColor: "#ffffff",
            },
          },
          // Divider block (order 7)
          {
            id: crypto.randomUUID(),
            type: "divider",
            order: 7,
            data: {
              color: "#000000",
              margin: 40,
              thickness: 2,
            },
          },
        );
      } else if (selectedEmailType === "article") {
        // Article email template blocks
        templateBlocks.push(
          // Image block (order 0)
          {
            id: crypto.randomUUID(),
            type: "image",
            order: 0,
            data: {
              image: "",
              size: 100,
              link: "",
              centered: true,
            },
          },
          // Author block (order 1)
          {
            id: crypto.randomUUID(),
            type: "author",
            order: 1,
            data: {
              content: "",
            },
          },
          // Text block (order 2)
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 2,
            data: {
              font: "sans-serif",
              content:
                '<h1 class="heading">Heading One</h1><p style="text-align: left">"In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not."</p><p style="text-align: left"></p><p style="text-align: left">There was a man sent from God, whose name was John.</p><p>The same came for a witness, to bear witness of the Light, that all men through him might believe. He was not that Light, but was sent to bear witness of that Light. That was the true Light, which lighteth every man that cometh into the world. He was in the world, and the world was made by him, and the world knew him not. He came unto his own, and his own received him not. But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name: Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.</p>',
              textColor: "#000000",
            },
          },
          // Divider block (order 3)
          {
            id: crypto.randomUUID(),
            type: "divider",
            order: 3,
            data: {
              color: "#5c5c5c",
              margin: 24,
              thickness: 1,
            },
          },
          // Text block (order 4)
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 4,
            data: {
              font: "sans-serif",
              content:
                '<p style="text-align: left">"In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not."</p><p style="text-align: left"></p><p style="text-align: left">There was a man sent from God, whose name was John.</p><p>The same came for a witness, to bear witness of the Light, that all men through him might believe. He was not that Light, but was sent to bear witness of that Light. That was the true Light, which lighteth every man that cometh into the world. He was in the world, and the world was made by him, and the world knew him not. He came unto his own, and his own received him not. But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name: Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.</p>',
              textColor: "#000000",
            },
          },
        );
      } else if (selectedEmailType === "scratch") {
        // Empty template with just a single text block
        templateBlocks.push(
          // Text block (order 0)
          {
            id: crypto.randomUUID(),
            type: "text",
            order: 0,
            data: {
              font: selectedFont,
              content:
                '<p style="text-align: left">Start typing your email content here...</p>',
              textColor: selectedPallet.colors.textColor,
            },
          },
        );
      }

      console.log("Template blocks created:", templateBlocks);

      // Send the template blocks to the parent directly
      if (onTemplateBlocks) {
        console.log("Calling onTemplateBlocks with blocks");
        onTemplateBlocks(templateBlocks);
      } else {
        console.log("onTemplateBlocks is not defined");
      }

      console.log(
        "setCurrentState function:",
        setCurrentState ? "Defined" : "Undefined",
      );

      // First apply updates to local state using direct function call
      if (setCurrentState) {
        // We need to use a callback to preserve existing blocks
        setCurrentState(
          (prevState: { blocks: any[]; styles: any; footer: any }) => {
            console.log("Previous state in callback:", prevState);
            const newState = {
              blocks: templateBlocks, // Use template blocks instead of existing blocks
              styles: styleUpdates, // Apply new styles
              footer: footerUpdates, // Apply new footer
            };
            console.log("New state being set:", newState);
            return newState;
          },
        );
        console.log("State update called");
      } else {
        console.error("setCurrentState is not defined!");
      }
    }

    console.log("Closing modal");
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
  // For simplicity, going 'back' is always -1, going 'forward' is always 1
  // You might want more complex logic if you have more views or deeper navigation
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
                  <div className="flex gap-8 rounded-lg border bg-muted p-5 shadow-sm">
                    <div className="flex flex-col gap-2">
                      <Label>Email Type</Label>
                      <div className="flex gap-3">
                        <div className="flex flex-col gap-2">
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
                        <div className="flex flex-col gap-2">
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
                  <p>Templates list will go here.</p>
                  <p>Templates list will go here.</p>
                  <p>Templates list will go here.</p>
                  <p>Templates list will go here.</p>
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
              onClick={() => {
                // Set email type to scratch before creating
                setSelectedEmailType("scratch");
                handleCreate();
              }}
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
