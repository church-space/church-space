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
          <AccordionTrigger className="text-base">
            Can I use Church Space for free?
          </AccordionTrigger>
          <AccordionContent className="text-base">
            Yes. You can send up to 500 emails per month on our free plan. All
            plans, including our free plan, get unlimited QR codes, link pages,
            automations, and people.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-base">
            What makes Church Space different than Mailchimp?
          </AccordionTrigger>
          <AccordionContent className="text-base">
            Church Space is more closely integrated with Planning Center than
            Mailchimp and is priced in a way that typically leads to churches
            paying 50% less than they are currently paying for Mailchimp.
            However, Mailchimp has more analytic features and is better if your
            primary purpose for emails is selling products. Feel free to try
            Church Space for free to see if it has all you need.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-base">
            Can I import data from my existing email provider?
          </AccordionTrigger>
          <AccordionContent className="text-base">
            We sync all of your contacts with an email address from Planning
            Center for you when you sign up. If you have subscribed contacts
            that are not in Planning Center, you can upload a CSV of all of your
            contacts, and we will add the missing ones to Planning Center for
            you. We also recommend that you import your unsubscribed contacts
            and cleaned contacts from any former email applications. This helps
            improve deliverability and make sure you only send emails to people
            who want them. If you need any help, feel free to reach out to{" "}
            <a
              className="text-primary hover:underline"
              href="mailto:support@churchspace.com"
            >
              support@churchspace.com
            </a>
            .
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-base">
            Can we use Church Space if we don&apos;t use Planning Center?
          </AccordionTrigger>
          <AccordionContent className="text-base">
            No. At the time, we require a Planning Center connection to use
            Church Space. This is how you manage your people, email addresses,
            and lists. We are looking to support other platforms in the future
            but do not currently have a timeline for it.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
