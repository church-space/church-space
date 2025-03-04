"use client";

import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
import { Card, CardContent } from "@church-space/ui/card";
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
            className="mb-6 flex flex-col items-center justify-center gap-2"
          >
            <div className="text-3xl font-bold">Link to Planning Center</div>
            <div className="text-sm text-muted-foreground">
              Let&apos;s get your account linked to Planning Center
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
