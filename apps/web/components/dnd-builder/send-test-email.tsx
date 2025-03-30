"use client";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Input } from "@church-space/ui/input";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEmailWithBlocks } from "@/hooks/use-email-with-blocks";
import { generateEmailCode } from "@/lib/generate-email-code";
import { render } from "@react-email/render";
import { toast } from "@church-space/ui/use-toast";
import { Section, BlockData, BlockType, EmailStyle } from "@/types/blocks";
import { createClient } from "@church-space/supabase/client";
import { z } from "zod";

interface OrganizationData {
  default_email: string;
  domains: {
    domain: string;
  } | null;
}

export default function SendTestEmail() {
  const [emailInput, setEmailInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const emailId = params.emailId
    ? parseInt(params.emailId as string, 10)
    : undefined;
  const { data: emailData } = useEmailWithBlocks(emailId);

  const validateEmails = (emails: string[]) => {
    const emailSchema = z.string().email();
    const emailArraySchema = z.array(emailSchema).min(1).max(5);

    try {
      emailArraySchema.parse(emails);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        if (firstError.code === "too_small") {
          return "Please enter at least one email address";
        }
        if (firstError.code === "too_big") {
          return "You can only send to up to 5 email addresses";
        }
        if (firstError.code === "invalid_string") {
          return `Invalid email address: ${firstError.path.join(".")}`;
        }
        return "Please enter valid email addresses";
      }
      return "An error occurred while validating emails";
    }
  };

  const handleSendTestEmail = async () => {
    // Split by comma and clean up each email
    const emails = emailInput
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    const validationError = validateEmails(emails);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (!emailData) {
      toast({
        title: "Error",
        description: "Email data not available",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      setIsOpen(false); // Close the modal immediately

      // Show loading toast
      const loadingToast = toast({
        title: "Sending Test Email",
        description: "Please wait while we send your test email...",
      });

      // Get organization's default email and domain
      const supabase = createClient();
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select(
          `
          default_email,
          domains!organizations_default_email_domain_fkey (
            domain
          )
        `,
        )
        .eq("id", emailData.email.organization_id)
        .single<OrganizationData>();

      if (orgError) {
        throw new Error("Failed to fetch organization data");
      }

      if (!orgData?.default_email || !orgData.domains?.domain) {
        toast({
          title: "Error",
          description: (
            <div>
              No default email or domain set for your organization.{" "}
              <a
                href="/settings/organization"
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/settings/organization");
                }}
              >
                Set it up here
              </a>
              .
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      // Combine default email with domain
      const fromEmail = `${orgData.default_email}@${orgData.domains.domain}`;

      // Convert blocks to sections format
      const sections: Section[] = [
        {
          id: "main-section",
          blocks: emailData.blocks.map((block) => ({
            id: block.id.toString(),
            type: block.type as BlockType,
            order: block.order || 0,
            data: block.value as unknown as BlockData,
          })),
        },
      ];

      // Get style from email data
      const emailStyle = emailData.email.style as unknown as EmailStyle;
      const style = {
        bgColor: emailStyle?.blocks_bg_color || "#ffffff",
        isInset: emailStyle?.is_inset || false,
        isRounded: emailStyle?.is_rounded || false,
        emailBgColor: emailStyle?.bg_color || "#eeeeee",
        defaultTextColor: emailStyle?.default_text_color || "#000000",
        defaultFont: emailStyle?.default_font || "sans-serif",
        linkColor: emailStyle?.link_color || "#0000ff",
      };

      // Generate email code
      const emailCode = generateEmailCode(sections, style, emailData.footer);
      const htmlContent = await render(emailCode);

      // Add additional email client compatibility headers
      const enhancedHtmlContent = htmlContent
        .replace(
          "<html",
          '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"',
        )
        .replace(
          "<head>",
          `<head>
          <meta name="color-scheme" content="only">
          <!--[if gte mso 9]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->`,
        );

      // Send to API
      const response = await fetch("/api/email/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: [
            {
              from: fromEmail,
              to: emails,
              subject: "TEST: " + emailData.email.subject || "Test Email",
              html: enhancedHtmlContent,
              text: "This is a test email sent from Church Space.",
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send test email");
      }

      // Dismiss loading toast and show success
      loadingToast.dismiss();
      toast({
        title: "Success",
        description: "Test email sent successfully",
      });
      setEmailInput("");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hidden md:block">
          Send Test
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Enter up to 5 email addresses separated by commas.
          </DialogDescription>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Email addresses (comma-separated)"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendTestEmail();
            }
          }}
        />
        <DialogFooter>
          <Button onClick={handleSendTestEmail} disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
