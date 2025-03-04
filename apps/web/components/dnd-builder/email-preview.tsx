import { useEmailWithBlocks } from "@/hooks/use-email-with-blocks";
import { generateEmailCode } from "@/lib/generate-email-code";
import { BlockData, Block as BlockType } from "@/types/blocks";
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
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

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
  const emailStyle = (emailData?.email?.style || {}) as any;

  const style = {
    bgColor: emailStyle.blocks_bg_color || "#f4f4f5",
    isInset: emailStyle.is_inset || false,
    emailBgColor: emailStyle.bg_color || "#ffffff",
    defaultTextColor: emailStyle.default_text_color || "#000000",
    defaultFont: emailStyle.default_font || "Inter",
    isRounded: emailStyle.is_rounded ?? true,
    linkColor: emailStyle.link_color || "#0000ff",
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
      <div className="flex items-center justify-between">
        {showBackButton && (
          <Link
            href={`/emails/${emailId}`}
            className="group flex -translate-x-px cursor-pointer flex-row items-center gap-1 text-sm font-medium"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
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
      <TabsContent value="web" className="h-[95%] overflow-auto">
        <div className="mx-auto flex h-full w-full flex-col items-start gap-4">
          <iframe
            srcDoc={htmlContent}
            className="h-full w-full border-0"
            title="Email Preview"
          />
        </div>
      </TabsContent>
      <TabsContent
        value="mobile"
        className="flex h-[95%] items-center justify-center overflow-auto"
      >
        <div className="mx-auto h-full max-h-[800px] min-h-[200px] w-full max-w-sm items-start rounded-[45px] border-8 border-black shadow-lg dark:border-muted">
          <iframe
            srcDoc={htmlContent}
            className="h-full w-full rounded-[36px] border-0"
            title="Email Preview Mobile"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
