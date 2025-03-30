"use client";
import React from "react";
import { Button } from "@church-space/ui/button";
import { useToast } from "@church-space/ui/use-toast";
import { useParams } from "next/navigation";

export default function TempSendNowButton() {
  const { toast } = useToast();
  const params = useParams();
  const emailId = parseInt(params.emailId as string, 10);

  const handleSendNow = async () => {
    try {
      const response = await fetch("/api/email/filter-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      toast({
        title: "Success",
        description: "Email sending process has started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="default" size="sm" onClick={handleSendNow}>
      Send Now
    </Button>
  );
}
