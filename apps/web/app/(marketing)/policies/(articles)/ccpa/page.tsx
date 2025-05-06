import React from "react";
import CCPA from "@/markdown/policies/ccpa.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "California Resident Notice at Collection",
};

export default function page() {
  return <CCPA />;
}
