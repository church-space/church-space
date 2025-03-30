import { generateEmailCode } from "@/lib/generate-email-code";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sections, style, footer, unsubscribeUrl, managePreferencesUrl } =
      await req.json();

    // Generate email code
    const emailCode = generateEmailCode(
      sections,
      style,
      footer,
      unsubscribeUrl,
      managePreferencesUrl,
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

    return NextResponse.json({ html: enhancedHtmlContent });
  } catch (error) {
    console.error("Error rendering email:", error);
    return NextResponse.json(
      { error: "Failed to render email" },
      { status: 500 },
    );
  }
}
