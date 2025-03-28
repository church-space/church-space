"use client";

import React, { useState } from "react";
import LinkListBuilderSidebar from "./sidebar";
import LinkListHeader from "./link-list-header";
import LinkListSocials from "./link-list-socials";
import LinkListLinks from "./link-list-links";
import { socialIcons } from "./link-list-socials";
import { getLinkListQuery } from "@church-space/supabase/queries/all/get-link-list";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { createClient } from "@church-space/supabase/client";
import {
  updateLinkList,
  updateLinkListLink,
  updateLinkListSocial,
  createLinkListLink,
  createLinkListSocial,
  deleteLinkListLink,
  deleteLinkListSocial,
} from "@church-space/supabase/mutations/link-lists";
import { useToast } from "@church-space/ui/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

export interface Link {
  icon: string;
  url: string;
  text: string;
}
export interface SocialLink {
  icon: keyof typeof socialIcons;
  url: string;
  text?: string;
}

export default function LinkListBuilder() {
  const params = useParams();
  const linkListId = params.linkListId as unknown as number;
  const supabase = createClient();

  if (!linkListId) {
    return <div>No link list ID</div>;
  }

  const { data: linkList, isLoading } = useQuery({
    queryKey: ["linkList", linkListId],
    queryFn: () => getLinkListQuery(supabase, linkListId),
  });

  console.log(linkList);

  const [links, setLinks] = useState<Link[]>([
    { icon: "link", url: "https://www.google.com", text: "Google" },
  ]);
  const [bgColor, setBgColor] = useState<string>("#f5f500");
  const [buttonColor, setButtonColor] = useState<string>("#ffffff");
  const [buttonTextColor, setButtonTextColor] = useState<string>("#000000");
  const [socialsStyle, setSocialsStyle] = useState<
    "outline" | "filled" | "icon-only"
  >("filled");
  const [socialsColor, setSocialsColor] = useState<string>("");
  const [socialsIconColor, setSocialsIconColor] = useState<string>("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [headerBgColor, setHeaderBgColor] = useState<string>("");
  const [headerTextColor, setHeaderTextColor] = useState<string>("");
  const [headerSecondaryTextColor, setHeaderSecondaryTextColor] =
    useState<string>("");
  const [headerTitle, setHeaderTitle] = useState<string>("");
  const [headerDescription, setHeaderDescription] = useState<string>("");
  const [headerName, setHeaderName] = useState<string>("");
  const [headerButtonText, setHeaderButtonText] = useState<string>("");
  const [headerButtonLink, setHeaderButtonLink] = useState<string>("");
  const [headerButtonColor, setHeaderButtonColor] = useState<string>("");
  const [headerButtonTextColor, setHeaderButtonTextColor] =
    useState<string>("");
  const [headerImage, setHeaderImage] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");

  return (
    <div className="relative flex p-2 pt-0 md:gap-4 md:p-4 md:pt-0">
      <LinkListBuilderSidebar
        links={links}
        bgColor={bgColor}
        buttonColor={buttonColor}
        buttonTextColor={buttonTextColor}
        socialsStyle={socialsStyle}
        socialsColor={socialsColor}
        socialsIconColor={socialsIconColor}
        socialLinks={socialLinks}
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
        setBgColor={setBgColor}
        setButtonColor={setButtonColor}
        setButtonTextColor={setButtonTextColor}
        setSocialsStyle={setSocialsStyle}
        setSocialsColor={setSocialsColor}
        setSocialsIconColor={setSocialsIconColor}
        setSocialLinks={setSocialLinks}
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
        setLinks={setLinks}
        setHeaderImage={setHeaderImage}
        setLogoImage={setLogoImage}
      />
      <div className="relative flex-1">
        <div className="mx-auto flex h-auto max-h-[calc(100vh-5rem)] max-w-sm flex-col overflow-y-auto rounded-md">
          <LinkListHeader
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
          />
          <div
            className="flex flex-col gap-6 py-6"
            style={{ backgroundColor: bgColor }}
          >
            <LinkListSocials
              style={socialsStyle}
              color={socialsColor}
              iconColor={socialsIconColor}
              links={socialLinks}
            />
            <LinkListLinks
              links={links}
              buttonColor={buttonColor}
              buttonTextColor={buttonTextColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
