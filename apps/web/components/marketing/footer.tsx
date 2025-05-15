import {
  ChurchSpaceBlack,
  Facebook,
  Instagram,
  XTwitter,
  Youtube,
} from "@church-space/ui/icons";
import Link from "next/link";

const links = [
  {
    group: "Features",
    items: [
      {
        title: "Email",
        href: "/#emails",
      },
      {
        title: "Automations",
        href: "/#automations",
      },
      {
        title: "QR Codes",
        href: "/#links",
      },
      {
        title: "Link Pages",
        href: "/#links",
      },
      {
        title: "PCO Integration",
        href: "/#pco",
      },
    ],
  },
  {
    group: "Resources",
    items: [
      {
        title: "Support",
        href: "https://help.churchspace.co",
        target: "_blank",
      },
      {
        title: "Pricing",
        href: "/pricing",
      },
      {
        title: "Getting Started",
        href: "https://help.churchspace.co/getting-started",
        target: "_blank",
      },
      {
        title: "Changelog",
        href: "https://help.churchspace.co/changelog",
        target: "_blank",
      },
    ],
  },

  {
    group: "Legal",
    items: [
      {
        title: "Terms of Service",
        href: "https://churchspace.co/policies/terms",
      },
      {
        title: "Privacy Policy",
        href: "https://churchspace.co/policies/privacy",
      },

      {
        title: "All Policies",
        href: "https://churchspace.co/policies",
      },
    ],
  },
  {
    group: "Company",
    items: [
      {
        title: "About",
        href: "/about",
      },
      {
        title: "Contact",
        href: "mailto:hello@churchspace.co?subject=Question%20about%20Church%20Space&body=NAME%3A%20%0ACHURCH%3A%20%0A%0AQUESTION%3A%20%0A",
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="flex items-start md:col-span-2">
            <Link
              href="/"
              aria-label="go home"
              className="flex items-center gap-1"
            >
              <ChurchSpaceBlack height={"40"} width={"40"} />
              <span className="text-nowrap text-xl font-semibold leading-none tracking-tighter">
                Church Space
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
            {links.map((link, index) => (
              <div key={index} className="space-y-4 text-sm">
                <span className="block font-medium">{link.group}</span>
                {link.items.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block text-muted-foreground duration-150 hover:text-primary"
                    target={item.target}
                  >
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t py-6">
          <div className="order-last flex w-full flex-col justify-center md:order-first md:w-fit md:justify-start">
            <span className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Church Space, All rights reserved
            </span>
            <span className="text-center text-sm font-light text-muted-foreground md:text-left">
              Church Space is not affiliated with Planning Center.
            </span>
          </div>
          <div className="order-first flex w-full flex-wrap justify-center gap-6 text-sm md:order-last md:w-fit md:justify-end">
            <Link
              href="https://x.com/churchspaceHQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Formerly Twitter)"
              className="block text-muted-foreground hover:text-primary"
            >
              <XTwitter height={"20"} width={"20"} />
            </Link>
            <Link
              href="https://www.instagram.com/churchspacehq/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="block text-muted-foreground hover:text-primary"
            >
              <Instagram height={"20"} width={"20"} />
            </Link>
            <Link
              href="https://www.facebook.com/churchspaceHQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="block text-muted-foreground hover:text-primary"
            >
              <Facebook height={"20"} width={"20"} />
            </Link>
            <Link
              href="https://www.youtube.com/@churchspaceHQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="block text-muted-foreground hover:text-primary"
            >
              <Youtube height={"20"} width={"20"} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
