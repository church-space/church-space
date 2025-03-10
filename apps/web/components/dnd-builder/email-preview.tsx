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
import { ChevronLeft, ChevronRight } from "@church-space/ui/icons";
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
          <div className="sticky w-full rounded-t-[36px] border-b bg-card pb-3 pt-2">
            <div className="mx-auto h-8 w-28 rounded-full bg-black"></div>
            <div className="flex w-full items-center justify-between px-4 pt-2">
              <div className="flex items-center gap-0.5 text-blue-500">
                <ChevronLeft strokewidth={2} height={"20"} width={"20"} />{" "}
                <div className="flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-center text-xs text-white">
                  14
                </div>
              </div>
              <div className="flex items-center gap-3 text-blue-500">
                <div className="rotate-90">
                  <ChevronLeft strokewidth={2} height={"20"} width={"20"} />
                </div>
                <div className="-rotate-90">
                  <ChevronLeft strokewidth={2} height={"20"} width={"20"} />
                </div>
              </div>
            </div>
          </div>
          <iframe
            srcDoc={htmlContent}
            className="h-full max-h-[706px] w-full rounded-b-[36px] border-0"
            title="Email Preview Mobile"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
