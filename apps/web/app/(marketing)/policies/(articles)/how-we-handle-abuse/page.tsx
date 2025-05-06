import React from "react";
import HowWeHandleAbuse from "@/markdown/policies/how-we-handle-abuse.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Handle Abuse",
};

export default function page() {
  return <HowWeHandleAbuse />;
}
