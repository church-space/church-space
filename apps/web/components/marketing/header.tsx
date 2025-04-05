import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@church-space/ui/navigation-menu";
import { cn } from "@church-space/ui/cn";
import Link from "next/link";
import {
  MailFilled,
  Qrcode,
  LinkIcon,
  LifeRing,
  CircleInfo,
  Waypoints,
  Map,
  ChurchSpaceBlack,
} from "@church-space/ui/icons";
import PCOlogo from "@/public/pco-logo.png";
import Image from "next/image";
import MobileHeaderSheet from "./mobile-header-sheet";
import HeaderButtons from "./header-buttons";
import { Separator } from "@church-space/ui/separator";
import { Label } from "@church-space/ui/label";
export default function Header() {
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
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="hidden sm:block">
              <NavigationMenuTrigger className="h-8 px-2.5 text-muted-foreground">
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 p-3 md:w-[500px] md:grid-cols-2">
                  <ListItem
                    href="/features/emails"
                    title="Email"
                    icon={<MailFilled />}
                  >
                    Send beautifully crafted emails to your people
                  </ListItem>
                  <ListItem
                    href="/features/automations"
                    title="Automations"
                    icon={<Waypoints />}
                  >
                    Automate your communications with powerful automation tools
                  </ListItem>
                  <ListItem
                    href="/features/qr"
                    title="QR Codes"
                    icon={<Qrcode />}
                  >
                    Manage, track, and update your QR codes
                  </ListItem>
                  <ListItem
                    href="/features/links"
                    title="Link Lists"
                    icon={<LinkIcon />}
                  >
                    Collect and share important links and resources
                  </ListItem>
                  <Separator className="col-span-2 my-0.5" />
                  <Label className="col-span-2 ml-1 text-sm font-semibold text-muted-foreground">
                    Integrations
                  </Label>
                  <ListItem
                    href="/integrations"
                    title="Planning Center"
                    className="bg-blue-500/10"
                    listItemClassName="col-span-2"
                    icon={
                      <Image
                        src={PCOlogo}
                        alt="PCO Logo"
                        height={16}
                        width={16}
                        className="mr-1"
                      />
                    }
                  >
                    Sync your data from Planning Center
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem className="hidden md:flex">
              <NavigationMenuTrigger className="h-8 px-2.5 text-muted-foreground">
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 p-3 md:w-[500px] md:grid-cols-2">
                  <ListItem href="/support" title="Support" icon={<LifeRing />}>
                    Search articles and contact the team for help
                  </ListItem>
                  <ListItem
                    href="/getting-started"
                    title="Getting Started"
                    icon={<Map />}
                  >
                    Learn how to make the switch and get started.
                  </ListItem>
                  <ListItem href="/about" title="About" icon={<CircleInfo />}>
                    Learn what we&apos;re about and what we&apos;re working on.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem className="hidden h-8 px-2.5 text-muted-foreground sm:block">
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem className="hidden text-muted-foreground md:block">
              <Link
                href="mailto:hello@churchspace.co?subject=Question%20about%20Church%20Space&body=NAME%3A%20%0ACHURCH%3A%20%0A%0AQUESTION%3A%20%0A"
                legacyBehavior
                passHref
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Contact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          <HeaderButtons />
          <MobileHeaderSheet />
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    icon: React.ReactNode;
    listItemClassName?: string;
  }
>(({ className, title, children, icon, listItemClassName, ...props }, ref) => {
  return (
    <li className={cn(listItemClassName)}>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-1">
            {icon}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
