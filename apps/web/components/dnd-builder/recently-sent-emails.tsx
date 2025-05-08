import { Button } from "@church-space/ui/button";
import { Card, CardContent } from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import { useInView } from "react-intersection-observer";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@church-space/ui/dialog";
import { useToast } from "@church-space/ui/use-toast";
import { applyEmailTemplateAction } from "@/actions/apply-email-template";
import { Switch } from "@church-space/ui/switch";

interface RecentlySentEmailsProps {
  emailId: number;
  organizationId: string;
  setNewEmailModalOpen?: (open: boolean) => void;
}

export default function RecentlySentEmails({
  emailId,
  organizationId,
  setNewEmailModalOpen,
}: RecentlySentEmailsProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [applyStyleOnly, setApplyStyleOnly] = useState(false);
  const supabaseClient = createClient();
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();
  const { ref: componentRef, inView: componentInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Properly implement debouncing with useEffect
  useEffect(() => {
    const updateDebouncedSearch = debounce((value: string) => {
      setDebouncedSearch(value);
    }, 300);

    updateDebouncedSearch(search);

    // Cleanup
    return () => {
      updateDebouncedSearch.cancel();
    };
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["sentEmails", organizationId, debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 20;
      const to = from + 19;

      let query = supabaseClient
        .from("emails")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("type", "standard")
        .eq("status", "sent")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (debouncedSearch) {
        const searchTerm = `%${debouncedSearch}%`;
        query = query.ilike("subject", searchTerm);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, nextPage: data.length === 20 ? pageParam + 1 : undefined };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: componentInView, // Only enable the query when component is in view
  });

  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [loadMoreInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages of data
  const emails = data?.pages.flatMap((page) => page.data) || [];

  const handleApply = async () => {
    if (!selectedEmail) {
      toast({
        title: "Error",
        description: "No email selected",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      const result = await applyEmailTemplateAction({
        target_email_id: emailId,
        template_email_id: selectedEmail.id,
        style_only: applyStyleOnly,
      });

      // The response is nested, so we need to check both levels
      if (result && result.data && result.data.success) {
        // Close the dialog

        if (setNewEmailModalOpen) {
          setNewEmailModalOpen(false);
        }

        setSelectedEmail(null);

        // Show a success message
        toast({
          title: "Success",
          description: "Email applied successfully. Refreshing page...",
        });

        // Refresh the page to get fresh data
        // First invalidate the query cache
        try {
          await queryClient.invalidateQueries({
            queryKey: ["email", emailId],
          });

          // Add a small delay before reloading to allow the toast to be seen
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError);
          // Force reload even if invalidation fails
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        // Log the full result object to see what's happening
        console.error("Error applying template - full result:", result);

        // Try to extract the error message
        let errorMessage = "Failed to apply template";

        // Type the result as any to access potential error property
        const resultObj = result as any;
        if (resultObj && typeof resultObj.error === "string") {
          errorMessage = resultObj.error;
        }

        console.error("Error applying template:", errorMessage);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Exception applying template:", error);

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? `Error: ${error.message}`
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEmailSelect = (email: any) => {
    setSelectedEmail(email);
    setConfirmDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-5 px-1" ref={componentRef}>
      <div className="flex flex-col gap-2">
        <Label className="px-1 text-sm text-secondary-foreground">Search</Label>
        <Input
          placeholder="Search sent emails"
          className="mb-3 w-full bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={300}
        />

        {isLoading ? (
          <div className="flex justify-center py-4">Loading emails...</div>
        ) : error ? (
          <div className="py-2 text-red-500">Error loading emails</div>
        ) : emails.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No emails found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-2">
            {emails.map((email) => (
              <Card
                key={email.id}
                className="cursor-pointer transition-colors hover:border-primary"
                onClick={() => handleEmailSelect(email)}
              >
                <CardContent className="flex flex-col gap-2 p-3">
                  <h3 className="text-sm font-medium">
                    {email.subject || "Untitled Email"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {email.subject || "No description"}
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Intersection observer target for infinite scrolling */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="col-span-2 py-2 text-center">
                {isFetchingNextPage ? "Loading more..." : ""}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject || "Apply Email"}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to apply this email?{" "}
            <span className="font-bold">
              Applying content will overwrite the current email content.
            </span>
          </DialogDescription>
          <div className="flex items-center space-x-2 py-2">
            <Switch
              id="style-only-switch"
              checked={applyStyleOnly}
              onCheckedChange={setApplyStyleOnly}
            />
            <Label htmlFor="style-only-switch">Apply style only</Label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isApplying}>
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
