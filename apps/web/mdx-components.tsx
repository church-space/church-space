import type { MDXComponents } from "mdx/types";
import { cn } from "@church-space/ui/cn";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          "scroll-m-20 text-4xl font-bold tracking-tight",
          className,
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          "mt-12 scroll-m-20 border-b pb-1 text-3xl font-medium leading-10 tracking-tight",
          className,
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          "mt-5 scroll-m-20 text-2xl font-medium tracking-tight",
          className,
        )}
        {...props}
      />
    ),
    p: ({ className, ...props }) => (
      <p
        className={cn("mt-2 leading-7 [&:not(:first-child)]:mt-4", className)}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("my-2 list-disc", className)} {...props} />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("ml-4 mt-2", className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a
        className={cn(
          "underline decoration-muted-foreground underline-offset-4 hover:text-primary",
          className,
        )}
        {...props}
      />
    ),
    hr: ({ className, ...props }) => (
      <hr
        className={cn("my-12 border-muted-foreground md:my-20", className)}
        {...props}
      />
    ),
    table: ({ className, ...props }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className={cn("w-full border-collapse", className)} {...props} />
      </div>
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={cn("m-0 border-t p-0 even:bg-muted/50", className)}
        {...props}
      />
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          "border bg-muted px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
          className,
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={cn(
          "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
          className,
        )}
        {...props}
      />
    ),
    ...components,
  };
}
