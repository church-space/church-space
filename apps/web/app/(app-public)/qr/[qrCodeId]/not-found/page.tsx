import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import {
  ArrowRight,
  ChevronRight,
  ChurchSpaceBlack,
  Qrcode,
} from "@church-space/ui/icons";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-secondary/70 to-background/60 py-10 dark:from-secondary/30">
      <Card className="mx-auto max-w-md items-center justify-center text-center">
        <CardHeader>
          <CardTitle className="flex w-full items-center justify-center gap-2 text-center text-lg font-bold">
            <span className="text-primary">
              <Qrcode height={"24"} width={"24"} />
            </span>
            QR Code not found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find the QR code you were looking for. It may have
            been deleted or disabled.
          </p>
        </CardContent>
      </Card>
      <Link href="/">
        <Card className="group mx-auto flex max-w-md flex-row items-center justify-start gap-4 p-4 transition-colors hover:bg-accent">
          <ChurchSpaceBlack height={"30"} width={"30"} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Church Space</h2>
              <span className="transition-transform group-hover:translate-x-1">
                <ArrowRight height={"12"} width={"12"} />
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your church&apos;s links and communications with Church
              Space.
            </p>
          </div>
        </Card>
      </Link>
    </div>
  );
}
