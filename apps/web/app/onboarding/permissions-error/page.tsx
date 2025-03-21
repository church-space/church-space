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
            <div className="text-3xl font-bold">Invalid Permissions</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="px-0">
              <CardContent className="pt-[30px] text-center">
                You must be a &quot;Manager&quot; in Planning Center
                &quot;People&quot; to set up this application. Please contact
                your administrator to request the necessary permissions.
              </CardContent>
            </Card>
            <div className="pt-4 text-center">
              <Button variant="ghost" asChild>
                <Link href="/onboarding">Try again</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}
