import { Section, TextBlockData } from "@/types/blocks";
import {
  Container,
  Section as EmailSection,
  Head,
  Hr,
  Html,
  Img,
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
} from "@church-space/ui/icons";

interface EmailStyle {
  bgColor?: string;
  isInset?: boolean;
  isRounded?: boolean;
  emailBgColor?: string;
  defaultTextColor?: string;
  defaultFont?: string;
}

// Custom components for email blocks
const CustomText: React.FC<{
  content: string;
  font?: string;
  textColor?: string;
  defaultFont?: string;
  defaultTextColor?: string;
}> = ({ content, font, textColor, defaultFont, defaultTextColor }) => {
  // Parse HTML content and convert to React Email components
  const sanitizedContent = content
    .replace(/class="[^"]*"/g, "")
    // Add more space above h1 and h2, reduce space below all headings, and set font weights
    .replace(/<h1/g, '<h1 style="margin: 1.5em 0 0.5em 0; font-weight: 700"')
    .replace(/<h2/g, '<h2 style="margin: 1.2em 0 0.5em 0; font-weight: 700"')
    .replace(/<h3/g, '<h3 style="margin: 1em 0 0.5em 0; font-weight: 600"')
    // Add light weight and line height to paragraphs, preserving any existing style attributes
    .replace(/<p(?: style="([^"]*)")?/g, (match, existingStyle) => {
      const baseStyle = "font-weight: 300; line-height: 1.6";
      if (existingStyle) {
        return `<p style="${existingStyle}; ${baseStyle}"`;
      }
      return `<p style="${baseStyle}"`;
    })
    // Handle empty paragraphs for line breaks
    .replace(/<p style="[^"]*"><\/p>/g, '<div style="height: 1.6em"></div>');

  return (
    <div
      style={{
        fontFamily: font || defaultFont || "sans-serif",
        color: textColor || defaultTextColor || "#000000",
        maxWidth: "100%",
        margin: "0",
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
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
}> = ({
  text,
  link,
  color,
  textColor,
  style: buttonStyle,
  size,
  isRounded,
  defaultFont,
}) => {
  const buttonWidth = size === "full" ? "100%" : "auto";
  const borderRadius = isRounded ? "6px" : "0";

  return (
    <table
      style={{ width: "100%", textAlign: "center", margin: "12px 0" }}
      cellPadding="0"
      cellSpacing="0"
      border={0}
    >
      <tr>
        <td align="center" style={{ width: "100%" }}>
          <a
            href={link || "#"}
            target="_blank"
            style={{
              backgroundColor: buttonStyle === "filled" ? color : "transparent",
              border: `2px solid ${color}`,
              borderRadius,
              color: buttonStyle === "filled" ? textColor : color,
              display: "inline-block",
              fontFamily: defaultFont || "sans-serif",
              fontSize: "14px",
              fontWeight: "300",
              lineHeight: "1",
              padding: "10px 18px",
              textDecoration: "none",
              textAlign: "center",
              width: buttonWidth,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            {text}
          </a>
        </td>
      </tr>
    </table>
  );
};

const CustomDivider: React.FC<{
  color: string;
  margin: number;
}> = ({ color, margin }) => (
  <Hr
    style={{
      borderTop: `1px solid ${color}`,
      margin: `${margin * 1.2}px 0`,
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
  const containerStyle = {
    width: `${size}%`,
    margin: centered ? "0 auto" : "0",
    textAlign: centered ? ("center" as const) : ("left" as const),
  };

  const imageStyle = {
    maxWidth: "100%",
    height: "auto",
    borderRadius: isRounded ? "6px" : "0",
  };

  const ImageComponent = (
    <Img src={imageUrl} alt="Email content" width="100%" style={imageStyle} />
  );

  return (
    <div style={containerStyle}>
      {link ? (
        <a href={link} target="_blank" style={{ textDecoration: "none" }}>
          {ImageComponent}
        </a>
      ) : (
        ImageComponent
      )}
    </div>
  );
};

const CustomFileDownload: React.FC<{
  title: string;
  file: string;
  bgColor: string;
  textColor: string;
  defaultFont?: string;
  isRounded?: boolean;
}> = ({ title, file, bgColor, textColor, defaultFont, isRounded }) => (
  <table
    style={{ width: "100%", borderCollapse: "collapse", margin: "12px 0" }}
    cellPadding="0"
    cellSpacing="0"
  >
    <tr>
      <td>
        <a
          href={file}
          target="_blank"
          style={{
            textDecoration: "none",
            display: "block",
          }}
        >
          <div
            style={{
              backgroundColor: bgColor,
              borderRadius: isRounded ? "6px" : "0",
              padding: "8px 8px 8px 13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <File width="20px" height="20px" fill={textColor} />
              <span
                style={{
                  fontFamily: defaultFont || "sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: textColor,
                }}
              >
                {title}
              </span>
            </div>
            <div>
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
                }}
              >
                Download
              </span>
            </div>
          </div>
        </a>
      </td>
    </tr>
  </table>
);

const CustomVideo: React.FC<{
  url: string;
  size: number;
  centered: boolean;
  isRounded?: boolean;
}> = ({ url, size, centered, isRounded }) => {
  const videoId = extractYouTubeId(url);
  const thumbnailUrl = videoId
    ? `https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : "";

  const containerStyle = {
    width: `${size}%`,
    margin: centered ? "0 auto" : "0",
    position: "relative" as const,
  };

  return (
    <div style={containerStyle}>
      <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
        <tr>
          <td>
            <a
              href={url}
              target="_blank"
              style={{
                display: "block",
                position: "relative" as const,
                textDecoration: "none",
              }}
            >
              <Img
                src={thumbnailUrl}
                alt="Video thumbnail"
                width="100%"
                style={{
                  display: "block",
                  borderRadius: isRounded ? "6px" : "0",
                }}
              />
              <div
                style={{
                  position: "absolute" as const,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Youtube
                  width={`${size ? Math.max(48, Math.min(96, (96 * size) / 100)) : 68}px`}
                  height={`${size ? Math.max(34, Math.min(68, (68 * size) / 100)) : 48}px`}
                  fill="#FF0000"
                  secondaryfill="#FFFFFF"
                />
              </div>
            </a>
          </td>
        </tr>
      </table>
    </div>
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
  <div style={{ padding: "12px 0" }}>
    {(title || subtitle) && (
      <div style={{ marginBottom: "24px" }}>
        {title && (
          <div
            style={{
              fontFamily: defaultFont || "sans-serif",
              fontSize: "24px",
              fontWeight: "bold",
              color: textColor,
              marginBottom: "8px",
            }}
          >
            {title}
          </div>
        )}
        {subtitle && (
          <div
            style={{
              fontFamily: defaultFont || "sans-serif",
              fontSize: "16px",
              color: textColor,
              opacity: 0.8,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    )}
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
          <tr key={rowIndex}>
            {row.map((card: any, colIndex: number) => {
              const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/email_assets/${card.image}`;
              return (
                <td key={colIndex} style={{ width: "50%", padding: "8px" }}>
                  <div style={{ maxWidth: "100%" }}>
                    {card.image && (
                      <Img
                        src={imageUrl}
                        alt={card.title}
                        width="100%"
                        height="192"
                        style={{
                          objectFit: "cover",
                          borderRadius: isRounded ? "6px" : "0",
                          marginBottom: "16px",
                        }}
                      />
                    )}
                    <div style={{ padding: "0 4px" }}>
                      <div
                        style={{
                          fontFamily: defaultFont || "sans-serif",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: labelColor,
                          marginBottom: "4px",
                        }}
                      >
                        {card.label}
                      </div>
                      <div
                        style={{
                          fontFamily: defaultFont || "sans-serif",
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: textColor,
                          marginBottom: "4px",
                        }}
                      >
                        {card.title}
                      </div>
                      <div
                        style={{
                          fontFamily: defaultFont || "sans-serif",
                          fontSize: "14px",
                          color: textColor,
                          opacity: 0.8,
                          marginBottom: "16px",
                        }}
                      >
                        {card.description}
                      </div>
                      {card.buttonText && (
                        <a
                          href={card.buttonLink}
                          target="_blank"
                          style={{
                            backgroundColor: buttonColor,
                            borderRadius: isRounded ? "6px" : "0",
                            color: buttonTextColor,
                            display: "inline-block",
                            fontFamily: defaultFont || "sans-serif",
                            fontSize: "14px",
                            fontWeight: "500",
                            padding: "8px 16px",
                            textDecoration: "none",
                          }}
                        >
                          {card.buttonText}
                        </a>
                      )}
                    </div>
                  </div>
                </td>
              );
            })}
            {row.length === 1 && <td style={{ width: "50%" }}></td>}
          </tr>
        ))}
    </table>
  </div>
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
}> = ({
  title,
  subtitle,
  textColor,
  bulletColor,
  bulletType,
  items,
  defaultFont,
}) => (
  <div style={{ padding: "32px 0" }}>
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          fontFamily: defaultFont || "sans-serif",
          fontSize: "20px",
          fontWeight: "bold",
          color: textColor,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: defaultFont || "sans-serif",
          fontSize: "14px",
          color: textColor,
          opacity: 0.8,
        }}
      >
        {subtitle}
      </div>
    </div>
    <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
      {items.map((item, index) => (
        <tr key={index}>
          <td style={{ padding: "16px 0", verticalAlign: "top" }}>
            <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
              <tr>
                <td style={{ width: "40px", verticalAlign: "top" }}>
                  <div
                    style={{
                      width: bulletType === "number" ? "32px" : "24px",
                      height: bulletType === "number" ? "32px" : "24px",
                      backgroundColor:
                        bulletType === "number" ? bulletColor : "transparent",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: bulletType === "number" ? "#FFFFFF" : bulletColor,
                      fontFamily: defaultFont || "sans-serif",
                      fontSize: bulletType === "number" ? "18px" : "24px",
                      fontWeight: "500",
                    }}
                  >
                    {bulletType === "number" ? index + 1 : "•"}
                  </div>
                </td>
                <td>
                  <div
                    style={{
                      fontFamily: defaultFont || "sans-serif",
                      fontSize: "18px",
                      fontWeight: "500",
                      color: textColor,
                      marginBottom: "4px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: defaultFont || "sans-serif",
                      fontSize: "14px",
                      color: textColor,
                      opacity: 0.8,
                    }}
                  >
                    {item.description}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      ))}
    </table>
  </div>
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
}> = ({ name, subtitle, avatar, links, defaultFont, defaultTextColor }) => {
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
                            backgroundColor: "#e2e8f0",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: finalTextColor,
                            fontFamily: defaultFont || "sans-serif",
                            fontSize: "18px",
                            fontWeight: "500",
                          }}
                        >
                          {name[0]}
                        </div>
                      )}
                    </td>
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
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
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
                ))}
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

// Main generator function
export function generateEmailCode(
  sections: Section[],
  style: EmailStyle,
  footerData?: any
): React.ReactElement {
  const {
    bgColor = "#ffffff",
    isInset = false,
    isRounded = false,
    emailBgColor = "#eeeeee",
    defaultTextColor = "#000000",
    defaultFont = "sans-serif",
  } = style;

  const containerStyle = {
    backgroundColor: isInset ? emailBgColor : bgColor,
    padding: isInset ? "18px 5px" : "18px",
  };

  const contentStyle = {
    backgroundColor: isInset ? bgColor : undefined,
    padding: isInset ? "0px 20px" : undefined,
    borderRadius: isInset && isRounded ? "12px" : undefined,
    maxWidth: "672px",
  };

  return (
    <Html>
      <Head>
        <title>Email Preview</title>
      </Head>
      <div style={containerStyle}>
        <Container style={contentStyle}>
          {sections.map((section, sectionIndex) => (
            <EmailSection key={sectionIndex}>
              {section.blocks.map((block, blockIndex) => {
                const blockStyle = { margin: "20px 0" };
                const Component = (() => {
                  switch (block.type) {
                    case "text":
                      const textData = block.data as TextBlockData;
                      return (
                        <div style={blockStyle}>
                          <CustomText
                            content={textData?.content || ""}
                            font={textData?.font}
                            textColor={textData?.textColor}
                            defaultFont={defaultFont}
                            defaultTextColor={defaultTextColor}
                          />
                        </div>
                      );
                    case "button":
                      return (
                        <div style={blockStyle}>
                          <CustomButton
                            {...(block.data as any)}
                            isRounded={isRounded}
                            defaultFont={defaultFont}
                          />
                        </div>
                      );
                    case "divider":
                      return (
                        <div style={blockStyle}>
                          <CustomDivider {...(block.data as any)} />
                        </div>
                      );
                    case "image":
                      return (
                        <div style={blockStyle}>
                          <CustomImage
                            {...(block.data as any)}
                            isRounded={isRounded}
                          />
                        </div>
                      );
                    case "file-download":
                      return (
                        <div style={blockStyle}>
                          <CustomFileDownload
                            {...(block.data as any)}
                            defaultFont={defaultFont}
                            isRounded={isRounded}
                          />
                        </div>
                      );
                    case "video":
                      return (
                        <div style={blockStyle}>
                          <CustomVideo
                            {...(block.data as any)}
                            isRounded={isRounded}
                          />
                        </div>
                      );
                    case "cards":
                      return (
                        <div style={blockStyle}>
                          <CustomCards
                            {...(block.data as any)}
                            defaultFont={defaultFont}
                            isRounded={isRounded}
                          />
                        </div>
                      );
                    case "list":
                      return (
                        <div style={blockStyle}>
                          <CustomList
                            {...(block.data as any)}
                            defaultFont={defaultFont}
                          />
                        </div>
                      );
                    case "author":
                      return (
                        <div style={blockStyle}>
                          <CustomAuthor
                            {...(block.data as any)}
                            defaultFont={defaultFont}
                            defaultTextColor={defaultTextColor}
                          />
                        </div>
                      );
                    default:
                      return null;
                  }
                })();
                return <div key={blockIndex}>{Component}</div>;
              })}
            </EmailSection>
          ))}
        </Container>
      </div>
    </Html>
  );
}
