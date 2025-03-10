"use client";

import EmailPreview from "@/components/dnd-builder/email-preview";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Eye } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";
import Link from "next/link";
import { DateTimePicker } from "@church-space/ui/date-time-picker";

import { useQueryState } from "nuqs";
import { Backlog, Done } from "@church-space/ui/icons";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";

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

export default function PreSendPage({ emailId }: { emailId: number }) {
  console.log(emailId);
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");
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
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
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
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
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
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
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
                  Yes. It adheres to the WAI-ARIA design pattern.
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Tabs defaultValue="schedule">
              <TabsList className="h-10 w-full">
                <TabsTrigger className="h-full w-full" value="schedule">
                  Schedule
                </TabsTrigger>
                <TabsTrigger className="h-full w-full" value="send-now">
                  Send Now
                </TabsTrigger>
              </TabsList>
              <TabsContent value="schedule">
                <DateTimePicker
                  placeholder="Select a date and time"
                  disabledPast
                  granularity="minute"
                />
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
                  onClick={(e) => {
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
