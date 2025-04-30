import { Section, TextBlockData, ButtonBlockData } from "@/types/blocks";
import {
  Container,
  Section as EmailSection,
  Head,
  Hr,
  Html,
  Img,
  Body,
} from "@react-email/components";
import * as React from "react";

const IconColors = {
  black: "#000000",
  white: "#ffffff",
  lightGray: "#c4c4c4",
  darkGray: "#404040",
};

// Helper function to ensure proper font fallbacks for email clients
function ensureFontFallbacks(font: string | undefined): string {
  if (!font) return "sans-serif";

  // Font is already properly formatted with fallbacks
  if (font.includes(",")) return font;

  // Add appropriate fallbacks based on font family
  switch (font) {
    case "sans-serif":
      return "Arial, 'Helvetica Neue', Helvetica, sans-serif";
    case "serif":
      return "'Times New Roman', Times, Georgia, serif";
    case "Arial, sans-serif":
      return "Arial, 'Helvetica Neue', Helvetica, sans-serif";
    case "Georgia, serif":
      return "Georgia, 'Times New Roman', Times, serif";
    case "Verdana, sans-serif":
      return "Verdana, Geneva, Tahoma, sans-serif";
    case "'Courier New', monospace":
      return "'Courier New', Courier, monospace";
    case "Helvetica, Arial, sans-serif":
      return "Helvetica, Arial, 'Helvetica Neue', sans-serif";
    case "'Lucida Sans Unicode', 'Lucida Grande', sans-serif":
      return "'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif";
    case "Tahoma, Geneva, sans-serif":
      return "Tahoma, Geneva, Verdana, sans-serif";
    case "'Times New Roman', Times, serif":
      return "'Times New Roman', Times, Georgia, serif";
    case "'Trebuchet MS', Helvetica, sans-serif":
      return "'Trebuchet MS', Helvetica, Arial, sans-serif";
    default:
      return `${font}, sans-serif`;
  }
}

// Define social icon keys mapping
const SocialIconKeys = {
  x: "x",
  twitter: "x", // Map twitter to x for backwards compatibility
} as const;

const IconImages = {
  black: {
    instagram:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/instagram.png",
    tiktok:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/tik-tok.png",
    x: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/x-twitter.png",
    mail: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/envelope.png",
    link: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/link.png",
    facebook:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/facebook.png",
    linkedin:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/linkedin.png",
    bluesky:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/bluesky.png",
    youtube:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/youtube.png",
    threads:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/threads.png",
    vimeo:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/vimeo.png",
    spotify:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/spotify.png",
    podcast:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/black/podcast.png",
  },
  white: {
    instagram:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/instagram.png",
    tiktok:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/tik-tok.png",
    x: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/x-twitter.png",
    mail: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/envelope.png",
    link: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/link.png",
    facebook:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/facebook.png",
    linkedin:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/linkedin.png",
    bluesky:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/bluesky.png",
    youtube:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/youtube.png",
    threads:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/threads.png",
    vimeo:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/vimeo.png",
    spotify:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/spotify.png",
    podcast:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/white/podcast.png",
  },
  lightGray: {
    instagram:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/instagram.png",
    tiktok:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/tik-tok.png",
    x: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/x-twitter.png",
    mail: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/envelope.png",
    link: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/link.png",
    facebook:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/facebook.png",
    linkedin:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/linkedin.png",
    bluesky:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/bluesky.png",
    youtube:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/youtube.png",
    threads:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/threads.png",
    vimeo:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/vimeo.png",
    spotify:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/spotify.png",
    podcast:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/light-gray/podcast.png",
  },
  darkGray: {
    instagram:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/instagram.png",
    tiktok:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/tik-tok.png",
    x: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/x-twitter.png",
    mail: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/envelope.png",
    link: "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/link.png",
    facebook:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/facebook.png",
    linkedin:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/linkedin.png",
    bluesky:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/bluesky.png",
    youtube:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/youtube.png",
    threads:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/threads.png",
    vimeo:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/vimeo.png",
    spotify:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/spotify.png",
    podcast:
      "https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets/snv-png/dark-gray/podcast.png",
  },
};

interface EmailStyle {
  bgColor?: string;
  isInset?: boolean;
  cornerRadius?: number;
  emailBgColor?: string;
  defaultTextColor?: string;
  accentTextColor?: string;
  defaultFont?: string;
  linkColor?: string;
  blockSpacing?: number;
}

// Custom components for email blocks
const CustomText: React.FC<{
  content: string;
  font?: string;
  accentTextColor?: string;
  defaultFont?: string;
  defaultTextColor?: string;
  linkColor?: string;
}> = ({
  content,
  font,
  accentTextColor,
  defaultFont,
  defaultTextColor,
  linkColor,
}) => {
  // Parse HTML content and convert to React Email components
  const sanitizedContent = content
    .replace(/class="[^"]*"/g, "")
    // Add more space above h1 and h2, reduce space below all headings, and set font weights and sizes
    .replace(/<h1(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        " font-weight: 600; font-size: 2rem; line-height: 1.2; margin-block-start: 0.3em; margin-block-end: 0.3em";
      if (existingStyle) {
        return `<h1 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h1 style="${baseStyle}"`;
    })
    .replace(/<h2(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        " font-weight: 600; font-size: 1.5rem; line-height: 1.3; margin-block-start: 0.3em; margin-block-end: 0.3em";
      if (existingStyle) {
        return `<h2 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h2 style="${baseStyle}"`;
    })
    .replace(/<h3(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "font-weight: 600; font-size: 1.25rem; line-height: 1.3; margin-block-start:0.3em; margin-block-end: 0.3em";
      if (existingStyle) {
        return `<h3 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h3 style="${baseStyle}"`;
    })
    .replace(/<h4(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        " font-weight: 600; font-size: 4rem; line-height: 1.2; margin-block-start: 0.3em; margin-block-end: 0.3em"; // Default to 4rem
      if (existingStyle) {
        return `<h4 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h4 style="${baseStyle}"`;
    })
    // Add light weight and line height to paragraphs, preserving any existing style attributes
    .replace(/<p(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "font-weight: 400; line-height: 1.5; margin: 0em 0 0.2em 0";
      if (existingStyle) {
        return `<p style="${existingStyle}; ${baseStyle}"`;
      }
      return `<p style="${baseStyle}"`;
    })
    // Style links with the specified linkColor
    .replace(/<a(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle = `color: ${linkColor || "#0000ff"}; text-decoration: underline; font-size: 16px`;
      if (existingStyle) {
        return `<a style="${existingStyle}; ${baseStyle}"`;
      }
      return `<a style="${baseStyle}"`;
    })
    // Add list styles
    .replace(/<ul(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "list-style-type: disc; padding-left: 24px; margin: 0.5em 0";
      if (existingStyle) {
        return `<ul style="${existingStyle}; ${baseStyle}"`;
      }
      return `<ul style="${baseStyle}"`;
    })
    .replace(/<ol(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "list-style-type: decimal; padding-left: 24px; margin: 0.5em 0";
      if (existingStyle) {
        return `<ol style="${existingStyle}; ${baseStyle}"`;
      }
      return `<ol style="${baseStyle}"`;
    })
    // Add font size to list items
    .replace(/<li(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "font-size: 16px; margin-bottom: 0.5em; line-height: 1.5";
      if (existingStyle) {
        return `<li style="${existingStyle}; ${baseStyle}"`;
      }
      return `<li style="${baseStyle}"`;
    })
    // Handle empty paragraphs for line breaks
    .replace(
      /<p style="[^"]*"><\/p>/g,
      '<p style="display: block; padding-bottom: 0.8em" />',
    )
    // Replace color styles in spans with data-color-type="accent"
    .replace(
      /<span(?: style="([^"]*)")?(?: data-color-type="accent"| class="accent-text-color")[^>]*>/g,
      (match, existingStyle) => {
        // Keep existing styles except color
        const cleanStyle = existingStyle
          ? existingStyle
              .replace(/color:\s*(?:rgb\([^)]+\)|#[a-fA-F0-9]{3,6})/g, "")
              .trim()
          : "";
        const combinedStyle = cleanStyle
          ? `${cleanStyle}; color: ${accentTextColor}`
          : `color: ${accentTextColor}`;
        return `<span style="${combinedStyle}" data-color-type="accent">`;
      },
    );

  // Ensure all elements with text-align: center also have align attribute
  // This improves compatibility with email clients
  const alignedContent = sanitizedContent
    .replace(
      /<(h[1-6]|p|div)([^>]*style="[^"]*text-align:\s*center[^"]*")([^>]*)>/gi,
      '<$1$2$3 align="center">',
    )
    .replace(
      /<(h[1-6]|p|div)([^>]*style="[^"]*text-align:\s*left[^"]*")([^>]*)>/gi,
      '<$1$2$3 align="left">',
    )
    .replace(
      /<(h[1-6]|p|div)([^>]*style="[^"]*text-align:\s*right[^"]*")([^>]*)>/gi,
      '<$1$2$3 align="right">',
    );

  // Now add a style tag to handle the first-child rule similar to the CSS
  const processedContent = `
    <style>
      /* Add email client support for text alignment */
      [style*="text-align: center"] {
        text-align: center !important;
      }
      [style*="text-align: left"] {
        text-align: left !important;
      }
      [style*="text-align: right"] {
        text-align: right !important;
      }
    </style>
    ${alignedContent}
  `;

  return (
    <table cellPadding="0" cellSpacing="0" border={0} width="100%">
      <tr>
        <td
          style={{
            fontFamily: ensureFontFallbacks(font || defaultFont),
            color: defaultTextColor || "#000000",
            fontSize: "16px",
          }}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </tr>
    </table>
  );
};

// Helper function to format URLs with proper protocol
function formatUrl(url: string, type: "mail" | "link" = "link"): string {
  if (!url || url.length === 0) return "#";

  if (type === "mail") {
    return !url.startsWith("mailto:") ? `mailto:${url}` : url;
  }

  return !url.startsWith("http://") && !url.startsWith("https://")
    ? `https://${url}`
    : url;
}

const CustomButton: React.FC<{
  text: string;
  link: string;
  color: string;
  textColor: string;
  style: "outline" | "filled";
  size: "fit" | "full" | "medium" | "large";
  cornerRadius?: number;
  defaultFont?: string;
  centered?: boolean;
}> = ({
  text,
  link,
  color,
  textColor,
  style: buttonStyle,
  size,
  cornerRadius,
  defaultFont,
  centered = true,
}) => {
  const buttonWidth = size === "full" ? "100%" : "auto";
  const borderRadius = cornerRadius ? `${cornerRadius * 0.3}px` : "0";

  // Format the URL with proper prefix if it's not a mailto link
  const formattedLink = link && link.length > 0 ? formatUrl(link) : "#";

  return text && text.length > 0 ? (
    <table
      style={{
        width: "100%",
        textAlign: centered ? "center" : "left",
        margin: "2px 0",
      }}
      cellPadding="0"
      cellSpacing="0"
      border={0}
    >
      <tr>
        <td align={centered ? "center" : "left"} style={{ width: "100%" }}>
          {link && link.length > 0 ? (
            <a
              href={formattedLink}
              target="_blank"
              style={{
                backgroundColor:
                  buttonStyle === "filled" ? color : "transparent",
                border: `2px solid ${color}`,
                borderRadius,
                color: buttonStyle === "filled" ? textColor : color,
                display: "inline-block",
                fontFamily: ensureFontFallbacks(defaultFont),
                fontSize: "14px",
                fontWeight: "normal",
                lineHeight: "1",
                padding:
                  size === "medium"
                    ? "9px 60px"
                    : size === "large"
                      ? "12px 80px"
                      : "9px 15px",
                textDecoration: "none",
                textAlign: "center",
                width: buttonWidth,
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              {text && text.length > 0 ? text : ""}
            </a>
          ) : (
            <p
              style={{
                backgroundColor:
                  buttonStyle === "filled" ? color : "transparent",
                border: `2px solid ${color}`,
                borderRadius,
                color: buttonStyle === "filled" ? textColor : color,
                display: "inline-block",
                fontFamily: ensureFontFallbacks(defaultFont),
                fontSize: "14px",
                fontWeight: "600",
                lineHeight: "1",
                padding:
                  size === "medium"
                    ? "9px 60px"
                    : size === "large"
                      ? "15px 32px"
                      : "9px 15px",
                textDecoration: "none",
                textAlign: "center",
                width: buttonWidth,
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              {text}
            </p>
          )}
        </td>
      </tr>
    </table>
  ) : null;
};

const CustomDivider: React.FC<{
  color: string;
  margin: number;
  thickness: number;
}> = ({ color, margin, thickness }) => {
  const updatedThickness = thickness === undefined ? 1 : thickness;

  return (
    <Hr
      style={{
        borderTop: `${updatedThickness}px solid ${color}`,
        marginTop: `${margin + 10}px`,
        marginBottom: `${margin + 10}px`,
        width: "100%",
      }}
    />
  );
};

const CustomImage: React.FC<{
  image: string;
  size: number;
  link: string;
  centered: boolean;
  cornerRadius?: number;
  altText?: string;
}> = ({ image, size, link, centered, cornerRadius, altText }) => {
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/organization-assets/${image}`;

  if (image === "") {
    return null;
  }

  const imageStyle = {
    maxWidth: "100%",
    height: "auto",
    borderRadius: cornerRadius ? `${cornerRadius}px` : "0",
    display: "block",
  };

  const ImageComponent = (
    <Img
      src={imageUrl}
      alt={altText || "Email content"}
      width={`${size}%`}
      style={imageStyle}
    />
  );

  // Format link with proper protocol
  const formattedLink = link ? formatUrl(link) : "";

  return (
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border={0}
      align={centered ? "center" : "left"}
    >
      <tr>
        <td width={`${size}%`} align={centered ? "center" : "left"}>
          {formattedLink ? (
            <a
              href={formattedLink}
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              {ImageComponent}
            </a>
          ) : (
            ImageComponent
          )}
        </td>
      </tr>
    </table>
  );
};

const CustomFileDownload: React.FC<{
  title: string;
  file: string;
  bgColor: string;
  textColor: string;
  defaultFont?: string;
  cornerRadius?: number;
}> = ({ title, file, bgColor, textColor, defaultFont, cornerRadius }) => {
  if (!file) {
    return null;
  }

  return (
    <table
      style={{ width: "100%", borderCollapse: "collapse", margin: "2px 0" }}
      cellPadding="0"
      cellSpacing="0"
    >
      <tr>
        <td>
          <a
            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/organization-assets/${file}`}
            target="_blank"
            style={{
              textDecoration: "none",
              display: "block",
            }}
          >
            <table
              style={{
                width: "100%",
                backgroundColor: bgColor,
                borderRadius: cornerRadius ? `${cornerRadius * 0.4}px` : "0",
                borderCollapse: "collapse",
              }}
              cellPadding="0"
              cellSpacing="0"
            >
              <tr>
                <td style={{ padding: "8px 8px 8px 13px" }}>
                  <table
                    style={{ width: "100%" }}
                    cellPadding="0"
                    cellSpacing="0"
                  >
                    <tr>
                      <td
                        style={{
                          paddingLeft: "8px",
                          verticalAlign: "middle",
                          width: "auto",
                          fontFamily: ensureFontFallbacks(defaultFont),
                          fontSize: "14px",
                          fontWeight: "500",
                          color: textColor,
                        }}
                      >
                        {title}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          verticalAlign: "middle",
                          width: "1%",
                          border: `1px solid ${bgColor}`,
                          borderRadius: cornerRadius
                            ? `${cornerRadius * 0.4}px`
                            : "0",
                          color: bgColor,
                          backgroundColor: textColor,
                          fontFamily: ensureFontFallbacks(defaultFont),
                          fontSize: "13px",
                          padding: "7px 18px",
                          whiteSpace: "nowrap",
                          fontWeight: "300",
                        }}
                        width="80"
                      >
                        Download
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
    </table>
  );
};

const CustomVideo: React.FC<{
  url: string;
  size: number;
  centered: boolean;
  cornerRadius?: number;
}> = ({ url, size, centered, cornerRadius }) => {
  const videoId = extractYouTubeId(url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : "";

  if (!videoId) {
    return null;
  }

  return (
    <table
      cellPadding="0"
      cellSpacing="0"
      border={0}
      width={`${size}%`}
      align={centered ? "center" : "left"}
    >
      <tr>
        <td width={`${size}%`} align={centered ? "center" : "left"}>
          <a
            href={url}
            target="_blank"
            style={{
              display: "block",
              textDecoration: "none",
            }}
          >
            <table cellPadding="0" cellSpacing="0" border={0} width="100%">
              <tr>
                <td>
                  <Img
                    src={thumbnailUrl}
                    alt="YouTube video thumbnail"
                    width="100%"
                    style={{
                      display: "block",
                      borderRadius: cornerRadius ? `${cornerRadius}px` : "0",
                    }}
                  />
                </td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
    </table>
  );
};

const CustomCards: React.FC<{
  title: string;
  subtitle: string;
  textColor: string;
  labelColor: string;
  buttonColor: string;
  buttonTextColor: string;
  cards: Array<{
    title: string;
    description: string;
    label: string;
    buttonText: string;
    buttonLink: string;
    image: string;
  }>;
  buttonStyle?: "outline" | "filled";
  buttonSize?: "fit" | "full" | "large";
  defaultFont?: string;
  cornerRadius?: number;
  imageAspectRatio?: "16:9" | "square";
}> = ({
  title,
  subtitle,
  textColor,
  labelColor,
  buttonColor,
  buttonTextColor,
  cards,
  defaultFont,
  cornerRadius,
  buttonStyle = "filled",
  buttonSize = "full",
}) => (
  <table
    width="100%"
    cellPadding="0"
    cellSpacing="0"
    border={0}
    style={{ paddingTop: "8px", paddingBottom: "8px" }}
  >
    {/* Title and Subtitle */}
    {(title || subtitle) && (
      <tr>
        <td colSpan={2} style={{ paddingBottom: "8px" }}>
          <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
            {title && (
              <tr>
                <td
                  style={{
                    fontFamily: ensureFontFallbacks(defaultFont),
                    fontSize: "30px",
                    fontWeight: "bold",
                    color: textColor,
                    paddingBottom: "8px",
                  }}
                >
                  {title}
                </td>
              </tr>
            )}
            {subtitle && (
              <tr>
                <td
                  style={{
                    fontFamily: ensureFontFallbacks(defaultFont),
                    fontSize: "16px",
                    color: textColor,
                    fontWeight: "300",
                  }}
                >
                  {subtitle}
                </td>
              </tr>
            )}
          </table>
        </td>
      </tr>
    )}

    {/* Card Rows */}
    {cards
      .reduce((rows, card, index) => {
        if (index % 2 === 0) {
          rows.push([card]);
        } else {
          rows[rows.length - 1].push(card);
        }
        return rows;
      }, [] as any[])
      .map((row, rowIndex) => (
        <tr key={rowIndex}>
          <td>
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="16"
              border={0}
              style={{
                borderCollapse: "separate",
                borderSpacing: "0 0",
                margin: "0",
                width: "100%",
                tableLayout: "fixed",
              }}
            >
              <tr>
                {row.map((card: any, colIndex: number) => {
                  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/organization-assets/${card.image}`;
                  const formattedButtonLink = card.buttonLink
                    ? formatUrl(card.buttonLink)
                    : "";
                  const CardContent = (
                    <table
                      width="100%"
                      cellPadding="0"
                      cellSpacing="12"
                      border={0}
                    >
                      {card.image && (
                        <tr>
                          <td>
                            <Img
                              src={imageUrl}
                              alt={card.title}
                              width="100%"
                              height="172"
                              style={{
                                display: "block",
                                objectFit: "cover",
                                borderRadius: cornerRadius
                                  ? `${cornerRadius * 0.5}px`
                                  : "0",
                              }}
                            />
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: "0" }}>
                          <table
                            width="100%"
                            cellPadding="0"
                            cellSpacing="0"
                            border={0}
                          >
                            {card.label && (
                              <tr>
                                <td
                                  style={{
                                    fontFamily: defaultFont || "sans-serif",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: labelColor,
                                    paddingBottom: "6px",
                                    paddingTop: "6px",
                                  }}
                                >
                                  {card.label}
                                </td>
                              </tr>
                            )}
                            {card.title && (
                              <tr>
                                <td
                                  style={{
                                    fontFamily: defaultFont || "sans-serif",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: textColor,
                                    paddingBottom: "6px",
                                  }}
                                >
                                  {card.title}
                                </td>
                              </tr>
                            )}
                            {card.description && (
                              <tr>
                                <td
                                  style={{
                                    fontFamily: defaultFont || "sans-serif",
                                    fontSize: "14px",
                                    color: textColor,
                                    opacity: 0.8,
                                    paddingBottom: "12px",
                                  }}
                                >
                                  {card.description}
                                </td>
                              </tr>
                            )}
                            {card.buttonText && (
                              <tr>
                                {card.buttonLink ? (
                                  <td
                                    style={{
                                      width: "100%",
                                      textAlign:
                                        buttonSize === "full"
                                          ? "center"
                                          : "left",
                                    }}
                                  >
                                    <a
                                      href={formattedButtonLink}
                                      target="_blank"
                                      style={{
                                        backgroundColor:
                                          buttonStyle === "filled"
                                            ? buttonColor
                                            : "transparent",
                                        border: `2px solid ${buttonColor}`,
                                        borderRadius: cornerRadius
                                          ? `${cornerRadius * 0.3}px`
                                          : "0",
                                        color:
                                          buttonStyle === "filled"
                                            ? buttonTextColor
                                            : buttonColor,
                                        display: "inline-block",
                                        fontFamily:
                                          ensureFontFallbacks(defaultFont),
                                        fontSize: "14px",
                                        fontWeight: "normal",
                                        lineHeight: "1",
                                        padding:
                                          buttonSize === "large"
                                            ? "15px 32px"
                                            : "9px 15px",
                                        textDecoration: "none",
                                        textAlign: "center",
                                        width:
                                          buttonSize === "full"
                                            ? "100%"
                                            : "auto",
                                        maxWidth: "100%",
                                        boxSizing: "border-box",
                                      }}
                                    >
                                      {card.buttonText}
                                    </a>
                                  </td>
                                ) : (
                                  <td
                                    style={{
                                      textAlign: "center",
                                      backgroundColor:
                                        buttonStyle === "filled"
                                          ? buttonColor
                                          : "transparent",
                                      border: `2px solid ${buttonColor}`,
                                      borderRadius: cornerRadius
                                        ? `${cornerRadius * 0.3}px`
                                        : "0",
                                      color:
                                        buttonStyle === "filled"
                                          ? buttonTextColor
                                          : buttonColor,
                                      display: "inline-block",
                                      fontFamily:
                                        ensureFontFallbacks(defaultFont),
                                      fontSize: "14px",
                                      fontWeight: "600",
                                      lineHeight: "1",
                                      padding:
                                        buttonSize === "large"
                                          ? "15px 32px"
                                          : "9px 15px",
                                      textDecoration: "none",
                                      width:
                                        buttonSize === "full" ? "100%" : "auto",
                                      maxWidth: "100%",
                                      boxSizing: "border-box",
                                    }}
                                  >
                                    {card.buttonText}
                                  </td>
                                )}
                              </tr>
                            )}
                          </table>
                        </td>
                      </tr>
                    </table>
                  );

                  return (
                    <td
                      key={colIndex}
                      className="card-column"
                      width="50%"
                      style={{
                        padding: "0 8px",
                        width: "50%",
                        maxWidth: "100%",
                      }}
                    >
                      {card.buttonLink ? (
                        <a
                          href={formattedButtonLink}
                          target="_blank"
                          style={{
                            textDecoration: "none",
                            display: "block",
                          }}
                        >
                          {CardContent}
                        </a>
                      ) : (
                        CardContent
                      )}
                    </td>
                  );
                })}
                {row.length === 1 && (
                  <td className="card-column empty-card-cell" width="50%"></td>
                )}
              </tr>
            </table>
          </td>
        </tr>
      ))}
  </table>
);

const CustomList: React.FC<{
  title: string;
  subtitle: string;
  textColor: string;
  bulletColor: string;
  items: Array<{
    title: string;
    description: string;
  }>;
  defaultFont?: string;
  defaultTextColor?: string;
}> = ({
  title,
  subtitle,
  textColor,
  bulletColor,
  items,
  defaultFont,
  defaultTextColor,
}) => (
  <table
    width="100%"
    cellPadding="0"
    cellSpacing="0"
    border={0}
    style={{ padding: "10px 0" }}
  >
    <tr>
      <td style={{ paddingBottom: "12px" }}>
        <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
          {title && (
            <tr>
              <td
                style={{
                  fontFamily: ensureFontFallbacks(defaultFont),
                  fontWeight: "800",
                  fontSize: "30px",
                  color: defaultTextColor || textColor,
                  lineHeight: "1.5",
                }}
              >
                {title}
              </td>
            </tr>
          )}
          {subtitle && (
            <tr>
              <td
                style={{
                  fontFamily: ensureFontFallbacks(defaultFont),
                  fontSize: "1rem",
                  color: defaultTextColor || textColor,
                  opacity: 0.8,
                  lineHeight: "1.5",
                }}
              >
                {subtitle}
              </td>
            </tr>
          )}
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
          {items
            .filter((item) => item.title || item.description)
            .map((item, displayIndex) => (
              <tr key={displayIndex}>
                <td
                  style={{
                    padding: "10px 0",
                    verticalAlign: "top",
                  }}
                >
                  <table
                    style={{ width: "100%" }}
                    cellPadding="0"
                    cellSpacing="0"
                  >
                    <tr>
                      <td
                        style={{
                          width: "48px",
                          verticalAlign: "top",
                          paddingRight: "10px",
                        }}
                      >
                        <table
                          cellPadding="0"
                          cellSpacing="0"
                          border={0}
                          width="32px"
                          style={{
                            backgroundColor: bulletColor,
                            borderRadius: "50%",
                            height: "32px",
                          }}
                          align="center"
                        >
                          <tr>
                            <td
                              align="center"
                              valign="middle"
                              style={{
                                color: "#FFFFFF",
                                fontFamily: defaultFont || "sans-serif",
                                fontSize: "18px",
                                fontWeight: "500",
                                height: "32px",
                                lineHeight: "1",
                              }}
                            >
                              {displayIndex + 1}
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td>
                        <table
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          border={0}
                        >
                          {item.title && (
                            <tr>
                              <td
                                style={{
                                  fontFamily: defaultFont || "sans-serif",
                                  fontSize: "18px",
                                  fontWeight: "600",
                                  color: defaultTextColor || textColor,
                                  lineHeight: "1.2",
                                }}
                              >
                                {item.title}
                              </td>
                            </tr>
                          )}
                          {item.description && (
                            <tr>
                              {item.description
                                .split("\n")
                                .map((paragraph, pIndex) => (
                                  <td
                                    key={pIndex}
                                    style={{
                                      fontFamily: defaultFont || "sans-serif",
                                      fontSize: "14px",
                                      color: defaultTextColor || textColor,
                                      opacity: 0.8,
                                      lineHeight: "1.5",
                                      marginBottom:
                                        pIndex <
                                        item.description.split("\n").length - 1
                                          ? "12px"
                                          : "0",
                                    }}
                                  >
                                    {paragraph}
                                  </td>
                                ))}
                            </tr>
                          )}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            ))}
        </table>
      </td>
    </tr>
  </table>
);

const CustomAuthor: React.FC<{
  name: string;
  subtitle: string;
  avatar: string;
  links: Array<{
    icon: string;
    url: string;
  }>;
  defaultFont?: string;
  defaultTextColor?: string;
  hideAvatar?: boolean;
  linkColor?: string;
}> = ({
  name,
  subtitle,
  avatar,
  links,
  defaultFont,
  defaultTextColor,
  hideAvatar,
  linkColor,
}) => {
  const avatarUrl = avatar
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/organization-assets/${avatar}`
    : "";

  const finalTextColor = defaultTextColor || "#000000";
  const iconColor = linkColor || finalTextColor;
  const iconColorKey =
    Object.entries(IconColors).find((entry) => entry[1] === iconColor)?.[0] ||
    "black";

  return (
    <table
      style={{ width: "100%", minHeight: "40px" }}
      cellPadding="0"
      cellSpacing="0"
    >
      <tr>
        <td>
          <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
            <tr>
              {/* TODO: stack on mobile */}
              <td style={{ verticalAlign: "middle" }}>
                <table cellPadding="0" cellSpacing="0">
                  <tr>
                    {!hideAvatar && (
                      <td style={{ paddingRight: "12px" }}>
                        {avatarUrl ? (
                          <Img
                            src={avatarUrl}
                            alt={name}
                            width="40"
                            height="40"
                            style={{
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <table
                            cellPadding="0"
                            cellSpacing="0"
                            border={0}
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: "#d4d4d8",
                              borderRadius: "50%",
                            }}
                          >
                            <tr>
                              <td
                                align="center"
                                valign="middle"
                                style={{
                                  color: "#000000",
                                  fontFamily: ensureFontFallbacks(defaultFont),
                                  fontSize: "15px",
                                  fontWeight: "400",
                                  lineHeight: "40px",
                                }}
                              >
                                {name && name.length > 0 ? name[0] : ""}
                              </td>
                            </tr>
                          </table>
                        )}
                      </td>
                    )}
                    <td>
                      <p
                        style={{
                          fontFamily: ensureFontFallbacks(defaultFont),
                          fontSize: "14px",
                          fontWeight: "600",
                          color: finalTextColor,
                          lineHeight: "7px",
                        }}
                      >
                        {name}
                      </p>
                      <p
                        style={{
                          fontFamily: ensureFontFallbacks(defaultFont),
                          fontSize: "14px",
                          lineHeight: "0",
                          color: finalTextColor,
                          opacity: 0.8,
                        }}
                      >
                        {subtitle}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
              <td style={{ textAlign: "right" }}>
                <table
                  style={{ width: "100%" }}
                  cellPadding="5px"
                  cellSpacing="0px"
                >
                  {links?.map((link, index) => {
                    if (!link.icon) {
                      return null;
                    }

                    const iconUrl =
                      IconImages[iconColorKey as keyof typeof IconImages]?.[
                        (SocialIconKeys[
                          link.icon as keyof typeof SocialIconKeys
                        ] || link.icon) as keyof (typeof IconImages)["black"]
                      ];
                    if (!iconUrl) {
                      return null;
                    }

                    if (!link.url) {
                      return (
                        <td
                          key={index}
                          style={{
                            width: "20px",
                            height: "20px",
                            display: "inline-block",
                            marginLeft: "8px",
                            marginBottom: "8px",
                            color: finalTextColor,
                            textDecoration: "none",
                          }}
                        >
                          <Img
                            src={iconUrl}
                            alt={link.icon}
                            width="18"
                            height="18"
                            style={{
                              display: "block",
                            }}
                          />
                        </td>
                      );
                    }

                    // Format the URL with proper prefix
                    const formattedUrl = formatUrl(
                      link.url,
                      link.icon === "mail" ? "mail" : "link",
                    );

                    return (
                      <a
                        key={index}
                        href={formattedUrl}
                        target="_blank"
                        style={{
                          marginLeft: "8px",
                          color: finalTextColor,
                          textDecoration: "none",
                        }}
                      >
                        <td
                          style={{
                            width: "20px",
                            height: "20px",
                            display: "inline-block",
                            marginBottom: "8px",
                          }}
                        >
                          <Img
                            src={iconUrl}
                            alt={link.icon}
                            width="18"
                            height="18"
                            style={{
                              display: "block",
                            }}
                          />
                        </td>
                      </a>
                    );
                  })}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};

// Helper function to extract YouTube video ID
function extractYouTubeId(url: string): string | undefined {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return undefined;
}

// Add CustomFooter component before the main generator function
const CustomFooter: React.FC<{
  footerData: any;
  orgFooterDetails: any;
  defaultFont?: string;
  emailBgColor?: string;
  isInset?: boolean;
  cornerRadius?: number;
  linkColor?: string;
}> = ({
  footerData,
  orgFooterDetails,
  defaultFont,
  emailBgColor,
  isInset,
  cornerRadius,
}) => {
  if (!footerData) return null;

  const {
    logo,
    name,
    subtitle,
    links = [],
    extra_links = [],
    bg_color = "#ffffff",
    text_color = "#000000",
    secondary_text_color = "#666666",
    socials_style = "icon-only",
    socials_color = "#000000",
    socials_icon_color = "#ffffff",
  } = footerData;

  const { address, name: orgName } = orgFooterDetails || {};

  const logoUrl = logo
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/organization-assets/${logo}`
    : "";

  // Determine which color key to use for icons based on style
  const getIconColorKey = (color: string) => {
    return (
      Object.entries(IconColors).find((entry) => entry[1] === color)?.[0] ||
      "black"
    );
  };

  // Get icon URL based on style and colors
  const getIconUrl = (icon: string) => {
    // Always use socials_icon_color for the icon color
    const colorKey = getIconColorKey(socials_icon_color);
    return IconImages[colorKey as keyof typeof IconImages]?.[
      (SocialIconKeys[icon as keyof typeof SocialIconKeys] ||
        icon) as keyof (typeof IconImages)["black"]
    ];
  };

  return (
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border={0}
      bgcolor={!isInset ? bg_color : emailBgColor}
      style={{
        width: "100%",
        textAlign: "center",
        marginTop: "-1px",
      }}
    >
      <tr>
        <td align="center" style={{ padding: "40px 0 32px" }}>
          <table
            cellPadding="0"
            cellSpacing="0"
            border={0}
            width="100%"
            style={{
              maxWidth: "672px",
              margin: "0 auto",
              fontFamily: ensureFontFallbacks(defaultFont),
            }}
          >
            <tr>
              <td align="center">
                {logoUrl && (
                  <table cellPadding="0" cellSpacing="0" border={0}>
                    <tr>
                      <td align="center" style={{ paddingBottom: "16px" }}>
                        <Img
                          src={logoUrl}
                          alt="Church Logo"
                          width="112"
                          height="112"
                          style={{
                            objectFit: "contain",
                            borderRadius: cornerRadius
                              ? `${cornerRadius * 0.6}px`
                              : "0",
                            marginBottom: "16px",
                          }}
                        />
                      </td>
                    </tr>
                  </table>
                )}

                {name && (
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    width="100%"
                  >
                    <tr>
                      <td
                        align="center"
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: text_color,
                          paddingBottom: "8px",
                        }}
                      >
                        {name}
                      </td>
                    </tr>
                  </table>
                )}

                {subtitle && (
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    width="100%"
                  >
                    <tr>
                      <td align="center">
                        <table
                          cellPadding="0"
                          cellSpacing="0"
                          border={0}
                          style={{ maxWidth: "448px" }}
                        >
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontSize: "14px",
                                color: secondary_text_color,
                                lineHeight: "1.4",
                                textAlign: "center",
                                paddingBottom: "26px",
                              }}
                            >
                              {subtitle}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                )}

                {links && links.length > 0 && (
                  <table
                    cellPadding="0"
                    cellSpacing="10px"
                    border={0}
                    width="100%"
                  >
                    <tr>
                      <td align="center">
                        {links.map((link: any, index: number) => {
                          const iconUrl = getIconUrl(link.icon);
                          if (!iconUrl) return null;

                          // Format the URL with proper prefix
                          const formattedUrl = formatUrl(
                            link.url,
                            link.icon === "mail" ? "mail" : "link",
                          );

                          return (
                            <a
                              key={index}
                              href={formattedUrl}
                              style={{
                                display: "inline-block",
                                margin:
                                  socials_style === "icon-only" ? "0" : "0 4px",
                                padding: "8px",
                                backgroundColor:
                                  socials_style === "filled"
                                    ? socials_color
                                    : "transparent",
                                border:
                                  socials_style === "outline"
                                    ? `1px solid ${socials_icon_color}`
                                    : "none",
                                borderRadius: "50%",
                                lineHeight: 0,
                              }}
                            >
                              <Img
                                src={iconUrl}
                                alt={link.icon}
                                width="18"
                                height="18"
                                style={{
                                  display: "block",
                                }}
                              />
                            </a>
                          );
                        })}
                      </td>
                    </tr>
                  </table>
                )}

                {extra_links && extra_links.length > 0 && (
                  <table
                    cellPadding="0"
                    cellSpacing="10px"
                    border={0}
                    width="100%"
                  >
                    {extra_links
                      .filter((link: any) => link.text)
                      .map((link: any, index: number) => {
                        return (
                          <tr key={index}>
                            <td align="center">
                              <a
                                key={index}
                                href={link.url}
                                style={{
                                  color: secondary_text_color,
                                  textDecoration: "underline",
                                  fontSize: "14px",
                                  fontWeight: "300",
                                }}
                              >
                                {link.text}
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                  </table>
                )}

                <table
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  width="100%"
                  style={{
                    padding: isInset ? "24px 24px" : "24px 0px",
                  }}
                >
                  <tr>
                    <td
                      style={{
                        height: "1px",
                        lineHeight: "1px",
                        fontSize: "1px",
                        backgroundColor: secondary_text_color,
                      }}
                    >
                      &nbsp;
                    </td>
                  </tr>
                </table>

                <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                  <tr>
                    <td align="center" style={{ color: secondary_text_color }}>
                      {address && orgFooterDetails && (
                        <table
                          cellPadding="0"
                          cellSpacing="0"
                          border={0}
                          width="100%"
                        >
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontSize: "12px",
                                paddingBottom: "8px",
                                lineHeight: "1.2",
                              }}
                            >
                              Our mailing address is:
                            </td>
                          </tr>
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontSize: "12px",
                                paddingBottom: "8px",
                                lineHeight: "1.2",
                              }}
                            >
                              {address?.line1 && ` ${address?.line1}`}
                              {address?.line2 && ` ${address?.line2}`},
                              {address?.city && ` ${address?.city}`},
                              {address?.state && ` ${address?.state}`}
                              {address?.zip && ` ${address?.zip}`}
                              {address?.country && ` ${address?.country}`}
                            </td>
                          </tr>
                        </table>
                      )}

                      {orgName && orgFooterDetails && (
                        <table
                          cellPadding="0"
                          cellSpacing="0"
                          border={0}
                          width="100%"
                        >
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontSize: "12px",
                                paddingBottom: "8px",
                                lineHeight: "1.2",
                              }}
                            >
                              You are receiving this email because of your
                              involvment with {orgName}.
                            </td>
                          </tr>
                        </table>
                      )}

                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td
                            align="center"
                            style={{
                              fontSize: "12px",
                              lineHeight: "1.5",
                              padding: "0 10px",
                            }}
                          >
                            &copy; {new Date().getFullYear()}{" "}
                            {orgName && orgName}
                            {" | "}
                            <a
                              href={"#"}
                              style={{
                                color: secondary_text_color,
                                textDecoration: "underline",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                              }}
                              id="manage-preferences-link"
                            >
                              Update your preferences
                            </a>
                            {" | "}
                            <a
                              href={"#"}
                              style={{
                                color: secondary_text_color,
                                textDecoration: "underline",
                              }}
                              id="unsubscribe-link"
                            >
                              Unsubscribe
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};

// Main generator function
export function generateEmailCode(
  sections: Section[],
  style: EmailStyle,
  footerData?: any,
  orgFooterDetails?: any,
): React.ReactElement {
  const {
    bgColor = "#ffffff",
    isInset = false,
    cornerRadius = 0,
    emailBgColor = "#eeeeee",
    defaultTextColor = "#000000",
    accentTextColor = "#000000",
    defaultFont = "sans-serif",
    linkColor = "#0000ff",
    blockSpacing = 0,
  } = style;

  // Ensure defaultFont has proper fallbacks for email clients
  const emailSafeFont = ensureFontFallbacks(defaultFont);

  return (
    <Html>
      <Head>
        <title>Email Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
      /* Default mobile styles */
      .card-column {
        display: block !important;
        width: 100% !important;
        padding: 0 !important;
        padding-bottom: 12px !important;
        box-sizing: border-box !important;
        vertical-align: top !important;
      }
      .card-column > a, .card-column > table {
         width: 100% !important;
      }
      .empty-card-cell {
        display: none !important;
      }

      /* Mobile H4 style */
      @media only screen and (max-width: 479px) {
        h4 {
          font-size: 3rem !important;
          line-height: 1.2 !important;
        }

        /* Mobile padding for inset container */
        .inset-container {
          padding: 12px !important;
          padding-top: 0px !important;
        }

        .td-container {
          padding: 6px !important;
        }
      }

      /* Desktop styles - Using media query syntax for email clients */
      @media only screen and (min-width: 480px) {
        .card-column {
          display: table-cell !important;
          width: 50% !important;
          padding-bottom: 12px !important;
        }
        .card-column:nth-child(odd) {
          padding: 0 4px !important;
        }
        .card-column:nth-child(even) {
          padding: 0 4px !important;
        }
        .empty-card-cell {
           display: table-cell !important;
           width: 50% !important;
           padding-left: 8px !important;
           padding-right: 0 !important;
        }
      }
    `}</style>
      </Head>
      <Body style={{ margin: 0, padding: 0 }}>
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          border={0}
          bgcolor={isInset ? emailBgColor : bgColor}
          style={{ width: "100%" }}
        >
          <tr>
            <td
              align="center"
              className="td-container"
              style={{ padding: isInset ? "20px" : "0" }}
            >
              {isInset ? (
                <table
                  className="inset-container"
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  width="672"
                  align="center"
                  style={{
                    width: "100%",
                    maxWidth: "672px",
                    backgroundColor: bgColor,
                    borderRadius: cornerRadius > 0 ? `12px` : "0px",
                    borderCollapse: "separate",
                    padding: "22px",
                    paddingTop: "8px",
                    paddingBottom: "20px",
                  }}
                >
                  <tr>
                    <td style={{ padding: "0px" }}>
                      <Container
                        style={{
                          margin: "0 auto",
                          width: "100%",
                          maxWidth: "672px",
                        }}
                      >
                        {sections.map((section, sectionIndex) => (
                          <EmailSection
                            key={`section-inset-${sectionIndex}`}
                            style={{ paddingTop: "16px" }}
                          >
                            {section.blocks.map((block, blockIndex) => {
                              const blockStyle = {
                                paddingBottom: blockSpacing - 5,
                              };
                              const Component = (() => {
                                switch (block.type) {
                                  case "text":
                                    const textData =
                                      block.data as TextBlockData;
                                    return (
                                      <table
                                        key={`block-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={{
                                          ...blockStyle,
                                        }}
                                      >
                                        <tr>
                                          <td>
                                            <CustomText
                                              content={textData?.content || ""}
                                              font={textData?.font}
                                              accentTextColor={accentTextColor}
                                              defaultFont={emailSafeFont}
                                              defaultTextColor={`${defaultTextColor} !important`}
                                              linkColor={linkColor}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "button":
                                    return (
                                      <table
                                        key={`button-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomButton
                                              {...(block.data as ButtonBlockData)}
                                              cornerRadius={cornerRadius}
                                              defaultFont={emailSafeFont}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "divider":
                                    return (
                                      <table
                                        key={`divider-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomDivider
                                              {...(block.data as any)}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "image":
                                    return (
                                      <table
                                        key={`image-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomImage
                                              {...(block.data as any)}
                                              cornerRadius={cornerRadius}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "file-download":
                                    return (
                                      <table
                                        key={`file-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomFileDownload
                                              {...(block.data as any)}
                                              defaultFont={emailSafeFont}
                                              cornerRadius={cornerRadius}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "video":
                                    return (
                                      <table
                                        key={`video-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomVideo
                                              {...(block.data as any)}
                                              cornerRadius={cornerRadius}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "cards":
                                    return (
                                      <table
                                        key={`cards-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomCards
                                              {...(block.data as any)}
                                              defaultFont={emailSafeFont}
                                              cornerRadius={cornerRadius}
                                              textColor={`${defaultTextColor} !important`}
                                              buttonStyle={
                                                (block.data as any)?.buttonStyle
                                              }
                                              buttonSize={
                                                (block.data as any)?.buttonSize
                                              }
                                              imageAspectRatio={
                                                (block.data as any)
                                                  ?.imageAspectRatio
                                              }
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "list":
                                    return (
                                      <table
                                        key={`list-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomList
                                              {...(block.data as any)}
                                              defaultFont={emailSafeFont}
                                              defaultTextColor={`${defaultTextColor} !important`}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "author":
                                    return (
                                      <table
                                        key={`author-inset-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomAuthor
                                              {...(block.data as any)}
                                              defaultFont={emailSafeFont}
                                              defaultTextColor={`${defaultTextColor} !important`}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  default:
                                    return null;
                                }
                              })();
                              return Component;
                            })}
                          </EmailSection>
                        ))}
                      </Container>
                    </td>
                  </tr>
                </table>
              ) : (
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  width="672"
                  align="center"
                  style={{
                    width: "100%",
                    maxWidth: "672px",
                    margin: "0 auto",
                  }}
                >
                  <tr>
                    <td style={{ padding: "15px" }}>
                      <Container
                        style={{
                          margin: "0 auto",
                          width: "100%",
                          maxWidth: "672px",
                        }}
                      >
                        {sections.map((section, sectionIndex) => (
                          <EmailSection key={`section-${sectionIndex}`}>
                            {section.blocks.map((block, blockIndex) => {
                              const blockStyle = {
                                margin: "8px 0",
                                paddingBottom: blockSpacing - 5,
                              };
                              const Component = (() => {
                                switch (block.type) {
                                  case "text":
                                    const textData =
                                      block.data as TextBlockData;
                                    return (
                                      <table
                                        key={`block-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomText
                                              content={textData?.content || ""}
                                              font={textData?.font}
                                              accentTextColor={accentTextColor}
                                              defaultFont={emailSafeFont}
                                              defaultTextColor={`${defaultTextColor} !important`}
                                              linkColor={linkColor}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "button":
                                    return (
                                      <table
                                        key={`button-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomButton
                                              {...(block.data as ButtonBlockData)}
                                              cornerRadius={cornerRadius}
                                              defaultFont={emailSafeFont}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "divider":
                                    return (
                                      <table
                                        key={`divider-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomDivider
                                              {...(block.data as any)}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "image":
                                    return (
                                      <table
                                        key={`image-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomImage
                                              {...(block.data as any)}
                                              cornerRadius={cornerRadius}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "file-download":
                                    return (
                                      <table
                                        key={`file-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomFileDownload
                                              {...(block.data as any)}
                                              defaultFont={emailSafeFont}
                                              cornerRadius={cornerRadius}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "video":
                                    return (
                                      <table
                                        key={`video-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomVideo
                                              {...(block.data as any)}
                                              cornerRadius={cornerRadius}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "cards":
                                    return (
                                      <table
                                        key={`cards-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomCards
                                              {...(block.data as any)}
                                              defaultFont={emailSafeFont}
                                              cornerRadius={cornerRadius}
                                              textColor={`${defaultTextColor} !important`}
                                              buttonStyle={
                                                (block.data as any)?.buttonStyle
                                              }
                                              buttonSize={
                                                (block.data as any)?.buttonSize
                                              }
                                              imageAspectRatio={
                                                (block.data as any)
                                                  ?.imageAspectRatio
                                              }
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "list":
                                    return (
                                      <table
                                        key={`list-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomList
                                              {...(block.data as any)}
                                              defaultFont={emailSafeFont}
                                              defaultTextColor={`${defaultTextColor} !important`}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  case "author":
                                    return (
                                      <table
                                        key={`author-${sectionIndex}-${blockIndex}`}
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border={0}
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomAuthor
                                              {...(block.data as any)}
                                              defaultFont={emailSafeFont}
                                              defaultTextColor={`${defaultTextColor} !important`}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    );
                                  default:
                                    return null;
                                }
                              })();
                              return Component;
                            })}
                          </EmailSection>
                        ))}
                      </Container>
                    </td>
                  </tr>
                </table>
              )}
            </td>
          </tr>
        </table>
        <CustomFooter
          footerData={footerData}
          orgFooterDetails={orgFooterDetails}
          defaultFont={emailSafeFont}
          emailBgColor={emailBgColor}
          isInset={isInset}
          cornerRadius={cornerRadius}
        />
      </Body>
    </Html>
  );
}
