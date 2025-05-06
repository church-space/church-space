import React from "react";
import UseRestrictions from "@/markdown/policies/use-restrictions.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use Restriction Policy",
};

export default function page() {
  return <UseRestrictions />;
}
