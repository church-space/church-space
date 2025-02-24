import { Label } from "@trivo/ui/label";

export default function TextForm() {
  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="text-sm text-muted-foreground">
          Add your content to the text block, and make chagnes to the formating
          using the toolbar above.
        </div>
      </div>
    </div>
  );
}
