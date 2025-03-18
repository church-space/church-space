"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@church-space/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@church-space/ui/card";
import { Loader2 } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setError("No session ID found");
        setIsVerifying(false);
        return;
      }

      try {
        // Verify the session with Stripe
        const response = await fetch(
          `/api/stripe/verify-session?session_id=${sessionId}`,
        );
        const data = await response.json();

        if (data.success) {
          setIsSuccess(true);

          // Redirect to settings after a short delay
          setTimeout(() => {
            router.push(process.env.NEXT_PUBLIC_SITE_URL + "/settings");
          }, 3000);
        } else {
          setError(data.error || "Failed to verify payment");
        }
      } catch (err) {
        setError("An error occurred while verifying your payment");
        console.error(err);
      } finally {
        setIsVerifying(false);
      }
    }

    verifySession();
  }, [sessionId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isVerifying
              ? "Processing Payment"
              : isSuccess
                ? "Payment Successful!"
                : "Payment Verification"}
          </CardTitle>
          <CardDescription>
            {isVerifying
              ? "Please wait while we verify your payment..."
              : isSuccess
                ? "Thank you for your subscription"
                : "There was an issue with your payment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {isVerifying ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : isSuccess ? (
            <div className="text-center">
              <div className="mb-4 rounded-md bg-green-100 p-4 text-green-800">
                Your subscription has been activated successfully. You will be
                redirected to the settings page shortly.
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-red-100 p-4 text-red-800">
              {error || "Unknown error occurred"}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!isVerifying && !isSuccess && (
            <Button
              onClick={() =>
                router.push(process.env.NEXT_PUBLIC_SITE_URL + "/settings")
              }
            >
              Return to Settings
            </Button>
          )}
          {isSuccess && (
            <p className="text-sm text-gray-500">
              Redirecting to settings page...
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
