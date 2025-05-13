import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import { ArrowRight, ChurchSpaceBlack } from "@church-space/ui/icons";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-secondary/30 to-background/60 py-10 dark:from-secondary/30">
      <Card className="mx-auto max-w-md items-center justify-center text-center">
        <CardHeader>
          <CardTitle className="flex w-full items-center justify-center gap-2 text-center text-lg font-bold">
            This organization has been deleted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-pretty text-sm text-muted-foreground">
            You should no longer receive emails from this organization through
            Church Space as their account has been deleted. If you continue to
            receive emails, please contact the sender directly.
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
