"use client";

import { Badge } from "@church-space/ui/badge";
import { Button } from "@church-space/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@church-space/ui/dialog";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import {
  Edit,
  Eye,
  PaletteFilled,
  TemplatesIcon,
  Trash,
} from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, Loader2, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { duplicateEmailAction } from "@/actions/duplicate-email-action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@church-space/ui/use-toast";
import { deleteEmailAction } from "@/actions/delete-email";

export type Email = {
  id: number;
  subject: string | null;
  type: "standard" | "template";
  created_at: string;
  organization_id: string;
  from_email: string | null;
  from_name: string | null;
  reply_to: string | null;
  scheduled_for: string | null;
  updated_at: string | null;
  status: string | null;
  sent_at: string | null;
  from_domain: { domain: string } | null;
  reply_to_domain: { domain: string } | null;
  list: {
    pco_list_description: string | null;
  } | null;
  category: {
    name: string | null;
  } | null;
  metrics: {
    total_sent: number | null;
    total_opens: number | null;
    total_clicks: number | null;
  } | null;
};

const currentYear = new Date().getFullYear();

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString();
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const dateYear = date.getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  };
  if (dateYear !== currentYear) {
    options.year = "numeric";
  }
  return date.toLocaleDateString("en-US", options);
};

export const columns: ColumnDef<Email>[] = [
  {
    header: "",
    id: "actions",
    accessorKey: "actions",
    cell: ({ row }) => {
      const email = row.original;
      const router = useRouter();
      const queryClient = useQueryClient();

      const [deleteOpen, setDeleteOpen] = useState(false);
      const [isDeleteLoading, setIsDeleteLoading] = useState(false);

      const [duplicateEmailName, setDuplicateEmailName] = useState(
        `Copy of ${email.subject || "Untitled Email"}`,
      );
      const [isDuplicateEmailDialogOpen, setIsDuplicateEmailDialogOpen] =
        useState(false);
      const [isDuplicatingEmail, setIsDuplicatingEmail] = useState(false);

      const handleDuplicateEmail = async () => {
        if (!duplicateEmailName.trim()) {
          toast({
            title: "Error",
            description: "Please enter an email subject",
            variant: "destructive",
          });
          return;
        }

        setIsDuplicatingEmail(true);
        try {
          const result = await duplicateEmailAction({
            subject: duplicateEmailName,
            organization_id: email.organization_id,
            source_email_id: email.id,
          });

          const resultObj = result as any;

          if (resultObj && resultObj.data) {
            queryClient.invalidateQueries({
              queryKey: ["emails"],
              refetchType: "all",
            });

            queryClient.invalidateQueries({
              queryKey: ["email-id-page", resultObj.data.data.id],
            });

            toast({
              title: "Success",
              description: "Email duplicated successfully",
            });
            router.push(`/emails/${resultObj.data.data.id}`);
            setIsDuplicateEmailDialogOpen(false); // Close dialog on success
            setDuplicateEmailName(""); // Reset name
          } else {
            let errorMessage = "Failed to duplicate email";
            if (resultObj && typeof resultObj.error === "string") {
              errorMessage = resultObj.error;
            }
            console.error("Error duplicating email:", errorMessage);
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Exception duplicating email:", error);
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? `Error: ${error.message}`
                : "An unexpected error occurred",
            variant: "destructive",
          });
        } finally {
          setIsDuplicatingEmail(false);
        }
      };

      useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
          if (deleteOpen && (e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            try {
              setIsDeleteLoading(true);
              const response = await deleteEmailAction({
                emailId: email.id,
                isTemplate: false,
              });

              if (!response?.data) {
                throw new Error("Failed to delete email");
              }

              // Invalidate emails query to refresh the list
              queryClient.invalidateQueries({
                queryKey: ["emails"],
                refetchType: "all",
              });

              toast({
                title: "Email deleted",
                description: "Your email has been deleted successfully.",
              });
            } catch {
              toast({
                title: "Error",
                description: "Failed to delete email",
                variant: "destructive",
              });
            } finally {
              setIsDeleteLoading(false);
              setDeleteOpen(false);
            }
          }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
      }, [deleteOpen, email.id, router, toast, queryClient]);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="w-7 text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
              >
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {email.status === "sent" && (
                <Link href={`/emails/${email.id}?tab=content`} prefetch={false}>
                  <DropdownMenuItem>
                    <Eye />
                    View
                  </DropdownMenuItem>
                </Link>
              )}
              {email.status === "draft" && (
                <Link href={`/emails/${email.id}/editor`} prefetch={false}>
                  <DropdownMenuItem>
                    <PaletteFilled /> Edit Design
                  </DropdownMenuItem>
                </Link>
              )}
              {email.status === "draft" && (
                <Link href={`/emails/${email.id}/editor`} prefetch={false}>
                  <DropdownMenuItem>
                    <Edit />
                    Edit Details
                  </DropdownMenuItem>
                </Link>
              )}
              <Dialog
                open={isDuplicateEmailDialogOpen}
                onOpenChange={setIsDuplicateEmailDialogOpen}
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()} // Prevent DropdownMenu from closing
                  >
                    <TemplatesIcon />
                    Replicate Email
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Replicate Email</DialogTitle>
                    <DialogDescription>
                      Enter a subject for the new email. It will be created as a
                      draft with the same content and settings as the original.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative mb-3">
                    <Input
                      placeholder="New email subject"
                      className="w-full pr-8"
                      value={duplicateEmailName}
                      onChange={(e) => setDuplicateEmailName(e.target.value)}
                      maxLength={60} // Or appropriate length
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleDuplicateEmail();
                        }
                      }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {duplicateEmailName.length} / 60
                    </span>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDuplicateEmailDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDuplicateEmail}
                      disabled={isDuplicatingEmail}
                    >
                      {isDuplicatingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Duplicating...
                        </>
                      ) : (
                        "Duplicate"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {email.status === "draft" && (
                <DropdownMenuItem
                  onClick={() => {
                    setDeleteOpen(true);
                  }}
                  className="hover:bg-transparent"
                >
                  <Trash />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Email</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Are you sure you want to delete this email? This action cannot
                be undone.
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel{" "}
                  <span className="rounded bg-muted px-1 text-xs text-muted-foreground">
                    Esc
                  </span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      setIsDeleteLoading(true);
                      const response = await deleteEmailAction({
                        emailId: email.id,
                        isTemplate: false,
                      });

                      if (!response?.data) {
                        throw new Error("Failed to delete email");
                      }

                      // Invalidate emails query to refresh the list
                      queryClient.invalidateQueries({
                        queryKey: ["emails"],
                        refetchType: "all",
                      });

                      toast({
                        title: "Email deleted",
                        description:
                          "Your email has been deleted successfully.",
                      });
                    } catch {
                      toast({
                        title: "Error",
                        description: "Failed to delete email",
                        variant: "destructive",
                      });
                    } finally {
                      setIsDeleteLoading(false);
                      setDeleteOpen(false);
                    }
                  }}
                  disabled={isDeleteLoading}
                >
                  <div className="flex items-center gap-2">
                    Delete
                    {isDeleteLoading && (
                      <div className="h-4 w-4 animate-spin">
                        <LoaderIcon />
                      </div>
                    )}
                  </div>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    header: "Subject",
    id: "subject",
    accessorKey: "subject",
    minSize: 300,
    cell: ({ row }) => {
      const email = row.original;

      return (
        <div className="line-clamp-2 w-full min-w-64 max-w-96 text-wrap">
          <Link href={`/emails/${email.id}`} prefetch={true}>
            <Button
              variant="ghost"
              className="group h-16 w-full items-center justify-start gap-3 truncate text-wrap px-0 text-left text-base hover:bg-transparent hover:underline [&_svg]:size-3"
            >
              {email.subject || "No Subject"}
            </Button>
          </Link>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    enableHiding: true,
    cell: ({ row }) => {
      return (
        <div className="pr-3">
          <Badge
            variant={
              row.original.status === "sent"
                ? "success"
                : row.original.status === "sending"
                  ? "warning"
                  : row.original.status === "failed"
                    ? "destructive"
                    : row.original.status === "scheduled"
                      ? "default"
                      : "secondary"
            }
            className="capitalize"
          >
            {row.original.status}
          </Badge>

          <div className="flex min-w-52 flex-col pr-3">
            <span className="mt-1 text-muted-foreground">
              {formatDate(row.original.sent_at)}
              {formatDate(row.original.scheduled_for)}
            </span>
          </div>
        </div>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "To",
    accessorKey: "list",
    cell: ({ row }) => {
      return (
        <div className="flex min-w-64 flex-col pr-3">
          <span className="font-semibold">
            {row.original.list?.pco_list_description}
          </span>
          <span className="text-muted-foreground">
            {row.original.category?.name}
          </span>
          {row.original.metrics?.total_sent && (
            <span className="text-muted-foreground">
              {row.original.metrics?.total_sent
                ? formatNumber(row.original.metrics.total_sent)
                : "—"}{" "}
              recipients
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: "From",
    accessorKey: "from_name",
    cell: ({ row }) => {
      return (
        <div className="flex min-w-64 flex-col pr-3">
          <span className="font-semibold">{row.original.from_name}</span>
          <span className="text-muted-foreground">
            {row.original.from_email && row.original.from_domain
              ? `${row.original.from_email}@${row.original.from_domain.domain}`
              : row.original.from_email || "—"}
          </span>
        </div>
      );
    },
  },

  {
    header: "Metrics",
    accessorKey: "metrics",
    cell: ({ row }) => {
      const metrics = row.original.metrics;
      const sent = metrics?.total_sent || 0;
      const opens = metrics?.total_opens || 0;
      const clicks = metrics?.total_clicks || 0;
      const percentageOpens = sent > 0 ? (opens / sent) * 100 : 0;
      const percentageClicks = sent > 0 ? (clicks / sent) * 100 : 0;

      if (sent === 0) {
        return null;
      }

      return (
        <div className="group">
          <div className="hidden min-w-64 flex-col gap-1 group-hover:flex">
            <div>
              <span className="font-semibold">{formatNumber(opens)}</span> Opens
            </div>
            <div>
              <span className="font-semibold">{formatNumber(clicks)}</span>{" "}
              Clicks
            </div>
          </div>
          <div className="flex min-w-64 flex-col gap-1 group-hover:hidden">
            <div>
              <span className="font-semibold">
                {percentageOpens.toFixed(2)}%
              </span>{" "}
              Opened
            </div>
            <div>
              <span className="font-semibold">
                {percentageClicks.toFixed(2)}%
              </span>{" "}
              Clicked
            </div>
          </div>
        </div>
      );
    },
  },
  {
    header: "Updated",
    accessorKey: "updated_at",
    cell: ({ row }) => {
      return (
        <div className="flex min-w-52 flex-col pr-3">
          <span className="text-muted-foreground">
            {formatDate(row.original.updated_at) || "—"}
          </span>
        </div>
      );
    },
  },
];
