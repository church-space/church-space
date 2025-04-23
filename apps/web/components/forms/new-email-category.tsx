"use client";

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
import { Textarea } from "@church-space/ui/textarea";
import { createEmailCategoryAction } from "@/actions/create-email-category";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be 60 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(80, "Description must be 80 characters or less")
    .nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewEmailCategory({
  organizationId,
  setIsNewEmailCategoryOpen,
}: {
  organizationId: string;
  setIsNewEmailCategoryOpen: (isOpen: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const result = await createEmailCategoryAction({
        name: values.name,
        organization_id: organizationId,
        description: values.description,
      });

      if (result?.data?.success && result?.data?.data) {
        // Invalidate email categories query to trigger a refresh
        await queryClient.invalidateQueries({
          queryKey: ["email-categories", organizationId],
        });

        // Close the form
        setIsNewEmailCategoryOpen(false);
      }
    } catch (error) {
      console.error("Failed to create email category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ml-1">Email Category Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Email category name..."
                    {...field}
                    type="text"
                    disabled={isLoading}
                    autoFocus
                    inputMode="text"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    autoComplete="false"
                    data-form-type="other"
                    data-lpignore={true}
                    aria-label="Email category name"
                    data-1p-ignore={true}
                    data-bwignore={true}
                    data-icloud-keychain-ignore={true}
                    className="pe-16"
                    maxLength={60}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {field.value.length} / 60
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ml-1">Description</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Enter email category description..."
                    {...field}
                    disabled={isLoading}
                    rows={2}
                    value={field.value || ""}
                    maxLength={80}
                    className="pe-16"
                  />
                  <span className="absolute right-2 top-2 text-sm text-muted-foreground">
                    {(field.value || "").length} / 80
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsNewEmailCategoryOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Email Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
