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
import { AuroraText } from "@church-space/ui/aurora-text";
import EmailMetricsCard from "@/components/marketing/sections/email-metrics-card";
import { AnimatedBeamDemo } from "@/components/marketing/sections/sending-animation";

export const allBlockTypes = [
  { label: "Text", type: "text", icon: Typography },
  { label: "Image", type: "image", icon: Image },
  {
    label: "Button",
    type: "button",
    icon: ButtonIcon,
  },
  {
    label: "File",
    type: "file-download",
    icon: Download,
  },
  {
    label: "Divider",
    type: "divider",
    icon: Divider,
  },
  { label: "Video", type: "video", icon: Video },
  { label: "Cards", type: "cards", icon: Grid },
  { label: "List", type: "list", icon: List },
  {
    label: "Author",
    type: "author",
    icon: CircleUser,
  },
];

export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero2 />
      <div className="mx-auto w-full -translate-y-16 pt-0">
        <PcoSection />

        <div id="emails" className="w-full space-y-8 px-4 py-28 sm:pb-32">
          <div className="mb-12 flex flex-col gap-4 px-2 md:items-center">
            <h1 className="max-w-2xl text-balance text-left text-5xl font-bold sm:text-center md:text-6xl">
              Send{" "}
              <AuroraText
                colors={["#3C63E0", "#AA5BBB", "#DA7D74", "#EBC495"]}
                speed={1}
              >
                beautiful
              </AuroraText>{" "}
              emails for half the cost
            </h1>
            <p className="max-w-sm text-pretty text-left text-xl text-muted-foreground sm:mx-auto sm:text-center md:max-w-xl md:text-center md:text-2xl">
              Beauty shouldn&apos;t come at a cost. Have unlimited contacts, and
              only pay for the emails you send.
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-20 sm:grid-cols-2 sm:gap-12">
            {/* Pay for what you use */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-4 rounded-xl border shadow-sm sm:max-w-none">
              <div className="mx-auto h-52 w-full items-center gap-2 overflow-hidden rounded-t-xl border-b bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary">
                <AnimatedBeamDemo />
              </div>
              <div className="flex flex-col gap-2 px-4 pb-4">
                <h3 className="text-lg font-bold">Only pay for what you use</h3>
                <p className="text-sm text-muted-foreground">
                  Quit paying for unused sends and limited contacts. Pick a plan
                  that works for you.
                </p>
              </div>
            </div>

            {/* metrics and analytics */}
            <div className="relative mx-auto flex h-full w-full flex-col justify-between gap-4 rounded-xl border shadow-sm sm:max-w-none">
              <EmailMetricsCard />

              <div className="flex flex-col gap-2 px-4 pb-4">
                <h3 className="text-lg font-bold">Metrics and Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track how your emails are performing and how your audience is
                  engaging with them.
                </p>
              </div>
            </div>

            {/* drag and drop editor */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-4 rounded-xl border shadow-sm sm:max-w-none">
              <div className="relative mx-auto h-52 w-full items-center gap-2 overflow-hidden rounded-t-xl border-b bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary">
                <div className="absolute left-4 top-8 z-10 flex w-32 -rotate-12 flex-col items-center gap-1 rounded-md border bg-card p-3 text-foreground shadow-sm hover:bg-accent/80">
                  <Image />
                  <span>Image</span>
                </div>
                <div className="animate-aurora absolute left-32 top-20 z-20">
                  <CursorDefault height={"30"} width={"30"} />
                </div>
                <div className="absolute bottom-0 right-0 z-0 h-40 w-[70%] rounded-tl-lg border bg-gradient-to-br from-accent to-primary/20"></div>
              </div>
              <div className="flex flex-col gap-2 px-4 pb-4">
                <h3 className="text-lg font-bold">Drag and Drop Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Building beautiful emails is a joy with our fluid drag and
                  drop editor.
                </p>
              </div>
            </div>
            {/* 9 block types */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-3 rounded-xl border shadow-sm sm:max-w-none">
              <div className="mx-auto grid h-52 w-full grid-cols-3 rounded-t-xl border-b bg-gradient-to-br from-muted/40 to-muted/60 text-primary">
                {allBlockTypes.map((block) => (
                  <div
                    key={block.type}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border bg-transparent p-3 hover:bg-accent/80",
                      block.type === "divider" && "rounded-none border-0",
                      block.type === "file-download" &&
                        "rounded-none border-y-0 border-l-0",
                      block.type === "video" &&
                        "rounded-none border-y-0 border-r-0",
                      block.type === "image" &&
                        "rounded-none border-x-0 border-t-0",
                      block.type === "list" &&
                        "rounded-none border-x-0 border-b-0",
                      block.type === "author" &&
                        "rounded-none border-b-0 border-r-0",
                      block.type === "cards" &&
                        "rounded-none border-b-0 border-l-0",
                      block.type === "text" &&
                        "rounded-b-none rounded-r-none border-l-0 border-t-0",
                      block.type === "button" &&
                        "rounded-b-none rounded-l-none border-r-0 border-t-0",
                    )}
                  >
                    <span className="text-primary">
                      <block.icon />
                    </span>
                    <span>{block.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 px-4 pb-4">
                <h3 className="text-lg font-bold">Nine Block Types</h3>
                <p className="text-sm text-muted-foreground">
                  Our nine block types help you take your email from idea to
                  reality.
                </p>
              </div>
            </div>
          </div>
        </div>

        <LinksSection />
        {/* <div className="w-full space-y-8 px-4 py-28 sm:pb-32">
          <h1 className="mx-auto w-full max-w-2xl text-balance text-left text-5xl font-bold sm:text-center md:text-6xl">
            Why choose Church Space?
          </h1>
          <p className="w-full max-w-4xl text-pretty text-left text-lg sm:mx-auto">
            There are a dozen ways to send emails to your church.
          </p>
        </div> */}
        <FAQSection className="px-4 pb-8 pt-20 md:pb-20 md:pt-36" />
      </div>
    </div>
  );
}
