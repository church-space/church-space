"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@church-space/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@church-space/ui/form";
import { Input } from "@church-space/ui/input";
import { createLinkListAction } from "@/actions/create-link-list";
import type { LinkListResponse } from "@/actions/create-link-list";
import type { ActionResponse } from "@/types/action";
import { useState } from "react";
import { cn } from "@church-space/ui/cn";

const formSchema = z.object({
  private_name: z.string().min(1, "Name is required"),
  url_slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: "URL slug must be lowercase letters, numbers, and hyphens only",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLinkList({
  organizationId,
  setIsNewLinkListOpen,
}: {
  organizationId: string;
  setIsNewLinkListOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      private_name: "",
      url_slug: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    form.clearErrors();

    try {
      const result = await createLinkListAction({
        private_name: values.private_name,
        url_slug: values.url_slug,
        organization_id: organizationId,
      });

      console.log("Link list creation result:", result);

      if (!result?.data?.error) {
        await router.push(
          `/link-lists/${result?.data?.data?.id}/editor?newList=true`,
        );
      } else if (result?.data?.error) {
        form.setError("url_slug", {
          type: "manual",
          message: result.data.error,
        });
      }
    } catch (error) {
      console.error("Failed to create link list:", error);
      form.setError("url_slug", {
        type: "manual",
        message: "Failed to create link list. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="private_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter list name..."
                  {...field}
                  type="text"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  aria-label="Link list name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url_slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="my-awesome-list"
                  {...field}
                  type="text"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  aria-label="URL slug"
                  className={cn(
                    form.formState.errors.url_slug &&
                      "ring-2 ring-destructive ring-offset-2",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            type="button"
            disabled={isLoading}
            onClick={() => setIsNewLinkListOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Link List"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
