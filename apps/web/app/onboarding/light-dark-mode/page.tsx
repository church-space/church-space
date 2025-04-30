"use client";

import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
import { ChurchSpaceBlack } from "@church-space/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";

export default function ClientPage() {
  const params = useParams();
  const error = params.error;

  return (
    <div className="flex w-full flex-1 -translate-y-16 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key="welcome"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6 px-0">
            <div className="pb-0">
              <motion.div
                className="mb-4 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
              >
                <ChurchSpaceBlack height="60" width="60" />
              </motion.div>
              <motion.h1
                className="text-balance text-center text-2xl font-bold sm:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Welcome to Church Space
              </motion.h1>
              <motion.p
                className="mx-auto mt-4 max-w-64 text-center text-base text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Let&apos;s begin by connecting to your Planning Center account.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="space-y-6">
                <ConnectToPcoButton isReconnect={false} />

                {error && (
                  <div className="rounded-md border border-destructive p-4">
                    {error}
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
