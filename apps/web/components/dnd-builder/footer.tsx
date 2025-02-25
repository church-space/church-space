import { cn } from "@trivo/ui/cn";
import {
  MailFilled,
  Instagram,
  Facebook,
  Linkedin,
  Bluesky,
  LinkIcon,
  Threads,
  TikTok,
  XTwitter,
  Youtube,
} from "@trivo/ui/icons";
import { Separator } from "@trivo/ui/separator";
import { useMemo } from "react";
import { getYear } from "date-fns";

// Define the type for social icon keys
type SocialIconKey =
  | "instagram"
  | "tiktok"
  | "twitter"
  | "mail"
  | "link"
  | "facebook"
  | "linkedin"
  | "bluesky"
  | "youtube"
  | "threads";

// Define the type for social icon style
type SocialIconStyle = "filled" | "outline" | "icon-only";

interface FooterProps {
  onClick: (e: React.MouseEvent) => void;
  isActive: boolean;
  footerData?: any;
}

const socialIcons = {
  instagram: Instagram,
  tiktok: TikTok,
  twitter: XTwitter,
  mail: MailFilled,
  link: LinkIcon,
  facebook: Facebook,
  linkedin: Linkedin,
  bluesky: Bluesky,
  youtube: Youtube,
  threads: Threads,
};

export default function Footer({ onClick, isActive, footerData }: FooterProps) {
  const emailInset = true;
  const emailBgColor = "#fff2d5";

  // Use footer data from database if available, otherwise use defaults
  const footerBgColor = footerData?.bg_color || "#ffffff";
  const footerTextColor = footerData?.text_color || "#000000";
  const footerSecondaryTextColor =
    footerData?.secondary_text_color || "#666666";
  const footerFont = footerData?.font || "Inter";
  const socialIconStyle = footerData?.socials_icon_color || "icon-only";
  const socialIconColor = footerData?.socials_color || "#000000";
  const socialIconTextColor = "#ffffff"; // For filled icons text

  // Get links from footer data or use empty array
  const footerLinks = Array.isArray(footerData?.links) ? footerData.links : [];

  // If we have links from the database, use those
  // Otherwise, randomly select 4 social icons on component mount
  const socialLinks = useMemo(() => {
    if (footerLinks && footerLinks.length > 0) {
      return footerLinks;
    }

    // Fallback to random icons if no links are defined
    const iconKeys = Object.keys(socialIcons) as SocialIconKey[];
    // Use a deterministic selection instead of random to avoid hydration mismatches
    return ["instagram", "facebook", "twitter", "mail"].map((icon) => ({
      icon,
      url: "",
    }));
  }, [footerLinks]);

  // Get the appropriate icon component
  const getIconComponent = (iconKey: string) => {
    return socialIcons[iconKey as SocialIconKey] || socialIcons.link;
  };

  return (
    <div
      className={cn("pt-5 pb-4 w-full ")}
      style={
        !emailInset
          ? { backgroundColor: footerBgColor }
          : { backgroundColor: emailBgColor }
      }
    >
      <div
        className={cn(
          "flex gap-4 pt-5 w-full max-w-2xl mx-auto px-4 flex-col items-center cursor-pointer border border-transparent hover:border-border rounded-md",
          isActive && "ring-2 ring-blue-500"
        )}
        onClick={onClick}
        style={{ fontFamily: footerFont }}
      >
        <div className="flex flex-col items-center gap-2">
          {footerData?.logo ? (
            <img
              src={footerData.logo}
              alt="Logo"
              className="h-28 w-28 object-contain"
            />
          ) : (
            <div className="h-28 w-28 rounded-md bg-green-900"></div>
          )}
          <div
            className="font-semibold text-lg "
            style={{ color: footerTextColor }}
          >
            {footerData?.name || "Church Name"}
          </div>
          <div
            className="text-sm text-muted-foreground max-w-sm text-center leading-tight text-pretty"
            style={{ color: footerSecondaryTextColor }}
          >
            {footerData?.subtitle ||
              "This is a description of the church or mission statement two lines."}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {socialLinks.map((link: any, index: number) => {
            const IconComponent = getIconComponent(link.icon);
            return (
              <div
                key={index}
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center"
                )}
                style={{
                  backgroundColor:
                    socialIconStyle === "filled" ? socialIconColor : "",
                  borderColor:
                    socialIconStyle === "outline" ? socialIconColor : "",
                  borderWidth: socialIconStyle === "outline" ? "1px" : "0px",
                }}
              >
                <IconComponent
                  height="18"
                  width="18"
                  fill={
                    socialIconStyle === "filled"
                      ? socialIconTextColor
                      : socialIconColor
                  }
                />
              </div>
            );
          })}
        </div>
        <Separator
          className="w-full mb-2 mt-4 "
          style={{ backgroundColor: footerSecondaryTextColor }}
        />
        <div
          className="flex flex-col items-center gap-1.5"
          style={{ color: footerSecondaryTextColor }}
        >
          <div className="text-xs text-center leading-none text-pretty">
            {footerData?.address ||
              "Hillsong Church 1-9 Solent Circuit Norwest, NSW 2153 Australia"}
          </div>
          <div className="text-xs leading-none text-center text-pretty">
            {footerData?.reason ||
              "You are receiving this email because you are subscribed to our newsletter."}
          </div>
          <div className="text-xs items-center w-full flex justify-center gap-2 leading-10 text-pretty">
            <span>
              &copy; {getYear(new Date())}{" "}
              {footerData?.copyright_name || "Hillsong Church"}
            </span>
            <span>|</span>
            <span className="underline">Update your preferences</span>
            <span>|</span>
            <span className="underline">Unsubscribe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
