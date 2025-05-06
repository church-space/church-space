import React from "react";
import Terms from "@/markdown/policies/terms.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function page() {
  return <Terms />;
}
