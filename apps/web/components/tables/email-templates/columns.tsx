"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@church-space/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useState } from "react";
// Define the type based on the SQL schema
export type EmailTemplate = {
  id: number;
  created_at: string;
  subject: string;
};

export const columns: ColumnDef<EmailTemplate>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      const subject = row.getValue("subject") as string;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

      return (
        <>
          <ContextMenu>
            <ContextMenuTrigger>
              <Link href={`/emails/${row.original.id}/editor`}>
                <div className="pl-2 text-base font-medium hover:underline">
                  {subject}
                </div>
              </Link>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => setIsRenameDialogOpen(true)}>
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <Dialog
            open={isRenameDialogOpen}
            onOpenChange={setIsRenameDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
];
