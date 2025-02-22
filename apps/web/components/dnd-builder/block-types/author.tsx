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
} from "@trivo/ui/icons";

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

export default function AuthorBlock() {
  return (
    <div className="flex justify-between gap-2 items-center">
      <div className="flex gap-2 items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex flex-col">
          <p className="text-sm font-medium">John Doe</p>
          <p className="text-sm text-muted-foreground">Author</p>
        </div>
      </div>
      <div className="flex gap-2">
        {Object.entries(socialIcons)
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .map(([key, Icon]) => (
            <Icon key={key} />
          ))}
      </div>
    </div>
  );
}
