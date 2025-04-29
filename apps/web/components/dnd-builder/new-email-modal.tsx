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

export default function NewEmailModal() {
  const [newEmailModalOpen = false, setNewEmailModalOpen] = useQueryState(
    "newEmail",
    parseAsBoolean,
  );
  const [view, setView] = useState<View>("main");

  const handleBack = () => setView("main");

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
        style={{ height: "528px", maxHeight: "528px" }}
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
                    <div className="flex gap-3">
                      {/* TODO: Make these clickable */}
                      <div className="flex flex-col gap-2">
                        <button className="rounded-lg border bg-background p-4 transition-all duration-300 hover:bg-primary/30 focus:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:hover:bg-primary/40">
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
                        <button className="rounded-lg border bg-background p-4 transition-all duration-300 hover:bg-primary/30 focus:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:hover:bg-primary/40">
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
                    <div className="flex flex-1 flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <Label>Color Scheme</Label>
                        <Select>
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
                        <Select>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="template-1">
                              Template 1
                            </SelectItem>
                            <SelectItem value="template-2">
                              Template 2
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mt-1.5 flex flex-row items-center gap-2">
                        <Switch />
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
            <Button variant="outline">Start from scratch</Button>
          )}
          <Button>{view === "main" ? "Create" : "Select"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
