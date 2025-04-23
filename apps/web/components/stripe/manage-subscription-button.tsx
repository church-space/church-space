"use client";

import { useState } from "react";
import { Button } from "@church-space/ui/button";
import {
  createPortalSessionAction,
  type PortalSessionResponse,
} from "@/actions/create-portal-session";

interface ManageSubscriptionButtonProps {
  organizationId: string;
}

export default function ManageSubscriptionButton({
  organizationId,
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      console.log("Starting subscription management...");
      setIsLoading(true);
      console.log("Calling createPortalSessionAction...");
      const response = (await createPortalSessionAction({
        organization_id: organizationId,
        return_url: window.location.href,
      })) as any;

      console.log("Got response:", response);

      if (response.data?.data?.url) {
        console.log("Attempting to open URL:", response.data.data.url);
        const newWindow = window.open(
          response.data.data.url,
          "_blank",
          "noopener,noreferrer",
        );
      }
    } catch (error) {
      console.error("Error managing subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Loading..." : "Manage Plan and Payment Method"}
    </Button>
  );
}
