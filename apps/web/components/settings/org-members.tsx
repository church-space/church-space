"use client";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import { Badge } from "@church-space/ui/badge";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { Skeleton } from "@church-space/ui/skeleton";
import { EllipsisVertical } from "lucide-react";
import { useUser } from "@/stores/use-user";
import { useState } from "react";
import { updateOrganizationMemberAction } from "@/actions/update-organizaztion-member";
import { deleteOrganizationMemberAction } from "@/actions/delete-organization-member";
import { useToast } from "@church-space/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@church-space/ui/dialog";

export default function OrgMembers({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data, isLoading, isError } = useOrganizationMembers(organizationId);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [isMakingOwner, setIsMakingOwner] = useState(false);
  const [affectedMemberIds, setAffectedMemberIds] = useState<number[]>([]);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { user } = useUser();
  const { toast } = useToast();

  const handleMakeOwner = async (
    memberId: number,
    role: "owner" | "member",
  ) => {
    setIsMakingOwner(true);
    setAffectedMemberIds((prev) => [...prev, memberId]);
    try {
      await updateOrganizationMemberAction({
        memberId,
        role,
      });
    } catch (error) {
      console.error(error);
    } finally {
      queryClient.invalidateQueries({
        queryKey: ["organization-members", organizationId],
      });
      toast({
        title: "Member updated",
        description: "Member updated in organization",
      });

      setIsMakingOwner(false);
      setAffectedMemberIds((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    setIsRemovingMember(true);
    setAffectedMemberIds((prev) => [...prev, memberId]);
    try {
      await deleteOrganizationMemberAction({
        memberId,
      });
    } catch (error) {
      console.error(error);
    } finally {
      queryClient.invalidateQueries({
        queryKey: ["organization-members", organizationId],
      });
      toast({
        title: "Member removed",
        description: "Member removed from organization",
      });
      setRemoveDialogOpen(false);
      setIsRemovingMember(false);
      setAffectedMemberIds((prev) => prev.filter((id) => id !== memberId));
    }
  };

  if (isLoading)
    return (
      <div className="rounded-lg">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            className={cn(
              "flex items-center justify-between p-4",
              index !== 0 && "border-t",
            )}
            key={index}
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Loading...</div>
                  <Badge className="h-5 w-fit px-1 text-xs capitalize">
                    Loading
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">Loading...</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-xs text-muted-foreground">
                Added{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Make Owner</DropdownMenuItem>
                  <DropdownMenuItem>Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    );
  if (isError)
    return (
      <div className="border border-destructive p-4 text-destructive">
        Error...
      </div>
    );
  return (
    <div className="rounded-lg">
      {data?.pages.map((page) =>
        page.data.map((member, index) => {
          const isAffected = affectedMemberIds.includes(member.id);
          return (
            <div key={member.id}>
              <div
                className={cn(
                  "flex items-center justify-between p-4",
                  index !== 0 && "border-t",
                  isAffected && "bg-muted opacity-50",
                )}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={member.users.avatar_url ?? undefined}
                      alt={member.users.first_name ?? undefined}
                    />
                    <AvatarFallback>
                      {member.users.first_name?.[0]}
                      {member.users.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {member.users.first_name} {member.users.last_name}
                      </div>
                      <Badge
                        className="h-5 w-fit px-1 text-xs capitalize"
                        variant={
                          member.role === "owner" ? "default" : "secondary"
                        }
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.users.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xs text-muted-foreground">
                    Added{" "}
                    {new Date(member.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isAffected}>
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user?.id !== member.users.id ? (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleMakeOwner(
                                member.id,
                                member.role === "owner" ? "member" : "owner",
                              )
                            }
                            disabled={isMakingOwner || isAffected}
                          >
                            {member.role === "owner"
                              ? "Make Member"
                              : "Make Owner"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={isRemovingMember || isAffected}
                            onClick={() => setRemoveDialogOpen(true)}
                          >
                            Remove from organization
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuLabel className="text-muted-foreground">
                          You are an owner of this organization
                        </DropdownMenuLabel>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <Dialog
                open={removeDialogOpen}
                onOpenChange={setRemoveDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove Member</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to remove this member from the
                      organization?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      disabled={isRemovingMember || isAffected}
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          );
        }),
      )}
    </div>
  );
}
