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
import { useState } from "react";

const formSchema = z.object({
  private_name: z.string().min(1, "Name is required"),
  url_slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: "URL slug must be lowercase letters, numbers, and hyphens only",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLinkList({
  organizationId,
}: {
  organizationId: string;
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
    try {
      const result = await createLinkListAction({
        private_name: values.private_name,
        url_slug: values.url_slug,
        organization_id: organizationId,
      });

      if (result?.data?.success && result?.data?.data) {
        await router.push(
          `/link-lists/${result.data.data.id}/editor?newList=true`,
        );
      }
    } catch (error) {
      console.error("Failed to create link list:", error);
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Link List"}
        </Button>
      </form>
    </Form>
  );
}
