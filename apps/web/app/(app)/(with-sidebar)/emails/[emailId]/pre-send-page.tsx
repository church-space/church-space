"use client";

import EmailPreview from "@/components/dnd-builder/email-preview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";
import { Button } from "@church-space/ui/button";
import { DateTimePicker } from "@church-space/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Ellipsis, Eye } from "lucide-react";
import Link from "next/link";
import {
  CircleDashed,
  CircleCheck,
  Trash,
  LoaderIcon,
} from "@church-space/ui/icons";
import { useRouter } from "next/navigation";

import DomainSelector from "@/components/id-pages/emails/domain-selector";
import ListSelector from "@/components/id-pages/emails/list-selector";
import { cn } from "@church-space/ui/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";
import { format } from "date-fns";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useToast } from "@church-space/ui/use-toast";
import { updateEmail } from "@church-space/supabase/mutations/emails";
import { createClient } from "@church-space/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPcoListQuery } from "@church-space/supabase/queries/all/get-pco-lists";
import { getDomainQuery } from "@church-space/supabase/queries/all/get-domains";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import SendTestEmail from "@/components/dnd-builder/send-test-email";
import { getEmailBlockCountQuery } from "@church-space/supabase/queries/all/get-email";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import { deleteEmailAction } from "@/actions/delete-email";

function SaveButtons(props: {
  isSaving: boolean;
  hasChanges: boolean;
  setIsSaving: (isSaving: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { isSaving, hasChanges, setIsSaving, onSave, onCancel } = props;

  return (
    <div className="mt-4 flex w-full items-center justify-end gap-2 border-t pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={isSaving}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        disabled={isSaving || !hasChanges}
        onClick={() => {
          setIsSaving(true);
          onSave();
        }}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

export default function PreSendPage({
  email: initialEmail,
  onStatusChange,
}: {
  email: any;
  onStatusChange: (status: "sending" | "scheduled") => void;
}) {
  const [email, setEmail] = useState<typeof initialEmail>(initialEmail);
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");
  const { toast } = useToast();
  const [activeAccordion, setActiveAccordion] = useState<string | null>("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  // Track which accordion is attempting to be closed with unsaved changes
  const [accordionWithPreventedClose, setAccordionWithPreventedClose] =
    useState<string | null>(null);

  const supabase = createClient();

  // Initialize state from email data
  const [subject, setSubject] = useState(email.subject || "");
  const [listId, setListId] = useState(email.list_id || "");

  // From details
  const [fromEmail, setFromEmail] = useState(email.from_email || "");
  const [fromDomain, setFromDomain] = useState(
    email.from_email_domain?.toString() || "",
  );
  const [fromName, setFromName] = useState(email.from_name || "");
  const [replyToEmail, setReplyToEmail] = useState(email.reply_to || "");
  const [replyToDomain, setReplyToDomain] = useState(
    email.reply_to_domain?.toString() || "",
  );

  // Fetch list and domain data
  const { data: listData } = useQuery({
    queryKey: ["pcoList", listId],
    queryFn: () => getPcoListQuery(supabase, parseInt(listId || "0")),
    enabled: !!listId,
  });

  const { data: fromDomainData } = useQuery({
    queryKey: ["domain", fromDomain],
    queryFn: () => getDomainQuery(supabase, parseInt(fromDomain || "0")),
    enabled: !!fromDomain,
  });

  const { data: replyToDomainData } = useQuery({
    queryKey: ["domain", replyToDomain],
    queryFn: () => getDomainQuery(supabase, parseInt(replyToDomain || "0")),
    enabled: !!replyToDomain,
  });

  // Add email block count query
  const { data: blockCountData } = useQuery({
    queryKey: ["emailBlockCount", email.id],
    queryFn: () => getEmailBlockCountQuery(supabase, email.id),
  });

  const emailBlockCount = blockCountData?.count || 0;

  // Add validation functions
  const isValidEmailLocalPart = (email: string) => {
    // Allow empty value or only letters, numbers, periods, hyphens, and underscores
    // No spaces or special characters
    return email === "" || /^[a-zA-Z0-9._-]*$/.test(email);
  };

  const handleFromEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (isValidEmailLocalPart(value)) {
      setFromEmail(value);
    }
  };

  const handleReplyToEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (isValidEmailLocalPart(value)) {
      setReplyToEmail(value);
    }
  };

  // Schedule details
  const [sendDate, setSendDate] = useState<Date | null>(
    email.scheduled_for ? new Date(email.scheduled_for) : null,
  );
  const [isScheduled, setIsScheduled] = useState<"schedule" | "send-now" | "">(
    email.scheduled_for ? "schedule" : email.send_now ? "send-now" : "",
  );
  const [sendNow, setSendNow] = useState(email.send_now || false);

  // Track changes
  const [toHasChanges, setToHasChanges] = useState(false);
  const [fromHasChanges, setFromHasChanges] = useState(false);
  const [subjectHasChanges, setSubjectHasChanges] = useState(false);
  const [scheduleHasChanges, setScheduleHasChanges] = useState(false);

  // Track saving states
  const [toIsSaving, setToIsSaving] = useState(false);
  const [fromIsSaving, setFromIsSaving] = useState(false);
  const [subjectIsSaving, setSubjectIsSaving] = useState(false);
  const [scheduleIsSaving, setScheduleIsSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  // Function to check if all required steps are completed
  const isAllStepsCompleted = () => {
    return (
      email.list_id &&
      email.from_name &&
      email.from_email &&
      email.from_email_domain &&
      email.subject &&
      (email.scheduled_for || email.send_now) &&
      emailBlockCount > 0
    );
  };

  // Setup the update email mutation using TanStack Query
  const updateEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      return await updateEmail(supabase, email.id, data);
    },
    onSuccess: () => {
      toast({
        title: "Email updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save changes: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Track changes for each section
  useEffect(() => {
    setToHasChanges(listId !== (email.list_id || ""));
  }, [listId, email.list_id]);

  useEffect(() => {
    setFromHasChanges(
      fromEmail !== (email.from_email || "") ||
        fromDomain !== (email.from_email_domain?.toString() || "") ||
        fromName !== (email.from_name || "") ||
        replyToEmail !== (email.reply_to || "") ||
        replyToDomain !== (email.reply_to_domain?.toString() || ""),
    );
  }, [fromEmail, fromDomain, fromName, replyToEmail, replyToDomain, email]);

  useEffect(() => {
    setSubjectHasChanges(subject !== (email.subject || ""));
  }, [subject, email.subject]);

  useEffect(() => {
    const originalScheduledDate = email.scheduled_for
      ? new Date(email.scheduled_for)
      : null;
    const originalIsScheduled = email.scheduled_for
      ? "schedule"
      : email.send_now
        ? "send-now"
        : "";

    setScheduleHasChanges(
      isScheduled !== originalIsScheduled ||
        (isScheduled === "schedule" &&
          sendDate?.getTime() !== originalScheduledDate?.getTime()) ||
        (isScheduled === "send-now" && sendNow !== email.send_now),
    );
  }, [sendDate, isScheduled, email.scheduled_for, email.send_now, sendNow]);

  // Save functions for each section
  const saveToSection = async () => {
    try {
      await updateEmailMutation.mutateAsync({
        list_id: listId,
      });
      setToIsSaving(false);
      setToHasChanges(false);
      setAccordionWithPreventedClose(null);
      // Update local email state
      setEmail((prev: typeof initialEmail) => ({
        ...prev,
        list_id: listId,
      }));
    } catch (error) {
      console.error("Error saving To section:", error);
      setToIsSaving(false);
    }
  };

  // Cancel/reset functions for each section
  const resetToSection = () => {
    setListId(email.list_id || "");
    setToHasChanges(false);
    setToIsSaving(false);
    setActiveAccordion("");
    setAccordionWithPreventedClose(null);
  };

  const saveFromSection = async () => {
    try {
      // Validate email length if provided
      if (fromEmail && fromEmail.length < 2) {
        toast({
          title: "Invalid email",
          description: "Email must be at least 2 characters long.",
          variant: "destructive",
        });
        setFromIsSaving(false);
        return;
      }

      if (replyToEmail && replyToEmail.length < 2) {
        toast({
          title: "Invalid email",
          description: "Reply-to email must be at least 2 characters long.",
          variant: "destructive",
        });
        setFromIsSaving(false);
        return;
      }

      // Convert empty strings to null
      const from_email = fromEmail === "" ? null : fromEmail;
      const from_email_domain = fromDomain ? parseInt(fromDomain) : null;
      const reply_to = replyToEmail === "" ? null : replyToEmail;
      const reply_to_domain = replyToDomain ? parseInt(replyToDomain) : null;

      await updateEmailMutation.mutateAsync({
        from_email,
        from_email_domain,
        from_name: fromName,
        reply_to,
        reply_to_domain,
      });
      setFromIsSaving(false);
      setFromHasChanges(false);
      setAccordionWithPreventedClose(null);
      // Update local email state
      setEmail((prev: typeof initialEmail) => ({
        ...prev,
        from_email,
        from_email_domain,
        from_name: fromName,
        reply_to,
        reply_to_domain,
      }));
    } catch (error) {
      console.error("Error saving From section:", error);
      setFromIsSaving(false);
    }
  };

  // Cancel/reset functions for each section
  const resetFromSection = () => {
    setFromEmail(email.from_email || "");
    setFromDomain(email.from_email_domain?.toString() || "");
    setFromName(email.from_name || "");
    setReplyToEmail(email.reply_to || "");
    setReplyToDomain(email.reply_to_domain?.toString() || "");
    setFromHasChanges(false);
    setFromIsSaving(false);
    setActiveAccordion("");
    setAccordionWithPreventedClose(null);
  };

  const saveSubjectSection = async () => {
    try {
      await updateEmailMutation.mutateAsync({
        subject,
      });
      setSubjectIsSaving(false);
      setSubjectHasChanges(false);
      setAccordionWithPreventedClose(null);
      // Update local email state
      setEmail((prev: typeof initialEmail) => ({
        ...prev,
        subject,
      }));
    } catch (error) {
      console.error("Error saving Subject section:", error);
      setSubjectIsSaving(false);
    }
  };

  // Cancel/reset functions for each section
  const resetSubjectSection = () => {
    setSubject(email.subject || "");
    setSubjectHasChanges(false);
    setSubjectIsSaving(false);
    setActiveAccordion("");
    setAccordionWithPreventedClose(null);
  };

  const saveScheduleSection = async () => {
    try {
      // Validate that a date and time are selected when scheduling
      if (isScheduled === "schedule" && !sendDate) {
        toast({
          title: "Invalid schedule time",
          description: "Please select a date and time to schedule the email.",
          variant: "destructive",
        });
        setScheduleIsSaving(false);
        return;
      }

      // Validate that the time is at least 10 minutes in the future if scheduled
      if (isScheduled === "schedule" && sendDate) {
        const now = new Date();
        const minValidTime = new Date(now);
        minValidTime.setMinutes(now.getMinutes() + 10);

        if (sendDate.getTime() < minValidTime.getTime()) {
          toast({
            title: "Invalid schedule time",
            description:
              sendDate.getTime() < now.getTime()
                ? "Schedule time cannot be in the past."
                : "Schedule time must be at least 10 minutes in the future.",
            variant: "destructive",
          });
          setScheduleIsSaving(false);
          return;
        }
      }

      const scheduled_for =
        isScheduled === "schedule" ? sendDate?.toISOString() : null;
      const send_now = isScheduled === "send-now";

      await updateEmailMutation.mutateAsync({
        scheduled_for,
        send_now,
      });

      setScheduleIsSaving(false);
      setScheduleHasChanges(false);
      setAccordionWithPreventedClose(null);
      // Update local email state
      setEmail((prev: typeof initialEmail) => ({
        ...prev,
        scheduled_for,
        send_now,
      }));
    } catch (error) {
      console.error("Error saving Schedule section:", error);
      setScheduleIsSaving(false);
    }
  };

  // Cancel/reset functions for each section
  const resetScheduleSection = () => {
    setSendDate(email.scheduled_for ? new Date(email.scheduled_for) : null);
    setIsScheduled(
      email.scheduled_for ? "schedule" : email.send_now ? "send-now" : "",
    );
    setSendNow(email.send_now || false);
    setScheduleHasChanges(false);
    setScheduleIsSaving(false);
    setActiveAccordion("");
    setAccordionWithPreventedClose(null);
  };

  // Subject validation functions
  const wordCount = subject.trim().split(/\s+/).filter(Boolean).length;
  const charCount = subject.length;
  const emojiCount = (subject.match(/[\p{Emoji}]/gu) || []).length;
  const punctuationCount = (subject.match(/[!?.,;:]/g) || []).length;

  // Subject validation warnings
  const tooManyWords = wordCount > 9;
  const tooManyChars = charCount > 60;
  const tooManyEmojis = emojiCount > 2;
  const tooManyPunctuations = punctuationCount > 2;

  // Check if any warnings exist
  const hasWarnings =
    tooManyWords || tooManyChars || tooManyEmojis || tooManyPunctuations;

  // Prevent closing accordion when there are unsaved changes
  const handleAccordionChange = (value: string) => {
    // Reset the prevented close state
    setAccordionWithPreventedClose(null);

    // If trying to close the current section
    if (value === "" || value !== activeAccordion) {
      // Check if current section has unsaved changes
      const hasUnsavedChangesInSection =
        (activeAccordion === "to" && toHasChanges) ||
        (activeAccordion === "from" && fromHasChanges) ||
        (activeAccordion === "subject" && subjectHasChanges) ||
        (activeAccordion === "schedule" && scheduleHasChanges);

      if (hasUnsavedChangesInSection) {
        // Mark this accordion as having prevented close
        setAccordionWithPreventedClose(activeAccordion);
        // Show toast notification
        toast({
          title: "Unsaved Changes",
          description:
            "Please save or cancel your changes before closing this section.",
          variant: "destructive",
        });
        // Don't update the accordion state
        return;
      }
    }
    // Otherwise, update to the new value
    setActiveAccordion(value);
  };

  // Add window beforeunload event listener to catch navigation attempts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        toHasChanges ||
        fromHasChanges ||
        subjectHasChanges ||
        scheduleHasChanges
      ) {
        // Standard way to show a confirmation dialog before leaving
        e.preventDefault();
        // This message might not be displayed in modern browsers, but the dialog will still appear
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [toHasChanges, fromHasChanges, subjectHasChanges, scheduleHasChanges]);

  // Function to check if there are any unsaved changes
  const hasUnsavedChanges = () => {
    return (
      toHasChanges || fromHasChanges || subjectHasChanges || scheduleHasChanges
    );
  };

  // Handle protected navigation - returns true if navigation should proceed
  const handleProtectedNavigation = (e?: React.MouseEvent) => {
    if (hasUnsavedChanges()) {
      if (e) e.preventDefault();

      // Show confirmation dialog
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
      return confirmed;
    }
    return true;
  };

  // Custom link component that checks for unsaved changes
  const ProtectedLink = ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!handleProtectedNavigation(e)) return;
      router.push(href);
    };

    return (
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
    );
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (deleteOpen && (e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        try {
          const response = await deleteEmailAction({
            emailId: email.id,
          });

          if (!response?.data) {
            throw new Error("Failed to delete email");
          }

          toast({
            title: "Email deleted",
            description: "Your email has been deleted successfully.",
          });

          router.push("/emails");
        } catch {
          toast({
            title: "Error",
            description: "Failed to delete email",
            variant: "destructive",
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteOpen, email.id, router, toast]);

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/emails">Email</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-32 truncate sm:max-w-sm">
                  {email.subject || "Untitled Email"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="p-2">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => {
                  setDeleteOpen(true);
                }}
                className="h-fit p-0 hover:bg-transparent"
              >
                <div className="flex w-full items-center gap-2 rounded p-1.5 transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <Trash />
                  Delete
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SendTestEmail />

          <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={!isAllStepsCompleted()}
                onClick={(e) => {
                  if (email.scheduled_for) {
                    const scheduledTime = new Date(email.scheduled_for);
                    const now = new Date();
                    const minValidTime = new Date(now);
                    minValidTime.setMinutes(now.getMinutes() + 10);

                    if (scheduledTime <= minValidTime) {
                      e.preventDefault();
                      toast({
                        title: "Invalid schedule time",
                        description:
                          scheduledTime <= now
                            ? "Schedule time cannot be in the past."
                            : "Schedule time must be at least 10 minutes in the future.",
                        variant: "destructive",
                      });

                      // Reset the schedule state
                      setIsScheduled("");
                      setSendDate(null);

                      // Update email state to reflect changes
                      setEmail((prev: typeof initialEmail) => ({
                        ...prev,
                        scheduled_for: null,
                      }));

                      return;
                    }
                  }
                  setSendDialogOpen(true);
                }}
              >
                {email.scheduled_for ? "Schedule" : "Send Now"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Confirm {email.scheduled_for ? "Schedule" : "Send"}
                </DialogTitle>
                <DialogDescription>
                  Please review the email details before{" "}
                  {email.scheduled_for ? "scheduling" : "sending"}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">To</h4>
                  <p className="text-sm text-muted-foreground">
                    {listData?.data?.[0]?.pco_list_description || "Loading..."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">From</h4>
                  <p className="text-sm text-muted-foreground">
                    {fromName} &lt;{fromEmail}@
                    {fromDomainData?.data?.[0]?.domain || ""}&gt;
                  </p>
                  {replyToEmail && (
                    <p className="text-sm text-muted-foreground">
                      Reply-To: {replyToEmail}@
                      {replyToDomainData?.data?.[0]?.domain || ""}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Subject</h4>
                  <p className="text-sm text-muted-foreground">
                    {email.subject}
                  </p>
                </div>
                {email.scheduled_for && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Schedule Time</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(email.scheduled_for),
                        "MMMM d, yyyy h:mm a",
                      )}{" "}
                      in {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                  </div>
                )}
                <div className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">
                  <div className="flex flex-col gap-2">
                    <h4 className="font-medium">Preview</h4>
                    <EmailPreview webOnly={true} />
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground">
                        {emailBlockCount} blocks
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSendDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      if (email.scheduled_for) {
                        // Schedule the email
                        const response = await fetch(
                          "/api/emails/schedule-email",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              emailId: email.id,
                            }),
                          },
                        );

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(
                            errorData.error || "Failed to schedule email",
                          );
                        }

                        // Optimistically update both local and parent state
                        setEmail((prev: typeof initialEmail) => ({
                          ...prev,
                          status: "scheduled",
                        }));
                        onStatusChange("scheduled");
                        setSendDialogOpen(false);

                        toast({
                          title: "Email scheduled",
                          description: `Email will be sent at ${format(
                            new Date(email.scheduled_for),
                            "MMMM d, yyyy h:mm a",
                          )}`,
                        });
                      } else {
                        // Send the email immediately
                        const response = await fetch(
                          "/api/emails/filter-emails",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              emailId: email.id,
                            }),
                          },
                        );

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(
                            errorData.error || "Failed to send email",
                          );
                        }

                        // Optimistically update both local and parent state
                        setEmail((prev: typeof initialEmail) => ({
                          ...prev,
                          status: "sending",
                        }));
                        onStatusChange("sending");
                        setSendDialogOpen(false);

                        toast({
                          title: "Email sending started",
                          description:
                            "Your email is being sent to recipients.",
                        });
                      }
                    } catch (err) {
                      toast({
                        title: "Error",
                        description:
                          err instanceof Error
                            ? err.message
                            : "Failed to process email",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                      if (email.scheduled_for) {
                        setSendDialogOpen(false);
                      }
                    }
                  }}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-2">
                    {email.scheduled_for ? "Schedule Email" : "Send Email"}
                    {isLoading && (
                      <div className="h-4 w-4 animate-spin">
                        <LoaderIcon />
                      </div>
                    )}
                  </div>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <div className="mx-auto mb-2 mt-8 flex w-full max-w-3xl items-center justify-between px-5">
        {subject ? (
          <div className="text-2xl font-bold">{subject}</div>
        ) : (
          <div className="text-2xl font-bold text-muted-foreground">
            Subject
          </div>
        )}
      </div>
      {email.status === "failed" && (
        <div className="mx-auto mt-4 w-full max-w-3xl px-4">
          <Card className="mx-auto w-full rounded-md border-destructive bg-destructive/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground">
                Email Failed to Send
              </CardTitle>
            </CardHeader>
            {email.error_message && (
              <CardContent className="mx-6 mb-4 mt-2 rounded-md border border-destructive bg-muted px-3 pb-2 pt-2 font-mono text-sm">
                {email.error_message}
              </CardContent>
            )}
            <CardFooter>
              <Link
                href={`mailto:support@churchspace.co?subject=Email%20Failed%20to%20Send&body=My%20email%20failed%20to%20send.%20Can%20you%20please%20investigate%20and%20let%20me%20know%20what%20to%20do%3F%0A%0AEmail%20ID%3A%20${email.id}${email.error_message ? `%0A%0AError%20Message%3A%20${encodeURIComponent(email.error_message)}` : ""}%0A%0AThanks!`}
              >
                <Button variant="outline">Contact Support</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
      <Accordion
        type="single"
        collapsible
        className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4"
        value={activeAccordion || undefined}
        onValueChange={handleAccordionChange}
      >
        <AccordionItem
          value="to"
          className={cn(
            accordionWithPreventedClose === "to" &&
              "rounded-lg ring-2 ring-destructive",
          )}
        >
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              {email.list_id ? (
                <CircleCheck height={"24"} width={"24"} fill="#2ECE26" />
              ) : (
                <CircleDashed height={"24"} width={"24"} />
              )}
              <div className="flex flex-col">
                <span>To</span>
                <span className="text-sm font-normal text-muted-foreground">
                  <span className="font-medium">
                    {listId
                      ? `${listData?.data?.[0]?.pco_list_description || "Loading..."}`
                      : ""}
                  </span>{" "}
                  {listId &&
                    (listData?.data?.[0]?.pco_total_people || "Loading...") +
                      " " +
                      (listData?.data?.[0]?.pco_total_people === "1"
                        ? "person"
                        : "people")}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">
                List <span className="text-destructive">*</span>
              </Label>
              <ListSelector
                value={listId}
                onChange={setListId}
                organizationId={email.organization_id}
              />
              <div className="flex flex-col px-2">
                {listData?.data?.[0]?.pco_list_categories?.pco_name && (
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold">Category:</span>{" "}
                    {listData?.data?.[0]?.pco_list_categories?.pco_name}
                  </span>
                )}
                {listData?.data?.[0]?.pco_total_people && (
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold">Total People:</span>{" "}
                    {listData?.data?.[0]?.pco_total_people}{" "}
                  </span>
                )}
              </div>
              <p className="px-2 text-xs text-muted-foreground">
                Select the list from PCO that you would like to send this email
                to. If they are unsubscribed from the PCO List Cateogry, the
                person will not recieve the email. Learn more about how
                unsubscribes work here.
              </p>
            </div>
            <SaveButtons
              isSaving={toIsSaving}
              hasChanges={toHasChanges}
              setIsSaving={setToIsSaving}
              onSave={saveToSection}
              onCancel={resetToSection}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="from"
          className={cn(
            accordionWithPreventedClose === "from" &&
              "rounded-lg ring-2 ring-destructive",
          )}
        >
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              {email.from_name &&
              email.from_email &&
              email.from_email_domain ? (
                <CircleCheck height={"24"} width={"24"} fill="#2ECE26" />
              ) : (
                <CircleDashed height={"24"} width={"24"} />
              )}
              <div className="flex flex-col">
                <span>From</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {fromName
                    ? `${fromName} <${fromEmail}@${fromDomainData?.data?.[0]?.domain || ""}>`
                    : fromEmail && fromDomain
                      ? `${fromEmail}@${fromDomainData?.data?.[0]?.domain || ""}`
                      : "No sender information"}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">
                From Email <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter from"
                  value={fromEmail}
                  onChange={handleFromEmailChange}
                />
                <span className="mb-1 leading-none">@</span>
                <DomainSelector
                  organizationId={email.organization_id}
                  onChange={(value) => setFromDomain(value)}
                  value={fromDomain}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">
                From Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Reply To</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter reply to"
                  value={replyToEmail}
                  onChange={handleReplyToEmailChange}
                />
                <span className="mb-1 leading-none">@</span>
                <DomainSelector
                  organizationId={email.organization_id}
                  onChange={(value) => setReplyToDomain(value)}
                  value={replyToDomain}
                />
              </div>
            </div>
            <SaveButtons
              isSaving={fromIsSaving}
              hasChanges={fromHasChanges}
              setIsSaving={setFromIsSaving}
              onSave={saveFromSection}
              onCancel={resetFromSection}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="subject"
          className={cn(
            accordionWithPreventedClose === "subject" &&
              "rounded-lg ring-2 ring-destructive",
          )}
        >
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              {email.subject ? (
                <CircleCheck height={"24"} width={"24"} fill="#2ECE26" />
              ) : (
                <CircleDashed height={"24"} width={"24"} />
              )}
              <div className="flex flex-col">
                <span>Subject</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {subject || "No subject set"}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter subject"
                value={subject}
                maxLength={60}
                onChange={(e) => setSubject(e.target.value.slice(0, 60))}
              />
              {subject && (
                <div
                  className={cn(
                    "flex flex-col gap-1 rounded-md border px-4 py-2.5",
                    hasWarnings
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-green-500 bg-green-500/10",
                  )}
                >
                  {tooManyWords && (
                    <span className="text-amber-600">
                      Warning: Subject has {wordCount} words. Consider using 9
                      or fewer words.
                    </span>
                  )}
                  {tooManyChars && (
                    <span className="text-amber-600">
                      Warning: Subject has {charCount} characters. Consider
                      keeping it under 60 characters.
                    </span>
                  )}
                  {tooManyEmojis && (
                    <span className="text-amber-600">
                      Warning: Subject has {emojiCount} emojis. Consider using 2
                      or fewer emojis.
                    </span>
                  )}
                  {tooManyPunctuations && (
                    <span className="text-amber-600">
                      Warning: Subject has {punctuationCount} punctuation marks.
                      Consider using 2 or fewer.
                    </span>
                  )}
                  {!hasWarnings && (
                    <span className="text-green-600">
                      Good! Your subject meets all recommended guidelines.
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {wordCount} words | {charCount}/60 characters | {emojiCount}{" "}
                    emojis | {punctuationCount} punctuation marks
                  </span>
                </div>
              )}
            </div>

            <SaveButtons
              isSaving={subjectIsSaving}
              hasChanges={subjectHasChanges}
              setIsSaving={setSubjectIsSaving}
              onSave={saveSubjectSection}
              onCancel={resetSubjectSection}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="schedule"
          className={cn(
            accordionWithPreventedClose === "schedule" &&
              "rounded-lg ring-2 ring-destructive",
          )}
        >
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              {email.scheduled_for || email.send_now ? (
                <CircleCheck height={"24"} width={"24"} fill="#2ECE26" />
              ) : (
                <CircleDashed height={"24"} width={"24"} />
              )}
              <div className="flex flex-col">
                <span>Send Time</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {email.scheduled_for
                    ? `Schedule for ${format(new Date(email.scheduled_for), "MMMM d, yyyy h:mm a")} in ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`
                    : email.send_now
                      ? "Send this email by clicking the send button in the top right corner of this page."
                      : "No send time selected"}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Tabs
              defaultValue=""
              onValueChange={(value) => {
                setIsScheduled(value as "schedule" | "send-now" | "");
                if (value === "send-now") {
                  setSendDate(null);
                  setSendNow(true);
                  setScheduleHasChanges(true);
                } else if (value === "schedule") {
                  setSendNow(false);
                  setScheduleHasChanges(true);
                } else {
                  setSendDate(null);
                  setSendNow(false);
                  setScheduleHasChanges(true);
                }
              }}
              value={isScheduled}
            >
              <TabsList className="h-10 w-full">
                <TabsTrigger className="h-full w-full" value="schedule">
                  Schedule
                </TabsTrigger>
                <TabsTrigger className="h-full w-full" value="send-now">
                  Send Now
                </TabsTrigger>
              </TabsList>
              <TabsContent value="schedule" className="space-y-3 pt-2">
                <div className="flex flex-col gap-2">
                  <Label className="ml-0.5">
                    Send Date and Time{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <DateTimePicker
                    placeholder="Select a date and time"
                    disabledPast
                    minFutureMinutes={10}
                    granularity="minute"
                    yearRange={1}
                    hourCycle={12}
                    onChange={(date) => {
                      if (date) {
                        // Validate that the date is not more than a year in the future
                        const now = new Date();
                        const oneYearFromNow = new Date();
                        oneYearFromNow.setFullYear(now.getFullYear() + 1);

                        if (date > oneYearFromNow) {
                          toast({
                            title: "Invalid schedule time",
                            description:
                              "Email cannot be scheduled more than a year in the future.",
                            variant: "destructive",
                          });
                          return;
                        }

                        setSendDate(date);
                      }
                    }}
                    value={sendDate ?? undefined}
                  />
                </div>
                {sendDate && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    This email will be sent at{" "}
                    {format(sendDate, "MMMM d, yyyy h:mm a")} in{" "}
                    <span className="text-primary underline">
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </span>{" "}
                    time.
                  </div>
                )}
                <div className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">
                  The email will not be offically scheduled until you hit the
                  &quot;Schedule&quot; button in the top right corner of this
                  page.
                </div>
              </TabsContent>
              <TabsContent
                value="send-now"
                className="mt-4 text-sm text-muted-foreground"
              >
                This email will be sent once the click the send button in the
                top right corner.
              </TabsContent>
            </Tabs>
            <SaveButtons
              isSaving={scheduleIsSaving}
              hasChanges={scheduleHasChanges}
              setIsSaving={setScheduleIsSaving}
              onSave={saveScheduleSection}
              onCancel={resetScheduleSection}
            />
          </AccordionContent>
        </AccordionItem>
        <div className="flex flex-1 cursor-pointer items-center justify-between rounded-lg border bg-card py-4 pl-6 pr-5 text-left font-medium transition-all hover:bg-accent/50">
          <ProtectedLink
            href={`/emails/${email.id}/editor`}
            className="group/link flex w-full items-center gap-3"
          >
            <span className="text-muted-foreground">
              {emailBlockCount > 0 ? (
                <CircleCheck height={"24"} width={"24"} fill="#2ECE26" />
              ) : (
                <CircleDashed height={"24"} width={"24"} />
              )}
            </span>
            <div className="flex flex-col">
              <span className="text-md font-semibold">Content</span>
              <span className="text-sm font-normal text-muted-foreground">
                {emailBlockCount > 0
                  ? `${emailBlockCount} block${emailBlockCount === 1 ? "" : "s"}`
                  : "No content created yet"}
              </span>
            </div>
          </ProtectedLink>
          <div className="flex items-center gap-1">
            <Dialog
              open={previewOpen === "true"}
              onOpenChange={(open) => setPreviewOpen(open ? "true" : null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPreviewOpen("true");
                  }}
                >
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
            <Button variant="outline" className="cursor-pointer px-5">
              Edit
            </Button>
          </div>
        </div>
      </Accordion>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Email</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this email? This action cannot be
            undone.
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
                  const response = await deleteEmailAction({
                    emailId: email.id,
                  });

                  if (!response?.data) {
                    throw new Error("Failed to delete email");
                  }

                  toast({
                    title: "Email deleted",
                    description: "Your email has been deleted successfully.",
                  });

                  router.push("/emails");
                } catch {
                  toast({
                    title: "Error",
                    description: "Failed to delete email",
                    variant: "destructive",
                  });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
