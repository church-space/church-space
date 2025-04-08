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
import { cn } from "@church-space/ui/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { CircleInfo } from "@church-space/ui/icons";

const formSchema = z.object({
  private_name: z.string().min(1, "Name is required"),
  url_slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message:
      "URL slug must be lowercase letters, numbers, and hyphens only, and it cannot end in a hyphen",
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

      if (!result?.data?.error) {
        await router.push(`/link-lists/${result?.data?.data?.id}?newList=true`);
      } else if (result?.data?.error) {
        form.setError("url_slug", {
          type: "manual",
          message: result.data.error,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to create link list:", error);
      form.setError("url_slug", {
        type: "manual",
        message: "Failed to create link list. Please try again.",
      });
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <FormLabel className="ml-1 flex items-center gap-1">
                    Name <CircleInfo />
                  </FormLabel>
                </TooltipTrigger>
                <TooltipContent className="max-w-64">
                  <p>This is the private name of your link list.</p>
                </TooltipContent>
              </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <FormLabel className="ml-1 flex items-center gap-1">
                    URL Slug <CircleInfo />
                  </FormLabel>
                </TooltipTrigger>
                <TooltipContent className="max-w-64">
                  <p>
                    This is the part of the link used after
                    churchspace.com/link-lists/
                  </p>
                </TooltipContent>
              </Tooltip>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="list-name"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "");
                      field.onChange(value);
                    }}
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
                      "pl-44 pr-14",
                      form.formState.errors.url_slug &&
                        "ring-2 ring-destructive ring-offset-2",
                    )}
                    maxLength={32}
                  />
                  <span className="absolute left-0 top-1/2 flex h-9 -translate-y-1/2 items-center rounded-l-md border bg-muted px-1.5 text-xs text-muted-foreground">
                    churchspace.com/link-lists/
                  </span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {field.value.length} / 32
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
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
