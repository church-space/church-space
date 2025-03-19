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
    group: "Product",
    items: [
      {
        title: "Features",
        href: "#",
      },
      {
        title: "Solution",
        href: "#",
      },
      {
        title: "Customers",
        href: "#",
      },
      {
        title: "Pricing",
        href: "#",
      },
      {
        title: "Help",
        href: "#",
      },
      {
        title: "About",
        href: "#",
      },
    ],
  },
  {
    group: "Solution",
    items: [
      {
        title: "Startup",
        href: "#",
      },
      {
        title: "Freelancers",
        href: "#",
      },
      {
        title: "Organizations",
        href: "#",
      },
      {
        title: "Students",
        href: "#",
      },
      {
        title: "Collaboration",
        href: "#",
      },
      {
        title: "Design",
        href: "#",
      },
      {
        title: "Management",
        href: "#",
      },
    ],
  },
  {
    group: "Company",
    items: [
      {
        title: "About",
        href: "#",
      },
      {
        title: "Careers",
        href: "#",
      },
      {
        title: "Blog",
        href: "#",
      },
      {
        title: "Press",
        href: "#",
      },
      {
        title: "Contact",
        href: "#",
      },
      {
        title: "Help",
        href: "#",
      },
    ],
  },
  {
    group: "Legal",
    items: [
      {
        title: "Licence",
        href: "#",
      },
      {
        title: "Privacy",
        href: "#",
      },
      {
        title: "Cookies",
        href: "#",
      },
      {
        title: "Security",
        href: "#",
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="flex items-start justify-center md:col-span-2 md:justify-start">
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
                  >
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
          <span className="order-last block w-full justify-center text-center text-sm text-muted-foreground md:order-first md:w-fit md:justify-start">
            © {new Date().getFullYear()} Church Space, All rights reserved
          </span>
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
