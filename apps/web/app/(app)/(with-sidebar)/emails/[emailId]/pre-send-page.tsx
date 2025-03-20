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

import { cn } from "@church-space/ui/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@church-space/ui/command";
import { Backlog } from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";
import { format } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";

function SaveButtons(props: {
  isSaving: boolean;
  hasChanges: boolean;
  setIsSaving: (isSaving: boolean) => void;
}) {
  const { isSaving, hasChanges, setIsSaving } = props;
  return (
    <div className="mt-4 flex w-full items-center justify-end gap-2 border-t pt-4">
      <Button variant="outline" size="sm" disabled={isSaving}>
        Cancel
      </Button>
      <Button
        size="sm"
        disabled={isSaving || !hasChanges}
        onClick={() => {
          setIsSaving(true);
        }}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

export default function PreSendPage({ email }: { email: any }) {
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");

  // Initialize state from email data
  const [subject, setSubject] = useState(email.subject || "");
  const [previewText, setPreviewText] = useState(email.preview_text || "");

  // From details
  const [fromEmail, setFromEmail] = useState(
    email.from_email?.split("@")[0] || "",
  );
  const [fromDomain, setFromDomain] = useState(
    email.from_email?.split("@")[1] || "",
  );
  const [fromName, setFromName] = useState(email.from_name || "");
  const [replyToEmail, setReplyToEmail] = useState(
    email.reply_to?.split("@")[0] || "",
  );
  const [replyToDomain, setReplyToDomain] = useState(
    email.reply_to?.split("@")[1] || "",
  );

  // Schedule details
  const [sendDate, setSendDate] = useState<Date | null>(
    email.scheduled_for ? new Date(email.scheduled_for) : null,
  );
  const [isScheduled, setIsScheduled] = useState(
    email.scheduled_for ? "schedule" : "send-now",
  );

  const [audienceOpen, setAudienceOpen] = useState(false);
  const [audienceValue, setAudienceValue] = useState(email.audience_id || "");

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

  // Track changes for each section
  useEffect(() => {
    setToHasChanges(audienceValue !== (email.audience_id || ""));
  }, [audienceValue, email.list_id, email.audience_id]);

  useEffect(() => {
    setFromHasChanges(
      fromEmail !== (email.from_email?.split("@")[0] || "") ||
        fromDomain !== (email.from_email?.split("@")[1] || "") ||
        fromName !== (email.from_name || "") ||
        replyToEmail !== (email.reply_to?.split("@")[0] || "") ||
        replyToDomain !== (email.reply_to?.split("@")[1] || ""),
    );
  }, [fromEmail, fromDomain, fromName, replyToEmail, replyToDomain, email]);

  useEffect(() => {
    setSubjectHasChanges(
      subject !== (email.subject || "") ||
        previewText !== (email.preview_text || ""),
    );
  }, [subject, previewText, email.subject, email.preview_text]);

  useEffect(() => {
    const originalScheduledDate = email.scheduled_for
      ? new Date(email.scheduled_for)
      : null;
    const originalIsScheduled = email.scheduled_for ? "schedule" : "send-now";

    setScheduleHasChanges(
      isScheduled !== originalIsScheduled ||
        sendDate?.getTime() !== originalScheduledDate?.getTime(),
    );
  }, [sendDate, isScheduled, email.scheduled_for]);

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

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5">
        {subject ? (
          <div className="text-2xl font-bold">{subject}</div>
        ) : (
          <div className="text-2xl font-bold text-muted-foreground">
            Subject
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link href={`/emails/${email.id}/editor`}>
            <Button variant="outline" size="sm">
              Edit Design
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="p-2">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setDeleteOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Accordion
        type="single"
        collapsible
        className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4"
      >
        <AccordionItem value="to">
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              <span
                className={
                  email.list_id && email.audience_id
                    ? "text-green-400"
                    : "text-muted-foreground"
                }
              >
                <Backlog height={"24"} width={"24"} />
              </span>
              <div className="flex flex-col">
                <span>To</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {audienceValue ? `${audienceValue}` : ""}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Audience</Label>
              <Popover open={audienceOpen} onOpenChange={setAudienceOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={audienceOpen}
                    className="w-full justify-between"
                  >
                    {audienceValue
                      ? frameworks.find(
                          (framework) => framework.value === audienceValue,
                        )?.label || audienceValue
                      : "Select audience..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search categories..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No audience found.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((framework) => (
                          <CommandItem
                            key={framework.value}
                            value={framework.value}
                            onSelect={(currentValue) => {
                              setAudienceValue(
                                currentValue === audienceValue
                                  ? ""
                                  : currentValue,
                              );
                              setAudienceOpen(false);
                            }}
                          >
                            {framework.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                audienceValue === framework.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">
                Audiences group the types of emails that people can subscribe to
                and unsubscribe from.
              </span>
            </div>
            <SaveButtons
              isSaving={toIsSaving}
              hasChanges={toHasChanges}
              setIsSaving={setToIsSaving}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="from">
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              <span
                className={
                  email.from_email && email.from_name
                    ? "text-green-400"
                    : "text-muted-foreground"
                }
              >
                <Backlog height={"24"} width={"24"} />
              </span>
              <div className="flex flex-col">
                <span>From</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {fromName
                    ? `${fromName} <${fromEmail}@${fromDomain}>`
                    : fromEmail && fromDomain
                      ? `${fromEmail}@${fromDomain}`
                      : "No sender information"}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">From Email</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter from"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
                <span className="mb-1 leading-none">@</span>
                <Select value={fromDomain} onValueChange={setFromDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder={fromDomain || "example.com"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domain.com">domain.com</SelectItem>
                    <SelectItem value="domain2.com">domain2.com</SelectItem>
                    <SelectItem value="domain3.com">domain3.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">From Name</Label>
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
                  onChange={(e) => setReplyToEmail(e.target.value)}
                />
                <span className="mb-1 leading-none">@</span>
                <Select value={replyToDomain} onValueChange={setReplyToDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder={replyToDomain || "example.com"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domain.com">domain.com</SelectItem>
                    <SelectItem value="domain2.com">domain2.com</SelectItem>
                    <SelectItem value="domain3.com">domain3.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SaveButtons
              isSaving={fromIsSaving}
              hasChanges={fromHasChanges}
              setIsSaving={setFromIsSaving}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="subject">
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              <span
                className={subject ? "text-green-400" : "text-muted-foreground"}
              >
                <Backlog height={"24"} width={"24"} />
              </span>
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
              <Label className="ml-0.5">Subject</Label>
              <Input
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                    {wordCount} words | {charCount} characters | {emojiCount}{" "}
                    emojis | {punctuationCount} punctuation marks
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Preview Text</Label>
              <Input
                placeholder="Enter preview text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />
              <span className="ml-0.5 text-xs text-muted-foreground">
                Preview text shows below the subject line in an email inbox.
              </span>
            </div>
            <SaveButtons
              isSaving={subjectIsSaving}
              hasChanges={subjectHasChanges}
              setIsSaving={setSubjectIsSaving}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="schedule">
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              <span
                className={
                  email.scheduled_for || isScheduled === "send-now"
                    ? "text-green-400"
                    : "text-muted-foreground"
                }
              >
                <Backlog height={"24"} width={"24"} />
              </span>
              <div className="flex flex-col">
                <span>Schedule</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {isScheduled === "schedule"
                    ? `Schedule for ${format(sendDate ?? new Date(), "MMMM d, yyyy h:mm a")} in ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`
                    : "Send this email immediately."}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Tabs
              defaultValue=""
              onValueChange={(value) => {
                setIsScheduled(value);
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
                  <Label className="ml-0.5">Send Date and Time</Label>
                  <DateTimePicker
                    placeholder="Select a date and time"
                    disabledPast
                    granularity="minute"
                    yearRange={1}
                    hourCycle={12}
                    onChange={(date) => {
                      if (date) {
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
            />
          </AccordionContent>
        </AccordionItem>
        <div className="flex flex-1 items-center justify-between rounded-xl border bg-card py-4 pl-6 pr-5 text-left font-medium transition-all hover:bg-accent/50">
          <Link
            href={`/emails/${email.id}/editor`}
            className="group/link flex w-full items-center gap-3"
          >
            <span className="text-muted-foreground">
              <Backlog height={"24"} width={"24"} />
            </span>
            <div className="flex flex-col">
              <span className="text-md font-semibold">Content</span>
              <span className="text-sm font-normal text-muted-foreground">
                {email.html_content
                  ? "Email content created"
                  : "No content created yet"}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Dialog
              open={previewOpen === "true"}
              onOpenChange={(open) => setPreviewOpen(open ? "true" : null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
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
              Cancel
            </Button>
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
