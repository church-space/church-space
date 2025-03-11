import { cn } from "@church-space/ui/cn";
import { ChevronLeft, ChevronRight, FooterIcon } from "@church-space/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import HeaderForm from "./sidebar-forms/header";
import LinksForm from "./sidebar-forms/links";
import SocialsForm from "./sidebar-forms/socials";
import { Button } from "@church-space/ui/button";
import { Link, SocialLink } from "./link-list-builder";

interface LinkListBuilderSidebarProps {
  className?: string;
  links: Link[];
  bgColor: string;
  buttonColor: string;
  buttonTextColor: string;
  socialsStyle: "outline" | "filled" | "icon-only";
  socialsColor: string;
  socialsIconColor: string;
  socialLinks: SocialLink[];
  headerBgColor: string;
  headerTextColor: string;
  headerSecondaryTextColor: string;
  headerTitle: string;
  headerDescription: string;
  headerName: string;
  headerButtonText: string;
  headerButtonLink: string;
  headerButtonColor: string;
  headerButtonTextColor: string;
  setBgColor: (color: string) => void;
  setButtonColor: (color: string) => void;
  setButtonTextColor: (color: string) => void;
  setSocialsStyle: (style: "outline" | "filled" | "icon-only") => void;
  setSocialsColor: (color: string) => void;
  setSocialsIconColor: (color: string) => void;
  setSocialLinks: (links: SocialLink[]) => void;
  setHeaderBgColor: (color: string) => void;
  setHeaderTextColor: (color: string) => void;
  setHeaderSecondaryTextColor: (color: string) => void;
  setHeaderTitle: (title: string) => void;
  setHeaderDescription: (description: string) => void;
  setHeaderName: (name: string) => void;
  setHeaderButtonText: (text: string) => void;
  setHeaderButtonLink: (link: string) => void;
  setHeaderButtonColor: (color: string) => void;
  setHeaderButtonTextColor: (color: string) => void;
  setLinks: (links: Link[]) => void;
}

export default function LinkListBuilderSidebar({
  className,
  links,
  bgColor,
  buttonColor,
  buttonTextColor,
  socialsStyle,
  socialsColor,
  socialsIconColor,
  socialLinks,
  headerBgColor,
  headerTextColor,
  headerSecondaryTextColor,
  headerTitle,
  headerDescription,
  headerName,
  headerButtonText,
  headerButtonLink,
  headerButtonColor,
  headerButtonTextColor,
  setBgColor,
  setButtonColor,
  setButtonTextColor,
  setSocialsStyle,
  setSocialsColor,
  setSocialsIconColor,
  setSocialLinks,
  setHeaderBgColor,
  setHeaderTextColor,
  setHeaderSecondaryTextColor,
  setHeaderTitle,
  setHeaderDescription,
  setHeaderName,
  setHeaderButtonText,
  setHeaderButtonLink,
  setHeaderButtonColor,
  setHeaderButtonTextColor,
  setLinks,
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
              {activeForm === "header" && (
                <HeaderForm
                  headerBgColor={headerBgColor}
                  headerTextColor={headerTextColor}
                  headerSecondaryTextColor={headerSecondaryTextColor}
                  headerTitle={headerTitle}
                  headerDescription={headerDescription}
                  headerName={headerName}
                  headerButtonText={headerButtonText}
                  headerButtonLink={headerButtonLink}
                  headerButtonColor={headerButtonColor}
                  headerButtonTextColor={headerButtonTextColor}
                  setHeaderBgColor={setHeaderBgColor}
                  setHeaderTextColor={setHeaderTextColor}
                  setHeaderSecondaryTextColor={setHeaderSecondaryTextColor}
                  setHeaderTitle={setHeaderTitle}
                  setHeaderDescription={setHeaderDescription}
                  setHeaderName={setHeaderName}
                  setHeaderButtonText={setHeaderButtonText}
                  setHeaderButtonLink={setHeaderButtonLink}
                  setHeaderButtonColor={setHeaderButtonColor}
                  setHeaderButtonTextColor={setHeaderButtonTextColor}
                />
              )}
              {activeForm === "socials" && (
                <SocialsForm
                  socialsStyle={socialsStyle}
                  socialsColor={socialsColor}
                  socialsIconColor={socialsIconColor}
                  socialLinks={socialLinks}
                  setSocialsStyle={setSocialsStyle}
                  setSocialsColor={setSocialsColor}
                  setSocialsIconColor={setSocialsIconColor}
                  setSocialLinks={setSocialLinks}
                />
              )}
              {activeForm === "links" && (
                <LinksForm
                  links={links}
                  buttonColor={buttonColor}
                  buttonTextColor={buttonTextColor}
                  bgColor={bgColor}
                  setLinks={setLinks}
                  setButtonColor={setButtonColor}
                  setButtonTextColor={setButtonTextColor}
                  setBgColor={setBgColor}
                />
              )}
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
