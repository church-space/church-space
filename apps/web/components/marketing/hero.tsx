import { Button } from "@church-space/ui/button";
import {
  LinkIcon,
  MailFilled,
  Qrcode,
  Waypoints,
} from "@church-space/ui/icons";
import { createClient } from "@church-space/supabase/server";
import Link from "next/link";

export default async function Hero() {
  const supabase = await createClient();

  const { data: session } = await supabase.auth.getSession();

  const isLoggedIn = session?.session !== null;
  return (
    <section className="overflow-hidden py-16 md:py-32">
      <div className="mx-auto mb-28 max-w-7xl space-y-6 px-6">
        <h1 className="mx-auto max-w-2xl text-balance text-center text-4xl font-bold sm:text-6xl md:text-7xl">
          Email your church for half the price.
        </h1>
        <div className="text-md mx-auto max-w-xs text-balance text-center font-semibold text-secondary-foreground sm:max-w-lg sm:text-xl md:max-w-xl md:text-2xl">
          <span className="hidden md:inline">
            Church Space helps you engage
          </span>
          <span className="inline md:hidden">Engage</span> your people with
          beautiful emails and organized links.
        </div>
        <div className="mx-auto flex items-center justify-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>

              <Button variant="outline">Learn More</Button>
            </>
          ) : (
            <Link href="/emails">
              <Button>Go to Dashboard</Button>
            </Link>
          )}
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
            Link Lists
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
