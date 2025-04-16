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
  Users,
} from "@church-space/ui/icons";
import Link from "next/link";
import { cn } from "@church-space/ui/cn";

const steps = [
  {
    title: "Add Your Domains",
    description: "Add the domains that you want to send emails from.",
    href: "/settings/domains",
    buttonText: "Add Domains",
    icon: Globe,
    completed: false,
  },
  {
    title: "Add Footer Details",
    description: "Create your default email footer.",
    href: "/emails/templates/edit-footer",
    buttonText: "Edit Footer",
    icon: FooterIcon,
    completed: true,
  },
  {
    title: "Configure PCO List Categories",
    description:
      "Select which PCO List Categories you want to be able to email to.",
    href: "/emails/categories",
    buttonText: "Email Categories",
    icon: Users,
    completed: true,
  },
  {
    title: "Create your first email",
    description: "Design your first email.",
    href: "/emails?newEmailOpen=true",
    buttonText: "Create Email",
    icon: Email,
    completed: true,
  },
  {
    title: "Create a link list",
    description:
      "Create a link list to share important links with your people.",
    href: "/link-lists?newLinkListOpen=true",
    buttonText: "Create Link List",
    icon: LinkFilled,
    completed: true,
  },
  {
    title: "Create a QR Code",
    description: "Create a QR code to share your link list.",
    href: "/qr-codes?newQrCodeOpen=true",
    buttonText: "Create QR Code",
    icon: Qrcode,
    completed: true,
  },
];

export default function WelcomePage() {
  return (
    <div className="mx-auto flex h-screen w-full max-w-2xl flex-col gap-2 px-4 pt-20">
      <h1 className="text-4xl font-bold">Welcome to Church Space</h1>
      <p className="text-lg">Let's get started by setting a few things up.</p>
      <div className="mt-4 flex flex-col gap-4">
        {steps.map((step, index) => (
          <Card
            className={cn(
              "flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-2",
              step.completed && "opacity-40",
            )}
            key={index}
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
              {step.completed ? (
                <Button variant="secondary" className="w-full sm:w-fit">
                  {step.buttonText}
                </Button>
              ) : (
                <Link href={step.href}>
                  <Button className="w-full sm:w-fit" disabled={step.completed}>
                    {step.buttonText}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
