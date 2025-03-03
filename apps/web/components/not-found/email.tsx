import Link from "next/link";
import { Button } from "@church-space/ui/button";
import { MailX } from "lucide-react";

export default function EmailNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        <div className="rounded-full bg-muted p-6">
          <MailX className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Email Not Found</h1>

        <p className="text-muted-foreground">
          The email you&apos;re looking for doesn&apos;t exist or may have been
          deleted.
        </p>

        <Button asChild size="lg">
          <Link href="/emails">Back to Emails</Link>
        </Button>
      </div>
    </div>
  );
}
