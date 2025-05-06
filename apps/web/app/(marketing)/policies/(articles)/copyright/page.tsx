import React from "react";
import Copyright from "@/markdown/policies/copyright.mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright Policy",
};

export default function page() {
  return <Copyright />;
}
