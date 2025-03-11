import { InfoIcon } from "lucide-react";
import { Button } from "@church-space/ui/button";

export default function TextForm({
  setActiveForm,
}: {
  setActiveForm?: (
    form:
      | "default"
      | "email-style"
      | "block"
      | "email-footer"
      | "email-templates",
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex items-start gap-2 rounded-md border bg-accent p-3 text-muted-foreground">
        <InfoIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="text-sm">
          <p>
            Add your content to the text block, and make changes to the
            formatting using the toolbar above.
          </p>
        </div>
      </div>
      <Button
        onClick={() => {
          setActiveForm && setActiveForm("email-style");
        }}
      >
        Email Style
      </Button>
    </div>
  );
}
