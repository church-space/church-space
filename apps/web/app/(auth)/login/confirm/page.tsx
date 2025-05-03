"use client";

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
import { createClient } from "@church-space/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ConfirmPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const handleLogin = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Verify the OTP
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      if (error) {
        console.error("OTP verification error:", error);
        setError(error.message);
        router.push("/login");
        return;
      }

      if (data?.session) {
        // The client library will automatically handle storing the session
        console.log("Auth successful! Redirecting...");
        router.push("/emails");
      } else {
        console.log("No session data after verification");
        setError("Authentication failed. Please try again.");
        router.push("/login");
      }
    } catch (err) {
      console.error("Unexpected error during authentication:", err);
      setError("An unexpected error occurred");
    }
  };

  // Fallback UI if everything else fails
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                variant="default"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md border px-2.5 text-sm font-semibold"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Continue to Church Space"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
