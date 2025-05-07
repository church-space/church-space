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
  Email,
  Grid,
  HourglassClock,
  Image,
  List,
  Typography,
  Video,
} from "@church-space/ui/icons";
import { AuroraText } from "@church-space/ui/aurora-text";
import EmailMetricsCard from "@/components/marketing/sections/email-metrics-card";
import { AnimatedList } from "@church-space/ui/animated-list";
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

interface Item {
  name: string;
}

let notifications = [
  { name: "Emily Johnson" },
  { name: "Michael Chen" },
  { name: "Sophia Rodriguez" },
  { name: "James Williams" },
  { name: "Olivia Martinez" },
  { name: "Noah Garcia" },
  { name: "Ava Thompson" },
  { name: "Ethan Nguyen" },
  { name: "Isabella Kim" },
  { name: "William Davis" },
  { name: "Mia Patel" },
  { name: "Benjamin Wilson" },
  { name: "Charlotte Lee" },
  { name: "Lucas Brown" },
  { name: "Amelia Jackson" },
  { name: "Alexander Wright" },
  { name: "Harper Anderson" },
  { name: "Daniel Taylor" },
  { name: "Abigail Thomas" },
  { name: "Matthew Robinson" },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-1.5 px-2.5",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <CircleUser height={"25"} width={"25"} />

        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm font-semibold">{name}</span>
          </figcaption>
          <p className="text-xs font-normal">Added from Planning Center</p>
        </div>
      </div>
    </figure>
  );
};

export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero2 />
      <div className="mx-auto w-full pb-12 pt-0 md:pt-12">
        <div
          id="emails"
          className="w-full space-y-8 px-4 py-10 pb-20 sm:py-20 sm:pb-32"
        >
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
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-20 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3">
            {/* Pay for what you use */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-4 rounded-xl sm:max-w-none">
              <div className="mx-auto h-52 w-full items-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary shadow-sm">
                <AnimatedBeamDemo />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Pay for what you use</h3>
                <p className="text-sm text-muted-foreground">
                  Quit paying for unused sends. Pick a plan that works for you.
                </p>
              </div>
            </div>
            {/* unlimited contacts */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-4 rounded-xl sm:max-w-none">
              <div className="mx-auto h-52 w-full items-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary shadow-sm">
                <AnimatedList>
                  {notifications.map((item, idx) => (
                    <Notification {...item} key={idx} />
                  ))}
                </AnimatedList>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Unlimited Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  Don&apos;t stress about hitting a limit. Add and group
                  unlimited contacts.
                </p>
              </div>
            </div>
            {/* automations */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-4 rounded-xl sm:max-w-none">
              <div className="mx-auto flex h-52 w-full flex-col items-start gap-2 overflow-hidden rounded-lg border bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary shadow-sm">
                <div className="flex w-[600px] items-center gap-2 rounded-md border border-yellow-500 bg-yellow-50 p-2 text-lg font-medium text-yellow-500">
                  <span className="animate-pulse">
                    <HourglassClock height={"26"} width={"26"} />
                  </span>
                  Wait 3 hours
                </div>
                <div className="flex w-[600px] items-center gap-2 rounded-md border border-primary bg-primary/10 p-2 text-lg font-medium text-primary">
                  <Email height={"26"} width={"26"} />
                  Send &quot;Welcome&quot;
                </div>
                <div className="flex w-[600px] items-center gap-2 rounded-md border border-yellow-500 bg-yellow-50 p-2 text-lg font-medium text-yellow-500">
                  <span className="animate-pulse">
                    <HourglassClock height={"26"} width={"26"} />
                  </span>
                  Wait 5 days
                </div>
                <div className="flex w-[600px] items-center gap-2 rounded-md border border-primary bg-primary/10 p-2 text-lg font-medium text-primary">
                  <Email height={"26"} width={"26"} />
                  Send &quot;See you Sunday!&quot;
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Email Automations</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically send emails to people when they are added or
                  removed from a list.
                </p>
              </div>
            </div>
            {/* metrics and analytics */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-4 rounded-xl sm:max-w-none">
              <EmailMetricsCard />

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Metrics and Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track how your emails are preforming, and how your audience is
                  engaging.
                </p>
              </div>
            </div>

            {/* drag and drop editor */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-4 rounded-xl sm:max-w-none">
              <div className="relative mx-auto h-52 w-full items-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary shadow-sm">
                <div className="absolute left-4 top-8 z-10 flex w-32 -rotate-12 flex-col items-center gap-1 rounded-md border bg-card p-3 text-foreground shadow-sm hover:bg-accent/80">
                  <Image />
                  <span>Image</span>
                </div>
                <div className="animate-aurora absolute left-32 top-20 z-20">
                  <CursorDefault height={"30"} width={"30"} />
                </div>
                <div className="absolute bottom-0 right-0 z-0 h-40 w-[70%] rounded-br-md rounded-tl-lg border bg-gradient-to-br from-accent to-primary/20"></div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Drag and Drop Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Building beautiful emails is a joy with our fluid drag and
                  drop editor.
                </p>
              </div>
            </div>
            {/* 9 block types */}
            <div className="mx-auto flex h-full w-full flex-col justify-between gap-3 rounded-xl sm:max-w-none">
              <div className="mx-auto grid h-52 w-full grid-cols-3 bg-gradient-to-br from-muted/40 to-muted/60 text-primary shadow-sm">
                {allBlockTypes.map((block) => (
                  <div
                    key={block.type}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border bg-transparent p-3 shadow-sm hover:bg-accent/80",
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
                    <span className="text-primary">
                      <block.icon />
                    </span>
                    <span>{block.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Nine Block Types</h3>
                <p className="text-sm text-muted-foreground">
                  Our nine block types help you take your email from idea to
                  reality.
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
