import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";

export default function GettingStarted() {
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
              <BreadcrumbPage>Getting Started</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-col gap-5">
        <div className="mb-2 flex flex-col gap-1">
          <h1 className="px-2 text-2xl font-bold">Getting Started</h1>
          <p className="px-2 text-sm text-muted-foreground">
            Welcome to the Church Space support center. Here you can find
            information and guides to help you get started.
          </p>
        </div>
        {Array.from({ length: 3 }).map((_value, index) => (
          <div
            key={index}
            className="flex flex-col rounded-lg border bg-muted p-4"
          >
            <h2 className="text-lg font-bold">Connect to PCO</h2>
            <p className="text-sm text-muted-foreground">
              Connect your PCO account to Church Space to get started.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
