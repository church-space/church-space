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
import { createEmailTemplateAction } from "@/actions/create-email-template";
import { useState } from "react";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewEmailTemplate({
  organizationId,
}: {
  organizationId: string;
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
      const result = await createEmailTemplateAction({
        subject: values.subject,
        organization_id: organizationId,
      });

      if (result?.data?.success && result?.data?.data) {
        await router.push(
          `/email/${result.data.data.id}/editor?newTemplate=true`,
        );
      }
    } catch (error) {
      console.error("Failed to create email template:", error);
    } finally {
      setIsLoading(false);
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
              <FormLabel>Template Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter email template subject..."
                  {...field}
                  type="text"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  name="email_template_subject_field"
                  aria-label="Email template subject"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Email Template"}
        </Button>
      </form>
    </Form>
  );
}
