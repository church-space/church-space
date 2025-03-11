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
} from "@church-space/ui/icons";

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

interface LinkListSocialsProps {
  style: "outline" | "filled" | "icon-only";
}

export default function LinkListSocials({ style }: LinkListSocialsProps) {
  return (
    <div className="mx-auto flex w-fit flex-wrap items-center justify-between gap-4 px-6 py-4">
      {Object.entries(socialIcons).map(([key, Icon]) => (
        <div className="flex h-7 w-7 items-center justify-center rounded-full">
          <Icon key={key} height={"22"} width={"22"} />
        </div>
      ))}
    </div>
  );
}
