"use client";

import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
import { ChurchSpaceBlack } from "@church-space/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@church-space/ui/button";
import { handleExpiredInvite } from "./actions";
import { useEffect } from "react";

export default function ClientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const error = params.error;
  const inviteError = searchParams.get("inviteError") === "true";

  // If there's an invite error, automatically clean up the cookie
  useEffect(() => {
    if (inviteError) {
      handleExpiredInvite();
    }
  }, [inviteError]);

  return (
    <div className="flex w-full flex-1 -translate-y-16 flex-col justify-center gap-2 px-8 sm:max-w-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key="welcome"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6 px-0">
            <motion.div
              className="mb-4 flex justify-center text-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <ChurchSpaceBlack height="60" width="60" fill="currentColor" />
            </motion.div>

            <motion.h1
              className="text-balance text-center text-3xl font-bold sm:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Welcome to Church Space
            </motion.h1>

            <motion.p
              className="mx-auto mt-4 max-w-72 text-center text-lg text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Let&apos;s begin by connecting to your Planning Center account.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="mx-auto max-w-md space-y-6">
                <ConnectToPcoButton isReconnect={false} />

                {error && (
                  <div className="rounded-md border border-destructive p-4">
                    {error}
                  </div>
                )}

                {inviteError && (
                  <div className="rounded-md border border-destructive p-4 text-center">
                    <p className="mb-2">
                      Your invite link has expired or is invalid.
                    </p>
                    <form action={handleExpiredInvite}>
                      <Button type="submit" variant="outline">
                        Clear Expired Invite
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
