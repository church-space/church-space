import { ChevronLeft } from "@church-space/ui/icons";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto mb-32 mt-12 flex max-w-3xl flex-col px-5">
      <Link
        href="/policies"
        className="group mb-3 flex -translate-x-px cursor-pointer flex-row items-center gap-1 text-sm font-light text-muted-foreground"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          <ChevronLeft height={"14"} width={"14"} />
        </span>
        Back to Policies
      </Link>
      {children}
    </div>
  );
}
