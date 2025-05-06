import React from "react";
import Privacy from "@/markdown/policies/privacy.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function page() {
  return <Privacy />;
}
