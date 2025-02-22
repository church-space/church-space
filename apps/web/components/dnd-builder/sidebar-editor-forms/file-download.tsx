import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";

export default function FileDownloadForm() {
  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center ">
          <Label>Title</Label>
          <Input className="col-span-2" placeholder="Title" />
          <Label>File</Label>
          <Input className="col-span-2" type="file" />
          <Label>BG Color</Label>
          <Input className="col-span-2" type="color" />
          <Label>Text Color</Label>
          <Input className="col-span-2" type="color" />
        </div>
      </div>
    </div>
  );
}
