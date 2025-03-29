import { Label } from "@church-space/ui/label";
import { Input } from "@church-space/ui/input";
import { Button } from "@church-space/ui/button";
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@church-space/ui/accordion";

export default function LinkListNewsletter() {
  return (
    <Accordion type="single" collapsible className="w-full px-4">
      <AccordionItem value="newsletter" className="rounded-[28px]">
        <AccordionTrigger
          className="rounded-full"
          style={{
            backgroundColor: "#000",
            color: "#fff",
          }}
        >
          Join the newsletter
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex w-full flex-col gap-4">
            <Label>First Name</Label>
            <Input placeholder="First Name" />
            <Label>Last Name</Label>
            <Input placeholder="Last Name" />
            <Label>Email</Label>
            <Input placeholder="Email" />
            <Button>Subscribe</Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
