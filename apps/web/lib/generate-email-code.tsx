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
import {
  File,
  Youtube,
  MailFilled,
  Instagram,
  Facebook,
  Linkedin,
  Bluesky,
  LinkIcon,
  Threads,
  TikTok,
  XTwitter,
  YoutubeFilled,
} from "@church-space/ui/icons";

interface EmailStyle {
  bgColor?: string;
  isInset?: boolean;
  isRounded?: boolean;
  emailBgColor?: string;
  defaultTextColor?: string;
  defaultFont?: string;
  linkColor?: string;
}

// Custom components for email blocks
const CustomText: React.FC<{
  content: string;
  font?: string;
  textColor?: string;
  defaultFont?: string;
  defaultTextColor?: string;
  linkColor?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}> = ({
  content,
  font,
  textColor,
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
      const baseStyle =
        "margin: 0.3cem 0 0.2em 0; font-weight: 600; font-size: 2rem; line-height: 1";
      if (existingStyle) {
        return `<h1 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h1 style="${baseStyle}"`;
    })
    .replace(/<h2(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "margin: 1em 0 0.2em 0; font-weight: 700; font-size: 1.5rem; line-height: 1.3";
      if (existingStyle) {
        return `<h2 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h2 style="${baseStyle}"`;
    })
    .replace(/<h3(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "margin: 1em 0 0.2em 0; font-weight: 600; font-size: 1.25rem; line-height: 1.3";
      if (existingStyle) {
        return `<h3 style="${existingStyle}; ${baseStyle}"`;
      }
      return `<h3 style="${baseStyle}"`;
    })
    // Add light weight and line height to paragraphs, preserving any existing style attributes
    .replace(/<p(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle =
        "font-weight: 300; line-height: 1.5; font-size: 16px; margin: 0.5em 0";
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
    .replace(/<li/g, '<li style="font-size: 16px; margin-bottom: 0.5em"');

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
            color: textColor || defaultTextColor || "#000000",
            fontSize: "16px",
          }}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </tr>
    </table>
  );
};

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
  const formattedLink =
    link && link.length > 0
      ? link.startsWith("mailto:")
        ? link
        : !link.startsWith("http://") && !link.startsWith("https://")
          ? `https://${link}`
          : link
      : "#";

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
}> = ({ image, size, link, centered, isRounded }) => {
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
      alt="Email content"
      width={`${size}%`}
      style={imageStyle}
    />
  );

  // Add https:// prefix to link if it doesn't start with http:// or https://
  const formattedLink =
    link && !/^https?:\/\//i.test(link) ? `https://${link}` : link;

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
                            fontSize: "14px",
                            padding: "6px 16px",
                            whiteSpace: "nowrap",
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
              <tr>
                <td style={{ textAlign: "center", marginTop: "-50px" }}>
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    style={{
                      width: "100%",
                      marginTop: `-${size * 2.25}px`,
                      zIndex: "10",
                    }}
                  >
                    <tr>
                      <td align="center">
                        <YoutubeFilled
                          width={`${size}px`}
                          height={`${size}px`}
                          fill="#ff0000"
                        />
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
    style={{ paddingTop: "12px" }}
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
                                    paddingBottom: "4px",
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
                                    paddingBottom: "4px",
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
                                    <a
                                      href={card.buttonLink}
                                      target="_blank"
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
                                    </a>
                                  </td>
                                </tr>
                              )}
                            </table>
                          </td>
                        </tr>
                      </table>
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
  bulletType: "number" | "bullet";
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
  bulletType,
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
                  fontSize: "1.5rem",
                  fontWeight: "800",
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
          {items.map((item, index) => (
            <tr key={index}>
              <td
                style={{
                  padding: bulletType === "number" ? "10px 0" : "8px 0",
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
                        width: bulletType === "number" ? "48px" : "24px",
                        verticalAlign: "top",
                        paddingRight: "10px",
                      }}
                    >
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        width={bulletType === "number" ? "32px" : "24px"}
                        style={{
                          backgroundColor:
                            bulletType === "number"
                              ? bulletColor
                              : "transparent",
                          borderRadius: "50%",
                          height: bulletType === "number" ? "32px" : "21px",
                        }}
                        align="center"
                      >
                        <tr>
                          <td
                            align="center"
                            valign="middle"
                            style={{
                              color:
                                bulletType === "number"
                                  ? "#FFFFFF"
                                  : defaultTextColor,
                              fontFamily: defaultFont || "sans-serif",
                              fontSize:
                                bulletType === "number" ? "18px" : "36px",
                              fontWeight: "500",
                              height: bulletType === "number" ? "32px" : "21px",
                              lineHeight: "1",
                            }}
                          >
                            {bulletType === "number" ? index + 1 : "•"}
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
                                        item.description.split("\n").length - 1
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
}> = ({
  name,
  subtitle,
  avatar,
  links,
  defaultFont,
  defaultTextColor,
  hideAvatar,
}) => {
  const avatarUrl = avatar
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/email_assets/${avatar}`
    : "";

  const finalTextColor = defaultTextColor || "#000000";

  return (
    <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
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
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: "#d4d4d8",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#000000",
                              fontFamily: defaultFont || "sans-serif",
                              fontSize: "15px",
                              fontWeight: "300",
                            }}
                          >
                            {name && name.length > 0 ? name[0] : ""}
                          </div>
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
                  // Add mailto: prefix for mail icon links
                  if (!link.icon) {
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
                        {(() => {
                          const Icon =
                            socialIcons[link.icon as keyof typeof socialIcons];
                          return Icon ? (
                            <Icon
                              fill={finalTextColor}
                              width="18px"
                              height="18px"
                            />
                          ) : null;
                        })()}
                      </span>
                    );
                  }

                  // Format the URL with proper prefix
                  const formattedUrl =
                    link.icon === "mail"
                      ? !link.url.startsWith("mailto:")
                        ? `mailto:${link.url}`
                        : link.url
                      : !link.url.startsWith("http://") &&
                          !link.url.startsWith("https://")
                        ? `https://${link.url}`
                        : link.url;

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
                        {(() => {
                          const Icon =
                            socialIcons[link.icon as keyof typeof socialIcons];
                          return Icon ? (
                            <Icon
                              fill={finalTextColor}
                              width="18px"
                              height="18px"
                            />
                          ) : null;
                        })()}
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
                      <td
                        align="center"
                        style={{
                          fontSize: "14px",
                          color: secondary_text_color,
                          maxWidth: "384px",
                          margin: "0 auto 16px",
                          lineHeight: "1.4",
                        }}
                      >
                        {subtitle}
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
                    style={{ paddingBottom: "24px" }}
                  >
                    <tr>
                      <td align="center">
                        {links.map((link: any, index: number) => {
                          const Icon =
                            socialIcons[link.icon as keyof typeof socialIcons];
                          if (!Icon) return null;

                          // Format the URL with proper prefix
                          const formattedUrl =
                            link.icon === "mail"
                              ? !link.url.startsWith("mailto:")
                                ? `mailto:${link.url}`
                                : link.url
                              : !link.url.startsWith("http://") &&
                                  !link.url.startsWith("https://")
                                ? `https://${link.url}`
                                : link.url;

                          return (
                            <a
                              key={index}
                              href={formattedUrl}
                              style={{
                                display: "inline-block",
                                margin: "0 4px",
                                padding: "8px",
                                backgroundColor:
                                  socials_style === "filled"
                                    ? socials_color
                                    : "transparent",
                                border:
                                  socials_style === "outline"
                                    ? `1px solid ${socials_color}`
                                    : "none",
                                borderRadius: "50%",
                                lineHeight: 0,
                              }}
                            >
                              <Icon
                                width="18px"
                                height="18px"
                                fill={
                                  socials_style === "filled"
                                    ? socials_icon_color
                                    : socials_color
                                }
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
    defaultFont = "sans-serif",
    linkColor = "#0000ff",
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
                          <EmailSection key={`section-inset-${sectionIndex}`}>
                            {section.blocks.map((block, blockIndex) => {
                              const blockStyle = {
                                margin: "8px 0",
                                padding: "8px 0px 0px 0",
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
                                        style={blockStyle}
                                      >
                                        <tr>
                                          <td>
                                            <CustomText
                                              content={textData?.content || ""}
                                              font={textData?.font}
                                              textColor={textData?.textColor}
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
                                              textColor={textData?.textColor}
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
