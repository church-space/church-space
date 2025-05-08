import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Automation",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
