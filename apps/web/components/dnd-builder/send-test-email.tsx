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
import { generateEmailCode } from "@/lib/generate-email-code";
import { render } from "@react-email/render";
import { toast } from "@church-space/ui/use-toast";
import { Section, BlockData, BlockType, EmailStyle } from "@/types/blocks";
import { createClient } from "@church-space/supabase/client";
import { z } from "zod";

interface OrganizationData {
  name: string;
  default_email: string;
  domains: {
    domain: string;
  } | null;
  customTrigger?: React.ReactNode;
}

export default function SendTestEmail({
  orgFooterDetails,
  customTrigger,
}: {
  orgFooterDetails: any;
  customTrigger?: React.ReactNode;
}) {
  const [emailInput, setEmailInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const emailId = params.emailId
    ? parseInt(params.emailId as string, 10)
    : undefined;

  // Change: Don't use the hook to fetch data automatically, we'll fetch on-demand
  // const { data: emailData } = useEmailWithBlocks(emailId);

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

    if (!emailId) {
      toast({
        title: "Error",
        description: "Email ID not available",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      setIsOpen(false); // Close the modal immediately

      // Get email data only when needed
      const supabase = createClient();

      // Fetch email data
      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .select(
          `
          id,
          subject,
          status,
          style,
          organization_id,
          type, 
          preview_text
        `,
        )
        .eq("id", emailId)
        .single();

      if (emailError) {
        throw emailError;
      }

      // Fetch blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from("email_blocks")
        .select("*")
        .eq("email_id", emailId)
        .order("order", { ascending: true });

      if (blocksError) {
        throw blocksError;
      }

      // Fetch footer data
      const { data: footerData, error: footerError } = await supabase
        .from("email_footers")
        .select("*")
        .eq("email_id", emailId)
        .maybeSingle();

      if (footerError && footerError.code !== "PGRST116") {
        throw footerError;
      }

      const emailWithBlocks = {
        email: emailData,
        blocks: blocksData || [],
        footer: footerData,
      };

      // Get organization's default email and domain
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select(
          `
          name,
          default_email,
          domains!organizations_default_email_domain_fkey (
            domain
          )
        `,
        )
        .eq("id", emailWithBlocks.email.organization_id)
        .single<OrganizationData>();

      if (orgError) {
        throw new Error("Failed to fetch organization data");
      }

      let fromEmail: string;
      if (!orgData?.default_email || !orgData.domains?.domain) {
        // Use default email if no organization email is set
        fromEmail = "test@platform.churchspace.co";

        // Show recommendation toast
        toast({
          title: "Using Default Email",
          description:
            "We recommend setting up your own email domain in organization settings for a more professional appearance.",
          action: (
            <Button
              size="sm"
              onClick={() => {
                router.push("/settings/organization");
              }}
            >
              Set Up Now
            </Button>
          ),
        });
      } else {
        // Combine default email with domain
        fromEmail = `${orgData.default_email}@${orgData.domains.domain}`;
      }

      // Convert blocks to sections format
      const sections: Section[] = [
        {
          id: "main-section",
          blocks: emailWithBlocks.blocks.map((block) => ({
            id: block.id.toString(),
            type: block.type as BlockType,
            order: block.order || 0,
            data: block.value as unknown as BlockData,
          })),
        },
      ];

      // Get style from email data
      const emailStyle = emailWithBlocks.email.style as unknown as EmailStyle;
      const style = {
        bgColor: emailStyle?.blocks_bg_color || "#ffffff",
        isInset: emailStyle?.is_inset || false,
        cornerRadius: emailStyle?.corner_radius || 0,
        emailBgColor: emailStyle?.bg_color || "#eeeeee",
        defaultTextColor: emailStyle?.default_text_color || "#000000",
        accentTextColor: emailStyle?.accent_text_color || "#000000",
        defaultFont: emailStyle?.default_font || "sans-serif",
        linkColor: emailStyle?.link_color || "#0000ff",
        blockSpacing: emailStyle?.block_spacing || 16,
      };

      // Generate email code
      const emailCode = generateEmailCode(
        sections,
        style,
        emailWithBlocks.footer,
        orgFooterDetails,
        emailWithBlocks.email.preview_text || undefined,
      );
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
      const response = await fetch("/api/emails/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: [
            {
              from: `${orgData.name} Test Email <${fromEmail}>`,
              to: emails,
              subject: "TEST: " + emailWithBlocks.email.subject || "Test Email",
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
        {customTrigger ? (
          customTrigger
        ) : (
          <Button variant="outline" className="hidden md:block">
            Send Test
          </Button>
        )}
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
          maxLength={500}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel{" "}
            <span className="rounded bg-muted px-1 text-xs text-muted-foreground">
              Esc
            </span>
          </Button>
          <Button onClick={handleSendTestEmail} disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
