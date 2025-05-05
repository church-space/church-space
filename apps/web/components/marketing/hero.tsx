import { Button } from "@church-space/ui/button";
import {
  LinkIcon,
  MailFilled,
  Qrcode,
  Waypoints,
  ChevronRight,
  Email,
  Robot,
} from "@church-space/ui/icons";
import { createClient } from "@church-space/supabase/server";
import Link from "next/link";
import HeroSubtitle from "./hero-subtitle";

export default async function Hero() {
  const supabase = await createClient();

  const { data: session } = await supabase.auth.getSession();

  const isLoggedIn = session?.session !== null;
  return (
    <section className="overflow-hidden py-16 lg:py-32">
      <div className="mx-auto mb-12 flex w-full max-w-7xl flex-col items-center gap-8 sm:mb-28">
        <div className="flex min-w-[500px] flex-col items-center justify-center gap-3 px-6 md:max-w-[690px] lg:gap-6">
          <h1 className="text-balance text-center text-4xl font-bold sm:text-6xl lg:text-7xl">
            <span className="relative z-[2] mb-2 pb-10">The better way to</span>{" "}
            <span className="relative bg-yellow-300/80 px-2">
              email your church
            </span>
          </h1>
          <HeroSubtitle />
          <div className="flex flex-col items-center justify-center gap-2 pt-2 md:flex-row lg:gap-4">
            {!isLoggedIn ? (
              <Link href="/signup">
                <Button className="h-10 px-4 text-base sm:h-12 sm:px-6">
                  Start Sending
                </Button>
              </Link>
            ) : (
              <Link href="/emails">
                <Button className="h-10 px-4 text-base sm:h-12 sm:px-6">
                  Go to Dashboard
                </Button>
              </Link>
            )}
            <Link href="https://cal.com/thomasharmond/15min">
              <Button
                variant="ghost"
                className="h-10 gap-1 px-2 text-base text-secondary-foreground sm:h-12 [&_svg]:size-3.5"
              >
                Talk to Foudner <ChevronRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-6">
        <div className="mx-auto flex max-w-[300px] flex-wrap items-center justify-center gap-2 sm:max-w-2xl sm:gap-4">
          <Button
            size="sm"
            variant="outline"
            className="text-base [&_svg]:size-5"
          >
            <span className="hidden sm:block">
              <Email />
            </span>
            Emails
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-base [&_svg]:size-5"
          >
            <span className="hidden sm:block">
              <Waypoints />
            </span>
            Automations
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-base [&_svg]:size-5"
          >
            <span className="hidden sm:block">
              <LinkIcon />
            </span>
            Link Pages
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-base [&_svg]:size-5"
          >
            <span className="hidden sm:block">
              <Qrcode />
            </span>
            QR Codes
          </Button>
        </div>
        <div className="relative mx-auto aspect-video w-full max-w-7xl rounded-xl bg-card outline outline-[3px] outline-muted">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent via-transparent to-background backdrop-blur-sm">
            emails / automations / links / qr codes
          </div>
        </div>
      </div>
    </section>
  );
}
