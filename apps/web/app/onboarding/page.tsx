"use client";

import { updateUserOnboardingAction } from "@/actions/onboarding/update-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@trivo/ui/button";
import { Card, CardContent } from "@trivo/ui/card";
import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@trivo/ui/use-toast";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export default function Page() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const { register, handleSubmit } = form;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    const result = await updateUserOnboardingAction({
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
    });

    if (result?.data?.success) {
      router.push("/new-organization");
    } else {
      setLoading(false);
      toast({
        title: "Failed to update user",
      });
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <AnimatePresence mode="wait">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-2 mb-6"
          >
            <div className="text-3xl font-bold">Let's get started</div>
            <div className="text-sm text-muted-foreground">
              Please enter your email to continue
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="space-y-6 px-0 pt-4">
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}
