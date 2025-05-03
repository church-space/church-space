import { Button } from "@church-space/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import { ChurchSpaceBlack } from "@church-space/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@church-space/supabase/server";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const token = (await searchParams).token;

  console.log(token);

  if (!token) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "email",
  });

  if (error) {
    redirect("/login");
  }

  if (data) {
    redirect("/emails");
  }

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <Link
        href="/login"
        className="bg-btn-background hover:bg-btn-background-hover group absolute left-2 top-4 flex items-center rounded-md px-4 py-2 text-sm text-foreground no-underline md:left-8 md:top-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>

      <AnimatePresence mode="wait">
        <motion.div
          key="create-account"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="space-y-2 px-0">
            <CardHeader className="items-center space-y-0">
              <ChurchSpaceBlack height={"60"} width={"60"} fill="#6065FE" />
              <CardTitle className="pt-4 text-2xl font-bold">
                Continue to Church Space
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <Button
                variant="default"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md border px-2.5 text-sm font-semibold"
              >
                Continue to Church Space
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
