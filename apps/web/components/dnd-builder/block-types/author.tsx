"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  MailFilled,
  Instagram,
  Facebook,
  Linkedin,
  Spotify,
  Podcast,
  Bluesky,
  LinkIcon,
  Threads,
  TikTok,
  XTwitter,
  Youtube,
  Vimeo,
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
  spotify: Spotify,
  podcast: Podcast,
  bluesky: Bluesky,
  youtube: Youtube,
  threads: Threads,
  vimeo: Vimeo,
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
  const hideAvatar = data?.hideAvatar || false;
  const linkColor = data?.linkColor || "#000000";
  // Force re-render of the Avatar component when avatar changes
  const [key, setKey] = useState(0);

  // Memoize the links array to prevent it from changing on every render
  const links = useMemo(() => {
    const linksArray = data?.links || [];
    return [...linksArray].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data?.links]);

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
      .from("organization-assets")
      .getPublicUrl(avatar);
    setAvatarUrl(urlData.publicUrl);
    // Force re-render of the Avatar component
    setKey((prev) => prev + 1);
  }, [avatar]);

  return (
    <div
      className="flex w-full flex-col justify-between md:flex-row md:items-center"
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
      <div className="ml-12 mt-1 flex gap-3 md:ml-0 md:mt-0">
        {links.map((link, index) => {
          const Icon = socialIcons[link.icon as keyof typeof socialIcons];
          return Icon ? (
            <Icon key={index} fill={linkColor} height="18px" width="18px" />
          ) : null;
        })}
      </div>
    </div>
  );
}
