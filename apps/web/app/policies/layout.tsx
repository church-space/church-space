import { PropsWithChildren } from "react";

export default function PoliciesLayout({ children }: PropsWithChildren) {
  return <div className="max-w-2xl mx-auto ">{children}</div>;
}
