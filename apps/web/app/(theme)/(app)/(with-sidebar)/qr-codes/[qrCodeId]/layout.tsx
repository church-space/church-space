import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage QR Code",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
