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
import { motion, AnimatePresence } from "framer-motion";
import { signInWithOtp } from "@/app/(theme)/(auth)/actions";
import { sanitizeInput } from "@/lib/sanitize-inputs";
import { cn } from "@church-space/ui/cn";
import { Email } from "@church-space/ui/icons";

const FormSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
});

interface EmailFormProps {
  onSubmit: (email: string) => void;
  showLastUsed?: boolean;
  buttonText?: string;
}

export function EmailForm({
  onSubmit,
  showLastUsed = false,
  buttonText = "Email",
}: EmailFormProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
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

  return (
    <div className="relative flex flex-col gap-2">
      <AnimatePresence>
        {showEmailForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="mt-3"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        className={cn(
          "flex h-11 w-full cursor-default items-center justify-center gap-2 rounded-md border bg-primary px-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90",
          !form.formState.isValid &&
            "bg-background text-foreground hover:bg-background",
          !form.formState.isValid && showEmailForm && "text-muted-foreground",
          (form.formState.isValid || !showEmailForm) && "cursor-pointer",
        )}
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        {isLoading ? (
          "Loading..."
        ) : showEmailForm ? (
          "Submit"
        ) : (
          <>
            <span className="text-primary">
              <Email height={"16"} width={"16"} />
            </span>
            {buttonText}
          </>
        )}
      </motion.button>
      {showLastUsed && !showEmailForm && (
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
