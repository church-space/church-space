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
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Church Space — Email for Planning Center" },
  keywords: ["Church Space", "Email", "Planning Center", "church email"],
  description:
    "Church Space is an email marketing platform purpose-built for churches.",
};

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
            <h2 className="max-w-2xl text-balance text-left text-5xl font-bold sm:text-center md:text-6xl">
              Send{" "}
              <AuroraText
                colors={["#3C63E0", "#AA5BBB", "#DA7D74", "#EBC495"]}
                speed={1}
              >
                beautiful
              </AuroraText>{" "}
              emails for half the cost
            </h2>
            <p className="max-w-sm text-pretty text-left text-xl text-secondary-foreground/80 sm:mx-auto sm:text-center md:max-w-xl md:text-center md:text-2xl">
              Beauty shouldn&apos;t come at a cost. Have unlimited contacts, and
              only pay for the emails you send.
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-20 sm:grid-cols-2 sm:gap-12">
            {/* Pay for what you use */}
            <div className="mx-auto flex h-full w-full flex-col gap-4 rounded-xl border shadow-sm sm:max-w-none">
              <div className="mx-auto h-52 w-full items-center gap-2 overflow-hidden rounded-t-xl border-b bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary">
                <AnimatedBeamDemo />
              </div>
              <div className="flex flex-col gap-2 px-4 pb-4">
                <h3 className="text-lg font-bold">Only pay for what you use</h3>
                <p className="text-sm text-muted-foreground">
                  Quit paying for unused sends and limited contacts. Pick an
                  affordable plan that works for your church.{" "}
                  <Link
                    href="/pricing"
                    className="underline underline-offset-4 transition-all duration-200 hover:text-white"
                  >
                    View our plans and pricing here.
                  </Link>
                </p>
              </div>
            </div>

            {/* metrics and analytics */}
            <div className="relative mx-auto flex h-full w-full flex-col gap-4 rounded-xl border shadow-sm sm:max-w-none">
              <EmailMetricsCard />

              <div className="flex flex-col gap-2 px-4 pb-4">
                <h3 className="text-lg font-bold">Metrics and Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track how your emails are performing and how your audience is
                  engaging with them. We provide stats for open rates, link
                  clicks, unsubscribes, spam complaints, and bounced emails.
                </p>
              </div>
            </div>

            {/* drag and drop editor */}
            <div className="mx-auto flex h-full w-full flex-col gap-4 rounded-xl border shadow-sm sm:max-w-none">
              <div className="relative mx-auto h-52 w-full items-center gap-2 overflow-hidden rounded-t-xl border-b bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary">
                <div className="absolute left-4 top-8 z-10 flex w-32 -rotate-12 flex-col items-center gap-1 rounded-md border bg-card p-3 text-foreground shadow-sm hover:bg-accent/80">
                  <span className="text-primary">
                    <Image />
                  </span>
                  <span>Image</span>
                </div>
                <div className="absolute left-32 top-20 z-20 animate-aurora">
                  <CursorDefault height={"30"} width={"30"} />
                </div>
                <div className="absolute bottom-0 right-0 z-0 h-40 w-[70%] rounded-tl-lg border bg-gradient-to-br from-accent to-primary/20"></div>
              </div>
              <div className="flex flex-col gap-2 px-4 pb-4">
                <h3 className="text-lg font-bold">Drag and Drop Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Our fluid drag and drop editor provides you with an easy to
                  use way to create beautiful emails for your church, groups,
                  events, and more.
                </p>
              </div>
            </div>
            {/* 9 block types */}
            <div className="mx-auto flex h-full w-full flex-col gap-3 rounded-xl border shadow-sm sm:max-w-none">
              <div className="mx-auto grid h-52 w-full grid-cols-3 rounded-t-xl border-b bg-gradient-to-br from-muted/40 to-muted/60">
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
                    <span className="">{block.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 px-4 pb-4">
                <h3 className="text-lg font-bold">Nine Block Types</h3>
                <p className="text-sm text-muted-foreground">
                  Our nine block types help you take your email from idea to
                  reality. The blocks are designed to be easy to flexible, easy
                  to use, and responsive for any size screen.
                </p>
              </div>
            </div>
          </div>
        </div>

        <LinksSection />
        <div className="w-full space-y-8 bg-gradient-to-b from-muted/50 to-background px-4 py-28 sm:pb-32">
          <h2 className="mx-auto w-full max-w-2xl text-balance text-left text-5xl font-bold sm:text-center md:text-6xl">
            Why choose Church Space?
          </h2>
          <p className="w-full max-w-4xl text-pretty text-left text-lg font-light sm:mx-auto">
            There are a dozen ways to send emails to your church, and many of
            them do a good job. But if you want a solution that integrates
            seamlessly with Planning Center, has all the features a church
            needs, and is affordable, Church Space is the right choice.
          </p>
          <p className="w-full max-w-4xl text-pretty text-left text-lg font-light sm:mx-auto">
            When we started working on Church Space, we set out with three goals
            in mind:
          </p>
          <div className="flex w-full max-w-4xl flex-col gap-2 sm:mx-auto">
            <h3 className="text-xl font-bold">
              1. Unlimited Planning Center contacts
            </h3>
            <p className="text-pretty text-left text-lg font-light">
              Our church&apos;s Planning Center database is always growing, but
              that doesn&apos;t mean that every person is an &quot;active
              contact&quot; in our mailing app. We made a solution that frees
              your from the stress of keeping a contact list low just so you
              don&apos;t hit your limit. Focus on reaching your people, not
              cleaning a list.
            </p>
          </div>
          <div className="flex w-full max-w-4xl flex-col gap-2 sm:mx-auto">
            <h3 className="text-xl font-bold">
              2. Easy to use but still powerful
            </h3>
            <p className="text-pretty text-left text-lg">
              While other mailing apps exists, they tend to either lack features
              that we need or become so complicated that they&apos;re hard for
              our team to use. We made a beautiful solution that is easy to use
              but doesn&apos;t lack important features like automations,
              analytics, or a Planning Center integration.
            </p>
          </div>
          <div className="flex w-full max-w-4xl flex-col gap-2 sm:mx-auto">
            <h3 className="text-xl font-bold">
              3. Affordable and fairly priced
            </h3>
            <p className="text-pretty text-left text-lg">
              With other mailing apps, we were paying for contacts that
              weren&apos;t active and we were paying for product sales features
              that we as a church don&apos;t need. That&apos;s why we decided to
              cut the bloat and price Church Space based on the actual emails
              you send, not the contacts you have.
            </p>
          </div>
          <p className="w-full max-w-4xl text-pretty text-left text-lg font-light sm:mx-auto">
            Ultimately, we made Church Space because it&apos;s what our church
            needed. We hope that it can serve you and your church as well. If
            you have any questions, feel free to reach out to us at{" "}
            <a
              href="mailto:hello@churchspace.co"
              className="underline underline-offset-4 transition-all duration-200 hover:underline-offset-8"
            >
              hello@churchspace.co
            </a>
            .
          </p>
        </div>
        <FAQSection className="px-4 pb-8 pt-12 md:pb-20 md:pt-20" />
      </div>
    </div>
  );
}
