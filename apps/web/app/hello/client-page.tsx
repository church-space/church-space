"use client";

import { Button } from "@church-space/ui/button";
import { Card, CardContent } from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@church-space/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserAction } from "@/actions/update-user";
import { Loader2 } from "lucide-react";
import { ThemeSelectorToggles } from "@/components/settings/theme-selector";

const formSchema = z.object({
  firstName: z.string().min(1, "First name cannot be blank"),
  lastName: z.string().min(1, "Last name cannot be blank"),
});

export default function ClientPage({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showThemeSelect, setShowThemeSelect] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await updateUserAction({
        ...data,
        userId,
      });
      if (result?.data?.error) {
        toast({ title: "Error updating user", description: result.data.error });
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setShowThemeSelect(true);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating user",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <AnimatePresence mode="wait">
        {!showThemeSelect ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mb-6 flex flex-col items-center justify-center gap-2"
            >
              <div className="text-center text-2xl font-bold">
                Welcome to Church Space
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Let&apos;s get to know you.
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="space-y-4 p-6 pt-1">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4 pt-4"
                >
                  <div className="space-y-1">
                    <Label>First Name</Label>
                    <Input
                      placeholder="First Name"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <div className="mt-2 text-sm text-red-500">
                        {errors.firstName.message}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Last Name</Label>
                    <Input placeholder="Last Name" {...register("lastName")} />
                    {errors.lastName && (
                      <div className="mt-2 text-sm text-red-500">
                        {errors.lastName.message}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !isValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Let&apos;s get started
                      </>
                    ) : (
                      `Let's get started`
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="theme-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            <div className="mt-6 text-center text-2xl font-bold">
              Choose your theme
            </div>
            <div className="mb-2 text-center text-sm text-muted-foreground">
              Would you like to use light mode or dark mode?
            </div>
            <div className="flex w-full justify-center">
              <ThemeSelectorToggles />
            </div>
            <Button
              className="mt-4 w-full"
              disabled={isPushing}
              onClick={() => {
                setIsPushing(true);
                router.push("/welcome");
              }}
            >
              {isPushing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Continue
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
