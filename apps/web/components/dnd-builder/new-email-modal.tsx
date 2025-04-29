import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useQueryState, parseAsBoolean } from "nuqs";
import ArticleSvgPath from "./article.svg";
import UpdatesSvgPath from "./updates.svg";
import { Button } from "@church-space/ui/button";
import { CardContent } from "@church-space/ui/card";
import { Card } from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Email,
  TemplatesIcon,
} from "@church-space/ui/icons";
export default function NewEmailModal() {
  const [newEmailModalOpen = false, setNewEmailModalOpen] = useQueryState(
    "newEmail",
    parseAsBoolean,
  );
  return (
    <Dialog
      open={newEmailModalOpen ?? false}
      onOpenChange={setNewEmailModalOpen}
    >
      <DialogContent className="max-w-screen-md">
        <DialogHeader>
          <DialogTitle>How do you want to start?</DialogTitle>
        </DialogHeader>
        <div className="mx-auto flex gap-8">
          {/* TODO: Make these clickable */}
          <div className="rounded-lg border bg-primary/20 p-4 transition-all duration-300 hover:bg-primary/30">
            <img
              src={ArticleSvgPath.src}
              alt="Article Template"
              style={{ width: "100px", height: "auto", cursor: "pointer" }}
            />
          </div>
          <div className="rounded-lg border bg-primary/20 p-4 transition-all duration-300 hover:bg-primary/30">
            <img
              src={UpdatesSvgPath.src}
              alt="Updates Template"
              style={{ width: "100px", height: "auto", cursor: "pointer" }}
            />
          </div>
        </div>
        <button className="group flex w-full items-center justify-between rounded-lg border bg-muted p-2 px-3 font-medium shadow-sm">
          <span className="flex items-center gap-2">
            <TemplatesIcon />
            Your Templates
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ChevronRight />
          </span>
        </button>
        <button className="group flex w-full items-center justify-between rounded-lg border bg-muted p-2 px-3 font-medium shadow-sm">
          <span className="flex items-center gap-2">
            <Email />
            Recently Sent Emails
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ChevronRight />
          </span>
        </button>

        <DialogFooter>
          <Button variant="outline">Start from scratch</Button>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
