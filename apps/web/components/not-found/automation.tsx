import Link from "next/link";
import { Button } from "@church-space/ui/button";
import { Robot } from "@church-space/ui/icons";

export default function AutomationNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center space-y-6 text-center">
        <div className="rounded-full bg-muted p-6">
          <span className="text-muted-foreground">
            <Robot height={"48"} width={"48"} />
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Automation Not Found
        </h1>

        <p className="text-muted-foreground">
          The automation you&apos;re looking for doesn&apos;t exist or may have
          been deleted.
        </p>

        <Button asChild size="lg">
          <Link href="/emails/automations">Back to Automations</Link>
        </Button>
      </div>
    </div>
  );
}
