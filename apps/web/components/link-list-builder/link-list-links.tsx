import React from "react";

interface Link {
  icon: string;
  url: string;
  text: string;
}

interface LinkListLinksProps {
  links: Link[];
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
      {links.map((link) => (
        <a href={link.url} key={link.url} target="_blank">
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
