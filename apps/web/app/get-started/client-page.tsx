"use client";

import { Button } from "@church-space/ui/button";
import { Card } from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@church-space/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { ThemeSelectorToggles } from "@/components/settings/theme-selector";
import cookies from "js-cookie";
import CountrySelect from "@church-space/ui/country-select";
import { useDebounce } from "@/hooks/use-debounce";
import type { ActionResponse } from "@/types/action";
import { updateOrganizationAddressAction } from "@/actions/update-organization-address";

const addressFormSchema = z.object({
  street: z.string().min(1, "Street address cannot be blank"),
  streetLine2: z.string().optional(),
  city: z.string().min(1, "City cannot be blank"),
  state: z.string().min(1, "State cannot be blank"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  country: z.string().min(1, "Country cannot be blank"),
});

const emailCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      isDefault: z.boolean(),
      isRemovable: z.boolean(),
    }),
  ),
  newCategory: z.string().optional(),
});

export default function ClientPage({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [zipCodeValue, setZipCodeValue] = useState("");
  const [zipCodeError, setZipCodeError] = useState<string | null>(null);
  const debouncedZipCode = useDebounce(zipCodeValue, 800);
  const [hasScrollShadow, setHasScrollShadow] = useState<{
    top: boolean;
    bottom: boolean;
  }>({
    top: false,
    bottom: false,
  });
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Check for selected_plan cookie on mount
  useEffect(() => {
    const selectedPlan = cookies.get("selected_plan");
    setShowBilling(!!selectedPlan);
  }, []);

  // Auto-redirect to welcome page after final loading screen
  useEffect(() => {
    let timer: NodeJS.Timeout;
    // If we're on the final loading screen
    if (currentStep === (showBilling ? 4 : 3)) {
      timer = setTimeout(() => {
        router.push("/welcome");
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [currentStep, router, showBilling]);

  // Validate zip code with debounce
  useEffect(() => {
    if (debouncedZipCode) {
      if (debouncedZipCode.length < 5) {
        setZipCodeError("Zip code must be at least 5 characters");
      } else {
        setZipCodeError(null);
      }
    } else {
      setZipCodeError(null);
    }
  }, [debouncedZipCode]);

  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street: "",
      streetLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    mode: "onChange",
  });

  const [emailCategories, setEmailCategories] = useState([
    {
      id: "general",
      name: "General Emails",
      isDefault: true,
      isRemovable: false,
    },
    { id: "students", name: "Students", isDefault: true, isRemovable: true },
    { id: "kids", name: "Kids", isDefault: true, isRemovable: true },
    { id: "events", name: "Events", isDefault: true, isRemovable: true },
    { id: "finance", name: "Finance", isDefault: true, isRemovable: true },
  ]);

  // Auto-scroll to bottom when adding a new category
  useEffect(() => {
    if (categoriesContainerRef.current && emailCategories.length > 0) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        if (categoriesContainerRef.current) {
          categoriesContainerRef.current.scrollTop =
            categoriesContainerRef.current.scrollHeight;
          updateScrollShadow();
        }
      }, 100);
    }
  }, [emailCategories.length]);

  const [newCategory, setNewCategory] = useState("");

  const emailForm = useForm<z.infer<typeof emailCategoriesSchema>>({
    resolver: zodResolver(emailCategoriesSchema),
    defaultValues: {
      categories: emailCategories,
      newCategory: "",
    },
  });

  const handleAddressSubmit = async (
    data: z.infer<typeof addressFormSchema>,
  ) => {
    setIsLoading(true);

    // Optimistically proceed to next step
    setCurrentStep(1);

    try {
      console.log("Street", data.street);
      // Call the update action
      const result = await updateOrganizationAddressAction({
        organizationId: organizationId, // Assuming userId is the organization ID
        address: {
          line1: data.street,
          line2: data.streetLine2 || "",
          city: data.city,
          state: data.state,
          zip: data.zipCode,
          country: data.country,
        },
      });

      // Cast the result to ActionResponse type for type safety
      const typedResult = result as ActionResponse;

      if (!typedResult) {
        // If there's no response, go back to address form
        setCurrentStep(0);
        toast({
          title: "Error saving address",
          description: "Failed to save address: no response received",
          variant: "destructive",
        });
        return;
      }

      if (typedResult.error) {
        // If there's an error in the response, go back to address form
        setCurrentStep(0);
        toast({
          title: "Error saving address",
          description:
            typedResult.error || "Failed to save address information",
          variant: "destructive",
        });
      }
    } catch (error) {
      // If there's an exception, go back to address form
      setCurrentStep(0);
      toast({
        title: "Error saving address",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailCategoriesSubmit = () => {
    setIsLoading(true);
    try {
      // For now, just simulating a submission
      setTimeout(() => {
        setCurrentStep(2);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
      setIsLoading(false);
    }
  };

  const handleThemeSubmit = () => {
    if (showBilling) {
      setCurrentStep(3);
    } else {
      setCurrentStep(3); // Go to final loading screen instead of direct navigation
    }
  };

  const handleBillingComplete = () => {
    setCurrentStep(4); // Go to final loading screen instead of direct navigation
  };

  const toggleCategory = (id: string) => {
    // This function is now a no-op since we removed checkboxes
    // Keeping it for future functionality if needed
  };

  const removeCategory = (id: string) => {
    setEmailCategories((categories) =>
      categories.filter((category) => category.id !== id),
    );
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;

    // Check if we've reached the limit of 10 categories
    if (emailCategories.length >= 10) {
      toast({
        title: "Category limit reached",
        description: "You can only have up to 10 email categories.",
      });
      return;
    }

    // Check if the category already exists
    if (
      emailCategories.some(
        (cat) => cat.name.toLowerCase() === newCategory.trim().toLowerCase(),
      )
    ) {
      toast({
        title: "Category already exists",
        description: "Please enter a unique category name.",
      });
      return;
    }

    const newId = `custom-${Date.now()}`;
    setEmailCategories([
      ...emailCategories,
      {
        id: newId,
        name: newCategory.trim(),
        isDefault: false,
        isRemovable: true,
      },
    ]);
    setNewCategory("");
  };

  const updateScrollShadow = () => {
    const container = categoriesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    setHasScrollShadow({
      top: scrollTop > 10,
      bottom: scrollTop + clientHeight < scrollHeight - 10,
    });
  };

  const handleCategoriesScroll = () => {
    updateScrollShadow();
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setZipCodeValue(value);
    addressForm.setValue("zipCode", value, { shouldValidate: false });
  };

  const renderAddressForm = () => (
    <motion.div
      key="address-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6 flex flex-col items-center justify-center gap-2"
      >
        <div className="text-center text-2xl font-bold">
          What&apos;s your church&apos;s address?
        </div>
        <div className="text-center text-sm text-muted-foreground">
          We&apos;ll use this address on the bottom of your emails to help with
          anit-spam laws.
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="space-y-2 p-6 pt-1">
          <form
            onSubmit={addressForm.handleSubmit(handleAddressSubmit)}
            className="space-y-2 pt-4"
          >
            <div className="space-y-1">
              <Label>Street Address</Label>
              <Input
                placeholder="123 Main St"
                {...addressForm.register("street")}
              />
              {addressForm.formState.errors.street && (
                <div className="mt-2 text-sm text-red-500">
                  {addressForm.formState.errors.street.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label>Address Line 2 (Optional)</Label>
              <Input
                placeholder="Apt, Suite, Building, etc."
                {...addressForm.register("streetLine2")}
              />
            </div>

            <div className="space-y-1">
              <Label>City</Label>
              <Input placeholder="City" {...addressForm.register("city")} />
              {addressForm.formState.errors.city && (
                <div className="mt-2 text-sm text-red-500">
                  {addressForm.formState.errors.city.message}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>State/Province</Label>
                <Input placeholder="State" {...addressForm.register("state")} />
                {addressForm.formState.errors.state && (
                  <div className="mt-2 text-sm text-red-500">
                    {addressForm.formState.errors.state.message}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label>Zip/Postal Code</Label>
                <Input
                  placeholder="Zip Code"
                  value={zipCodeValue}
                  onChange={handleZipCodeChange}
                />
                {zipCodeError && (
                  <div className="mt-2 text-sm text-red-500">
                    {zipCodeError}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1 pb-2">
              <Label>Country</Label>
              <CountrySelect
                value={addressForm.watch("country")}
                onValueChange={(value) =>
                  addressForm.setValue("country", value, {
                    shouldValidate: true,
                  })
                }
                className="w-full"
              />
              {addressForm.formState.errors.country && (
                <div className="mt-2 text-sm text-red-500">
                  {addressForm.formState.errors.country.message}
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading || !addressForm.formState.isValid || !!zipCodeError
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Continue
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderEmailCategories = () => (
    <motion.div
      key="email-categories"
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
        <div className="text-center text-2xl font-bold">Email Categories</div>
        <div className="text-center text-sm text-muted-foreground">
          Set up audience categories for your organization's emails
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="space-y-4 p-6 pt-1">
          <div className="space-y-4 pt-4">
            <div className="relative">
              {hasScrollShadow.top && (
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-4 bg-gradient-to-b from-background to-transparent" />
              )}
              <div
                ref={categoriesContainerRef}
                className="relative max-h-[300px] space-y-2 overflow-y-auto pr-1"
                onScroll={handleCategoriesScroll}
              >
                {emailCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.8,
                    }}
                    layout
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="font-medium">
                      {category.name}
                      {category.isDefault && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Default)
                        </span>
                      )}
                    </div>
                    {category.isRemovable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCategory(category.id)}
                        className="h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
              {hasScrollShadow.bottom && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-4 bg-gradient-to-t from-background to-transparent" />
              )}
            </div>

            {emailCategories.length < 10 && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Input
                  placeholder="Add new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={addCategory}
                  disabled={!newCategory.trim()}
                  type="button"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            <div className="pt-4">
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={handleEmailCategoriesSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Continue
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderThemeSelector = () => (
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
        disabled={isLoading}
        onClick={handleThemeSubmit}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Continue
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </motion.div>
  );

  const renderBillingPage = () => (
    <motion.div
      key="billing-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-6"
    >
      <div className="mt-6 text-center text-2xl font-bold">
        Complete Your Billing
      </div>
      <div className="mb-2 text-center text-sm text-muted-foreground">
        Finalize your subscription
      </div>
      <Card className="w-full p-6">
        <div className="space-y-4">
          <div className="text-lg font-medium">Selected Plan Information</div>
          <div className="rounded-md bg-muted p-4">
            <p>Selected Plan:</p>
            <p>{cookies.get("selected_plan")}</p>
          </div>
          <Button className="w-full" onClick={handleBillingComplete}>
            Complete Setup
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderFinalLoading = () => (
    <motion.div
      key="final-loading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      <div className="mt-6 text-center text-2xl font-bold">
        Getting things ready for you
      </div>
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <div className="text-center text-sm text-muted-foreground">
        Setting up your workspace...
      </div>
    </motion.div>
  );

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <AnimatePresence mode="wait">
        {currentStep === 0 && renderAddressForm()}
        {currentStep === 1 && renderEmailCategories()}
        {currentStep === 2 && renderThemeSelector()}
        {currentStep === 3 && showBilling && renderBillingPage()}
        {currentStep === (showBilling ? 4 : 3) && renderFinalLoading()}
      </AnimatePresence>
    </div>
  );
}
