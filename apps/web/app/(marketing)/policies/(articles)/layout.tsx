import { ChevronLeft } from "@church-space/ui/icons";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="max-w-2xl mx-auto my-12 flex flex-col ">
      <Link
        href="/policies"
        className="flex flex-row gap-1 items-center font-light text-muted-foreground text-sm cursor-pointer group mb-3 -translate-x-px"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-300">
          <ChevronLeft height={"14"} width={"14"} />
        </span>
        Back to Policies
      </Link>
      {children}
    </div>
  );
}
