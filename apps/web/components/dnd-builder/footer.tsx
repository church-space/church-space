import { cn } from "@church-space/ui/cn";
import {
  Bluesky,
  Facebook,
  Instagram,
  Linkedin,
  LinkIcon,
  MailFilled,
  Threads,
  TikTok,
  XTwitter,
  Youtube,
  Vimeo,
  Spotify,
  Podcast,
} from "@church-space/ui/icons";
import { Separator } from "@church-space/ui/separator";
import { getYear } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@church-space/supabase/client";
import Image from "next/image";

// Define the type for social icon keys
type SocialIconKey =
  | "instagram"
  | "tiktok"
  | "twitter"
  | "mail"
  | "link"
  | "facebook"
  | "linkedin"
  | "spotify"
  | "podcast"
  | "bluesky"
  | "youtube"
  | "threads"
  | "vimeo";

interface FooterProps {
  onClick: (e: React.MouseEvent) => void;
  isActive: boolean;
  footerData?: any;
  emailInset: boolean;
  emailBgColor: string;
  defaultFont?: string;
  showHover: boolean;
  orgFooterDetails?: any;
  cornerRadius?: number;
}

const socialIcons = {
  instagram: Instagram,
  tiktok: TikTok,
  twitter: XTwitter,
  mail: MailFilled,
  link: LinkIcon,
  facebook: Facebook,
  linkedin: Linkedin,
  spotify: Spotify,
  podcast: Podcast,
  bluesky: Bluesky,
  youtube: Youtube,
  threads: Threads,
  vimeo: Vimeo,
};

export default function Footer({
  onClick,
  isActive,
  footerData,
  emailInset,
  emailBgColor,
  defaultFont,
  showHover = true,
  orgFooterDetails,
  cornerRadius,
}: FooterProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const logo = footerData?.logo || "";

  // Use footer data from database if available, otherwise use defaults
  const footerBgColor = footerData?.bg_color || "#ffffff";
  const footerTextColor = footerData?.text_color || "#000000";
  const footerSecondaryTextColor =
    footerData?.secondary_text_color || "#666666";
  const footerFont = defaultFont || footerData?.font || "Inter";
  const socialIconStyle = footerData?.socials_style || "icon-only";
  const socialIconColor = footerData?.socials_color || "#000000";
  const socialIconTextColor = footerData?.socials_icon_color || "#ffffff"; // For filled icons text
  const extraLinks = footerData?.extra_links || [];

  // Get links from footer data and sort by order
  const footerLinks = useMemo(() => {
    const links = Array.isArray(footerData?.links) ? footerData.links : [];
    return [...links].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [footerData?.links]);

  // Get the appropriate icon component
  const getIconComponent = (iconKey: string) => {
    return socialIcons[iconKey as SocialIconKey] || socialIcons.link;
  };

  // Use Supabase to get the logo URL
  useEffect(() => {
    // Reset the logo URL when logo is empty
    if (!logo) {
      setLogoUrl(null);
      return;
    }

    // Set the logo URL when logo is present
    const supabase = createClient();
    const { data: urlData } = supabase.storage
      .from("organization-assets")
      .getPublicUrl(logo);
    setLogoUrl(urlData.publicUrl);
  }, [logo]);

  return (
    <div
      className={cn("w-full rounded-b-md pb-4 pt-5")}
      style={
        !emailInset
          ? { backgroundColor: footerBgColor }
          : { backgroundColor: emailBgColor }
      }
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-2xl cursor-pointer flex-col items-center gap-4 rounded-md border border-transparent px-4 pt-5",
          isActive && "ring-2 ring-blue-500",
          showHover && "hover:border-border",
        )}
        onClick={onClick}
        style={{ fontFamily: footerFont }}
      >
        <div className="flex flex-col items-center gap-2">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="Logo"
              className="mb-6 h-28 w-28 object-contain"
              style={{
                borderRadius: cornerRadius ? `${cornerRadius * 0.6}px` : "0px",
              }}
              width={112}
              height={112}
            />
          )}

          {footerData?.name && (
            <div
              className="text-lg font-semibold"
              style={{ color: footerTextColor }}
            >
              {footerData.name}
            </div>
          )}
          {footerData?.subtitle && (
            <div
              className="w-full max-w-md pb-4 text-center text-sm leading-tight text-muted-foreground"
              style={{ color: footerSecondaryTextColor }}
            >
              {footerData?.subtitle ||
                "This is a description of the church or mission statement two lines."}
            </div>
          )}
        </div>

        {footerLinks.length > 0 && (
          <div className="flex items-center gap-2">
            {footerLinks
              .filter((link: any) => link.icon)
              .map((link: any, index: number) => {
                const IconComponent = getIconComponent(link.icon);
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full",
                    )}
                    style={{
                      backgroundColor:
                        socialIconStyle === "filled" ? socialIconColor : "",
                      borderColor:
                        socialIconStyle === "outline"
                          ? socialIconTextColor
                          : "",
                      borderWidth:
                        socialIconStyle === "outline" ? "1px" : "0px",
                      height: socialIconStyle === "icon-only" ? "20px" : "35px",
                      width: socialIconStyle === "icon-only" ? "20px" : "35px",
                    }}
                  >
                    <IconComponent
                      height="18"
                      width="18"
                      fill={socialIconTextColor}
                    />
                  </div>
                );
              })}
          </div>
        )}

        {extraLinks.length > 0 && (
          <div
            className="flex flex-col items-center gap-2 text-sm underline"
            style={{ color: footerSecondaryTextColor }}
          >
            {extraLinks
              .filter((link: any) => link.text)
              .map((link: any, index: number) => {
                return <div key={index}>{link.text}</div>;
              })}
          </div>
        )}

        <Separator
          className="mb-2 mt-4 w-full"
          style={{ backgroundColor: footerSecondaryTextColor }}
        />
        <div
          className="flex flex-col items-center gap-3"
          style={{ color: footerSecondaryTextColor }}
        >
          {orgFooterDetails?.data?.address && (
            <div className="flex flex-col items-center gap-2 text-center text-xs leading-none">
              Our mailing address is:
              <div className="text-pretty text-center text-xs leading-none">
                {orgFooterDetails?.data?.address?.line1 &&
                  ` ${orgFooterDetails?.data?.address?.line1}`}
                {orgFooterDetails?.data?.address?.line2 &&
                  ` ${orgFooterDetails?.data?.address?.line2}`}
                ,
                {orgFooterDetails?.data?.address?.city &&
                  ` ${orgFooterDetails?.data?.address?.city}`}
                ,
                {orgFooterDetails?.data?.address?.state &&
                  ` ${orgFooterDetails?.data?.address?.state}`}
                {orgFooterDetails?.data?.address?.zip &&
                  ` ${orgFooterDetails?.data?.address?.zip}`}
                {orgFooterDetails?.data?.address?.country &&
                  ` ${orgFooterDetails?.data?.address?.country}`}
              </div>
            </div>
          )}
          {orgFooterDetails?.data?.name && (
            <div className="text-pretty text-center text-xs leading-none">
              You are receiving this email because of your involvment with{" "}
              {orgFooterDetails?.data?.name}.
            </div>
          )}
          <div className="flex w-full flex-col items-center justify-center text-pretty pb-1 text-xs md:flex-row md:gap-2">
            <span>
              &copy; {getYear(new Date())}{" "}
              {orgFooterDetails?.data?.name && orgFooterDetails?.data?.name}
            </span>
            <span className="hidden md:block">|</span>
            <div className="flex items-center gap-2">
              <span className="underline">Update your preferences</span>
              <span>|</span>
              <span className="underline">Unsubscribe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
