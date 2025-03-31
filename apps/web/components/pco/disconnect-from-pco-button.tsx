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
} from "@church-space/ui/dialog";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";

export default function DisconnectFromPcoButton() {
  const [confirmText, setConfirmText] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Disconnect</Button>
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
              Disconnecting from Planning Center will remove all Planning Center
              data from Church Space account including all <b>People, Lists,</b>{" "}
              and <b>List Categories.</b> You will still see your emails, link
              lists, and QR codes, but data related to people will be deleted.
              This cannont be undone.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex flex-col gap-2">
          <Label>
            Type <b className="font-bold">disconnect</b> to confirm
          </Label>
          <Input
            placeholder="Type 'disconnect' to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            variant="destructive"
            disabled={confirmText.toLowerCase() !== "disconnect"}
          >
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
