import React from "react";
import AccountOwnership from "@/markdown/policies/account-ownership.mdx";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Ownership Policy",
};

export default function page() {
  return <AccountOwnership />;
}
