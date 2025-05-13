import "server-only";

import { queue, task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import { createClient } from "@church-space/supabase/job";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Interface for the payload
interface SendFailureNotificationPayload {
  emailId: number;
  organizationId: string;
  emailSubject: string;
  errorMessage: string;
}

const emailQueue = queue({
  name: "platform-emails-queue",
  concurrencyLimit: 3,
});

export const sendFailureNotification = task({
  id: "send-failure-notification",
  run: async (payload: SendFailureNotificationPayload) => {
    const { emailId, organizationId, emailSubject, errorMessage } = payload;
    const supabase = createClient();

    let userEmail = "";

    try {
      const { data: email, error: emailError } = await supabase
        .from("emails")
        .select("sent_by, users(email)")
        .eq("id", emailId)
        .eq("organization_id", organizationId)
        .single();

      if (emailError || !email) {
        throw new Error("Email not found");
      }

      if (!email.users) {
        console.log(
          `User not found for emailId ${emailId} (sent_by: ${email.sent_by}). Skipping failure notification.`,
        );
        return {
          email: userEmail,
          success: true,
          message: "User not found, notification not sent.",
        };
      }

      userEmail = email.users.email;

      const response = await resend.emails.send(
        {
          from: `Church Space <notifications@platform.churchspace.co>`,
          to: userEmail,
          subject: `Email Failed to Send: ${emailSubject}`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email failed to send</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" align="center" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; margin: 0 auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: left; vertical-align: middle;">
                    <!-- Church Space Logo with Link -->
                    <a href="https://churchspace.co" target="_blank" style="text-decoration: none; color: #000000; display: inline-flex; align-items: center;">
                      <img
                        src="https://auth.churchspace.co/storage/v1/object/public/email_assets//churchspace-black.png"
                        alt="Church Space Logo"
                        height="24"
                        style="vertical-align: middle; display: inline-block; width: auto;"
                      />
                      <span style="font-size: 16px; font-weight: 600; letter-spacing: -0.5px; margin-left: 6px; vertical-align: middle;">Church Space</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 30px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; line-height: 32px; color: #333333; text-align: left; word-wrap: break-word; -ms-word-wrap: break-word;">Your email failed to send</h1>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #555555; text-align: left; word-wrap: break-word; -ms-word-wrap: break-word;">
                Your email, <strong>${emailSubject}</strong>, failed to send. Please address the issue below and try again.
              </p>
              
              <a href="https://churchspace.co/emails/${emailId}" target="_blank">
              <p style="margin: 0 0 30px; padding: 15px; font-size: 16px; background-color: #f8f8f8; border-radius: 6px; text-align: left; font-weight: bold; color: #333333; font-family: 'Courier New', monospace; word-wrap: break-word; -ms-word-wrap: break-word;">
              ${errorMessage}
              </p>
                </a>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #555555; text-align: left; word-wrap: break-word; -ms-word-wrap: break-word;">
                If you have any questions, please contact our support team at <a href="mailto:support@churchspace.co" style="color: #555555; text-decoration: underline;">support@churchspace.co</a>
              </p>
            </td>
          </tr>
          
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f8f8; border-top: 1px solid #eeeeee; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: left; font-size: 14px; color: #888888;">
              <p style="margin: 0; word-wrap: break-word; -ms-word-wrap: break-word;">
                &copy; 2025 Church Space. All rights reserved.
              </p>
        
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
          text: `Your email, ${emailSubject}, failed to send. Please address the issue below and try again.

${errorMessage}

If you have any questions, please contact our support team at support@churchspace.co.

© 2025 Church Space. All rights reserved.`,
        },
        {
          idempotencyKey: `${emailId}-${organizationId}-${errorMessage}`,
        },
      );

      return {
        email: userEmail,
        success: true,
        resendId: response.data?.id,
      };
    } catch (error) {
      console.error(`Failed to send notification to ${userEmail}:`, error);
      return { email: userEmail, success: false, error };
    }
  },
});
