import { cn } from "@church-space/ui/cn";
import { ChevronLeft, ChevronRight, FooterIcon } from "@church-space/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import HeaderForm from "./sidebar-forms/header";
import LinksForm from "./sidebar-forms/links";
import SocialsForm from "./sidebar-forms/socials";
import { Button } from "@church-space/ui/button";

interface LinkListBuilderSidebarProps {
  className?: string;
}

export default function LinkListBuilderSidebar({
  className,
}: LinkListBuilderSidebarProps) {
  const [activeForm, setActiveForm] = useState<
    "header" | "socials" | "links" | "default"
  >("default");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-16 h-[calc(100vh-5rem)] flex-shrink-0 overflow-hidden rounded-md border bg-sidebar p-4 shadow-sm md:w-[320px] lg:w-[400px]",
        className,
      )}
    >
      <AnimatePresence mode="sync">
        {activeForm !== "default" ? (
          <motion.div
            key={activeForm}
            initial={{ x: hasMounted ? 400 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
            className="absolute inset-0 bg-sidebar p-4"
          >
            <div className="mb-4 flex items-center gap-2">
              <Button
                className="hidden h-7 gap-1 px-1 py-0 text-muted-foreground md:flex"
                variant="ghost"
                onClick={() => setActiveForm("default")}
              >
                <ChevronLeft />
                Back
              </Button>
            </div>
            <div className="h-full overflow-y-auto py-1">
              {activeForm === "header" && <HeaderForm />}
              {activeForm === "socials" && <SocialsForm />}
              {activeForm === "links" && <LinksForm />}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="default-content"
            initial={{ x: hasMounted ? -400 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="text-lg font-medium">Editor</div>
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                onClick={() => setActiveForm("header")}
              >
                <div className="flex items-center gap-2">
                  <FooterIcon />
                  Header
                </div>
                <ChevronRight />
              </div>
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                onClick={() => setActiveForm("socials")}
              >
                <div className="flex items-center gap-2">
                  <FooterIcon />
                  Socials
                </div>
                <ChevronRight />
              </div>
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                onClick={() => setActiveForm("links")}
              >
                <div className="flex items-center gap-2">
                  <FooterIcon />
                  Links
                </div>
                <ChevronRight />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
