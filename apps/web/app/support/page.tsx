import React from "react";
import { Input } from "@church-space/ui/input";
import {
  Search as SearchIcon,
  Waypoints,
  Email,
  Robot,
  Qrcode,
  LinkFilled,
  Organization,
} from "@church-space/ui/icons";
import Link from "next/link";
import PlanningCenter from "@/public/pco-logo.png";
import Image from "next/image";
import { Separator } from "@church-space/ui/separator";

const topics = [
  {
    title: "Getting Started",
    description: "Begin your journey with the Church Space",
    link: "/support/getting-started",
    icon: <Waypoints height={"38"} width={"38"} />,
  },
  {
    title: "Account and Billing",
    description: "Learn how to set up and manage your account",
    link: "/support/account-and-billing",
    icon: <Organization height={"38"} width={"38"} />,
  },
  {
    title: "Emails",
    description: "Learn how to set up and manage your emails",
    link: "/support/emails",
    icon: <Email height={"38"} width={"38"} />,
  },
  {
    title: "Automations",
    description: "Automate your church communications",
    link: "/support/automations",
    icon: <Robot height={"38"} width={"38"} />,
  },
  {
    title: "Planning Center Integration",
    description:
      "Learn how to set up and manage your Planning Center integration",
    link: "/support/planning-center-integration",
    icon: (
      <Image
        src={PlanningCenter}
        alt="Planning Center"
        height={38}
        width={38}
      />
    ),
  },
  {
    title: "Link Pages",
    description: "Create and manage your link pages",
    link: "/support/link-pages",
    icon: <LinkFilled height={"38"} width={"38"} />,
  },
  {
    title: "QR Codes",
    description: "Create and manage your QR codes",
    link: "/support/qr-codes",
    icon: <Qrcode height={"38"} width={"38"} />,
  },
];

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="flex h-96 w-full flex-col items-center justify-center bg-primary px-4 font-bold">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-white">
          <h1 className="text-5xl font-semibold">How can we help?</h1>

          <div className="relative w-full">
            <Input
              autoFocus
              className="peer h-12 w-full bg-card ps-10 font-normal text-foreground shadow-lg"
              placeholder="Search for questions, keywords, or topics"
              maxLength={250}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <SearchIcon height={"24"} width={"24"} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4 pt-10">
        <h1 className="mb-4 text-2xl font-bold">Topics</h1>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link href={topic.link} key={topic.link}>
              <div className="flex h-full w-full flex-row items-center gap-4 rounded-md border bg-muted p-5 pt-6 shadow-md transition-colors duration-300 hover:bg-muted/50 sm:flex-col sm:gap-0">
                {topic.icon}
                <div className="flex w-full flex-col items-start sm:items-center">
                  <h3 className="mb-1 text-lg font-semibold sm:mt-4 sm:text-center">
                    {topic.title}
                  </h3>
                  <p className="text-pretty text-sm text-muted-foreground sm:text-center">
                    {topic.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Separator className="mb-8 mt-16 w-full max-w-5xl" />
      <div className="mx-auto mb-20 flex w-full max-w-5xl flex-col px-4 pt-10">
        <h1 className="mb-4 text-2xl font-bold">Helpful Articles</h1>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <p className="cursor-pointer font-semibold text-blue-500 hover:underline">
            Article 1
          </p>
          <p className="cursor-pointer font-semibold text-blue-500 hover:underline">
            Article 2
          </p>
          <p className="cursor-pointer font-semibold text-blue-500 hover:underline">
            Article 3
          </p>
        </div>
      </div>
    </div>
  );
}
