import React, { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import type { AuthorBlockData } from "@/types/blocks";
import { createClient } from "@church-space/supabase/client";

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
  defaultFont?: string;
  defaultTextColor?: string;
}

export default function AuthorBlock({
  data,
  defaultFont,
  defaultTextColor,
}: AuthorBlockProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const name = data?.name || "";
  const subtitle = data?.subtitle || "";
  const avatar = data?.avatar || "";
  const links = data?.links || [];
  const hideAvatar = data?.hideAvatar || false;

  // Force re-render of the Avatar component when avatar changes
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Reset the avatar URL when avatar is empty
    if (!avatar) {
      setAvatarUrl(null);
      // Force re-render of the Avatar component
      setKey((prev) => prev + 1);
      return;
    }

    // Set the avatar URL when avatar is present
    const supabase = createClient();
    const { data: urlData } = supabase.storage
      .from("email_assets")
      .getPublicUrl(avatar);
    setAvatarUrl(urlData.publicUrl);
    // Force re-render of the Avatar component
    setKey((prev) => prev + 1);
  }, [avatar]);

  return (
    <div
      className="flex w-full items-center justify-between"
      style={{ fontFamily: defaultFont || "inherit" }}
    >
      <div className="flex items-center gap-3">
        {/* Use key to force re-render when avatar changes */}
        {!hideAvatar && (
          <Avatar key={key}>
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-zinc-300 text-black" delayMs={0}>
              {name[0]}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          <p
            className="text-sm font-semibold leading-tight"
            style={{ color: defaultTextColor }}
          >
            {name ? name : <span className="text-muted-foreground">Name</span>}
          </p>

          <p
            className="text-sm text-muted-foreground opacity-80"
            style={{ color: defaultTextColor }}
          >
            {subtitle ? (
              subtitle
            ) : (
              <span className="text-muted-foreground">Title</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {links.map((link, index) => {
          const Icon = socialIcons[link.icon as keyof typeof socialIcons];
          return Icon ? (
            <Icon
              key={index}
              fill={defaultTextColor}
              height="18px"
              width="18px"
            />
          ) : null;
        })}
      </div>
    </div>
  );
}
