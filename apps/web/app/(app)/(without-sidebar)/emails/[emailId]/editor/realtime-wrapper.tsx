"use client";

import dynamic from "next/dynamic";

// Dynamically import the RealtimeListener component with no SSR
const RealtimeListener = dynamic(() => import("./realtime-listener"), {
  ssr: false,
});

export default function RealtimeWrapper({ emailId }: { emailId: string }) {
  return <RealtimeListener emailId={parseInt(emailId)} />;
}
