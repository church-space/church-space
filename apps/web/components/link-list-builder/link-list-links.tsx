import React from "react";

export interface LinkListLink {
  type: string;
  url: string;
  text: string;
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
    <div className="flex w-full flex-col gap-4 px-4">
      {filteredLinks.map((link, index) => (
        <a href={link.url} key={index} target="_blank">
          <button
            className="flex min-h-12 w-full items-center justify-center text-pretty rounded-full py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor,
            }}
          >
            {link.text}
          </button>
        </a>
      ))}
    </div>
  );
}
