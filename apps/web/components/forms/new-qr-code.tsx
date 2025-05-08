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
    .min(3, "URL is required")
    .refine((val) => !val.includes(" "), {
      message: "URL cannot contain spaces",
    })
    .refine(
      (val) => {
        try {
          const urlToTest =
            !val.startsWith("http://") && !val.startsWith("https://")
              ? `https://${val}`
              : val;
          const parsedUrl = new URL(urlToTest);
          const hostname = parsedUrl.hostname;

          if (!hostname) return false; // Hostname is essential

          // Allow localhost and common IP address formats
          const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
          // Very basic check for IPv6, relying mostly on URL parser's leniency
          const ipv6Regex = /^[a-fA-F0-9:]+$/;

          if (
            hostname === "localhost" ||
            ipv4Regex.test(hostname) ||
            (hostname.includes(":") && ipv6Regex.test(hostname)) // Simple check if contains ':'
          ) {
            return true;
          }

          // For other hostnames, require a dot (likely for TLD)
          if (!hostname.includes(".")) {
            return false;
          }

          return true; // Parsed, has hostname, and meets criteria
        } catch {
          return false; // Didn't parse as a URL
        }
      },
      {
        message:
          "Must be a valid URL (e.g., example.com or https://example.com)",
      },
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
        setIsNewQRCodeOpen(false);
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
          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? "Creating..." : "Create QR Code"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
