"use client";

import { useState, useEffect } from "react";
import { Button } from "@church-space/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import {
  Email,
  FooterIcon,
  Globe,
  Qrcode,
  NewEmail as NewEmailIcon,
  Users,
  LinkIcon,
  Palette,
  XIcon,
} from "@church-space/ui/icons";
import Link from "next/link";
import { cn } from "@church-space/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import NewEmail from "@/components/forms/new-email";
import NewQRCode from "@/components/forms/new-qr-code";
import { useUser } from "@/stores/use-user";
import { motion } from "framer-motion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@church-space/ui/breadcrumb";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import NewLinkList from "@/components/forms/new-link-list";

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 },
  },
  dismissed: {
    opacity: 0.9,
    transition: { duration: 0.8 },
  },
};

const steps = [
  {
    id: "verify-domain",
    title: "Verify your domain",
    description: "Verify your domain to start sending emails to your people.",
    href: "/settings/domains",
    buttonText: "Verify",
    icon: Globe,
    completed: false,
    ownerOnly: true,
  },
  {
    id: "import-contacts",
    title: "Import additional contacts",
    description:
      "Import your contacts from your previous email provider to make sure they're on the list. We also recommend importing your unsubscribes to prevent emails from being sent to people who have unsubscribed in the past.",
    href: "/people/import",
    buttonText: "Import",
    icon: Users,
    completed: false,
    ownerOnly: true,
  },
  {
    id: "brand-colors",
    title: "Add your brand colors",
    description: "Add your brand colors to your church space.",
    href: "/settings/brand-colors",
    buttonText: "Add",
    icon: Palette,
    completed: false,
    ownerOnly: false,
  },
  {
    id: "email-footer",
    title: "Create your default email footer",
    description:
      "Design the footer that will be used as a deafult for new emails.",
    href: "/emails/templates/edit-footer",
    buttonText: "Create",
    icon: FooterIcon,
    completed: false,
    ownerOnly: true,
  },
  {
    id: "first-email",
    title: "Create your first email",
    description: "Design your first email.",
    href: "/emails?newEmailOpen=true",
    buttonText: "Create",
    icon: Email,
    completed: false,
    openDialog: "email",
    ownerOnly: false,
  },
  // {
  //   title: "Create a link page",
  //   description:
  //     "Create a link page to share important links with your people.",
  //   href: "/link-pages?newLinkListOpen=true",
  //   buttonText: "Create",
  //   icon: LinkFilled,
  //   completed: false,
  //   openDialog: "linkpage",
  //   ownerOnly: false,
  // },
  // {
  //   title: "Create a QR Code",
  //   description: "Create a QR code to share your link page.",
  //   href: "/qr-codes?newQrCodeOpen=true",
  //   buttonText: "Create",
  //   icon: Qrcode,
  //   completed: false,
  //   openDialog: "qrcode",
  //   ownerOnly: false,
  // },
];

export default function WelcomePage() {
  const [newEmailDialogOpen, setNewEmailDialogOpen] = useState(false);
  const [newQrCodeDialogOpen, setNewQrCodeDialogOpen] = useState(false);
  const [newLinkPageDialogOpen, setNewLinkPageDialogOpen] = useState(false);
  const [sortedSteps, setSortedSteps] = useState(steps);
  const [dismissedStepIds, setDismissedStepIds] = useState<string[]>([]);
  const { organizationId, role } = useUser();

  // Load dismissed steps from local storage on component mount
  useEffect(() => {
    const storedDismissedSteps = JSON.parse(
      localStorage.getItem("dismissedSteps") || "[]",
    );
    setDismissedStepIds(storedDismissedSteps);

    // Filter steps based on role and sort dismissed items to end
    const availableSteps = steps.filter(
      (step) => !step.ownerOnly || role === "owner",
    );

    const sorted = [...availableSteps].sort((a, b) => {
      const aIsDismissed = storedDismissedSteps.includes(a.id);
      const bIsDismissed = storedDismissedSteps.includes(b.id);

      if (aIsDismissed && !bIsDismissed) return 1;
      if (!aIsDismissed && bIsDismissed) return -1;
      return 0;
    });

    setSortedSteps(sorted);
  }, [role]);

  // Function to dismiss a step
  const dismissStep = (stepId: string) => {
    // Get current dismissed steps from local storage
    const storedDismissedSteps = JSON.parse(
      localStorage.getItem("dismissedSteps") || "[]",
    );

    // Add the new step ID to the dismissed steps array if not already included
    if (!storedDismissedSteps.includes(stepId)) {
      const updatedDismissedSteps = [...storedDismissedSteps, stepId];

      // Save back to local storage
      localStorage.setItem(
        "dismissedSteps",
        JSON.stringify(updatedDismissedSteps),
      );
      setDismissedStepIds(updatedDismissedSteps);

      // Force a complete re-sorting to ensure consistent spacing
      const newSorted = [...sortedSteps].sort((a, b) => {
        const aIsDismissed = updatedDismissedSteps.includes(a.id);
        const bIsDismissed = updatedDismissedSteps.includes(b.id);

        if (aIsDismissed && !bIsDismissed) return 1;
        if (!aIsDismissed && bIsDismissed) return -1;
        return 0;
      });

      // Create a new array to force re-render
      setSortedSteps(newSorted);
    }
  };

  // Function to undismiss a step
  const undismissStep = (stepId: string) => {
    // Get current dismissed steps from local storage
    const storedDismissedSteps = JSON.parse(
      localStorage.getItem("dismissedSteps") || "[]",
    );

    // Remove the step ID from the dismissed steps array
    const updatedDismissedSteps = storedDismissedSteps.filter(
      (id: string) => id !== stepId,
    );

    // Save back to local storage
    localStorage.setItem(
      "dismissedSteps",
      JSON.stringify(updatedDismissedSteps),
    );
    setDismissedStepIds(updatedDismissedSteps);

    // Force a complete re-sorting to ensure consistent spacing
    const newSorted = [...sortedSteps].sort((a, b) => {
      const aIsDismissed = updatedDismissedSteps.includes(a.id);
      const bIsDismissed = updatedDismissedSteps.includes(b.id);

      if (aIsDismissed && !bIsDismissed) return 1;
      if (!aIsDismissed && bIsDismissed) return -1;
      return 0;
    });

    // Create a new array to force re-render
    setSortedSteps(newSorted);
  };

  return (
    <div className="relative min-h-[calc(100vh-1rem)] bg-gradient-to-b from-background to-secondary/10">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Welcome</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <motion.div
        className="mx-auto mb-16 flex w-full max-w-2xl flex-col gap-2 px-4 py-8 md:py-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 className="text-4xl font-bold" variants={itemVariants}>
          Welcome to Church Space
        </motion.h1>
        <motion.p className="text-lg" variants={itemVariants}>
          Let&apos;s get started by setting a few things up.
        </motion.p>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {sortedSteps.map((step) => {
            const isDismissed = dismissedStepIds.includes(step.id);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isDismissed ? 0.9 : 1,
                  y: 0,
                  transition: { duration: isDismissed ? 0.8 : 0.25 },
                }}
                layout="position"
                layoutId={`step-${step.id}`}
                transition={{
                  layout: {
                    duration: 0.8,
                    type: "spring",
                    stiffness: 90,
                    damping: 15,
                  },
                }}
                className="w-full"
              >
                <Card
                  className={cn(
                    "group relative flex flex-col justify-between gap-2 transition-all duration-700 hover:bg-secondary/30 sm:flex-row sm:items-center sm:gap-2",
                    isDismissed && "opacity-90",
                  )}
                >
                  <CardHeader className="flex-row items-start gap-2.5 pb-2 pt-5 sm:pb-5">
                    <div
                      className={cn(
                        "mt-1 aspect-square flex-shrink-0 rounded-md border border-primary bg-secondary p-1 text-primary",
                        isDismissed &&
                          "border-muted-foreground bg-muted text-muted-foreground",
                      )}
                    >
                      <step.icon height={"24"} width={"24"} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <CardTitle
                        className={cn(isDismissed && "text-muted-foreground")}
                      >
                        {step.title}
                      </CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="w-full sm:w-fit sm:p-0 sm:pr-4">
                    {step.openDialog ? (
                      <Button
                        variant={isDismissed ? "outline" : "default"}
                        className={cn(
                          "w-full sm:w-fit",
                          isDismissed && "text-muted-foreground",
                        )}
                        onClick={() => {
                          if (step.openDialog === "email") {
                            setNewEmailDialogOpen(true);
                          } else if (step.openDialog === "linkpage") {
                            setNewLinkPageDialogOpen(true);
                          } else if (step.openDialog === "qrcode") {
                            setNewQrCodeDialogOpen(true);
                          }
                        }}
                      >
                        {step.buttonText}
                      </Button>
                    ) : isDismissed ? (
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full sm:w-fit",
                          isDismissed && "text-muted-foreground",
                        )}
                      >
                        {step.buttonText}
                      </Button>
                    ) : (
                      <Link href={step.href}>
                        <Button
                          className={cn(
                            "w-full sm:w-fit",
                            isDismissed && "text-muted-foreground",
                          )}
                          disabled={isDismissed}
                          variant={isDismissed ? "outline" : "default"}
                        >
                          {step.buttonText}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                  {!isDismissed ? (
                    <div
                      className="absolute -top-3 left-2 flex cursor-pointer items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs opacity-0 transition-all duration-200 hover:text-destructive group-hover:opacity-100"
                      onClick={() => dismissStep(step.id)}
                    >
                      <XIcon /> Dismiss
                    </div>
                  ) : (
                    <div
                      className="absolute -top-3 left-2 flex cursor-pointer items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs opacity-0 transition-all duration-200 hover:text-primary group-hover:opacity-100"
                      onClick={() => undismissStep(step.id)}
                    >
                      <span className="mr-1 inline-block rotate-45">
                        <XIcon />
                      </span>
                      Restore
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      <Dialog open={newEmailDialogOpen} onOpenChange={setNewEmailDialogOpen}>
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <NewEmailIcon />
              Create New Email
            </DialogTitle>
            <DialogDescription className="text-pretty text-left">
              What&apos;s the subject of your email? You can always change it
              later.
            </DialogDescription>
          </DialogHeader>
          <NewEmail
            organizationId={organizationId ?? ""}
            setIsNewEmailOpen={setNewEmailDialogOpen}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={newQrCodeDialogOpen} onOpenChange={setNewQrCodeDialogOpen}>
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-1">
              <Qrcode height={"20"} width={"20"} /> Create New QR Code
            </DialogTitle>
          </DialogHeader>
          <NewQRCode
            organizationId={organizationId ?? ""}
            setIsNewQRCodeOpen={setNewQrCodeDialogOpen}
            isSidebar={false}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={newLinkPageDialogOpen}
        onOpenChange={setNewLinkPageDialogOpen}
      >
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-1">
              <LinkIcon height={"20"} width={"20"} /> Create New Link Page
            </DialogTitle>
          </DialogHeader>
          <NewLinkList
            organizationId={organizationId ?? ""}
            setIsNewLinkListOpen={setNewLinkPageDialogOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
