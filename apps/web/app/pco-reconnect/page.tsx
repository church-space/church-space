"use client";

import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
import { Card, CardContent } from "@trivo/ui/card";
import { AnimatePresence, motion } from "framer-motion";

export default function Page() {
  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <AnimatePresence mode="wait">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-2 mb-6"
          >
            <div className="text-3xl font-bold">
              Reconnect to Planning Center
            </div>
            <div className="text-sm text-muted-foreground">
              It has been over 90 days since you last connected to Planning
              Center. Please reconnect to continue using this application.
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="space-y-6 px-0 pt-4">
              <CardContent className="space-y-4 pt-4">
                <ConnectToPcoButton />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}
