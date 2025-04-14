"use client";

import Link from "next/link";
import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import { EmailForm } from "@/components/auth/email-form";
import { InputOTPForm } from "@/components/auth/otp-form";
import { AnimatePresence, motion } from "framer-motion";
import { signInWithOtp } from "@/app/(auth)/actions";
import { ArrowRight, ChurchSpaceBlack } from "@church-space/ui/icons";

export default function Page() {
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setIsEmailSubmitted(true);
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
    }
  }, [email, resendCooldown]);

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
          <motion.div
            key="email-submitted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="px-0">
              <CardHeader className="items-center space-y-4">
                <ChurchSpaceBlack height={"60"} width={"60"} fill="#6065FE" />
                <CardTitle>Check your email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-10">
                <div className="w-full text-center font-light">
                  We&apos;ve sent you a login email. Please check your email at{" "}
                  <span className="font-medium">{email}</span>{" "}
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
                      <InputOTPForm email={email} redirectUrl={"/emails"} />
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
        ) : (
          <motion.div
            key="create-account"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="px-0">
              <CardHeader className="items-center space-y-0">
                <ChurchSpaceBlack height={"60"} width={"60"} fill="#6065FE" />
                <CardTitle className="pt-4 text-2xl font-bold">
                  Welcome Back
                </CardTitle>
                <CardDescription>Log in to Church Space</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <EmailForm
                      onSubmit={handleEmailSubmit}
                      showLastUsed={false}
                    />
                  </div>
                </div>
                <div className="flex w-full justify-center gap-1 text-center text-sm font-light text-muted-foreground">
                  Need an account?{" "}
                  <Link
                    className="flex items-center gap-1 text-foreground hover:underline"
                    href="/signup"
                  >
                    Sign up{" "}
                    <span className="transition-transform group-hover:translate-x-1">
                      <ArrowRight />
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
