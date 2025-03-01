import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";
import { useQueryState } from "nuqs";
import { render } from "@react-email/render";

export default function EmailPreview() {
  const [previewType, setPreviewType] = useQueryState("previewType");

  return (
    <Tabs
      defaultValue={previewType || "web"}
      onValueChange={(value) => setPreviewType(value)}
    >
      <TabsList>
        <TabsTrigger value="web">Web</TabsTrigger>
        <TabsTrigger value="mobile">Mobile</TabsTrigger>
      </TabsList>
      <TabsContent value="web">
        {" "}
        <div className="flex flex-col gap-4 mx-auto w-full h-full items-start">
          {/* EMAIL HERE */}
        </div>
      </TabsContent>
      <TabsContent value="mobile" className="overflow-auto h-full">
        <div className="flex flex-col gap-4 mx-auto max-w-sm w-full h-full items-start">
          {/* EMAIL HERE */}
        </div>
      </TabsContent>
    </Tabs>
  );
}
