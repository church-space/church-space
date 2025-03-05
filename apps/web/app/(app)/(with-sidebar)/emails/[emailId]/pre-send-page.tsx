"use client";

import EmailPreview from "@/components/dnd-builder/email-preview";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Eye } from "lucide-react";
import { useQueryState } from "nuqs";

export default function PreSendPage({ emailId }: { emailId: number }) {
  console.log(emailId);
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");
  return (
    <>
      <Dialog
        open={previewOpen === "true"}
        onOpenChange={(open) => setPreviewOpen(open ? "true" : null)}
      >
        <DialogTrigger asChild>
          <Button variant="ghost">
            <span className="hidden md:block">Preview</span>
            <span className="block md:hidden">
              <Eye />
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[95%] min-w-[95%] p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>

          <EmailPreview />
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">Page</div>
    </>
  );
}
