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
} from "@church-space/ui/form";
import { Input } from "@church-space/ui/input";
import { useToast } from "@church-space/ui/use-toast";
import { motion } from "framer-motion";
import { signInWithOtp } from "@/app/(auth)/actions";
import { sanitizeInput } from "@/lib/sanitize-inputs";
import { MailFilled } from "@church-space/ui/icons";
import { cn } from "@church-space/ui/cn";

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
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });
  const { toast } = useToast();

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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      form.handleSubmit(onSubmitForm)();
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
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
                    maxLength={255}
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </form>
      <motion.button
        type="button"
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-primary px-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90",
          !form.formState.isValid && "bg-primary/50 hover:bg-primary/50",
        )}
        onClick={() => form.handleSubmit(onSubmitForm)()}
        disabled={isLoading || !form.formState.isValid}
      >
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            <MailFilled />
            Continue with Email
          </>
        )}
      </motion.button>
      {showLastUsed && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute right-2 top-2.5 rounded-full bg-foreground p-1 px-2.5 text-xs font-medium text-background"
        >
          Last used
        </motion.div>
      )}
    </div>
  );
}
