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
import { Avatar, AvatarFallback, AvatarImage } from "@trivo/ui/avatar";
import type { AuthorBlockData } from "@/types/blocks";

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

interface AuthorBlockProps {
  data?: AuthorBlockData;
}

export default function AuthorBlock({ data }: AuthorBlockProps) {
  const name = data?.name || "John Doe";
  const subtitle = data?.subtitle || "Author";
  const avatar = data?.avatar || "";
  const links = data?.links || [];

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {links.map((link, index) => {
          const Icon = socialIcons[link.icon as keyof typeof socialIcons];
          return Icon ? <Icon key={index} /> : null;
        })}
      </div>
    </div>
  );
}
