import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useQueryState, parseAsBoolean } from "nuqs";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Email</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
