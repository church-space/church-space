import { useEmailWithBlocks } from "@/hooks/use-email-with-blocks";
import { generateEmailCode } from "@/lib/generate-email-code";
import { BlockData, Block as BlockType } from "@/types/blocks";
import { Button } from "@church-space/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";
import { render } from "@react-email/render";
import { ChevronLeft } from "@church-space/ui/icons";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function EmailPreview({
  showBackButton = false,
}: {
  showBackButton?: boolean;
}) {
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
      <div className="flex justify-between items-center">
        {showBackButton && (
          <Link
            href={`/emails/${emailId}`}
            className="flex flex-row gap-1 items-center font-medium  text-sm cursor-pointer group  -translate-x-px"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">
              <ChevronLeft height={"14"} width={"14"} />
            </span>
            Back to Email
          </Link>
        )}
        <TabsList>
          <TabsTrigger value="web">Web</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="web" className="overflow-auto h-[95%]">
        <div className="flex flex-col gap-4 mx-auto w-full h-full items-start">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="Email Preview"
          />
        </div>
      </TabsContent>
      <TabsContent
        value="mobile"
        className="overflow-auto h-[95%] items-center justify-center flex"
      >
        <div className="mx-auto max-w-sm items-start w-full min-h-[200px] max-h-[800px] h-full  border-8 border-black dark:border-muted rounded-[45px] shadow-lg ">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0 rounded-[36px] "
            title="Email Preview Mobile"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
