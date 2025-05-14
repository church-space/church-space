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
import { useQueryClient } from "@tanstack/react-query";

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
          // If it's a mailto link or email address, validate differently
          if (
            val.startsWith("mailto:") ||
            (val.includes("@") && !val.includes(" "))
          ) {
            return true;
          }

          const urlToTest =
            !val.startsWith("http://") && !val.startsWith("https://")
              ? `https://${val}`
              : val;
          const parsedUrl = new URL(urlToTest);
          const hostname = parsedUrl.hostname;

          if (!hostname) return false;

          // Allow localhost and common IP address formats
          const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
          const ipv6Regex = /^[a-fA-F0-9:]+$/;

          if (
            hostname === "localhost" ||
            ipv4Regex.test(hostname) ||
            (hostname.includes(":") && ipv6Regex.test(hostname))
          ) {
            return true;
          }

          // For other hostnames, require a dot (likely for TLD)
          if (!hostname.includes(".")) {
            return false;
          }

          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Must be a valid URL (e.g., example.com) or email address",
      },
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewQRCode({
  organizationId,
  setIsNewQRCodeOpen,
  isSidebar,
}: {
  organizationId: string;
  setIsNewQRCodeOpen: (isOpen: boolean) => void;
  isSidebar: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      // Format the URL before saving
      let formattedUrl = values.url;

      // Handle email addresses and mailto links
      if (
        formattedUrl.includes("@") &&
        !formattedUrl.includes(" ") &&
        !formattedUrl.startsWith("mailto:")
      ) {
        formattedUrl = `mailto:${formattedUrl}`;
      }
      // Handle regular URLs
      else if (
        !formattedUrl.startsWith("mailto:") &&
        !formattedUrl.startsWith("http://") &&
        !formattedUrl.startsWith("https://")
      ) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const result = await createQRLinkAction({
        name: values.subject,
        url: formattedUrl,
        organization_id: organizationId,
      });

      if (result?.data?.success && result?.data?.data) {
        // Invalidate the qr-links queries
        await queryClient.invalidateQueries({
          queryKey: ["qr-links", organizationId],
        });

        if (isSidebar) {
          setIsNewQRCodeOpen(false);
          router.push(`/qr-codes/${result.data.data.id}?newQRCode=true`);
        } else {
          router.push(`/qr-codes/${result.data.data.id}?newQRCode=true`);
        }
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
              <FormLabel className="ml-1">URL or Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter URL or email address..."
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
