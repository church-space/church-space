"use client";

import { useDebounceCallback } from "@/hooks/use-debounce";
import { createClient } from "@church-space/supabase/client";
import {
  createLinkListLink,
  deleteLinkListLink,
  updateLinkList,
  updateLinkListLink,
  updateLinkListSocial,
  createLinkListSocial,
  deleteLinkListSocial,
} from "@church-space/supabase/mutations/link-lists";
import { getLinkListQuery } from "@church-space/supabase/queries/all/get-link-list";
import { useToast } from "@church-space/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import LinkListHeader from "./link-list-header";
import LinkListLinks from "./link-list-links";
import LinkListSocials, { socialIcons } from "./link-list-socials";
import LinkListBuilderSidebar from "./sidebar";
import { Skeleton } from "@church-space/ui/skeleton";

export interface Link {
  type: string;
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
  const [links, setLinks] = useState<Link[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [bgColor, setBgColor] = useState<string>("#f5f500");
  const [buttonColor, setButtonColor] = useState<string>("#ffffff");
  const [buttonTextColor, setButtonTextColor] = useState<string>("#000000");
  const [socialsStyle, setSocialsStyle] = useState<
    "outline" | "filled" | "icon-only"
  >("filled");
  const [socialsColor, setSocialsColor] = useState<string>("");
  const [socialsIconColor, setSocialsIconColor] = useState<string>("");
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

  // Update state when data loads
  useEffect(() => {
    if (linkList?.data) {
      // Update links
      const dbLinks =
        linkList.data.link_list_links?.map((link) => ({
          type: link.type || "website",
          url: link.url || "",
          text: link.text || "",
        })) || [];
      setLinks(dbLinks.length > 0 ? dbLinks : []);

      // Update social links
      const dbSocialLinks =
        linkList.data.link_list_socials?.map((social) => ({
          icon: (social.icon as keyof typeof socialIcons) || "link",
          url: social.url || "",
        })) || [];
      setSocialLinks(dbSocialLinks);

      // Update style-related states
      if (style) {
        setBgColor(style.backgroundColor || "#f5f500");
        setButtonColor(style.buttonColor || "#ffffff");
        setButtonTextColor(style.buttonTextColor || "#000000");
        setSocialsStyle(style.socialsStyle || "filled");
        setSocialsColor(style.socialsColor || "");
        setSocialsIconColor(style.socialsIconColor || "");
        setHeaderBgColor(style.headerBgColor || "");
        setHeaderTextColor(style.headerTextColor || "");
        setHeaderSecondaryTextColor(style.headerSecondaryTextColor || "");
      }

      // Update primary button states
      if (primaryButton) {
        setHeaderButtonText(primaryButton.text || "");
        setHeaderButtonLink(primaryButton.url || "");
        setHeaderButtonColor(primaryButton.color || "");
        setHeaderButtonTextColor(primaryButton.textColor || "");
      }

      // Update text and image states
      setHeaderTitle(linkList.data.title || "");
      setHeaderDescription(linkList.data.description || "");
      setHeaderName(linkList.data.name || "");
      setHeaderImage(linkList.data.bg_image || "");
      setLogoImage(linkList.data.logo_asset || "");
    }
  }, [linkList?.data, style, primaryButton]);

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
          type: link.type,
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
          type: link.type,
        },
        linkListId,
      );
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
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

  // Social link mutations
  const updateSocialMutation = useMutation({
    mutationFn: async ({ social, id }: { social: SocialLink; id: number }) => {
      const { data: result, error } = await updateLinkListSocial(
        supabase,
        {
          icon: social.icon,
          url: social.url,
        },
        id,
      );
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
    onError: (error) => {
      if (error instanceof Error && error.message !== "No rows found") {
        toast({
          title: "Error",
          description: "Failed to update social link. Please try again.",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
  });

  const createSocialMutation = useMutation({
    mutationFn: async (social: SocialLink) => {
      const { data: result, error } = await createLinkListSocial(
        supabase,
        {
          link_list: linkListId,
          icon: social.icon,
          url: social.url,
        },
        linkListId,
      );
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
    onError: (error) => {
      if (error instanceof Error && error.message !== "No rows found") {
        toast({
          title: "Error",
          description: "Failed to create social link. Please try again.",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
  });

  const deleteSocialMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data: result, error } = await deleteLinkListSocial(supabase, id);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
    onError: (error) => {
      if (error instanceof Error && error.message !== "No rows found") {
        toast({
          title: "Error",
          description: "Failed to delete social link. Please try again.",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["linkList", linkListId] });
    },
  });

  // Debounced update functions
  const debouncedUpdateStyle = useDebounceCallback((style: any) => {
    if (!style) return;

    // Ensure we're saving the complete style object with all style properties
    const updatedStyle = {
      backgroundColor: bgColor,
      buttonColor: buttonColor,
      buttonTextColor: buttonTextColor,
      socialsStyle: socialsStyle,
      socialsColor: socialsColor,
      socialsIconColor: socialsIconColor,
      headerBgColor: headerBgColor,
      headerTextColor: headerTextColor,
      headerSecondaryTextColor: headerSecondaryTextColor,
      ...style,
    };

    updateLinkListMutation.mutate({ style: updatedStyle });
  }, 1000);

  const debouncedUpdatePrimaryButton = useDebounceCallback(
    (primary_button: any) => {
      if (!primary_button) return;
      updateLinkListMutation.mutate({ primary_button });
    },
    1000,
  );

  const debouncedUpdateText = useDebounceCallback((updates: any) => {
    if (!updates) return;
    updateLinkListMutation.mutate(updates);
  }, 1000);

  // Update handlers
  const handleStyleUpdate = (newStyle: any) => {
    if (!newStyle) return;
    // We just need to pass the specific updates to debouncedUpdateStyle
    // It will now combine them with the complete style object
    debouncedUpdateStyle(newStyle);
  };

  const handlePrimaryButtonUpdate = (newButton: any) => {
    if (!newButton) return;
    debouncedUpdatePrimaryButton(newButton);
  };

  const handleTextUpdate = (updates: any) => {
    if (!updates) return;
    debouncedUpdateText(updates);
  };

  const handleSetLinks = (newLinks: Link[]) => {
    // Immediately update UI state for optimistic updates
    setLinks(newLinks);

    // Get existing links from the database
    const existingLinks = linkList?.data?.link_list_links || [];

    // For each new link in the updated list
    newLinks.forEach((link, index) => {
      const existingLink = existingLinks[index];

      // If there's an existing link at this position
      if (existingLink) {
        // Update it if it changed
        if (
          existingLink.type !== link.type ||
          existingLink.url !== link.url ||
          existingLink.text !== link.text
        ) {
          updateLinkMutation.mutate({
            link,
            id: Number(existingLink.id),
          });
        }
      }
      // If this is a new link, create it in the database
      else {
        // Create new link even with empty values to maintain structure
        createLinkMutation.mutate({
          type: link.type,
          url: link.url || "",
          text: link.text || "",
        });
      }
    });

    // If links were removed, delete them from the database
    existingLinks.slice(newLinks.length).forEach((link) => {
      deleteLinkMutation.mutate(Number(link.id));
    });
  };

  const handleSocialLinksUpdate = (newSocialLinks: SocialLink[]) => {
    // Immediately update UI state for optimistic updates
    setSocialLinks(newSocialLinks);

    // Get existing social links from the database
    const existingSocials = linkList?.data?.link_list_socials || [];

    // For each new social in the updated list
    newSocialLinks.forEach((social, index) => {
      const existingSocial = existingSocials[index];

      // If there's an existing social at this position
      if (existingSocial) {
        // Update it if it changed
        if (
          existingSocial.icon !== social.icon ||
          existingSocial.url !== social.url
        ) {
          updateSocialMutation.mutate({
            social,
            id: Number(existingSocial.id),
          });
        }
      }
      // If this is a new social, create it in the database
      else {
        // Create new social even with empty values to maintain structure
        createSocialMutation.mutate({
          icon: social.icon,
          url: social.url || "",
        });
      }
    });

    // If socials were removed, delete them from the database
    existingSocials.slice(newSocialLinks.length).forEach((social) => {
      deleteSocialMutation.mutate(Number(social.id));
    });
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
        setSocialLinks={handleSocialLinksUpdate}
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
        setLinks={handleSetLinks}
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
        <div className="mx-auto flex h-auto max-h-[calc(100vh-5rem)] max-w-sm flex-col overflow-y-auto rounded-md border shadow-md">
          {isLoading && (
            <Skeleton className="h-[calc(100vh-20rem)] w-full bg-muted" />
          )}
          {!isLoading && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
