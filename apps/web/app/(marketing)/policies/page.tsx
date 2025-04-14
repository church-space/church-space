import Link from "next/link";

export default function PoliciesPage() {
  return (
    <div className="mx-auto my-32 flex max-w-3xl flex-col gap-4 px-5">
      <h1 className="text-4xl font-bold">Policies and Terms</h1>
      <p className="text-lg font-medium">
        We try to make our policies and terms as simple as possible. If you have
        any questions, please reach out to us at{" "}
        <Link
          href="mailto:support@churchspace.com"
          className="text-primary underline"
        >
          support@churchspace.com
        </Link>
        .
      </p>
      <ul className="ml-4 list-disc space-y-2 text-lg">
        <li>
          <Link
            href="/policies/terms"
            className="underline hover:text-primary hover:underline-offset-4"
          >
            Terms of Service
          </Link>
        </li>
        <li>
          <Link
            href="/policies/privacy"
            className="underline hover:text-primary hover:underline-offset-4"
          >
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link
            href="/policies/ccpa"
            className="underline hover:text-primary hover:underline-offset-4"
          >
            California Resident Notice at Collection
          </Link>
        </li>
        <li>
          <Link
            href="/policies/cancellation"
            className="underline hover:text-primary hover:underline-offset-4"
          >
            Cancellation Policy
          </Link>
        </li>
        <li>
          <Link
            href="/policies/refund"
            className="underline hover:text-primary hover:underline-offset-4"
          >
            Refund Policy
          </Link>
        </li>
        <li>
          <Link
            href="/policies/use-restrictions"
            className="underline hover:text-primary hover:underline-offset-4"
          >
            Use Restrictions Policy
          </Link>
        </li>
        <li>
          <Link
            href="/policies/account-ownership"
            className="underline hover:text-primary hover:underline-offset-4"
          >
            Account Ownership Policy
          </Link>
        </li>
        <li>
          <Link
            href="/policies/dpa"
            className="underline hover:text-primary hover:underline-offset-4"
          >
            Data Processing Agreement
          </Link>
        </li>
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        You will see the name &quot;Trivo Technologies LLC&quot; in a few places
        throughout these policies. This is just our legal entity&apos;s name. It
        was the working name for Church Space while the project was beginning.
        We say this to say, &quot;Trivo&quot; is the same people that build,
        own, and run Church Space. It&apos;s an honor for us to serve you and
        your churches.
      </p>
    </div>
  );
}
