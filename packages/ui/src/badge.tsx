import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent shadow-sm shadow-primary/20 dark:shadow-none bg-primary dark:text-white text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary shadow-sm shadow-secondary/20 dark:shadow-none text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive shadow-sm shadow-destructive/20 dark:shadow-none text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-green-500 bg-green-500 shadow-sm dark:shadow-none shadow-green-500/20 dark:bg-green-600 text-white",
        successOutline:
          "border-green-500 bg-green-500/10 dark:bg-green-600/10 text-green-500 shadow-sm shadow-green-500/20 dark:shadow-none",
        warning:
          "border-yellow-500 bg-yellow-500 shadow-sm dark:shadow-none shadow-yellow-500/20 dark:bg-yellow-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
