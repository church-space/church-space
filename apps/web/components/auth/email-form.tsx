"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@trivo/ui/form";
import { Input } from "@trivo/ui/input";
import { useToast } from "@trivo/ui/use-toast";
import { signInWithOtp } from "@trivo/supabase/auth";
import { sanitizeInput } from "@/lib/sanitize-inputs";
import { Mail } from "lucide-react";
import { animate } from "motion";

const FormSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
});

interface EmailFormProps {
  onSubmit: (email: string) => void;
  showLastUsed?: boolean;
}

export function EmailForm({ onSubmit, showLastUsed = false }: EmailFormProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });
  const { toast } = useToast();

  const emailFormRef = React.useRef<HTMLDivElement>(null);

  async function onSubmitForm(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    try {
      const sanitizedEmail = sanitizeInput(data.email);
      await signInWithOtp(sanitizedEmail);
      toast({
        title: "Success",
        description: "Check your email for the login link.",
      });
      onSubmit(sanitizedEmail);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "There was a problem sending the login link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleButtonClick = () => {
    if (showEmailForm) {
      form.handleSubmit(onSubmitForm)();
    } else {
      setShowEmailForm(true);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter" && showEmailForm) {
      event.preventDefault();
      form.handleSubmit(onSubmitForm)();
    }
  };

  React.useEffect(() => {
    if (showEmailForm && emailFormRef.current) {
      animate(
        emailFormRef.current,
        { height: "auto", opacity: 1 },
        { duration: 0.1 }
      );
    }

    return () => {
      if (emailFormRef.current) {
        animate(
          emailFormRef.current,
          { height: 0, opacity: 0 },
          { duration: 0.1 }
        );
      }
    };
  }, [showEmailForm]);

  return (
    <div className="relative flex flex-col gap-2">
      {showEmailForm && (
        <div ref={emailFormRef} className="mt-3">
          <form onKeyDown={handleKeyPress}>
            <Form {...form}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address..."
                        {...field}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </form>
        </div>
      )}
      <button
        type="button"
        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-secondary px-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        {isLoading ? (
          "Loading..."
        ) : showEmailForm ? (
          "Submit"
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Email
          </>
        )}
      </button>
      {showLastUsed && !showEmailForm && (
        <div className="absolute right-2 top-2.5 rounded-full bg-foreground p-1 px-2.5 text-xs font-medium text-background">
          Last used
        </div>
      )}
    </div>
  );
}
