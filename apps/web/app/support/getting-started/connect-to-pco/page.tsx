import ConnectToPcoMdx from "@/markdown/support/getting-started/connect-to-pco.mdx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";

export default function ConnectToPco() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-20">
      <header className="mb-10 mt-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/support">Support</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/support/getting-started">
                Getting Started
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-32 truncate sm:max-w-sm">
                Connect to PCO but with a much longer name for testing
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <ConnectToPcoMdx />
    </div>
  );
}
