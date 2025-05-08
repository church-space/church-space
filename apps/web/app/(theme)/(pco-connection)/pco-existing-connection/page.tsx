"use client";

import { Button } from "@church-space/ui/button";
import { Card, CardContent } from "@church-space/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { redirect } from "next/navigation";
import { use } from "react";

type SearchParams = Promise<{
  connectedByFirstName?: string;
  connectedByLastName?: string;
}>;

export default function Page(props: { searchParams: SearchParams }) {
  const searchParams = use(props.searchParams);
  if (!searchParams.connectedByFirstName || !searchParams.connectedByLastName) {
    return redirect("/");
  }

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
            <div className="text-3xl font-bold">PCO Already Connected</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="px-0">
              <CardContent className="pt-[30px] text-center">
                <span className="font-semibold">
                  {searchParams.connectedByFirstName}{" "}
                  {searchParams.connectedByLastName}
                </span>{" "}
                already connected your organization to Church Space. Please
                contact them directly to gain access.
              </CardContent>
            </Card>
            <div className="pt-4 text-center">
              <Button variant="ghost" asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}
