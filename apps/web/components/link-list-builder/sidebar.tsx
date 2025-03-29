import { cn } from "@church-space/ui/cn";
import {
  ChevronLeft,
  ChevronRight,
  HeaderIcon,
  Users,
  LinkFilled,
} from "@church-space/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import HeaderForm from "./sidebar-forms/header";
import LinksForm from "./sidebar-forms/links";
import SocialsForm from "./sidebar-forms/socials";
import { Button } from "@church-space/ui/button";
import { Link, SocialLink } from "./link-list-builder";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";

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
  headerImage: string;
  logoImage: string;
  headerBlur: boolean;
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
  setHeaderImage: (image: string) => void;
  setLogoImage: (image: string) => void;
  setHeaderBlur: (blur: boolean) => void;
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
  headerImage,
  logoImage,
  headerBlur,
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
  setHeaderImage,
  setLogoImage,
  setHeaderBlur,
}: LinkListBuilderSidebarProps) {
  const [activeForm, setActiveForm] = useState<
    "header" | "socials" | "links" | "default"
  >("default");
  const [hasMounted, setHasMounted] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const exitX = isSmallScreen ? 800 : 400;

  const springConfig = isSmallScreen
    ? {
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 1,
      }
    : {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8,
      };

  return (
    <div
      className={cn(
        "sticky top-16 h-[calc(100vh-5rem)] w-full flex-shrink-0 overflow-hidden rounded-md border bg-sidebar p-4 shadow-sm lg:w-[400px]",
        className,
      )}
    >
      <AnimatePresence mode="sync">
        {activeForm !== "default" ? (
          <motion.div
            key={activeForm}
            initial={{ x: hasMounted ? exitX : 0 }}
            animate={{ x: 0 }}
            exit={{ x: exitX }}
            transition={springConfig}
            className="absolute inset-0 bg-sidebar p-4"
          >
            <div className="mb-4 flex items-center gap-2">
              <Button
                className="h-7 gap-1 px-1 py-0 text-muted-foreground"
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
                  headerImage={headerImage}
                  logoImage={logoImage}
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
                  setHeaderImage={setHeaderImage}
                  setLogoImage={setLogoImage}
                  setHeaderBlur={setHeaderBlur}
                  headerBlur={headerBlur}
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
            initial={{ x: hasMounted ? -exitX : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -exitX }}
            transition={springConfig}
          >
            <div className="flex flex-col gap-4">
              <div className="text-lg font-medium">Editor</div>
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                onClick={() => setActiveForm("header")}
              >
                <div className="flex items-center gap-2">
                  <HeaderIcon height={"18"} width={"18"} />
                  Header
                </div>
                <ChevronRight />
              </div>
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                onClick={() => setActiveForm("socials")}
              >
                <div className="flex items-center gap-2">
                  <Users height={"18"} width={"18"} />
                  Socials
                </div>
                <ChevronRight />
              </div>
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
                onClick={() => setActiveForm("links")}
              >
                <div className="flex items-center gap-2">
                  <LinkFilled height={"18"} width={"18"} />
                  Links
                </div>
                <ChevronRight />
              </div>
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Link List Name"
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>URL</Label>
                  <div className="shadow-xs flex rounded-md">
                    <span className="-z-10 inline-flex items-center rounded-s-md border border-input bg-transparent px-3 text-xs text-muted-foreground">
                      churchspace.co/links/
                    </span>
                    <Input
                      className="-ms-px rounded-s-none bg-background shadow-none"
                      placeholder="ex: your-church"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
