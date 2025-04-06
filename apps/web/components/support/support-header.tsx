import { Button } from "@church-space/ui/button";
import { ChurchSpaceBlack } from "@church-space/ui/icons";
import Link from "next/link";
import MobileHeaderSheet from "../marketing/mobile-header-sheet";

export default function SupportHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-nowrap font-semibold leading-none tracking-tighter text-foreground sm:text-lg"
        >
          <ChurchSpaceBlack fill="currentColor" height={"26"} width={"26"} />
          Church Space
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/support">
            <Button asChild size="sm">
              <span>Search</span>
            </Button>
          </Link>
          <Link href="mailto:support@churchspace.co">
            <Button asChild size="sm">
              <span>Contact Support</span>
            </Button>
          </Link>
          <MobileHeaderSheet />
        </div>
      </div>
    </header>
  );
}
