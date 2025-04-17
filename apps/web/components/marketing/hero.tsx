import { Button } from "@church-space/ui/button";
import {
  LinkIcon,
  MailFilled,
  Qrcode,
  Waypoints,
  ChevronRight,
} from "@church-space/ui/icons";
import { createClient } from "@church-space/supabase/server";
import Link from "next/link";
import HeroSubtitle from "./hero-subtitle";

export default async function Hero() {
  const supabase = await createClient();

  const { data: session } = await supabase.auth.getSession();

  const isLoggedIn = session?.session !== null;
  return (
    <section className="overflow-hidden py-16 md:py-32">
      <div className="mx-auto mb-28 flex w-full max-w-7xl flex-col items-center gap-8 lg:flex-row">
        <div className="flex min-w-[500px] flex-col items-center justify-center gap-3 px-6 md:max-w-[690px] lg:items-start lg:justify-start lg:gap-6">
          <h1 className="text-balance text-center text-4xl font-bold sm:text-6xl lg:text-left lg:text-7xl">
            <span className="relative z-[2] mb-2 pb-10">The better way to</span>{" "}
            <span className="relative bg-yellow-300/80 px-2">
              email your church
            </span>
          </h1>
          <HeroSubtitle />
          <div className="flex flex-col items-center justify-center gap-2 pt-2 lg:flex-row lg:gap-4">
            {!isLoggedIn ? (
              <>
                <Link href="/signup">
                  <Button className="h-10 px-4 text-base sm:h-12 sm:px-6">
                    Start Sending
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="gap-1 px-2 text-base text-muted-foreground [&_svg]:size-3.5"
                >
                  Learn More <ChevronRight />
                </Button>
              </>
            ) : (
              <Link href="/emails">
                <Button>Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
        <div className="hidden w-full flex-1 lg:flex lg:pr-4">
          <div className="h-96 w-full rounded-xl border bg-muted">
            Image of link page, email, and QR code
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-6">
        <div className="mx-auto flex items-center justify-center gap-4">
          <Button size="sm" variant="outline">
            <MailFilled />
            Email
          </Button>
          <Button size="sm" variant="outline">
            <Waypoints />
            Automation
          </Button>
          <Button size="sm" variant="outline">
            <LinkIcon />
            Link Pages
          </Button>
          <Button size="sm" variant="outline">
            <Qrcode />
            QR Codes
          </Button>
        </div>
        <div className="relative mx-auto aspect-video w-full max-w-7xl rounded-xl bg-card outline outline-[3px] outline-muted">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent via-transparent to-background backdrop-blur-sm" />
        </div>
      </div>
    </section>
  );
}
