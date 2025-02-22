import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import { Slider } from "@trivo/ui/slider";
export default function DividerForm() {
  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center ">
          <Label>Color</Label>
          <Input className="col-span-2" type="color" />
          <Label>Margin</Label>
          <Slider
            defaultValue={[33]}
            max={100}
            min={0}
            step={1}
            className="col-span-2"
          />
        </div>
      </div>
    </div>
  );
}
