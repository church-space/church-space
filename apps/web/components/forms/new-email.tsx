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
import type { ActionResponse } from "@/types/action";
import type { EmailResponse } from "@/actions/create-email";
import { useState } from "react";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewEmail({
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
      const result = await createEmailAction({
        subject: values.subject,
        organization_id: organizationId,
      });

      console.log(result);

      if (result?.data?.success && result?.data?.data) {
        await router.push(
          `/emails/${result.data.data.id}/editor?newEmail=true`,
        );
      }
    } catch (error) {
      console.error("Failed to create email:", error);
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
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter email subject..."
                  {...field}
                  type="text"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  name="email_subject_field"
                  aria-label="Email subject"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Email"}
        </Button>
      </form>
    </Form>
  );
}
