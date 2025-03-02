import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";
import { useQueryState } from "nuqs";
import { render } from "@react-email/render";
import { generateEmailCode } from "@/lib/generate-email-code";
import { useEmailWithBlocks } from "@/hooks/use-email-with-blocks";
import { useParams } from "next/navigation";
import { Block as BlockType, BlockData } from "@/types/blocks";
import { useEffect, useState } from "react";

export default function EmailPreview() {
  const [previewType, setPreviewType] = useQueryState("previewType");
  const [htmlContent, setHtmlContent] = useState<string>("");
  const params = useParams();
  const emailId = params.emailId
    ? parseInt(params.emailId as string, 10)
    : undefined;
  const { data: emailData } = useEmailWithBlocks(emailId);

  // Convert blocks to sections format
  const sections = [
    {
      id: "main-section",
      blocks:
        emailData?.blocks?.map((block) => ({
          id: block.id.toString(),
          type: block.type as BlockType["type"],
          order: block.order || 0,
          data: block.value as unknown as BlockData,
        })) || [],
    },
  ];

  // Prepare email style
  const style = {
    bgColor: emailData?.email?.blocks_bg_color || "#f4f4f5",
    isInset: emailData?.email?.is_inset || false,
    emailBgColor: emailData?.email?.bg_color || "#ffffff",
    defaultTextColor: emailData?.email?.default_text_color || "#000000",
    defaultFont: emailData?.email?.default_font || "Inter",
    isRounded: emailData?.email?.is_rounded ?? true,
    linkColor: emailData?.email?.link_color || "#0000ff",
  };

  useEffect(() => {
    const renderEmail = async () => {
      // Generate email code
      const emailCode = generateEmailCode(sections, style, emailData?.footer);
      const renderedHtml = await render(emailCode);
      setHtmlContent(renderedHtml);
    };

    renderEmail();
  }, [emailData, sections, style]);

  return (
    <Tabs
      defaultValue={previewType || "web"}
      onValueChange={(value) => setPreviewType(value)}
    >
      <TabsList>
        <TabsTrigger value="web">Web</TabsTrigger>
        <TabsTrigger value="mobile">Mobile</TabsTrigger>
      </TabsList>
      <TabsContent value="web" className="overflow-auto h-[95%]">
        <div className="flex flex-col gap-4 mx-auto w-full h-full items-start">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="Email Preview"
          />
        </div>
      </TabsContent>
      <TabsContent value="mobile" className="overflow-auto h-[95%] ">
        <div className="flex flex-col gap-4 mx-auto max-w-sm w-full h-full items-start">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="Email Preview Mobile"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
