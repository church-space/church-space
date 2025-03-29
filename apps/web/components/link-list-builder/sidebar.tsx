import { cn } from "@church-space/ui/cn";
import {
  ChevronLeft,
  ChevronRight,
  HeaderIcon,
  Users,
  LinkFilled,
} from "@church-space/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import HeaderForm from "./sidebar-forms/header";
import LinksForm from "./sidebar-forms/links";
import SocialsForm from "./sidebar-forms/socials";
import { Button } from "@church-space/ui/button";
import { Link as LinkType, SocialLink } from "./link-list-builder";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Switch } from "@church-space/ui/switch";
import Link from "next/link";

interface LinkListBuilderSidebarProps {
  className?: string;
  links: LinkType[];
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
  urlSlug: string;
  isPublic: boolean;
  privateName: string;
  urlSlugErrorProp?: string | null;
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
  setLinks: (links: LinkType[]) => void;
  setHeaderImage: (image: string) => void;
  setLogoImage: (image: string) => void;
  setHeaderBlur: (blur: boolean) => void;
  setUrlSlug: (slug: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setPrivateName: (name: string) => void;
}

const isValidSlug = (slug: string): boolean => {
  if (!slug) return false;
  return /^[a-zA-Z0-9-]+$/.test(slug);
};

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
  urlSlug,
  isPublic,
  privateName,
  urlSlugErrorProp,
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
  setUrlSlug,
  setIsPublic,
  setPrivateName,
}: LinkListBuilderSidebarProps) {
  const [activeForm, setActiveForm] = useState<
    "header" | "socials" | "links" | "default"
  >("default");
  const [hasMounted, setHasMounted] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [localUrlSlug, setLocalUrlSlug] = useState(urlSlug);
  const [localPrivateName, setLocalPrivateName] = useState(privateName);
  const [urlSlugFormatError, setUrlSlugFormatError] = useState<string | null>(
    null,
  );
  const [privateNameError, setPrivateNameError] = useState<string | null>(null);

  const urlSlugError = urlSlugFormatError || urlSlugErrorProp;

  const urlSlugTimerRef = useRef<NodeJS.Timeout | null>(null);
  const privateNameTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasMounted(true);

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setLocalUrlSlug(urlSlug);
    setUrlSlugFormatError(null);
  }, [urlSlug]);

  useEffect(() => {
    setLocalPrivateName(privateName);
    setPrivateNameError(null);
  }, [privateName]);

  useEffect(() => {
    if (urlSlugErrorProp) {
      setUrlSlugFormatError(null);
    }
  }, [urlSlugErrorProp]);

  const handleUrlSlugChange = (value: string) => {
    const cleanedValue = value.toLowerCase();
    setLocalUrlSlug(cleanedValue);
    setUrlSlugFormatError(null);

    if (urlSlugTimerRef.current) {
      clearTimeout(urlSlugTimerRef.current);
    }

    urlSlugTimerRef.current = setTimeout(() => {
      const trimmedValue = cleanedValue.trim();
      if (trimmedValue === "") {
        setUrlSlugFormatError("URL slug cannot be empty.");
      } else if (!isValidSlug(cleanedValue)) {
        setUrlSlugFormatError(
          "Invalid format: use letters, numbers, or hyphens.",
        );
      } else {
        setUrlSlug(cleanedValue);
      }
    }, 800);
  };

  const handlePrivateNameChange = (value: string) => {
    setLocalPrivateName(value);
    setPrivateNameError(null);

    if (privateNameTimerRef.current) {
      clearTimeout(privateNameTimerRef.current);
    }

    privateNameTimerRef.current = setTimeout(() => {
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        setPrivateNameError("Name cannot be empty.");
      } else {
        setPrivateName(trimmedValue);
      }
    }, 800);
  };

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
            className="h-full overflow-y-auto pb-10"
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
              <div className="mt-4 flex flex-col gap-4 border-t pt-4">
                <div className="text-md font-medium">Settings</div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Link List Name (private)"
                    className={cn(
                      "bg-background",
                      privateNameError && "border-destructive",
                    )}
                    value={localPrivateName}
                    onChange={(e) => handlePrivateNameChange(e.target.value)}
                    aria-invalid={!!privateNameError}
                    aria-describedby={
                      privateNameError ? "private-name-error" : undefined
                    }
                  />
                  {privateNameError && (
                    <p
                      id="private-name-error"
                      className="text-xs text-destructive"
                    >
                      {privateNameError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="url">URL</Label>
                  <div
                    className={cn(
                      "shadow-xs flex rounded-md border border-input focus-within:ring-1 focus-within:ring-ring",
                      urlSlugError &&
                        "border-destructive focus-within:ring-destructive",
                    )}
                  >
                    <span className="inline-flex items-center rounded-s-md border-e border-input bg-accent px-3 text-xs text-muted-foreground">
                      churchspace.co/links/
                    </span>
                    <Input
                      id="url"
                      className="-ms-px rounded-s-none border-0 bg-background px-2 py-2 shadow-none focus-visible:ring-0"
                      placeholder="ex: your-church"
                      type="text"
                      value={localUrlSlug}
                      onChange={(e) => handleUrlSlugChange(e.target.value)}
                      aria-invalid={!!urlSlugError}
                      aria-describedby={
                        urlSlugError ? "url-slug-error" : undefined
                      }
                    />
                  </div>
                  {urlSlugError && (
                    <p id="url-slug-error" className="text-xs text-destructive">
                      {urlSlugError}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    id="is-public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="is-public">Make Public</Label>
                </div>
                <Link
                  href={localUrlSlug ? `/links/${localUrlSlug}` : "#"}
                  target="_blank"
                  passHref
                  legacyBehavior
                >
                  <a
                    className={cn(
                      !localUrlSlug && "pointer-events-none opacity-50",
                    )}
                    aria-disabled={!localUrlSlug}
                  >
                    <Button variant="outline" disabled={!localUrlSlug}>
                      View Live Page
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
