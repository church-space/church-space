import { createClient } from "@church-space/supabase/server";
import Link from "next/link";
import { Button } from "@church-space/ui/button";

export default async function HeaderButtons() {
  const supabase = await createClient();

  const { data: session } = await supabase.auth.getSession();

  const isLoggedIn = session?.session !== null;
  return (
    <div className="flex items-center gap-2">
      {!isLoggedIn ? (
        <>
          <Link href="/login" passHref>
            <Button
              variant="ghost"
              className="h-8 rounded-lg px-3 py-0 text-muted-foreground"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button className="h-8 rounded-lg bg-foreground/90 px-3 py-0 text-background hover:bg-foreground">
              Sign up
            </Button>
          </Link>
        </>
      ) : (
        <Link href="/emails" passHref>
          <Button className="h-8 gap-1 rounded-lg bg-foreground/90 px-3 py-0 text-background hover:bg-foreground">
            <span className="hidden sm:inline">Go to</span>
            Dashboard
          </Button>
        </Link>
      )}
    </div>
  );
}
