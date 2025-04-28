"use client";

import React from "react";
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
  Spotify,
  Podcast,
} from "@church-space/ui/icons";

const ensureHttps = (url: string, icon: keyof typeof socialIcons) => {
  if (!url) return "#";
  if (url.startsWith("mailto:")) return url;
  if (icon === "mail") {
    if (url.startsWith("mailto:")) return url;
    return `mailto:${url}`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

export const socialIcons = {
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
  spotify: Spotify,
  podcast: Podcast,
};

export interface SocialLink {
  icon: keyof typeof socialIcons;
  url: string;
  text?: string;
  order: number;
}

interface LinkListSocialsProps {
  style: "outline" | "filled" | "icon-only";
  color: string;
  iconColor: string;
  links: SocialLink[];
  mode: "live" | "builder";
}

export default function LinkListSocials({
  style,
  color,
  iconColor,
  links,
  mode,
}: LinkListSocialsProps) {
  const filteredLinks =
    mode === "live" ? links.filter((link) => link.url) : links;

  return (
    <>
      {filteredLinks.length > 0 && (
        <div className="mx-auto flex w-fit items-center justify-between gap-3 px-6 hover:cursor-pointer">
          {filteredLinks.map((link, index) => {
            const IconComponent = socialIcons[link.icon] || socialIcons.link;
            const iconElement = (
              <div
                key={index}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: style === "filled" ? color : "transparent",
                  color: iconColor,
                  borderColor: style === "outline" ? iconColor : "transparent",
                  borderWidth: style === "outline" ? "1px" : "0px",
                }}
              >
                <IconComponent
                  height={style === "icon-only" ? "24" : "22"}
                  width={style === "icon-only" ? "24" : "22"}
                />
              </div>
            );

            return mode === "live" ? (
              <a
                href={ensureHttps(link.url, link.icon)}
                key={index}
                target="_blank"
                rel="noopener noreferrer"
              >
                {iconElement}
              </a>
            ) : (
              iconElement
            );
          })}
        </div>
      )}
    </>
  );
}
