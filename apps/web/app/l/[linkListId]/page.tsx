import React from "react";
import LinkListHeader from "@/components/link-list-builder/link-list-header";
import LinkListSocials, {
  SocialLink,
} from "@/components/link-list-builder/link-list-socials";
import LinkListLinks, {
  LinkListLink,
} from "@/components/link-list-builder/link-list-links";

export default function LinkListPage() {
  const headerBgColor = "#000000";
  const headerTextColor = "#ffffff";
  const headerSecondaryTextColor = "#ffffff";
  const headerTitle = "Link List";
  const headerDescription = "Link List Description";
  const headerName = "Link List Name";
  const headerButtonText = "Link List Button Text";
  const headerButtonLink = "/";
  const headerButtonColor = "#000000";
  const headerButtonTextColor = "#ffffff";
  const headerImage = "/images/link-list-header.png";
  const logoImage = "/images/link-list-logo.png";
  const bgColor = "#000000";
  const socialsStyle = "horizontal";
  const socialsColor = "#000000";
  const socialsIconColor = "#ffffff";
  const links = [
    {
      text: "Link 1",
      url: "/link1",
      type: "facebook",
    },
    {
      text: "Link 2",
      url: "/link2",
      type: "twitter",
    },
    {
      text: "Link 3",
      url: "/link3",
      type: "instagram",
    },
  ];
  const buttonColor = "#ffffff";
  const buttonTextColor = "#000000";
  const socialLinks = [
    {
      text: "Social 1",
      url: "/social1",
      icon: "facebook",
    },
    {
      text: "Social 2",
      url: "/social2",
      icon: "twitter",
    },
  ];

  return (
    <div style={{ backgroundColor: bgColor }} className="min-h-screen w-full">
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
