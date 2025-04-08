import { LinkFilled } from "@church-space/ui/icons";
import React from "react";

const ensureHttps = (url: string, type: string) => {
  if (!url) return "#";
  if (url.startsWith("mailto:")) return url;
  if (type === "mail") {
    if (url.startsWith("mailto:")) return url;
    return `mailto:${url}`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

export interface LinkListLink {
  type: string;
  url: string;
  text: string;
  order: number;
}

interface LinkListLinksProps {
  links: LinkListLink[];
  buttonColor: string;
  buttonTextColor: string;
  mode: "live" | "builder";
}

export default function LinkListLinks({
  links,
  buttonColor,
  buttonTextColor,
  mode,
}: LinkListLinksProps) {
  const filteredLinks =
    mode === "live" ? links.filter((link) => link.url && link.text) : links;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
      {filteredLinks.map((link, index) => {
        const buttonElement = (
          <button
            key={index}
            className="flex min-h-12 w-full items-center justify-center text-pretty rounded-full py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor,
            }}
          >
            {link.text}
          </button>
        );

        return mode === "live" ? (
          <a
            href={ensureHttps(link.url, link.type)}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            // onClick={() => {
            //   const trackingData = JSON.stringify({ url: link.url, timestamp: Date.now() });
            //   if (navigator.sendBeacon) {
            //     navigator.sendBeacon('/track-click', trackingData);
            //   } else {
            //     // Fallback for browsers that don't support sendBeacon
            //     fetch('/track-click', {
            //       method: 'POST',
            //       body: trackingData,
            //       keepalive: true,
            //     });
            //   }
            // }}
          >
            {buttonElement}
          </a>
        ) : (
          buttonElement
        );
      })}
      {filteredLinks.length === 0 && mode === "builder" && (
        <div className="flex w-full flex-col items-center justify-center rounded-md border bg-muted p-3 text-center text-sm text-muted-foreground">
          <LinkFilled height={"28"} width={"28"} />
          <h4 className="mb-1 mt-5 text-lg font-semibold">
            Let&apos;s get started!
          </h4>
          <p className="text-pretty px-4 text-sm">
            To add your first link, click the &quot;Links&quot; tab on the left
            and click &quot;Add Link&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
