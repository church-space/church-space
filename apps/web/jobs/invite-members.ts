import "server-only";
import { task, queue } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import { Resend } from "resend";
import { SignJWT } from "jose";
import { add } from "date-fns";

interface InviteMemberData {
  email: string;
  role: string;
}

interface InviteMembersPayload {
  organization_id: string;
  invited_by: string;
  members: InviteMemberData[];
}

const inviteMembersQueue = queue({
  name: "invite-members-queue",
  concurrencyLimit: 3,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const inviteMembers = task({
  id: "invite-members",
  queue: inviteMembersQueue,

  run: async (payload: InviteMembersPayload, io) => {
    const supabase = createClient();
    const { organization_id, invited_by, members } = payload;

    if (!members || members.length === 0 || members.length > 10) {
      throw new Error("Invalid number of members. Must be between 1 and 10.");
    }

    // Get organization details
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organization_id)
      .single();

    if (orgError || !orgData) {
      throw new Error(
        `Failed to get organization details: ${orgError?.message}`,
      );
    }

    // Get inviter details
    const { data: inviterData, error: inviterError } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", invited_by)
      .single();

    if (inviterError || !inviterData) {
      throw new Error(
        `Failed to get inviter details: ${inviterError?.message}`,
      );
    }

    const inviterName =
      `${inviterData.first_name || ""} ${inviterData.last_name || ""}`.trim() ||
      "A team member";

    // Process each invite
    for (const member of members) {
      // Check if user with this email already exists
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", member.email)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // PGRST116 means no rows returned
        console.error(
          `Failed to check existing user for ${member.email}:`,
          userError,
        );
        continue;
      }

      // If user exists, check if they're already a member of the organization
      if (existingUser) {
        const { data: existingMembership, error: membershipError } =
          await supabase
            .from("organization_memberships")
            .select("id")
            .eq("user_id", existingUser.id)
            .eq("organization_id", organization_id)
            .single();

        if (membershipError && membershipError.code !== "PGRST116") {
          console.error(
            `Failed to check existing membership for ${member.email}:`,
            membershipError,
          );
          continue;
        }

        // Skip if user is already a member
        if (existingMembership) {
          continue;
        }
      }

      const expirationDate = add(new Date(), { days: 7 });

      // Create JWT token
      const token = await new SignJWT({
        email: member.email,
        role: member.role,
        organization_id,
        exp: Math.floor(expirationDate.getTime() / 1000),
        iat: Math.floor(Date.now() / 1000),
      })
        .setProtectedHeader({ alg: "HS256" })
        .sign(new TextEncoder().encode(process.env.INVITE_MEMBERS_SECRET));

      // Add invite to database
      const { error: inviteError } = await supabase.from("invites").insert({
        email: member.email.trim(),
        organization_id,
        invited_by,
        expires: expirationDate.toISOString(),
        status: "pending",
      });

      if (inviteError) {
        console.error(
          `Failed to create invite for ${member.email}:`,
          inviteError,
        );
        continue;
      }

      // Send invite email
      const inviteLink = `https://churchspace.co/signup?invite=${token}`;

      try {
        await resend.emails.send({
          from: "invites@churchspace.co",
          to: member.email,
          subject: `You've been invited to join ${orgData.name} on Church Space`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Join</title>
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
                        src="https://dcwieoyzmyesvfugjrxn.supabase.co/storage/v1/object/public/email_assets//churchspace-black.png"
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
              <h1 style="margin: 0 0 20px; font-size: 24px; line-height: 32px; color: #333333; text-align: left; word-wrap: break-word; -ms-word-wrap: break-word;">You've been invited to join</h1>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 25px; width: 100%;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f8f8; border-radius: 6px; text-align: center;">
                    <p style="margin: 0; font-size: 20px; font-weight: 600; color: #333333; word-wrap: break-word; -ms-word-wrap: break-word;">${orgData.name}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #555555; text-align: left; word-wrap: break-word; -ms-word-wrap: break-word;">
                <strong>${inviterName}</strong> has invited you to join their organization on Church Space. Click the button below to accept this invitation.
              </p>
              
              <!-- Accept Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 4px; background-color: #6065FE; text-align: center;">
                    <a href="${inviteLink}" target="_blank" style="background-color: #6065FE; border: 1px solid #6065FE; border-radius: 4px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; line-height: 1.2; padding: 12px 24px; text-decoration: none; text-align: center;">Accept Invitation</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 10px; font-size: 14px; line-height: 20px; color: #777777; text-align: left; word-wrap: break-word; -ms-word-wrap: break-word;">
                This invitation will expire in 7 days. If you did not expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f8f8; border-top: 1px solid #eeeeee; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: left; font-size: 14px; color: #888888;">
              <p style="margin: 0; word-wrap: break-word; -ms-word-wrap: break-word;">
                &copy; 2025 Church Space. All rights reserved.
              </p>
              <p style="margin: 0; padding-top: 10px; word-wrap: break-word; -ms-word-wrap: break-word;">
                If you have any questions, please contact our support team at <a href="mailto:support@churchspace.co" style="color: #555555; text-decoration: underline;">support@churchspace.co</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
          text: `You've been invited to join ${orgData.name} on Church Space

${inviterName} has invited you to join their organization on Church Space. Click the link below to accept this invitation:

${inviteLink}

This invitation will expire in 7 days. If you did not expect this invitation, you can safely ignore this email.

© 2025 Church Space. All rights reserved.

If you have any questions, please contact our support team at support@churchspace.co`,
        });
      } catch (error) {
        console.error(`Failed to send invite email to ${member.email}:`, error);
      }
    }
  },
});
