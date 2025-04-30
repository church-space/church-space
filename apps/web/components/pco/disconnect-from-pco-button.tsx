"use client";

import { useState } from "react";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@church-space/ui/dialog";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { handlePcoDisconnect } from "@/actions/handle-pco-disconnect";
import { useRouter } from "next/navigation";

export default function DisconnectFromPcoButton({
  organizationId,
}: {
  organizationId: string;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await handlePcoDisconnect({
        organizationId: organizationId,
      });

      router.push("/pco-reconnect");
    } catch (error) {
      console.error("Error initiating PCO connection:", error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          Disconnect
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disconnect from Planning Center</DialogTitle>
          <DialogDescription>
            Are you sure you want to disconnect from Planning Center?
          </DialogDescription>
        </DialogHeader>
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle>Warning</CardTitle>
            <CardDescription className="text-normal">
              Planning Center is required to use Church Space. If you disconnect
              your account from Planning Center, you will not be able to use
              Church Space until you reconnect.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex flex-col gap-2">
          <Label className="font-normal">
            Type <b className="font-bold">disconnect</b> to confirm
          </Label>
          <Input
            placeholder="Type 'disconnect' to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toLowerCase())}
            autoFocus
            maxLength={10}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={confirmText.toLowerCase() !== "disconnect" || isLoading}
            onClick={handleDisconnect}
          >
            {isLoading ? "Disconnecting..." : "Disconnect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
