"use client";

import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
import { ChurchSpaceBlack } from "@church-space/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@church-space/ui/button";
import { handleExpiredInvite } from "./actions";
import { useState } from "react";

interface ClientPageProps {
  inviteErrorParam?: boolean;
}

export default function ClientPage({
  inviteErrorParam = false,
}: ClientPageProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const error = params.error;
  const inviteError =
    inviteErrorParam || searchParams.get("inviteError") === "true";

  const [hideInviteError, setHideInviteError] = useState(false);

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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl border bg-background p-6 shadow-md"
            >
              <h2 className="mb-2 text-center text-xl font-semibold">
                Connect to Planning Center
              </h2>
              <p className="text-center text-sm">
                Let&apos;s begin by getting connected to your Planning Center
                account. We will use this to sync your people and lists to
                Church Space.
              </p>
              <div className="mx-auto mt-5 max-w-md space-y-6">
                <ConnectToPcoButton isReconnect={false} />

                {error && (
                  <div className="rounded-md border border-destructive p-4">
                    {error}
                  </div>
                )}

                {inviteError && !hideInviteError && (
                  <div className="rounded-md border border-destructive p-4 text-center">
                    <p className="mb-2">
                      Your invite link has expired or is invalid.
                    </p>
                    <form action={handleExpiredInvite}>
                      <Button
                        type="submit"
                        variant="outline"
                        onClick={() => setHideInviteError(true)}
                      >
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
