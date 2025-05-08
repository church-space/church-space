import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@church-space/ui/accordion";
import { cn } from "@church-space/ui/cn";

interface FAQSectionProps {
  className?: string;
}

export default function FAQSection({ className }: FAQSectionProps) {
  return (
    <div className={cn(className)}>
      <h2 className="mb-8 text-center text-3xl font-semibold">FAQ</h2>
      <Accordion
        type="single"
        collapsible
        className="mx-auto w-full max-w-4xl space-y-2"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Can I use Church Space for free?</AccordionTrigger>
          <AccordionContent>
            Yes. You can send up to 500 emails per month on our free plan. All
            plans, including our free plan, get unlimited QR codes, link pages,
            automations, and people.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            What makes Church Space different than Mailchimp?
          </AccordionTrigger>
          <AccordionContent>
            Church Space is more closely integrated with Planning Center than
            Mailchimp and is priced in a way that typically leads to churches
            paying 50% less than they are currently paying for Mailchimp.
            However, Mailchimp has more analytic features and is better if your
            primary purpose for emails is selling products. Feel free to try
            Church Space for free to see if it has all you need.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            Can we use Church Space if we don&apos;t use Planning Center?
          </AccordionTrigger>
          <AccordionContent>
            No. At the time, we require a Planning Center connection to use
            Church Space. This is how you manage your people, email addresses,
            and lists. We are looking to support other platforms in the future
            but do not currently have a timeline for it.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>
            Can I import data from my existing email provider?
          </AccordionTrigger>
          <AccordionContent>
            Your active contacts are automatically imported from Planning
            Center. We recommend that you also import your unsubscribed contacts
            and cleaned contacts from any former email applications. This helps
            improve deliverability and make sure you only send emails to people
            who want them. If you have people on a mailing list who aren&apos;t
            in Planning Center and need help getting them in, feel free to reach
            out to{" "}
            <a
              className="text-primary hover:underline"
              href="mailto:support@churchspace.com"
            >
              support@churchspace.com
            </a>
            .
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
