"use client";

import { useState } from "react";
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
  LinkFilled,
  Qrcode,
  NewEmail as NewEmailIcon,
  Users,
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
};

const steps = [
  {
    title: "Add your domains",
    description: "Add the domains that you want to send emails from.",
    href: "/settings/domains",
    buttonText: "Add",
    icon: Globe,
    completed: false,
    ownerOnly: true,
  },
  {
    title: "Import your unsubscribes",
    description:
      "Import your unsubscribes from your previous email provider to prevent emails from being sent to people who have unsubscribed in the past.",
    href: "/settings/unsubscribes",
    buttonText: "Import",
    icon: Users,
    completed: false,
    ownerOnly: true,
  },
  {
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
    title: "Create your first email",
    description: "Design your first email.",
    href: "/emails?newEmailOpen=true",
    buttonText: "Create",
    icon: Email,
    completed: false,
    openDialog: "email",
    ownerOnly: false,
  },
  {
    title: "Create a link page",
    description:
      "Create a link page to share important links with your people.",
    href: "/link-pages?newLinkListOpen=true",
    buttonText: "Create",
    icon: LinkFilled,
    completed: false,
    ownerOnly: false,
  },
  {
    title: "Create a QR Code",
    description: "Create a QR code to share your link page.",
    href: "/qr-codes?newQrCodeOpen=true",
    buttonText: "Create",
    icon: Qrcode,
    completed: false,
    openDialog: "qrcode",
    ownerOnly: false,
  },
];

export default function WelcomePage() {
  const [newEmailDialogOpen, setNewEmailDialogOpen] = useState(false);
  const [newQrCodeDialogOpen, setNewQrCodeDialogOpen] = useState(false);

  const { organizationId, role } = useUser();
  return (
    <div className="relative">
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
        className="mx-auto flex h-screen w-full max-w-2xl flex-col gap-2 px-4 pt-8 md:pt-20"
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
        <motion.div
          className="mt-4 flex flex-col gap-4"
          variants={containerVariants}
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card
                className={cn(
                  "flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-2",
                  step.completed && "opacity-40",
                )}
              >
                <CardHeader className="flex-row items-start gap-2.5 pb-2 pt-5 sm:pb-5">
                  <div className="mt-1 aspect-square flex-shrink-0 rounded-md border border-primary bg-secondary p-1 text-primary">
                    <step.icon height={"24"} width={"24"} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="w-full sm:w-fit sm:p-0 sm:pr-4">
                  {step.openDialog ? (
                    <Button
                      variant={step.completed ? "secondary" : "default"}
                      className="w-full sm:w-fit"
                      onClick={() => {
                        if (step.openDialog === "email") {
                          setNewEmailDialogOpen(true);
                        } else if (step.openDialog === "qrcode") {
                          setNewQrCodeDialogOpen(true);
                        }
                      }}
                    >
                      {step.buttonText}
                    </Button>
                  ) : step.completed ? (
                    <Button variant="secondary" className="w-full sm:w-fit">
                      {step.buttonText}
                    </Button>
                  ) : (
                    <Link href={step.href}>
                      <Button
                        className="w-full sm:w-fit"
                        disabled={step.completed}
                      >
                        {step.buttonText}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
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
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
