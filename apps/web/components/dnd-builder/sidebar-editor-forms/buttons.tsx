import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@trivo/ui/select";
export default function AuthorForm() {
  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center ">
          <Label>Text</Label>
          <Input className="col-span-2" placeholder="Name" />
          <Label>Link</Label>
          <Input className="col-span-2" placeholder="Title" />
          <Label>Color</Label>
          <Input className="col-span-2" type="color" />
          <Label>Style</Label>
          <Select>
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
          <Label>Size</Label>
          <Select>
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit</SelectItem>
              <SelectItem value="full">Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
