"use client";

import { useState } from "react";
import { Button } from "@church-space/ui/button";
import {
  createPortalSessionAction,
  type PortalSessionResponse,
} from "@/actions/create-portal-session";
import type { ActionResponse } from "@/types/action";

interface ManageSubscriptionButtonProps {
  organizationId: string;
}

export default function ManageSubscriptionButton({
  organizationId,
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = (await createPortalSessionAction({
        organization_id: organizationId,
        return_url: window.location.href,
      })) as ActionResponse<PortalSessionResponse>;

      if (!response?.success || !response?.data) {
        console.error("Failed to create portal session:", response?.error);
        return;
      }

      // Redirect to the portal
      window.location.href = response.data.url;
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
