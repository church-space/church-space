import React from "react";
import LinkListBuilderSidebar from "./sidebar";
import LinkListHeader from "./link-list-header";
import LinkListSocials from "./link-list-socials";

export default function LinkListBuilder() {
  return (
    <div className="relative flex p-2 pt-0 md:gap-4 md:p-4 md:pt-0">
      <LinkListBuilderSidebar />
      <div className="relative flex-1">
        <div className="mx-auto flex h-full max-w-sm flex-col rounded-md bg-blue-500">
          <LinkListHeader />
          <LinkListSocials style="filled" />
        </div>
      </div>
    </div>
  );
}
