import { cn } from "@church-space/ui/cn";
import React from "react";

interface SettingsSection {
  title: string;
  description: string;
  actionType: "button" | "select";
  actionLabel: string;
  selectOptions?: { label: string; value: string }[];
  action?: () => void;
  selectValue?: string;
  buttonLink?: string;
  buttonAction?: () => void;
}

// Main wrapper component
const SettingsSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mx-auto flex w-full max-w-5xl flex-col", className)}
    {...props}
  />
));
SettingsSection.displayName = "SettingsSection";

// Header component that contains title and description
const SettingsHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col", className)} {...props} />
);
SettingsHeader.displayName = "SettingsHeader";

// Title component
const SettingsTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("pl-1 text-2xl font-bold", className)}
    {...props}
  />
));
SettingsTitle.displayName = "SettingsTitle";

// Description as text component
const SettingsDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mb-4 pl-1 text-sm text-muted-foreground", className)}
    {...props}
  />
));
SettingsDescription.displayName = "SettingsDescription";

// Content wrapper component
const SettingsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-3 flex w-full flex-col rounded-lg border bg-card",
      className,
    )}
    {...props}
  />
));
SettingsContent.displayName = "SettingsContent";

// Row component
interface SettingsRowProps extends React.HTMLAttributes<HTMLDivElement> {
  isFirstRow?: boolean;
  larger?: boolean;
}

const SettingsRow = React.forwardRef<HTMLDivElement, SettingsRowProps>(
  ({ className, larger = false, isFirstRow = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex w-full flex-col items-start justify-between gap-2 p-4 md:flex-row md:items-center",
        !isFirstRow && "border-t",
        larger && "!lg:flex-row !lg:items-center",
        className,
      )}
      {...props}
    />
  ),
);
SettingsRow.displayName = "SettingsRow";

// Row title component
const SettingsRowTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
SettingsRowTitle.displayName = "SettingsRowTitle";

// Row description component
const SettingsRowDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SettingsRowDescription.displayName = "SettingsRowDescription";

// Row action wrapper
const SettingsRowAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { larger?: boolean }
>(({ className, larger = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full flex-col items-end md:w-auto md:max-w-xs md:flex-1",
      larger && "md:max-w-md",
      className,
    )}
    {...props}
  />
));
SettingsRowAction.displayName = "SettingsRowAction";

export {
  SettingsSection,
  SettingsHeader,
  SettingsTitle,
  SettingsDescription,
  SettingsContent,
  SettingsRow,
  SettingsRowTitle,
  SettingsRowDescription,
  SettingsRowAction,
};
