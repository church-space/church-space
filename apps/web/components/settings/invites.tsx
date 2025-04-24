"use client";

import { useOrganizationInvites } from "@/hooks/use-organization-invites";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { SettingsContent } from "./settings-settings";
import { cancelInviteAction } from "@/actions/cancel-invite";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function OrgInvites({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data, isLoading, isError } = useOrganizationInvites(organizationId);
  const queryClient = useQueryClient();
  const [cancellingInvites, setCancellingInvites] = useState<number[]>([]);

  const handleCancelInvite = async (inviteId: number) => {
    setCancellingInvites((prev) => [...prev, inviteId]);

    try {
      const result = await cancelInviteAction({
        inviteId,
      });

      if (result?.data?.error) {
        console.error(result.data.error);
      } else {
        // Invalidate both queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: ["organization-invites", organizationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["organization-members", organizationId],
        });
      }
    } finally {
      setCancellingInvites((prev) => prev.filter((id) => id !== inviteId));
    }
  };

  if (isLoading) return null;
  if (isError) return null;
  return (
    <>
      <div className="ml-1 mt-6 font-medium">Pending Invites</div>
      <SettingsContent>
        <div className="rounded-lg">
          {data?.pages.map((page) =>
            page.data.map((member, index) => {
              const isCancelling = cancellingInvites.includes(member.id);
              return (
                <div
                  className={cn(
                    "flex items-center justify-between p-4",
                    index !== 0 && "border-t",
                    isCancelling && "bg-muted opacity-50",
                  )}
                  key={member.id}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">{member.email}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-xs text-muted-foreground">
                      Expires{" "}
                      {new Date(member.expires).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isCancelling}
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleCancelInvite(member.id)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? "Cancelling..." : "Cancel Invite"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </SettingsContent>
    </>
  );
}
