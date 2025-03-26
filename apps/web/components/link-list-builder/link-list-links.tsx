import React from "react";

export interface LinkListLink {
  icon: string;
  url: string;
  text: string;
}

interface LinkListLinksProps {
  links: LinkListLink[];
  buttonColor: string;
  buttonTextColor: string;
}
export default function LinkListLinks({
  links,
  buttonColor,
  buttonTextColor,
}: LinkListLinksProps) {
  return (
    <div className="flex w-full flex-col gap-4 px-4">
      {links.map((link, index) => (
        <a href={link.url} key={index} target="_blank">
          <button
            className="flex w-full items-center justify-center text-pretty rounded-full py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
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
