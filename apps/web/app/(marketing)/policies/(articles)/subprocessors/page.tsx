import React from "react";
import Subprocessors from "@/markdown/policies/subprocessors.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subprocessors",
};

export default function page() {
  return <Subprocessors />;
}
