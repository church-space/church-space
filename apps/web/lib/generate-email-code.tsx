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
  },
};

interface EmailStyle {
  bgColor?: string;
  isInset?: boolean;
  isRounded?: boolean;
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
  firstName?: string;
  lastName?: string;
  email?: string;
}> = ({
  content,
  font,
  accentTextColor,
  defaultFont,
  defaultTextColor,
  linkColor,
  firstName,
  lastName,
  email,
}) => {
  // Replace mention spans with actual values
  const personalizedContent = content
    .replace(
      /<span class="mention" data-type="mention" data-id="first-name">@first-name<\/span>/g,
      firstName || "@first-name",
    )
    .replace(
      /<span class="mention" data-type="mention" data-id="last-name">@last-name<\/span>/g,
      lastName || "@last-name",
    )
    .replace(
      /<span class="mention" data-type="mention" data-id="email">@email<\/span>/g,
      email || "@email",
    );

  // Parse HTML content and convert to React Email components
  const sanitizedContent = personalizedContent
    .replace(/class="[^"]*"/g, "")
    // Add more space above h1 and h2, reduce space below all headings, and set font weights and sizes
    .replace(/<h1(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle = " font-weight: 600; font-size: 2rem; line-height: 1";
      if (existingStyle) {
        return `<h1 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h1 style="${baseStyle}"`;
    })
    .replace(/<h2(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle = " font-weight: 700; font-size: 1.5rem; line-height: 1";
      if (existingStyle) {
        return `<h2 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h2 style="${baseStyle}"`;
    })
    .replace(/<h3(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle = "font-weight: 600; font-size: 1.25rem; line-height: 1";
      if (existingStyle) {
        return `<h3 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h3 style="${baseStyle}"`;
    })
    // Add light weight and line height to paragraphs, preserving any existing style attributes
    .replace(/<p(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "font-weight: 400; line-height: 1.5; font-size: 16px; margin: 0.5em 0";
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
    // Handle empty paragraphs for line breaks
    .replace(
      /<p style="[^"]*"><\/p>/g,
      '<br style="display: block; margin: 0.8em 0;" />',
    )
    // Add font size to list items
    .replace(/<li/g, '<li style="font-size: 16px; margin-bottom: 0.5em"')
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

  // Now add a style tag to handle the first-child rule similar to the CSS
  const processedContent = `
    <style>
      h1:first-child, h2:first-child, h3:first-child {
        margin-top: 0em !important;
      }
    </style>
    ${sanitizedContent}
  `;

  return (
    <table cellPadding="0" cellSpacing="0" border={0} width="100%">
      <tr>
        <td
          style={{
            fontFamily: font || defaultFont || "sans-serif",
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
  size: "fit" | "full";
  isRounded?: boolean;
  defaultFont?: string;
  centered?: boolean;
}> = ({
  text,
  link,
  color,
  textColor,
  style: buttonStyle,
  size,
  isRounded,
  defaultFont,
  centered = true,
}) => {
  const buttonWidth = size === "full" ? "100%" : "auto";
  const borderRadius = isRounded ? "6px" : "0";

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
                fontFamily: defaultFont || "sans-serif",
                fontSize: "14px",
                fontWeight: "normal",
                lineHeight: "1",
                padding: "9px 15px",
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
            <span
              style={{
                backgroundColor:
                  buttonStyle === "filled" ? color : "transparent",
                border: `2px solid ${color}`,
                borderRadius,
                color: buttonStyle === "filled" ? textColor : color,
                display: "inline-block",
                fontFamily: defaultFont || "sans-serif",
                fontSize: "14px",
                fontWeight: "normal",
                lineHeight: "1",
                padding: "9px 15px",
                textDecoration: "none",
                textAlign: "center",
                width: buttonWidth,
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              {text}
            </span>
          )}
        </td>
      </tr>
    </table>
  ) : null;
};

const CustomDivider: React.FC<{
  color: string;
  margin: number;
}> = ({ color, margin }) => (
  <Hr
    style={{
      borderTop: `1px solid ${color}`,
      marginTop: `${margin}px`,
      marginBottom: `${margin}px`,
      width: "100%",
    }}
  />
);

const CustomImage: React.FC<{
  image: string;
  size: number;
  link: string;
  centered: boolean;
  isRounded?: boolean;
  altText?: string;
}> = ({ image, size, link, centered, isRounded, altText }) => {
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/email_assets/${image}`;

  if (image === "") {
    return null;
  }

  const imageStyle = {
    maxWidth: "100%",
    height: "auto",
    borderRadius: isRounded ? "6px" : "0",
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
  isRounded?: boolean;
}> = ({ title, file, bgColor, textColor, defaultFont, isRounded }) => {
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
            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/email_assets/${file}`}
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
                borderRadius: isRounded ? "6px" : "0",
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
                        }}
                      >
                        <span
                          style={{
                            fontFamily: defaultFont || "sans-serif",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: textColor,
                            display: "inline-block",
                          }}
                        >
                          {title}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          verticalAlign: "middle",
                          width: "1%",
                        }}
                        width="80"
                      >
                        <span
                          style={{
                            border: `1px solid ${bgColor}`,
                            borderRadius: isRounded ? "6px" : "0",
                            color: bgColor,
                            backgroundColor: textColor,
                            display: "inline-block",
                            fontFamily: defaultFont || "sans-serif",
                            fontSize: "13px",
                            padding: "6px 18px",
                            whiteSpace: "nowrap",
                            fontWeight: "300",
                          }}
                        >
                          Download
                        </span>
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
  isRounded?: boolean;
}> = ({ url, size, centered, isRounded }) => {
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
                      borderRadius: isRounded ? "6px" : "0",
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
  defaultFont?: string;
  isRounded?: boolean;
}> = ({
  title,
  subtitle,
  textColor,
  labelColor,
  buttonColor,
  buttonTextColor,
  cards,
  defaultFont,
  isRounded,
}) => (
  <table
    width="100%"
    cellPadding="0"
    cellSpacing="0"
    border={0}
    style={{ paddingTop: "12px", paddingBottom: "12px" }}
  >
    {(title || subtitle) && (
      <tr>
        <td style={{ paddingBottom: "20px" }}>
          <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
            {title && (
              <tr>
                <td
                  style={{
                    fontFamily: defaultFont || "sans-serif",
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
                    fontFamily: defaultFont || "sans-serif",
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
    <tr>
      <td>
        <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
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
              <tr
                key={rowIndex}
                style={{
                  ...(rowIndex > 0 ? { verticalAlign: "top" } : {}),
                }}
              >
                {row.map((card: any, colIndex: number) => {
                  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/email_assets/${card.image}`;
                  const formattedButtonLink = card.buttonLink
                    ? formatUrl(card.buttonLink)
                    : "";
                  const CardContent = (
                    <table
                      width="100%"
                      cellPadding="0"
                      cellSpacing="0"
                      border={0}
                    >
                      {card.image && (
                        <tr>
                          <td style={{ paddingBottom: "16px" }}>
                            <Img
                              src={imageUrl}
                              alt={card.title}
                              width="100%"
                              height="192"
                              style={{
                                display: "block",
                                objectFit: "cover",
                                borderRadius: isRounded ? "6px" : "0",
                              }}
                            />
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: "0 4px" }}>
                          <table
                            width="100%"
                            cellPadding="0"
                            cellSpacing="0"
                            border={0}
                          >
                            <tr>
                              <td
                                style={{
                                  fontFamily: defaultFont || "sans-serif",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  color: labelColor,
                                  paddingBottom: "8px",
                                }}
                              >
                                {card.label}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  fontFamily: defaultFont || "sans-serif",
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                  color: textColor,
                                  paddingBottom: "8px",
                                }}
                              >
                                {card.title}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  fontFamily: defaultFont || "sans-serif",
                                  fontSize: "14px",
                                  color: textColor,
                                  opacity: 0.8,
                                  paddingBottom: "16px",
                                }}
                              >
                                {card.description}
                              </td>
                            </tr>
                            {card.buttonText && (
                              <tr>
                                <td>
                                  <div
                                    style={{
                                      backgroundColor: buttonColor,
                                      borderRadius: isRounded ? "6px" : "0",
                                      color: buttonTextColor,
                                      display: "block",
                                      fontFamily: defaultFont || "sans-serif",
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      padding: "8px 16px",
                                      textDecoration: "none",
                                      textAlign: "center",
                                      boxSizing: "border-box",
                                      width: "100%",
                                    }}
                                  >
                                    {card.buttonText}
                                  </div>
                                </td>
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
                      style={{
                        width: "50%",
                        verticalAlign: "top",
                        ...(rowIndex > 0 ? { paddingTop: "56px" } : {}),
                        ...(colIndex === 0
                          ? { paddingRight: "12px" }
                          : { paddingLeft: "12px" }),
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
                {row.length === 1 && <td style={{ width: "50%" }}></td>}
              </tr>
            ))}
        </table>
      </td>
    </tr>
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
                  fontFamily: defaultFont || "sans-serif",
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
                  fontFamily: defaultFont || "sans-serif",
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
                                  paddingBottom: item.description ? "4px" : "0",
                                }}
                              >
                                {item.title}
                              </td>
                            </tr>
                          )}
                          {item.description && (
                            <tr>
                              <td>
                                {item.description
                                  .split("\n")
                                  .map((paragraph, pIndex) => (
                                    <div
                                      key={pIndex}
                                      style={{
                                        fontFamily: defaultFont || "sans-serif",
                                        fontSize: "14px",
                                        color: defaultTextColor || textColor,
                                        opacity: 0.8,
                                        lineHeight: "1.5",
                                        marginBottom:
                                          pIndex <
                                          item.description.split("\n").length -
                                            1
                                            ? "12px"
                                            : "0",
                                      }}
                                    >
                                      {paragraph}
                                    </div>
                                  ))}
                              </td>
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
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/email_assets/${avatar}`
    : "";

  const finalTextColor = defaultTextColor || "#000000";
  const iconColor = linkColor || finalTextColor;
  const iconColorKey =
    Object.entries(IconColors).find((entry) => entry[1] === iconColor)?.[0] ||
    "black";

  return (
    <table
      style={{ width: "100%", minHeight: "48px" }}
      cellPadding="0"
      cellSpacing="0"
    >
      <tr>
        <td>
          <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
            <tr>
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
                                  fontFamily: defaultFont || "sans-serif",
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
                      <div
                        style={{
                          fontFamily: defaultFont || "sans-serif",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: finalTextColor,
                          marginBottom: "2px",
                        }}
                      >
                        {name}
                      </div>
                      <div
                        style={{
                          fontFamily: defaultFont || "sans-serif",
                          fontSize: "14px",
                          color: finalTextColor,
                          opacity: 0.8,
                        }}
                      >
                        {subtitle}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
              <td style={{ textAlign: "right" }}>
                {links?.map((link, index) => {
                  if (!link.icon) {
                    return null;
                  }

                  const iconUrl =
                    IconImages[iconColorKey as keyof typeof IconImages]?.[
                      link.icon as keyof (typeof IconImages)["black"]
                    ];
                  if (!iconUrl) {
                    return null;
                  }

                  if (!link.url) {
                    return (
                      <span
                        key={index}
                        style={{
                          width: "20px",
                          height: "20px",
                          display: "inline-block",
                          marginLeft: "8px",
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
                      </span>
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
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          display: "inline-block",
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
                      </span>
                    </a>
                  );
                })}
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
  defaultFont?: string;
  emailBgColor?: string;
  isInset?: boolean;
  isRounded?: boolean;
  linkColor?: string;
  unsubscribeUrl?: string;
  managePreferencesUrl?: string;
}> = ({
  footerData,
  defaultFont,
  emailBgColor,
  isInset,
  isRounded,
  unsubscribeUrl,
  managePreferencesUrl,
}) => {
  if (!footerData) return null;

  const {
    logo,
    name,
    subtitle,
    links = [],
    address,
    reason,
    copyright_name,
    bg_color = "#ffffff",
    text_color = "#000000",
    secondary_text_color = "#666666",
    socials_style = "icon-only",
    socials_color = "#000000",
    socials_icon_color = "#ffffff",
  } = footerData;

  const logoUrl = logo
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/email_assets/${logo}`
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
      icon as keyof (typeof IconImages)["black"]
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
              fontFamily: defaultFont,
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
                            borderRadius: isRounded ? "6px" : "0",
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
                                textWrap: "balance",
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
                    cellSpacing="0"
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
                      {address && (
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
                              {address}
                            </td>
                          </tr>
                        </table>
                      )}

                      {reason && (
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
                              {reason}
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
                            <span>
                              © {new Date().getFullYear()} {copyright_name}
                            </span>
                            <span style={{ margin: "0 8px" }}>|</span>
                            <a
                              href={managePreferencesUrl || "#"}
                              style={{
                                color: secondary_text_color,
                                textDecoration: "underline",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                              }}
                            >
                              Update your preferences
                            </a>
                            <span style={{ margin: "0 8px" }}>|</span>
                            <a
                              href={unsubscribeUrl || "#"}
                              style={{
                                color: secondary_text_color,
                                textDecoration: "underline",
                              }}
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
  unsubscribeUrl?: string,
  managePreferencesUrl?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
): React.ReactElement {
  const {
    bgColor = "#ffffff",
    isInset = false,
    isRounded = false,
    emailBgColor = "#eeeeee",
    defaultTextColor = "#000000",
    accentTextColor = "#000000",
    defaultFont = "sans-serif",
    linkColor = "#0000ff",
    blockSpacing = 0,
  } = style;

  return (
    <Html>
      <Head>
        <title>Email Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
            <td align="center" style={{ padding: isInset ? "10px" : "0" }}>
              {/* If inset, we need an inner table with a different background color */}
              {isInset ? (
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  width="100%"
                  align="center"
                  style={{
                    maxWidth: "672px",
                    width: "100%",
                    backgroundColor: bgColor,
                    borderRadius: isRounded ? "12px" : "0",
                    borderCollapse: "separate",
                    paddingBottom: "10px",
                  }}
                >
                  <tr>
                    <td style={{ padding: "0px" }}>
                      <Container
                        style={{
                          padding: "0px 10px",
                          maxWidth: "656px",
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
                                              defaultFont={defaultFont}
                                              defaultTextColor={
                                                defaultTextColor
                                              }
                                              linkColor={linkColor}
                                              firstName={firstName}
                                              lastName={lastName}
                                              email={email}
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
                                              isRounded={isRounded}
                                              defaultFont={defaultFont}
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
                                              isRounded={isRounded}
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
                                              defaultFont={defaultFont}
                                              isRounded={isRounded}
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
                                              isRounded={isRounded}
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
                                              defaultFont={defaultFont}
                                              isRounded={isRounded}
                                              textColor={defaultTextColor}
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
                                              defaultFont={defaultFont}
                                              defaultTextColor={
                                                defaultTextColor
                                              }
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
                                        style={{ margin: "18px 0 4px 0" }}
                                      >
                                        <tr>
                                          <td>
                                            <CustomAuthor
                                              {...(block.data as any)}
                                              defaultFont={defaultFont}
                                              defaultTextColor={
                                                defaultTextColor
                                              }
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
                /* Not inset, simpler structure */
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  width="100%"
                  align="center"
                  style={{ maxWidth: "672px", width: "100%" }}
                >
                  <tr>
                    <td style={{ padding: "0px 0" }}>
                      <Container style={{ padding: 0 }}>
                        {sections.map((section, sectionIndex) => (
                          <EmailSection key={`section-${sectionIndex}`}>
                            {section.blocks.map((block, blockIndex) => {
                              const blockStyle = { margin: "8px 0" };
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
                                              defaultFont={defaultFont}
                                              defaultTextColor={
                                                defaultTextColor
                                              }
                                              linkColor={linkColor}
                                              firstName={firstName}
                                              lastName={lastName}
                                              email={email}
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
                                              isRounded={isRounded}
                                              defaultFont={defaultFont}
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
                                              isRounded={isRounded}
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
                                              defaultFont={defaultFont}
                                              isRounded={isRounded}
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
                                              isRounded={isRounded}
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
                                              defaultFont={defaultFont}
                                              isRounded={isRounded}
                                              textColor={defaultTextColor}
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
                                              defaultFont={defaultFont}
                                              defaultTextColor={
                                                defaultTextColor
                                              }
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
                                        style={{ margin: "24px 0 8px 0" }}
                                      >
                                        <tr>
                                          <td>
                                            <CustomAuthor
                                              {...(block.data as any)}
                                              defaultFont={defaultFont}
                                              defaultTextColor={
                                                defaultTextColor
                                              }
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
          defaultFont={defaultFont}
          emailBgColor={emailBgColor}
          isInset={isInset}
          isRounded={isRounded}
          unsubscribeUrl={unsubscribeUrl}
          managePreferencesUrl={managePreferencesUrl}
        />
      </Body>
    </Html>
  );
}
