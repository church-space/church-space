"use client";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Input } from "@church-space/ui/input";
import { useState } from "react";
import { useToast } from "@church-space/ui/use-toast";
import { z } from "zod";
import { Label } from "@church-space/ui/label";
import { updateUserEmailAddressAction } from "@/actions/update-user-email-address";

const emailChangeSchema = z.object({
  email: z.string().email(),
});

export default function EmailChange({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast({
        title: "Please enter a new email address",
        variant: "destructive",
      });
      return;
    }

    try {
      emailChangeSchema.parse({ email: newEmail });
    } catch (error) {
      console.error(error);
      toast({
        title: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUserEmailAddressAction({
        email: newEmail,
      });

      if (!result?.data?.success) {
        toast({
          title: "An error occurred while updating your email",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred while updating your email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsSuccess(false);
      setNewEmail("");
    }
  };

  return (
    <div className="w-full">
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild className="w-full">
          <Button
            variant="outline"
            className="w-full justify-start truncate px-3 font-normal"
          >
            {email}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isSuccess ? "Email Change Initiated" : "Change Email"}
            </DialogTitle>
          </DialogHeader>
          {isSuccess ? (
            <>
              <div className="space-y-4">
                <DialogDescription>
                  We&apos;ve sent confirmation emails to both your current and
                  new email addresses. Please check both emails and follow the
                  instructions to complete the email change.
                </DialogDescription>
                <Button
                  onClick={() => handleDialogChange(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogDescription>
                Your current email is <span className="font-bold">{email}</span>
                . Please enter a new email to change it.
              </DialogDescription>
              <div className="rounded-md border bg-muted p-3 px-4 text-sm text-muted-foreground">
                You will need to confirm the new email on both your old and new
                email addresses.
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailChange();
                }}
              >
                <div>
                  <Label>New email</Label>
                  <Input
                    type="email"
                    placeholder="New email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isLoading}
                    maxLength={255}
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                    disabled={isLoading}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button disabled={isLoading} type="submit">
                    {isLoading ? "Updating..." : "Change Email"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
