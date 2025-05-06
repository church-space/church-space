import Hero2 from "@/components/marketing/hero-2";
import FAQSection from "@/components/marketing/sections/faq";
import LinksSection from "@/components/marketing/sections/links";
import PcoSection from "@/components/marketing/sections/pco";
import { cn } from "@church-space/ui/cn";
import {
  Button as ButtonIcon,
  CircleUser,
  CursorDefault,
  Divider,
  Download,
  Grid,
  Image,
  List,
  Typography,
  Video,
} from "@church-space/ui/icons";

export const allBlockTypes = [
  { label: "Text", type: "text", icon: Typography },
  { label: "Image", type: "image", icon: Image },
  { label: "Button", type: "button", icon: ButtonIcon },
  { label: "File", type: "file-download", icon: Download },
  { label: "Divider", type: "divider", icon: Divider },
  { label: "Video", type: "video", icon: Video },
  { label: "Cards", type: "cards", icon: Grid },
  { label: "List", type: "list", icon: List },
  { label: "Author", type: "author", icon: CircleUser },
];

export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero2 />
      <div className="mx-auto w-full pb-12 pt-0 md:pt-12">
        <div id="emails" className="w-full space-y-8 px-4 py-10 sm:py-20">
          <div className="mb-12 flex flex-col gap-4 px-2 md:items-center">
            <h1 className="text-5xl font-semibold md:max-w-full md:text-6xl">
              Craft beautiful emails
            </h1>
            <p className="max-w-sm text-pretty text-left text-xl text-muted-foreground md:max-w-xl md:text-center md:text-2xl">
              Our drag and drop editor makes it easy to create beautiful emails
              for your church.
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex h-full flex-col justify-between gap-6 rounded-xl border bg-accent p-8">
              <div className="mx-auto grid h-52 w-full max-w-sm grid-cols-3">
                {allBlockTypes.map((block) => (
                  <div
                    key={block.type}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border bg-background p-3 shadow-sm hover:bg-accent/80",
                      block.type === "divider" && "rounded-none border-0",
                      block.type === "file-download" &&
                        "rounded-none border-y-0",
                      block.type === "video" && "rounded-none border-y-0",
                      block.type === "image" && "rounded-none border-x-0",
                      block.type === "list" && "rounded-none border-x-0",
                      block.type === "author" &&
                        "rounded-l-none rounded-t-none",
                      block.type === "cards" && "rounded-r-none rounded-t-none",
                      block.type === "text" && "rounded-b-none rounded-r-none",
                      block.type === "button" &&
                        "rounded-b-none rounded-l-none",
                    )}
                  >
                    <block.icon />
                    <span>{block.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Nine Block Types</h3>
                <p className="text-sm text-muted-foreground">
                  Our nine block types help you easily take your email from idea
                  to reality.
                </p>
              </div>
            </div>

            <div className="flex h-full flex-col justify-between gap-4 rounded-xl border bg-accent p-8">
              <div className="relative mx-auto h-52 w-full max-w-sm items-center gap-2 rounded-lg border bg-background text-primary">
                <div className="absolute left-4 top-8 z-10 flex w-32 -rotate-12 flex-col items-center gap-1 rounded-md border bg-card p-3 text-foreground shadow-sm hover:bg-accent/80">
                  <Image />
                  <span>Image</span>
                </div>
                <div className="absolute left-32 top-20 z-20">
                  <CursorDefault height={"30"} width={"30"} />
                </div>
                <div className="absolute bottom-0 right-0 z-0 h-40 w-24 rounded-tl-lg bg-primary sm:w-48 md:w-32 lg:w-48"></div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Drag and Drop Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Bring your dream emails to life without the hassle.
                </p>
              </div>
            </div>
          </div>
        </div>
        <PcoSection />

        <LinksSection />
        <FAQSection className="px-4 pb-8 pt-20 md:pb-20 md:pt-36" />
      </div>
    </div>
  );
}
