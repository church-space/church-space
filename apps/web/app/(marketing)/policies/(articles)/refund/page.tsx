import React from "react";
import Refund from "@/markdown/policies/refund.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function page() {
  return <Refund />;
}
