"use client";

import Link from "next/link";
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@church-space/ui/card";
import { EmailForm } from "@/components/auth/email-form";
import { Button } from "@church-space/ui/button";
import { InputOTPForm } from "@/components/auth/otp-form";
import { AnimatePresence, motion } from "framer-motion";
import { signInWithGoogle, signInWithOtp } from "@/app/(auth)/actions";
import { useToast } from "@church-space/ui/use-toast";
import { ArrowRight } from "@church-space/ui/icons";
export default function Page() {
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const toast = useToast();

  const updateLastUsedMethod = (method: string) => {
    localStorage.setItem("lastAuthMethod", method);
  };

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setIsEmailSubmitted(true);
    updateLastUsedMethod("email");
  };

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return;

    try {
      await signInWithOtp(email);
      setResendCount((prev) => prev + 1);
      setResendCooldown(60);

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to resend code:", error);
      // You might want to show an error toast here
    }
  }, [email, resendCooldown]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();

      if (result?.url) {
        updateLastUsedMethod("google");
        window.location.href = result.url;
      } else {
        console.error("No URL returned from signInWithGoogle");
        toast.toast({
          title: "Failed to initiate Google Sign-In",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
      toast.toast({
        title: "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      {isEmailSubmitted ? (
        <button
          onClick={() => setIsEmailSubmitted(false)}
          className="bg-btn-background hover:bg-btn-background-hover group absolute left-8 top-8 flex items-center rounded-md px-4 py-2 text-sm text-foreground no-underline"
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
        </button>
      ) : (
        <Link
          href="/"
          className="bg-btn-background hover:bg-btn-background-hover group absolute left-8 top-8 flex items-center rounded-md px-4 py-2 text-sm text-foreground no-underline"
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
      )}

      <AnimatePresence mode="wait">
        {isEmailSubmitted ? (
          <div>
            <motion.div
              key="email-submitted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="space-y-6 px-0">
                <CardHeader className="items-center space-y-8">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <CardTitle>Check your email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-10">
                  <div className="w-full text-center font-light">
                    We&apos;ve sent you a verification email. Please check your
                    email at <span className="font-medium">{email}</span>{" "}
                  </div>
                  {!showOTPForm && (
                    <div
                      className="flex w-full cursor-pointer justify-center gap-1 text-center text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowOTPForm(true)}
                    >
                      Enter code manually
                    </div>
                  )}
                  <AnimatePresence>
                    {showOTPForm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <InputOTPForm email={email} redirectUrl={"/home"} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex w-full flex-col items-center justify-center gap-1">
                    <div
                      className={`flex w-full justify-center gap-1 text-center text-sm font-light ${
                        resendCooldown > 0
                          ? "text-muted-foreground"
                          : "cursor-pointer text-muted-foreground hover:underline"
                      }`}
                      onClick={handleResendCode}
                    >
                      {resendCooldown > 0
                        ? `Resend email in ${resendCooldown}s`
                        : "Resend email"}
                    </div>
                    {resendCount > 0 && (
                      <div className="w-2/3 text-center text-sm text-muted-foreground">
                        If you don&apos;t see the email, please check your spam
                        folder.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <div className="mt-5 flex justify-center">
              <div className="w-3/4 text-center text-sm font-light text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link className="text-foreground hover:underline" href="/terms">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  className="text-foreground hover:underline"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </div>
        ) : (
          <div>
            <motion.div
              key="create-account"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="space-y-6 px-0">
                <CardHeader className="items-center space-y-8">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <CardTitle>Create your account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Button
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-md border px-2.5 text-sm font-semibold"
                      onClick={handleGoogleSignIn}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.3em"
                        height="1.3em"
                        viewBox="0 0 256 262"
                      >
                        <path
                          fill="#4285f4"
                          d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                        />
                        <path
                          fill="#34a853"
                          d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                        />
                        <path
                          fill="#fbbc05"
                          d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                        />
                        <path
                          fill="#eb4335"
                          d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                        />
                      </svg>
                      Sign up with Google
                    </Button>
                  </div>
                  <div className="flex w-full items-center justify-between gap-2 text-sm text-muted-foreground">
                    <div className="h-px w-full bg-muted-foreground"></div>
                    Or
                    <div className="h-px w-full bg-muted-foreground"></div>
                  </div>
                  <EmailForm onSubmit={handleEmailSubmit} />
                  <div className="flex w-full justify-center gap-1 text-center text-sm font-light text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      className="flex items-center gap-1 text-foreground hover:underline group"
                      href="/login"
                    >
                      Login{" "}
                      <span className="group-hover:translate-x-1 transition-transform">
                        <ArrowRight />
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <div className="mt-5 flex justify-center">
              <div className="w-3/4 text-center text-sm font-light text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link
                  className="text-foreground hover:underline"
                  href="/policies/terms"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  className="text-foreground hover:underline"
                  href="/policies/privacy"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
