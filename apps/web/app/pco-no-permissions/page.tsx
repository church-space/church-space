"use client";

import { Button } from "@church-space/ui/button";
import { Card, CardContent } from "@church-space/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

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
            <div className="text-3xl font-bold">
              Unsatisfactory PCO Permissions
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="px-0">
              <CardContent className="pt-[30px] text-center">
                You no longer have the necessary permissions within Planning
                Center People to use Church Space. You must be either a
                &quot;Manager&quot; or &quot;Editor&quot; in Planning Center
                People and have the ability to email lists to use Church Space.
                Please contact your administrator to request the necessary
                permissions.
              </CardContent>
            </Card>
            <div className="pt-4 text-center">
              <Button variant="ghost" asChild>
                <Link href="/homepage">Return Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}
