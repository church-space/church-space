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
import { createEmailAction } from "@/actions/create-email";
import { useState } from "react";

const formSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(60, "Subject must be 60 characters or less"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewEmailTemplate({
  organizationId,
  setIsNewEmailTemplateOpen,
}: {
  organizationId: string;
  setIsNewEmailTemplateOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const result = await createEmailAction({
        subject: values.subject,
        organization_id: organizationId,
        type: "template",
      });

      console.log(result);

      if (result?.data?.success && result?.data?.data) {
        await router.push(`/emails/${result.data.data.id}/editor`);
      }
    } catch (error) {
      console.error("Failed to create template:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ml-1">Template Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Template name..."
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
                    aria-label="Template name"
                    data-1p-ignore={true}
                    data-bwignore={true}
                    data-icloud-keychain-ignore={true}
                    className="pe-16"
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
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsNewEmailTemplateOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
