"use client";

import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
import ManageSubscriptionButton from "@/components/stripe/manage-subscription-button";
import { Card, CardContent } from "@church-space/ui/card";
import { AnimatePresence, motion } from "framer-motion";

export default function ClientPage({
  organizationId,
}: {
  organizationId: string;
}) {
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
            <div className="text-center text-2xl font-bold">
              Reconnect to Planning Center
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Seems like we&apos;ve lost connection to your Planning Center
              account. This can happen if the person who connected your account
              to Church Space is no longer a People Manager or if you
              haven&apos;t used Church Space in a while. To reconnect to
              Planning Center, please click the button below.
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="space-y-6 px-0 pt-4">
              <CardContent className="space-y-4 pt-4">
                <ConnectToPcoButton isReconnect={true} />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="mt-6 flex flex-col gap-2 px-4">
              <p className="mb-2 text-balance text-center text-sm text-muted-foreground">
                If you need to cancel your subscription, you can do so by
                clicking the button below.
              </p>
              <ManageSubscriptionButton
                organizationId={organizationId}
                buttonVariant="outline"
              />
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}
