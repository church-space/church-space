import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Input } from "@church-space/ui/input";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useEmailWithBlocks } from "@/hooks/use-email-with-blocks";
import { generateEmailCode } from "@/lib/generate-email-code";
import { render } from "@react-email/render";
import { toast } from "@church-space/ui/use-toast";
import { Section, BlockData, BlockType } from "@/types/blocks";

export default function SendTestEmail() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const params = useParams();
  const emailId = params.emailId
    ? parseInt(params.emailId as string, 10)
    : undefined;
  const { data: emailData } = useEmailWithBlocks(emailId);

  const handleSendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
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
      const style = {
        bgColor: emailData.email.blocks_bg_color || "#ffffff",
        isInset: emailData.email.is_inset || false,
        isRounded: emailData.email.is_rounded || false,
        emailBgColor: emailData.email.bg_color || "#eeeeee",
        defaultTextColor: emailData.email.default_text_color || "#000000",
        defaultFont: emailData.email.default_font || "sans-serif",
        linkColor: emailData.email.link_color || "#0000ff",
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
      const response = await fetch("/api/emails/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: [
            {
              from: "thomas@trivo.app",
              to: [email],
              subject: emailData.email.subject || "Test Email",
              html: enhancedHtmlContent,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send test email");
      }

      toast({
        title: "Success",
        description: "Test email sent successfully",
      });
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="hidden md:block">
          Send Test
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
