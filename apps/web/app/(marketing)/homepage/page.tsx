import React from "react";
import Homepage from "../page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Church Space | Email for Planning Center",
  description:
    "Church Space is an email marketing platform purpose-built for churches.",
};

export default function page() {
  return <Homepage />;
}
