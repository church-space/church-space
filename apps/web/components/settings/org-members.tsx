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
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { Skeleton } from "@church-space/ui/skeleton";
import { EllipsisVertical } from "lucide-react";

export default function OrgMembers({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data, isLoading, isError } = useOrganizationMembers(organizationId);

  if (isLoading)
    return (
      <div className="rounded-lg border">
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
    <div className="rounded-lg border">
      {data?.pages.map((page) =>
        page.data.map((member, index) => (
          <div
            className={cn(
              "flex items-center justify-between p-4",
              index !== 0 && "border-t",
            )}
            key={member.id}
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
                  <Badge className="h-5 w-fit px-1 text-xs capitalize">
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
        )),
      )}
    </div>
  );
}
