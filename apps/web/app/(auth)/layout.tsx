import { getUser } from "@trivo/supabase/cached-queries/platform";
import { redirect } from "next/navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getUser();

  if (user) {
    return redirect("/home");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-card/100 to-background/60">
      {children}
    </div>
  );
}
