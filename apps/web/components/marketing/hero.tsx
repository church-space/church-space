import { TextAnimate } from "@church-space/ui/text-annimate";
import { Button } from "@church-space/ui/button";
import {
  LinkIcon,
  MailFilled,
  Qrcode,
  Waypoints,
} from "@church-space/ui/icons";

export default function Hero() {
  return (
    <section className="space-y-14 overflow-hidden py-16 md:py-32">
      <div className="mx-auto mb-12 max-w-7xl space-y-6 px-6">
        <h1 className="mx-auto max-w-2xl text-center text-4xl font-bold sm:text-6xl md:text-7xl">
          Church Comms
          <br />
          Made Easy
        </h1>
        <div className="mx-auto max-w-2xl text-pretty text-center text-xl text-muted-foreground">
          Church Space helps you engage
          <br />
          your people with craft and ease.
        </div>
        <div className="mx-auto flex items-center justify-center gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4">
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
        <div className="relative mx-auto aspect-video w-full max-w-7xl rounded-t-xl bg-card outline outline-[3px] outline-muted">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background backdrop-blur-sm" />
        </div>
      </div>
    </section>
  );
}
