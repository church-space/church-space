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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Eye } from "lucide-react";
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
import { useState } from "react";

function SaveButtons() {
  return (
    <div className="mt-4 flex w-full items-center justify-end gap-2 border-t pt-4">
      <Button variant="outline" size="sm">
        Cancel
      </Button>
      <Button size="sm">Save</Button>
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

export default function PreSendPage({ emailId }: { emailId: number }) {
  console.log(emailId);
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");
  const [sendDate, setSendDate] = useState<Date | null>(null);
  const [isScheduled, setIsScheduled] = useState("schedule");
  const [subject, setSubject] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [listValue, setListValue] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");

  // Subject validation functions
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
      <Accordion
        type="single"
        collapsible
        className="mx-auto w-full max-w-3xl space-y-4 px-4"
      >
        <AccordionItem value="to">
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              {/* <span className="text-green-400">
                <Done height={"24"} width={"24"} />
              </span> */}
              <span className="text-muted-foreground">
                <Backlog height={"24"} width={"24"} />
              </span>
              <div className="flex flex-col">
                <span>To</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Yes. It adheres to the WAI-ARIA design pattern.
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Planning Center List</Label>
              <Popover open={listOpen} onOpenChange={setListOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={listOpen}
                    className="w-full justify-between"
                  >
                    {listValue
                      ? frameworks.find(
                          (framework) => framework.value === listValue,
                        )?.label
                      : "Select framework..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search framework..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((framework) => (
                          <CommandItem
                            key={framework.value}
                            value={framework.value}
                            onSelect={(currentValue) => {
                              setListValue(
                                currentValue === listValue ? "" : currentValue,
                              );
                              setListOpen(false);
                            }}
                          >
                            {framework.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                listValue === framework.value
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
                This is the Planning Center list that will receive this email.
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Church Space Category</Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full justify-between"
                  >
                    {categoryValue
                      ? frameworks.find(
                          (framework) => framework.value === categoryValue,
                        )?.label
                      : "Select framework..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search framework..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((framework) => (
                          <CommandItem
                            key={framework.value}
                            value={framework.value}
                            onSelect={(currentValue) => {
                              setCategoryValue(
                                currentValue === categoryValue
                                  ? ""
                                  : currentValue,
                              );
                              setCategoryOpen(false);
                            }}
                          >
                            {framework.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                categoryValue === framework.value
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
                This is the Church Space email category. Categories group the
                types of emails that people can subscribe to and unsubscribe
                from.
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="from">
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              {/* <span className="text-green-400">
                <Done height={"24"} width={"24"} />
              </span> */}
              <span className="text-muted-foreground">
                <Backlog height={"24"} width={"24"} />
              </span>
              <div className="flex flex-col">
                <span>From</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Yes. It adheres to the WAI-ARIA design pattern.
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">From Email</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="Enter from" />
                <span className="mb-1 leading-none">@</span>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="example.com" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">@domain.com</SelectItem>
                    <SelectItem value="2">@domain2.com</SelectItem>
                    <SelectItem value="3">@domain3.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">From Name</Label>
              <Input placeholder="Name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Reply To</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="Enter from" />
                <span className="mb-1 leading-none">@</span>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="example.com" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">@domain.com</SelectItem>
                    <SelectItem value="2">@domain2.com</SelectItem>
                    <SelectItem value="3">@domain3.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="subject">
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              {/* <span className="text-green-400">
                <Done height={"24"} width={"24"} />
              </span> */}
              <span className="text-muted-foreground">
                <Backlog height={"24"} width={"24"} />
              </span>
              <div className="flex flex-col">
                <span>Subject</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Yes. It adheres to the WAI-ARIA design pattern.
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
              <Input placeholder="Enter preview text" />
              <span className="ml-0.5 text-xs text-muted-foreground">
                Preview text shows below the subject line in an email inbox.
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="schedule">
          <AccordionTrigger className="text-md font-semibold">
            <div className="flex items-center gap-3">
              {/* <span className="text-green-400">
                <Done height={"24"} width={"24"} />
              </span> */}
              <span className="text-muted-foreground">
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
            <SaveButtons />
          </AccordionContent>
        </AccordionItem>
        <div className="flex flex-1 items-center justify-between rounded-xl border bg-card py-4 pl-6 pr-5 text-left font-medium transition-all hover:bg-accent/50">
          <Link
            href={`/emails/${emailId}/editor`}
            className="group/link flex w-full items-center gap-3"
          >
            <span className="text-muted-foreground">
              <Backlog height={"24"} width={"24"} />
            </span>
            <div className="flex flex-col">
              <span className="text-md font-semibold">Content</span>
              <span className="text-sm font-normal text-muted-foreground">
                Yes. It adheres to the WAI-ARIA design pattern.
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
    </>
  );
}
