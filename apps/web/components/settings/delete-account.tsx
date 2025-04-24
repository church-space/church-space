"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@church-space/ui/alert-dialog";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { deleteUserAction } from "@/actions/delete-user";
import { useToast } from "@church-space/ui/use-toast";
import { useRouter } from "next/navigation";
import { getOrgNameQuery } from "@church-space/supabase/queries/all/get-org-name";
import { getOrgOwnersQuery } from "@church-space/supabase/queries/all/get-org-owners";
import { createClient } from "@church-space/supabase/client";

// unsub from stripe
// delete resend domain
// delete pco connection
// delete pco webhooks

export default function DeleteAccount({
  userId,
  orgRole,
  organizationId,
  userEmail,
}: {
  userId: string;
  orgRole: string;
  organizationId: string;
  userEmail: string;
}) {
  const [email, setEmail] = useState("");
  const [inputOrgName, setInputOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [isOnlyOwner, setIsOnlyOwner] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch organization name and check if user is only owner when component mounts
  React.useEffect(() => {
    const fetchData = async () => {
      const supabase = await createClient();

      // Fetch org name
      const { data: orgData, error: orgError } = await getOrgNameQuery(
        supabase,
        organizationId,
      );
      if (orgData?.name) {
        setOrgName(orgData.name);
      }
      if (orgError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch organization name",
        });
      }

      // Check if user is only owner
      if (orgRole === "owner") {
        const { data: ownersData, error: ownersError } =
          await getOrgOwnersQuery(supabase, organizationId);
        if (ownersData) {
          setIsOnlyOwner(ownersData.length === 1);
        }
        if (ownersError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch organization owners",
          });
        }
      }
    };
    fetchData();
  }, [organizationId, orgRole, toast]);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const result = await deleteUserAction({
        userId,
        email,
        organizationId,
        organizationName:
          orgRole === "owner" && isOnlyOwner ? inputOrgName : undefined,
        role: orgRole as "owner" | "admin" | "member",
      });

      if (!result) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete account: no response received",
        });
        return;
      }

      const response = result.data;
      if (!response) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete account: no data received",
        });
        return;
      }

      if (response.success) {
        toast({
          title: "Success",
          description: "Your account has been deleted successfully.",
        });
        // Redirect to login page
        router.push("/login");
        return;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: response.error || "Failed to delete account",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex flex-col gap-1">
              <div className="font-normal">
                Please enter your email to confirm:
              </div>
              <div className="font-bold">{userEmail}</div>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={userEmail}
              maxLength={100}
            />
          </div>

          {orgRole === "owner" && isOnlyOwner && orgName && (
            <div className="space-y-2">
              <Label htmlFor="orgName" className="flex flex-col gap-1">
                <div className="font-normal">
                  Please enter your organization name to confirm:
                </div>
                <div className="font-bold">{orgName}</div>
              </Label>
              <Input
                id="orgName"
                type="text"
                aria-placeholder="Enter your organization name"
                value={inputOrgName}
                onChange={(e) => setInputOrgName(e.target.value)}
                placeholder={orgName}
                maxLength={200}
              />
              <p className="mt-4 rounded-md border border-destructive bg-destructive/20 p-2 text-sm text-foreground">
                <b>Warning:</b> Since you are the only owner, this will also
                delete your organization. This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={
              isLoading ||
              email !== userEmail ||
              (orgRole === "owner" && isOnlyOwner && inputOrgName !== orgName)
            }
          >
            {isLoading ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
