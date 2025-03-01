import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";
import { useQueryState } from "nuqs";

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
        <TabsTrigger value="plain-text">Plain Text</TabsTrigger>
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
      <TabsContent value="plain-text">
        <div className=" mx-auto w-full max-w-2xl">
          Ad nulla laboris cillum et proident aliqua irure commodo exercitation
          incididunt. Aute sit pariatur duis velit consequat voluptate. Est
          voluptate deserunt et sit voluptate fugiat reprehenderit ea anim.
          Officia anim laborum incididunt culpa reprehenderit do. Id nisi culpa
          labore do officia labore sint commodo velit amet officia. Qui do
          proident pariatur tempor eu anim veniam cupidatat fugiat aute. Minim
          qui exercitation consectetur veniam culpa amet est Lorem deserunt quis
          quis fugiat. Sit consequat minim ut adipisicing dolore consequat
          culpa. Dolor est consequat laborum enim quis pariatur exercitation
          veniam commodo. Veniam sit do amet occaecat fugiat dolor voluptate
          sunt incididunt pariatur officia mollit. Culpa sit et ullamco sit
          Lorem qui sint anim incididunt incididunt adipisicing. Sit proident
          elit veniam ipsum amet aute duis minim pariatur proident est aute
          minim nostrud.
        </div>
      </TabsContent>
    </Tabs>
  );
}
