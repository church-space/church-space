import { Button } from "@church-space/ui/button";
import { ChurchSpaceBlack, Search } from "@church-space/ui/icons";
import Link from "next/link";
import {
  TooltipTrigger,
  Tooltip,
  TooltipContent,
} from "@church-space/ui/tooltip";

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-8 w-8 gap-1 px-0 py-0"
                variant="outline"
              >
                <Search strokewidth={1.5} height={"20"} width={"20"} />
                <span className="sr-only">Search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="border">
              Search for articles
            </TooltipContent>
          </Tooltip>
          <Link href="mailto:support@churchspace.co">
            <Button asChild size="sm">
              <span>Contact Support</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
