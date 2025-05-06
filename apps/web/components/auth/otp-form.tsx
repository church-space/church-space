"use client";

import { sanitizeInput } from "@/lib/sanitize-inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@church-space/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@church-space/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@church-space/ui/input-otp";
import { toast } from "@church-space/ui/use-toast";
import { verifyOtp } from "@/app/(theme)/(auth)/actions";

const FormSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

interface InputOTPFormProps {
  email: string;
  redirectUrl: string;
}

export function InputOTPForm({ email, redirectUrl }: InputOTPFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    try {
      const sanitizedPin = sanitizeInput(data.pin);
      await verifyOtp(email, sanitizedPin);
      router.push(redirectUrl);
    } catch {
      toast({
        title: "Authentication failed",
        description: "Please check your OTP and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  const handleComplete = (value: string) => {
    if (value.length === 6) {
      const sanitizedValue = sanitizeInput(value);
      form.setValue("pin", sanitizedValue);
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-3">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP maxLength={6} {...field} onComplete={handleComplete}>
                  <InputOTPGroup className="w-full">
                    <InputOTPSlot index={0} className="h-12 w-full text-lg" />
                    <InputOTPSlot index={1} className="h-12 w-full text-lg" />
                    <InputOTPSlot index={2} className="h-12 w-full text-lg" />
                    <InputOTPSlot index={3} className="h-12 w-full text-lg" />
                    <InputOTPSlot index={4} className="h-12 w-full text-lg" />
                    <InputOTPSlot index={5} className="h-12 w-full text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
    </Form>
  );
}
