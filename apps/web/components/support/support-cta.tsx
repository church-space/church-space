import { Button } from "@church-space/ui/button";
import Link from "next/link";

export default function SupportCTA() {
  return (
    <section className="px-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between rounded-xl border bg-muted px-6 py-8 md:flex-row md:py-20 lg:px-12">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl">
            Still Need help?
          </h2>
          <p className="text-balance text-lg">
            Send a request to our support team.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-4 md:mt-0">
          <Link href="mailto:support@churchspace.co">
            <Button asChild size="lg">
              <span>Contact Us</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
