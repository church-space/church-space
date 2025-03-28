"use client";

import React, { useState } from "react";
import LinkListBuilderSidebar from "./sidebar";
import LinkListHeader from "./link-list-header";
import LinkListSocials from "./link-list-socials";
import LinkListLinks from "./link-list-links";
import { socialIcons } from "./link-list-socials";
import { getLinkListQuery } from "@church-space/supabase/queries/all/get-link-list";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
import { useDebounce, useDebounceCallback } from "@/hooks/use-debounce";
import { z } from "zod";

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

interface Style {
  backgroundColor: string;
  buttonColor: string;
  buttonTextColor: string;
  socialsStyle: "outline" | "filled" | "icon-only";
  socialsColor: string;
  socialsIconColor: string;
  headerBgColor: string;
  headerTextColor: string;
  headerSecondaryTextColor: string;
}

interface PrimaryButton {
  text: string;
  url: string;
  color: string;
  textColor: string;
}

export default function LinkListBuilder() {
  const params = useParams();
  const linkListId = params.linkListId as unknown as number;
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!linkListId) {
    return <div>No link list ID</div>;
  }

  const { data: linkList, isLoading } = useQuery({
    queryKey: ["linkList", linkListId],
    queryFn: () => getLinkListQuery(supabase, linkListId),
  });

  // Parse initial data from database
  const style = linkList?.data?.style as Style | null;

  const primaryButton = linkList?.data?.primary_button as PrimaryButton | null;

  // State management with database integration
  const [links, setLinks] = useState<Link[]>(
    linkList?.data?.link_list_links?.map((link) => ({
      icon: link.type || "link",
      url: link.url || "",
      text: link.text || "",
    })) || [{ icon: "link", url: "https://www.google.com", text: "Google" }],
  );

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    linkList?.data?.link_list_socials?.map((social) => ({
      icon: (social.icon as keyof typeof socialIcons) || "link",
      url: social.url || "",
    })) || [],
  );

  const [bgColor, setBgColor] = useState<string>(
    style?.backgroundColor || "#f5f500",
  );
  const [buttonColor, setButtonColor] = useState<string>(
    style?.buttonColor || "#ffffff",
  );
  const [buttonTextColor, setButtonTextColor] = useState<string>(
    style?.buttonTextColor || "#000000",
  );
  const [socialsStyle, setSocialsStyle] = useState<
    "outline" | "filled" | "icon-only"
  >(style?.socialsStyle || "filled");
  const [socialsColor, setSocialsColor] = useState<string>(
    style?.socialsColor || "",
  );
  const [socialsIconColor, setSocialsIconColor] = useState<string>(
    style?.socialsIconColor || "",
  );
  const [headerBgColor, setHeaderBgColor] = useState<string>(
    style?.headerBgColor || "",
  );
  const [headerTextColor, setHeaderTextColor] = useState<string>(
    style?.headerTextColor || "",
  );
  const [headerSecondaryTextColor, setHeaderSecondaryTextColor] =
    useState<string>(style?.headerSecondaryTextColor || "");
  const [headerTitle, setHeaderTitle] = useState<string>(
    linkList?.data?.title || "",
  );
  const [headerDescription, setHeaderDescription] = useState<string>(
    linkList?.data?.description || "",
  );
  const [headerName, setHeaderName] = useState<string>(
    linkList?.data?.name || "",
  );
  const [headerButtonText, setHeaderButtonText] = useState<string>(
    primaryButton?.text || "",
  );
  const [headerButtonLink, setHeaderButtonLink] = useState<string>(
    primaryButton?.url || "",
  );
  const [headerButtonColor, setHeaderButtonColor] = useState<string>(
    primaryButton?.color || "",
  );
  const [headerButtonTextColor, setHeaderButtonTextColor] = useState<string>(
    primaryButton?.textColor || "",
  );
  const [headerImage, setHeaderImage] = useState<string>(
    linkList?.data?.bg_image || "",
  );
  const [logoImage, setLogoImage] = useState<string>(
    linkList?.data?.logo_asset || "",
  );

  // URL validation schema
  const urlSchema = z.string().superRefine((url, ctx) => {
    if (url === "") return;
    if (url.trim() !== url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL cannot contain spaces",
      });
      return;
    }
    const urlPattern =
      /^(https?:\/\/)?[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(\/.*)?$/;
    if (!urlPattern.test(url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Please enter a valid URL with a domain and top-level domain (e.g., example.com)",
      });
    }
  });

  // Email validation schema
  const emailSchema = z.string().superRefine((email, ctx) => {
    if (email === "") return;
    if (email.trim() !== email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email cannot contain spaces",
      });
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address",
      });
    }
  });

  // Mutations
  const updateLinkListMutation = useMutation({
    mutationFn: async (data: {
      style?: any;
      primary_button?: any;
      title?: string;
      description?: string;
      name?: string;
      bg_image?: string;
      logo_asset?: string;
    }) => {
      const { data: result, error } = await updateLinkList(
        supabase,
        data,
        linkListId,
      );
      if (error) throw error;
      return result;
    },
    onError: (error) => {
      if (error instanceof Error && error.message !== "No rows found") {
        toast({
          title: "Error",
          description: "Failed to update link list. Please try again.",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ link, id }: { link: Link; id: number }) => {
      const { data: result, error } = await updateLinkListLink(
        supabase,
        {
          text: link.text,
          url: link.url,
          type: link.icon,
        },
        id,
      );
      if (error) throw error;
      return result;
    },
    onError: (error) => {
      if (error instanceof Error && error.message !== "No rows found") {
        toast({
          title: "Error",
          description: "Failed to update link. Please try again.",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (link: Link) => {
      const { data: result, error } = await createLinkListLink(
        supabase,
        {
          link_list_id: linkListId,
          text: link.text,
          url: link.url,
          type: link.icon,
        },
        linkListId,
      );
      if (error) throw error;
      return result;
    },
    onError: (error) => {
      if (error instanceof Error && error.message !== "No rows found") {
        toast({
          title: "Error",
          description: "Failed to create link. Please try again.",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data: result, error } = await deleteLinkListLink(supabase, id);
      if (error) throw error;
      return result;
    },
    onError: (error) => {
      if (error instanceof Error && error.message !== "No rows found") {
        toast({
          title: "Error",
          description: "Failed to delete link. Please try again.",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
  });

  // Debounced update functions
  const debouncedUpdateStyle = useDebounceCallback((style: any) => {
    updateLinkListMutation.mutate({ style });
  }, 1000);

  const debouncedUpdatePrimaryButton = useDebounceCallback(
    (primary_button: any) => {
      updateLinkListMutation.mutate({ primary_button });
    },
    1000,
  );

  const debouncedUpdateText = useDebounceCallback((updates: any) => {
    updateLinkListMutation.mutate(updates);
  }, 1000);

  // Update handlers
  const handleStyleUpdate = (newStyle: any) => {
    debouncedUpdateStyle(newStyle);
  };

  const handlePrimaryButtonUpdate = (newButton: any) => {
    debouncedUpdatePrimaryButton(newButton);
  };

  const handleTextUpdate = (updates: any) => {
    debouncedUpdateText(updates);
  };

  const handleLinkUpdate = (index: number, link: Link) => {
    const existingLink = linkList?.data?.link_list_links?.[index];
    if (existingLink) {
      updateLinkMutation.mutate({ link, id: Number(existingLink.id) });
    } else {
      createLinkMutation.mutate(link);
    }
  };

  const handleLinkDelete = (index: number) => {
    const existingLink = linkList?.data?.link_list_links?.[index];
    if (existingLink) {
      deleteLinkMutation.mutate(Number(existingLink.id));
    }
  };

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
        setBgColor={(color) => {
          setBgColor(color);
          handleStyleUpdate({ ...(style || {}), backgroundColor: color });
        }}
        setButtonColor={(color) => {
          setButtonColor(color);
          handleStyleUpdate({ ...(style || {}), buttonColor: color });
        }}
        setButtonTextColor={(color) => {
          setButtonTextColor(color);
          handleStyleUpdate({ ...(style || {}), buttonTextColor: color });
        }}
        setSocialsStyle={(styleValue) => {
          setSocialsStyle(styleValue);
          handleStyleUpdate({ ...(style || {}), socialsStyle: styleValue });
        }}
        setSocialsColor={(color) => {
          setSocialsColor(color);
          handleStyleUpdate({ ...(style || {}), socialsColor: color });
        }}
        setSocialsIconColor={(color) => {
          setSocialsIconColor(color);
          handleStyleUpdate({ ...(style || {}), socialsIconColor: color });
        }}
        setSocialLinks={setSocialLinks}
        setHeaderBgColor={(color) => {
          setHeaderBgColor(color);
          handleStyleUpdate({ ...(style || {}), headerBgColor: color });
        }}
        setHeaderTextColor={(color) => {
          setHeaderTextColor(color);
          handleStyleUpdate({ ...(style || {}), headerTextColor: color });
        }}
        setHeaderSecondaryTextColor={(color) => {
          setHeaderSecondaryTextColor(color);
          handleStyleUpdate({
            ...(style || {}),
            headerSecondaryTextColor: color,
          });
        }}
        setHeaderTitle={(title) => {
          setHeaderTitle(title);
          handleTextUpdate({ title });
        }}
        setHeaderDescription={(description) => {
          setHeaderDescription(description);
          handleTextUpdate({ description });
        }}
        setHeaderName={(name) => {
          setHeaderName(name);
          handleTextUpdate({ name });
        }}
        setHeaderButtonText={(text) => {
          setHeaderButtonText(text);
          handlePrimaryButtonUpdate({ ...(primaryButton || {}), text });
        }}
        setHeaderButtonLink={(url) => {
          setHeaderButtonLink(url);
          handlePrimaryButtonUpdate({ ...(primaryButton || {}), url });
        }}
        setHeaderButtonColor={(color) => {
          setHeaderButtonColor(color);
          handlePrimaryButtonUpdate({ ...(primaryButton || {}), color });
        }}
        setHeaderButtonTextColor={(color) => {
          setHeaderButtonTextColor(color);
          handlePrimaryButtonUpdate({
            ...(primaryButton || {}),
            textColor: color,
          });
        }}
        setLinks={(newLinks) => {
          setLinks(newLinks);
          // Update each link
          newLinks.forEach((link, index) => {
            handleLinkUpdate(index, link);
          });
        }}
        setHeaderImage={(image) => {
          setHeaderImage(image);
          handleTextUpdate({ bg_image: image });
        }}
        setLogoImage={(image) => {
          setLogoImage(image);
          handleTextUpdate({ logo_asset: image });
        }}
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
