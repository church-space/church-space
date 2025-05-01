"use client";

import { Button } from "@church-space/ui/button";
import { Card } from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Switch } from "@church-space/ui/switch";
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
import { createEmailCategoryAction } from "@/actions/create-email-category";
import { updateOrganizationOnboardingStatusAction } from "@/actions/update-organization-onboarding-status";
import { updateUserPreferencesAction } from "@/actions/update-user-preferences";
import { useUser } from "@/stores/use-user";

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

// Add type for email categories
interface EmailCategory {
  id: string;
  name: string;
  isDefault: boolean;
  isRemovable: boolean;
  description: string | null;
}

export default function ClientPage({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [addressLoading, setAddressLoading] = useState(false);
  const [emailCategoriesLoading, setEmailCategoriesLoading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [zipCodeValue, setZipCodeValue] = useState("");
  const [zipCodeError, setZipCodeError] = useState<string | null>(null);
  const [productUpdateEmails, setProductUpdateEmails] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
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
  const { setOrgFinishedOnboarding } = useUser();

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

  const [emailCategories, setEmailCategories] = useState<EmailCategory[]>([
    {
      id: "general",
      name: "General Emails",
      isDefault: true,
      isRemovable: false,
      description: "Updates and announcements for the whole church.",
    },
    {
      id: "students",
      name: "Students",
      isDefault: false,
      isRemovable: true,
      description: "News and events for the student program.",
    },
    {
      id: "kids",
      name: "Kids",
      isDefault: false,
      isRemovable: true,
      description: "Info for parents and children's ministry families.",
    },
    {
      id: "events",
      name: "Events",
      isDefault: false,
      isRemovable: true,
      description: "Upcoming gatherings, registrations, and details.",
    },
    {
      id: "finance",
      name: "Finance",
      isDefault: false,
      isRemovable: true,
      description: "Giving updates, budget reports, and stewardship info.",
    },
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
    setAddressLoading(true);

    // Optimistically proceed to next step
    setCurrentStep(1);

    try {
      console.log("Street", data.street);
      // Call the update action
      const result = await updateOrganizationAddressAction({
        organizationId: organizationId,
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
      setAddressLoading(false);
    }
  };

  const handleEmailCategoriesSubmit = async () => {
    setEmailCategoriesLoading(true);
    try {
      console.log("Saving categories:", emailCategories);

      const saveResults = [];

      // Create all email categories in the database
      // Only save categories that remain in the state (weren't removed by the user)
      for (const category of emailCategories) {
        console.log("Saving category:", category.name);

        try {
          const result = await createEmailCategoryAction({
            name: category.name,
            description: category.description,
            organization_id: organizationId,
          });

          console.log("Category save result:", result);

          if (result && "error" in result && result.error) {
            console.error(
              `Failed to save category ${category.name}:`,
              result.error,
            );
            saveResults.push({
              category: category.name,
              success: false,
              error: result.error,
            });
          } else {
            saveResults.push({ category: category.name, success: true });
          }
        } catch (err) {
          console.error(`Error saving category ${category.name}:`, err);
          saveResults.push({
            category: category.name,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      const failures = saveResults.filter((r) => !r.success);

      if (failures.length > 0) {
        console.error("Some categories failed to save:", failures);
        toast({
          title: `${failures.length} categories failed to save`,
          description:
            "Some email categories could not be saved. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Proceed to next step
      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving categories:", error);
      toast({
        title: "Error saving email categories",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setEmailCategoriesLoading(false);
    }
  };

  const handleThemeSubmit = async () => {
    setThemeLoading(true);

    try {
      if (userId) {
        // Save user preferences
        const result = await updateUserPreferencesAction({
          userId,
          preferences: {
            productUpdateEmails,
          },
        });

        // Cast the result to ActionResponse type for type safety
        const typedResult = result as ActionResponse;

        if (typedResult.error) {
          toast({
            title: "Error saving preferences",
            description: typedResult.error || "Failed to save preferences",
            variant: "destructive",
          });
        }
      }

      // If there is no selected plan, update onboarding status here
      if (!showBilling) {
        // Set client-side state first
        setOrgFinishedOnboarding(true);

        const result = await updateOrganizationOnboardingStatusAction({
          organizationId,
          onboardingStatus: true,
        });

        // Cast the result to ActionResponse type for type safety
        const typedResult = result as ActionResponse;

        if (typedResult.error) {
          toast({
            title: "Error updating onboarding status",
            description:
              typedResult.error || "Failed to update onboarding status",
            variant: "destructive",
          });
        }
      }

      // Continue to next step regardless of preference save result
      if (showBilling) {
        setCurrentStep(3);
      } else {
        setCurrentStep(3); // Go to final loading screen instead of direct navigation
      }
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setThemeLoading(false);
    }
  };

  const handleBillingComplete = async () => {
    setBillingLoading(true);

    try {
      // If there is a selected plan, update onboarding status here
      // Set client-side state first
      setOrgFinishedOnboarding(true);

      const result = await updateOrganizationOnboardingStatusAction({
        organizationId,
        onboardingStatus: true,
      });

      // Cast the result to ActionResponse type for type safety
      const typedResult = result as ActionResponse;

      if (typedResult.error) {
        toast({
          title: "Error updating onboarding status",
          description:
            typedResult.error || "Failed to update onboarding status",
          variant: "destructive",
        });
        return;
      }

      setCurrentStep(4); // Go to final loading screen
    } catch (error) {
      toast({
        title: "Error completing setup",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setBillingLoading(false);
    }
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

    // Create a custom category with a default description
    const newId = `custom-${Date.now()}`;
    const trimmedName = newCategory.trim();

    setEmailCategories([
      ...emailCategories,
      {
        id: newId,
        name: trimmedName,
        isDefault: false,
        isRemovable: true,
        description: `Emails for ${trimmedName}`,
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newCategory.trim()) {
      e.preventDefault();
      addCategory();
    }
  };

  // Add useEffect to handle mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Back button function to go to the previous step
  const handleBackButton = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
                addressLoading ||
                !addressForm.formState.isValid ||
                !!zipCodeError
              }
            >
              {addressLoading ? (
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
          Set up audience categories for your church&apos;s emails
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
                    className="flex items-center justify-between rounded-md border p-1 pl-3"
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
                  onKeyDown={handleKeyDown}
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
                disabled={emailCategoriesLoading}
                onClick={handleEmailCategoriesSubmit}
              >
                {emailCategoriesLoading ? (
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
        Your Preferences
      </div>
      <div className="mb-2 text-center text-sm text-muted-foreground">
        Customize your experience with Church Space
      </div>

      <div className="w-full">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-medium">Display Theme</h3>
            <div className="flex w-full justify-center">
              {isMounted && <ThemeSelectorToggles />}
            </div>
          </div>

          <div
            className="flex flex-col space-y-2"
            onClick={() => setProductUpdateEmails(!productUpdateEmails)}
          >
            <h3 className="text-lg font-medium">Communication</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Product Updates</div>
                <div className="text-xs text-muted-foreground">
                  Receive infrequent emails about new features and updates
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="product-updates" className="sr-only">
                  Product Updates
                </Label>
                <Switch
                  id="product-updates"
                  checked={productUpdateEmails}
                  onCheckedChange={setProductUpdateEmails}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="mt-4 w-full"
        disabled={themeLoading}
        onClick={handleThemeSubmit}
      >
        {themeLoading ? (
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
          <Button
            className="w-full"
            onClick={handleBillingComplete}
            disabled={billingLoading}
          >
            {billingLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Complete Setup
              </>
            ) : (
              "Complete Setup"
            )}
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
      <AnimatePresence>
        {currentStep > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackButton}
            className="bg-btn-background hover:bg-btn-background-hover group absolute left-8 top-8 flex items-center rounded-md px-4 py-2 text-sm text-foreground no-underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>{" "}
            Back
          </motion.button>
        )}
      </AnimatePresence>
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
