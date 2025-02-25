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
import { useMemo, useState } from "react";
import { getYear } from "date-fns";

// Define the type for social icon keys
type SocialIconKey =
  | "instagram"
  | "tiktok"
  | "x"
  | "mail"
  | "link"
  | "facebook"
  | "linkedin"
  | "bluesky"
  | "youtube"
  | "threads";

// Define the type for social icon style
type SocialIconStyle = "filled" | "outline" | "icon-only";

const socialIcons = {
  instagram: Instagram,
  tiktok: TikTok,
  x: XTwitter,
  mail: MailFilled,
  link: LinkIcon,
  facebook: Facebook,
  linkedin: Linkedin,
  bluesky: Bluesky,
  youtube: Youtube,
  threads: Threads,
};

export default function Footer({ onClick }: { onClick: () => void }) {
  const emailInset = true;
  const emailBgColor = "#fff2d5";
  const footerBgColor = "#ffffff";
  const footerTextColor = "#000000";
  const footerSecondaryTextColor = "#ff0000";
  const footerFont = "Inter";
  const [socialIconStyle, setSocialIconStyle] =
    useState<SocialIconStyle>("icon-only");
  const socialIconColor = "#000000";
  const socialIconTextColor = "#000000";

  // Randomly select 4 social icons on component mount
  const randomSocialIcons = useMemo(() => {
    const iconKeys = Object.keys(socialIcons) as SocialIconKey[];
    const shuffled = [...iconKeys].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  return (
    <div
      className={cn("pt-5 pb-4 w-full ")}
      style={
        !emailInset
          ? { backgroundColor: footerBgColor }
          : { backgroundColor: emailBgColor }
      }
      onClick={onClick}
    >
      <div className="flex gap-4 pt-5 w-full max-w-2xl mx-auto px-4 flex-col items-center cursor-pointer border border-transparent hover:border-blue-500 rounded-md">
        <div className="flex flex-col items-center gap-2">
          <div className="h-28 w-28 rounded-md bg-green-900"></div>
          <div
            className="font-semibold text-lg "
            style={{ color: footerTextColor }}
          >
            Church Name
          </div>
          <div
            className=" text-sm text-muted-foreground max-w-sm text-center leading-tight text-pretty"
            style={{ color: footerSecondaryTextColor }}
          >
            This is a description of the church or mission statementtwo lines.
          </div>
        </div>

        <div className="flex items-center gap-2">
          {randomSocialIcons.map((iconKey) => {
            return (
              <div
                key={iconKey}
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
                <TikTok
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
          <div className="text-xs   text-center leading-none text-pretty">
            Hillsong Church 1-9 Solent Circuit Norwest, NSW 2153 Australia
          </div>
          <div className="text-xs leading-none text-center text-pretty">
            You are receiving this email because you are subscribed to our
            newsletter.
          </div>
          <div className="text-xs items-center w-full flex justify-center gap-2 leading-10 text-pretty">
            <span>&copy; {getYear(new Date())} Hillsong Church</span>
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
