import { Button } from "@church-space/ui/button";
import { Card, CardContent } from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { debounce } from "lodash";
import AssetBrowserModal from "../asset-browser";
import { useInfiniteQuery } from "@tanstack/react-query";
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

interface EmailTemplateFormProps {
  onSelectTemplate?: (templateId: string) => void;
  organizationId: string;
}

export default function EmailTemplateForm({
  onSelectTemplate,
  organizationId,
}: EmailTemplateFormProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const supabaseClient = createClient();
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();
  const { ref: componentRef, inView: componentInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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
    queryKey: ["emailTemplates", organizationId, debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 20;
      const to = from + 19;

      let query = supabaseClient
        .from("emails")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("type", "template")
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
  const templates = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="flex flex-col gap-5 px-1" ref={componentRef}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <AssetBrowserModal
                  triggerText="Gallery"
                  buttonClassName="h-8 py-0 px-2.5"
                  onSelectAsset={() => {}}
                  organizationId={organizationId}
                  handleDelete={() => {}}
                  bucket="email_assets"
                />
              </TooltipTrigger>
              <TooltipContent>Browse premade templates</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-8 px-2 py-0">
                      <Save />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Email as Template</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      Save the current email as a template for future use.
                    </DialogDescription>
                    <Input
                      placeholder="Template name"
                      className="mb-3 w-full"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>Save current email as template</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a template from the gallery or use one of your own.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="px-1 text-sm text-secondary-foreground">
          Your Templates
        </Label>
        <Input
          placeholder="Search your templates"
          className="mb-3 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isLoading ? (
          <div className="flex justify-center py-4">Loading templates...</div>
        ) : error ? (
          <div className="py-2 text-red-500">Error loading templates</div>
        ) : templates.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No templates found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <Dialog>
                <DialogTrigger asChild>
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-colors hover:border-primary"
                    onClick={() => onSelectTemplate?.(template.id.toString())}
                  >
                    <CardContent className="flex flex-col gap-2 p-3">
                      <h3 className="text-sm font-medium">
                        {template.subject || "Untitled Template"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {template.subject || "No description"}
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{template.subject}</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Are you sure you want to apply this template?{" "}
                    <span className="font-bold">
                      This will overwrite any content you have in the current
                      email.
                    </span>
                  </DialogDescription>
                  <DialogFooter>
                    <Button variant="ghost">Cancel</Button>
                    <Button>Apply</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
    </div>
  );
}
