import React from "react";
import Cancellation from "@/markdown/policies/cancellation.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation Policy",
};

export default function page() {
  return <Cancellation />;
}
