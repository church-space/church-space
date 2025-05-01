"use client";

import { useState } from "react";
import { Button } from "@church-space/ui/button";
import { createPortalSessionAction } from "@/actions/create-portal-session";

interface ManageSubscriptionButtonProps {
  organizationId: string;
  buttonVariant?: "default" | "outline";
}

export default function ManageSubscriptionButton({
  organizationId,
  buttonVariant = "default",
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);

      const response = (await createPortalSessionAction({
        organization_id: organizationId,
        return_url: window.location.href,
      })) as any;

      if (response.data?.data?.url) {
        window.open(response.data.data.url, "_blank", "noopener,noreferrer");
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
      variant={buttonVariant}
    >
      {isLoading ? "Loading..." : "Manage Plan and Payment Method"}
    </Button>
  );
}
