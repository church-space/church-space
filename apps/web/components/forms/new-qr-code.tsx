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
import { createQRLinkAction } from "@/actions/create-qr-link";
import { useState } from "react";

const formSchema = z.object({
  subject: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be 60 characters or less"),
  url: z
    .string()
    .min(1, "URL is required")
    .transform((val) => {
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
        return `https://${val}`;
      }
      return val;
    })
    .refine(
      (val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Must be a valid URL" },
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewQRCode({
  organizationId,
  setIsNewQRCodeOpen,
}: {
  organizationId: string;
  setIsNewQRCodeOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      url: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const result = await createQRLinkAction({
        name: values.subject,
        url: values.url,
        organization_id: organizationId,
      });

      if (result?.data?.success && result?.data?.data) {
        await router.push(`/qr-codes/${result.data.data.id}?newQRCode=true`);
      }
    } catch (error) {
      console.error("Failed to create QR code:", error);
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
              <FormLabel className="ml-1">Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="QR Code name..."
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
                    aria-label="QR Code name"
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
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ml-1">URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter URL..."
                  {...field}
                  type="text"
                  maxLength={500}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsNewQRCodeOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create QR Code"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
