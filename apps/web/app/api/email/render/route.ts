import { generateEmailCode } from "@/lib/generate-email-code";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verify the secret
    const triggerSecret = req.headers.get("X-Trigger-Secret");
    if (
      !triggerSecret ||
      triggerSecret !== process.env.TRIGGER_API_ROUTE_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      sections,
      style,
      footer,
      unsubscribeUrl,
      managePreferencesUrl,
      firstName,
      lastName,
      email,
    } = await req.json();

    // Generate email code
    const emailCode = generateEmailCode(
      sections,
      style,
      footer,
      unsubscribeUrl,
      managePreferencesUrl,
      firstName,
      lastName,
      email,
    );

    // Generate both HTML and plain text versions
    const htmlContent = await render(emailCode);
    const plainTextContent = await render(emailCode, { plainText: true });

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

    const enhancedPlainTextContent = plainTextContent
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

    return NextResponse.json({
      html: enhancedHtmlContent,
      text: enhancedPlainTextContent,
    });
  } catch (error) {
    console.error("Error rendering email:", error);
    return NextResponse.json(
      { error: "Failed to render email" },
      { status: 500 },
    );
  }
}
