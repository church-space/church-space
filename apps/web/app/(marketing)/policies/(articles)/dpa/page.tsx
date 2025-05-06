import React from "react";
import DPA from "@/markdown/policies/dpa.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
};

export default function page() {
  return <DPA />;
}
