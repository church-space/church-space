import React from "react";
import LinkListHeader from "@/components/link-list-builder/link-list-header";
import LinkListSocials, {
  SocialLink,
} from "@/components/link-list-builder/link-list-socials";
import LinkListLinks, {
  LinkListLink,
} from "@/components/link-list-builder/link-list-links";
import { getLinkListBySlugQuery } from "@church-space/supabase/queries/all/get-link-list";
import { createClient } from "@church-space/supabase/server";

export default async function LinkListPage({
  params,
}: {
  params: Promise<{ linkListSlug: string }>;
}) {
  const { linkListSlug } = await params;
  const supabase = await createClient();
  const { data: linkList, error } = await getLinkListBySlugQuery(
    supabase,
    linkListSlug,
  );
  if (error) throw error;
  const headerBgColor = linkList?.style?.headerBgColor;
  const headerTextColor = linkList?.style?.headerTextColor;
  const headerSecondaryTextColor = linkList?.style?.headerSecondaryTextColor;
  const headerTitle = linkList?.title;
  const headerDescription = linkList?.description;
  const headerName = linkList?.name;
  const headerButtonText = linkList?.primary_button?.text;
  const headerButtonLink = linkList?.primary_button?.link;
  const headerButtonColor = linkList?.primary_button?.color;
  const headerButtonTextColor = linkList?.primary_button?.textColor;
  const headerImage = linkList?.bg_image;
  const logoImage = linkList?.logo_asset;
  const bgColor = linkList?.style?.backgroundColor;
  const socialsStyle = linkList?.style?.socialsStyle;
  const socialsColor = linkList?.style?.socialsColor;
  const socialsIconColor = linkList?.style?.socialsIconColor;
  const headerBlur = linkList?.style?.headerBlur;
  const links = linkList?.link_list_links;
  const socialLinks = linkList?.link_list_socials;
  const buttonColor = linkList?.style?.buttonColor;
  const buttonTextColor = linkList?.style?.buttonTextColor;

  if (!linkList?.is_public) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Link List Not Found</h1>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: bgColor }} className="min-h-screen w-full">
      <div className="mx-auto flex flex-col rounded-md">
        <LinkListHeader
          headerBgColor={headerBgColor}
          headerTextColor={headerTextColor}
          headerSecondaryTextColor={headerSecondaryTextColor}
          headerTitle={headerTitle ?? ""}
          headerDescription={headerDescription ?? ""}
          headerName={headerName ?? ""}
          headerButtonText={headerButtonText ?? ""}
          headerButtonLink={headerButtonLink ?? ""}
          headerButtonColor={headerButtonColor ?? ""}
          headerButtonTextColor={headerButtonTextColor ?? ""}
          headerImage={headerImage ?? ""}
          logoImage={logoImage ?? ""}
          mode="live"
          headerBlur={headerBlur}
        />
        <div
          className="flex flex-col gap-6 py-6"
          style={{ backgroundColor: bgColor }}
        >
          <LinkListSocials
            style={socialsStyle as "outline" | "filled" | "icon-only"}
            color={socialsColor}
            iconColor={socialsIconColor}
            links={socialLinks as SocialLink[]}
            mode="live"
          />
          <LinkListLinks
            links={links as LinkListLink[]}
            buttonColor={buttonColor}
            buttonTextColor={buttonTextColor}
            mode="live"
          />
        </div>
      </div>
    </div>
  );
}
