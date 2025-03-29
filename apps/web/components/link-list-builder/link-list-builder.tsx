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
import { useEffect, useState, useRef } from "react";
import LinkListHeader from "./link-list-header";
import LinkListLinks from "./link-list-links";
import LinkListSocials, { socialIcons } from "./link-list-socials";
import LinkListBuilderSidebar from "./sidebar";
import { Skeleton } from "@church-space/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";

export interface Link {
  type: string;
  url: string;
  text: string;
  order: number;
}
export interface SocialLink {
  icon: keyof typeof socialIcons;
  url: string;
  text?: string;
  order: number;
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
  headerBlur: boolean;
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
  const [headerBlur, setHeaderBlur] = useState<boolean>(false);
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

  // Query hook
  const { data: linkList, isLoading } = useQuery({
    queryKey: ["linkList", linkListId],
    queryFn: () => getLinkListQuery(supabase, linkListId),
    enabled: !!linkListId,
  });

  // Parse initial data from database
  const style = linkList?.data?.style as Style | null;
  const primaryButton = linkList?.data?.primary_button as PrimaryButton | null;

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
      headerBlur: headerBlur,
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

  // Update state when data loads
  useEffect(() => {
    if (linkList?.data) {
      // Update links
      const dbLinks =
        linkList.data.link_list_links?.map((link) => ({
          type: link.type || "website",
          url: link.url || "",
          text: link.text || "",
          order: link.order || 0,
        })) || [];
      setLinks(dbLinks.length > 0 ? dbLinks : []);

      // Update social links
      const dbSocialLinks =
        linkList.data.link_list_socials?.map((social) => ({
          icon: (social.icon as keyof typeof socialIcons) || "link",
          url: social.url || "",
          order: social.order || 0,
        })) || [];
      setSocialLinks(dbSocialLinks);

      // Update style-related states with defaults
      if (style) {
        setBgColor(style.backgroundColor || "#ffffff");
        setButtonColor(style.buttonColor || "#000000");
        setButtonTextColor(style.buttonTextColor || "#ffffff");
        setSocialsStyle(style.socialsStyle || "filled");
        setSocialsColor(style.socialsColor || "#f7f7f7");
        setSocialsIconColor(style.socialsIconColor || "#000000");
        setHeaderBgColor(style.headerBgColor || "#f7f7f7");
        setHeaderBlur(style.headerBlur || false);
        setHeaderTextColor(style.headerTextColor || "#000000");
        setHeaderSecondaryTextColor(
          style.headerSecondaryTextColor || "#454545",
        );
      } else {
        // Set default values if no style object exists
        setBgColor("#ffffff");
        setButtonColor("#000000");
        setButtonTextColor("#ffffff");
        setSocialsStyle("filled");
        setSocialsColor("#f7f7f7");
        setSocialsIconColor("#000000");
        setHeaderBgColor("#f7f7f7");
        setHeaderBlur(false);
        setHeaderTextColor("#000000");
        setHeaderSecondaryTextColor("#454545");
      }

      // Update primary button states with defaults
      if (primaryButton) {
        setHeaderButtonText(primaryButton.text || "Plan your visit");
        setHeaderButtonLink(primaryButton.url || "");
        setHeaderButtonColor(primaryButton.color || "#000000");
        setHeaderButtonTextColor(primaryButton.textColor || "#ffffff");
      } else {
        // Set default values if no primary button exists
        setHeaderButtonText("Plan your visit");
        setHeaderButtonLink("");
        setHeaderButtonColor("#000000");
        setHeaderButtonTextColor("#ffffff");
      }

      // Update text and image states
      setHeaderTitle(linkList.data.title || "");
      setHeaderDescription(linkList.data.description || "");
      setHeaderName(linkList.data.name || "");
      setHeaderImage(linkList.data.bg_image || "");
      setLogoImage(linkList.data.logo_asset || "");
    }
  }, [linkList?.data, style, primaryButton]);

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

  const linkDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socialDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSetLinks = (newLinks: Link[]) => {
    // Immediately update UI state for optimistic updates
    setLinks(newLinks);

    // Get existing links from the database
    const existingLinks = linkList?.data?.link_list_links || [];

    // Debounce processing to avoid multiple unnecessary server calls
    if (linkDebounceTimerRef.current) {
      clearTimeout(linkDebounceTimerRef.current);
    }

    linkDebounceTimerRef.current = setTimeout(() => {
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
            order: link.order || 0,
          });
        }
      });

      // If links were removed, delete them from the database
      existingLinks.slice(newLinks.length).forEach((link) => {
        deleteLinkMutation.mutate(Number(link.id));
      });
    }, 1000); // 1 second debounce
  };

  const handleSocialLinksUpdate = (newSocialLinks: SocialLink[]) => {
    // Immediately update UI state for optimistic updates
    setSocialLinks(newSocialLinks);

    // Get existing social links from the database
    const existingSocials = linkList?.data?.link_list_socials || [];

    // Debounce processing to avoid multiple unnecessary server calls
    if (socialDebounceTimerRef.current) {
      clearTimeout(socialDebounceTimerRef.current);
    }

    socialDebounceTimerRef.current = setTimeout(() => {
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
            order: social.order || 0,
          });
        }
      });

      // If socials were removed, delete them from the database
      existingSocials.slice(newSocialLinks.length).forEach((social) => {
        deleteSocialMutation.mutate(Number(social.id));
      });
    }, 1000); // 1 second debounce
  };

  // Early return for no linkListId, but now all hooks are declared above
  if (!linkListId) {
    return <div>No link list ID</div>;
  }

  return (
    <div className="relative flex p-2 pt-0 lg:gap-4 lg:p-4 lg:pt-0">
      <div className="w-full lg:hidden">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-2">
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
                      mode="builder"
                      headerBlur={headerBlur}
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
                        mode="builder"
                      />
                      <LinkListLinks
                        links={links}
                        buttonColor={buttonColor}
                        buttonTextColor={buttonTextColor}
                        mode="builder"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-2">
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
              headerBlur={headerBlur}
              setBgColor={(color) => {
                // Immediately update UI state for responsive feedback
                setBgColor(color);
                // Debounce the server update
                handleStyleUpdate({ ...(style || {}), backgroundColor: color });
              }}
              setButtonColor={(color) => {
                // Immediately update UI state for responsive feedback
                setButtonColor(color);
                // Debounce the server update
                handleStyleUpdate({ ...(style || {}), buttonColor: color });
              }}
              setButtonTextColor={(color) => {
                // Immediately update UI state for responsive feedback
                setButtonTextColor(color);
                // Debounce the server update
                handleStyleUpdate({ ...(style || {}), buttonTextColor: color });
              }}
              setSocialsStyle={(styleValue) => {
                // Immediately update UI state for responsive feedback
                setSocialsStyle(styleValue);
                // Debounce the server update
                handleStyleUpdate({
                  ...(style || {}),
                  socialsStyle: styleValue,
                });
              }}
              setSocialsColor={(color) => {
                // Immediately update UI state for responsive feedback
                setSocialsColor(color);
                // Debounce the server update
                handleStyleUpdate({ ...(style || {}), socialsColor: color });
              }}
              setSocialsIconColor={(color) => {
                // Immediately update UI state for responsive feedback
                setSocialsIconColor(color);
                // Debounce the server update
                handleStyleUpdate({
                  ...(style || {}),
                  socialsIconColor: color,
                });
              }}
              setSocialLinks={handleSocialLinksUpdate}
              setHeaderBgColor={(color) => {
                // Immediately update UI state for responsive feedback
                setHeaderBgColor(color);
                // Debounce the server update
                handleStyleUpdate({ ...(style || {}), headerBgColor: color });
              }}
              setHeaderBlur={(blur) => {
                // Immediately update UI state for responsive feedback
                setHeaderBlur(blur);
                // Debounce the server update
                handleStyleUpdate({ ...(style || {}), headerBlur: blur });
              }}
              setHeaderTextColor={(color) => {
                // Immediately update UI state for responsive feedback
                setHeaderTextColor(color);
                // Debounce the server update
                handleStyleUpdate({ ...(style || {}), headerTextColor: color });
              }}
              setHeaderSecondaryTextColor={(color) => {
                // Immediately update UI state for responsive feedback
                setHeaderSecondaryTextColor(color);
                // Debounce the server update
                handleStyleUpdate({
                  ...(style || {}),
                  headerSecondaryTextColor: color,
                });
              }}
              setHeaderTitle={(title) => {
                // Immediately update UI state for responsive feedback
                setHeaderTitle(title);
                // Debounce the server update
                handleTextUpdate({ title });
              }}
              setHeaderDescription={(description) => {
                // Immediately update UI state for responsive feedback
                setHeaderDescription(description);
                // Debounce the server update
                handleTextUpdate({ description });
              }}
              setHeaderName={(name) => {
                // Immediately update UI state for responsive feedback
                setHeaderName(name);
                // Debounce the server update
                handleTextUpdate({ name });
              }}
              setHeaderButtonText={(text) => {
                // Immediately update UI state for responsive feedback
                setHeaderButtonText(text);
                // Debounce the server update
                handlePrimaryButtonUpdate({ ...(primaryButton || {}), text });
              }}
              setHeaderButtonLink={(url) => {
                // Immediately update UI state for responsive feedback
                setHeaderButtonLink(url);
                // Debounce the server update
                handlePrimaryButtonUpdate({ ...(primaryButton || {}), url });
              }}
              setHeaderButtonColor={(color) => {
                // Immediately update UI state for responsive feedback
                setHeaderButtonColor(color);
                // Debounce the server update
                handlePrimaryButtonUpdate({ ...(primaryButton || {}), color });
              }}
              setHeaderButtonTextColor={(color) => {
                // Immediately update UI state for responsive feedback
                setHeaderButtonTextColor(color);
                // Debounce the server update
                handlePrimaryButtonUpdate({
                  ...(primaryButton || {}),
                  textColor: color,
                });
              }}
              setLinks={handleSetLinks}
              setHeaderImage={(image) => {
                // Immediately update UI state for responsive feedback
                setHeaderImage(image);
                // Debounce the server update
                handleTextUpdate({ bg_image: image });
              }}
              setLogoImage={(image) => {
                // Immediately update UI state for responsive feedback
                setLogoImage(image);
                // Debounce the server update
                handleTextUpdate({ logo_asset: image });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden lg:block">
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
          headerBlur={headerBlur}
          setBgColor={(color) => {
            // Immediately update UI state for responsive feedback
            setBgColor(color);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), backgroundColor: color });
          }}
          setButtonColor={(color) => {
            // Immediately update UI state for responsive feedback
            setButtonColor(color);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), buttonColor: color });
          }}
          setButtonTextColor={(color) => {
            // Immediately update UI state for responsive feedback
            setButtonTextColor(color);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), buttonTextColor: color });
          }}
          setSocialsStyle={(styleValue) => {
            // Immediately update UI state for responsive feedback
            setSocialsStyle(styleValue);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), socialsStyle: styleValue });
          }}
          setSocialsColor={(color) => {
            // Immediately update UI state for responsive feedback
            setSocialsColor(color);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), socialsColor: color });
          }}
          setSocialsIconColor={(color) => {
            // Immediately update UI state for responsive feedback
            setSocialsIconColor(color);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), socialsIconColor: color });
          }}
          setSocialLinks={handleSocialLinksUpdate}
          setHeaderBgColor={(color) => {
            // Immediately update UI state for responsive feedback
            setHeaderBgColor(color);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), headerBgColor: color });
          }}
          setHeaderBlur={(blur) => {
            // Immediately update UI state for responsive feedback
            setHeaderBlur(blur);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), headerBlur: blur });
          }}
          setHeaderTextColor={(color) => {
            // Immediately update UI state for responsive feedback
            setHeaderTextColor(color);
            // Debounce the server update
            handleStyleUpdate({ ...(style || {}), headerTextColor: color });
          }}
          setHeaderSecondaryTextColor={(color) => {
            // Immediately update UI state for responsive feedback
            setHeaderSecondaryTextColor(color);
            // Debounce the server update
            handleStyleUpdate({
              ...(style || {}),
              headerSecondaryTextColor: color,
            });
          }}
          setHeaderTitle={(title) => {
            // Immediately update UI state for responsive feedback
            setHeaderTitle(title);
            // Debounce the server update
            handleTextUpdate({ title });
          }}
          setHeaderDescription={(description) => {
            // Immediately update UI state for responsive feedback
            setHeaderDescription(description);
            // Debounce the server update
            handleTextUpdate({ description });
          }}
          setHeaderName={(name) => {
            // Immediately update UI state for responsive feedback
            setHeaderName(name);
            // Debounce the server update
            handleTextUpdate({ name });
          }}
          setHeaderButtonText={(text) => {
            // Immediately update UI state for responsive feedback
            setHeaderButtonText(text);
            // Debounce the server update
            handlePrimaryButtonUpdate({ ...(primaryButton || {}), text });
          }}
          setHeaderButtonLink={(url) => {
            // Immediately update UI state for responsive feedback
            setHeaderButtonLink(url);
            // Debounce the server update
            handlePrimaryButtonUpdate({ ...(primaryButton || {}), url });
          }}
          setHeaderButtonColor={(color) => {
            // Immediately update UI state for responsive feedback
            setHeaderButtonColor(color);
            // Debounce the server update
            handlePrimaryButtonUpdate({ ...(primaryButton || {}), color });
          }}
          setHeaderButtonTextColor={(color) => {
            // Immediately update UI state for responsive feedback
            setHeaderButtonTextColor(color);
            // Debounce the server update
            handlePrimaryButtonUpdate({
              ...(primaryButton || {}),
              textColor: color,
            });
          }}
          setLinks={handleSetLinks}
          setHeaderImage={(image) => {
            // Immediately update UI state for responsive feedback
            setHeaderImage(image);
            // Debounce the server update
            handleTextUpdate({ bg_image: image });
          }}
          setLogoImage={(image) => {
            // Immediately update UI state for responsive feedback
            setLogoImage(image);
            // Debounce the server update
            handleTextUpdate({ logo_asset: image });
          }}
        />
      </div>
      <div className="relative hidden flex-1 lg:block">
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
                mode="builder"
                headerBlur={headerBlur}
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
                  mode="builder"
                />
                <LinkListLinks
                  links={links}
                  buttonColor={buttonColor}
                  buttonTextColor={buttonTextColor}
                  mode="builder"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
