import { createClient } from "@church-space/supabase/server";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import Link from "next/link";
import { Button } from "@church-space/ui/button";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user?.organizationMembership) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 text-balance text-center">
        <div className="text-lg">
          You are not authorized to access this page. Please contact an owner of
          your organization to gain access.
        </div>
        <Link href="/settings">
          <Button>Back to Settings</Button>
        </Link>
      </div>
    );
  }

  if (user?.organizationMembership.role !== "owner") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 text-balance text-center">
        <div className="text-lg">
          You are not authorized to access this page. Please contact an owner of
          your organization to gain access.
        </div>
        <Link href="/settings">
          <Button>Back to Settings</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
