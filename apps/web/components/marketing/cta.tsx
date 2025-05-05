import { Button } from "@church-space/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="px-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between rounded-xl border px-6 py-12 md:flex-row md:py-20 lg:px-12">
        <h2 className="mb-8 text-balance text-3xl font-semibold md:mb-0 md:text-4xl">
          Engage Your Church.
        </h2>

        <div className="flex flex-col-reverse items-center justify-center gap-4 md:flex-row">
          <Link href="mailto:hello@churchspace.co?subject=Question%20about%20Church%20Space&body=NAME%3A%20%0ACHURCH%3A%20%0A%0AQUESTION%3A%20%0A">
            <Button asChild size="lg" variant="outline">
              <span>Contact Us</span>
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              asChild
              size="lg"
              className="bg-foreground/90 hover:bg-foreground"
            >
              <span>Get Started for Free</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
