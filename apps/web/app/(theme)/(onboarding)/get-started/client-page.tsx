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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { addDomainAction } from "@/actions/add-domain";

// Domain validation schema
const domainSchema = z
  .string()
  .transform((val) => {
    // Trim whitespace
    let domain = val.trim();

    // Remove http:// or https:// if present
    domain = domain.replace(/^https?:\/\//i, "");

    // Remove trailing slash if present
    domain = domain.replace(/\/$/, "");

    return domain;
  })
  .refine(
    (val) => {
      // Basic domain validation regex
      const domainRegex =
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
      return domainRegex.test(val);
    },
    {
      message: "Please enter a valid domain name (e.g., example.com)",
    },
  );

// Import STRIPE_PLANS from subscribe-modal.tsx
interface StripePlans {
  productId: string;
  priceId: string;
  price: number;
  sendLimit: number;
  enviorment: "testing" | "live";
}

export const STRIPE_PLANS: StripePlans[] = [
  {
    productId: "prod_Ry0AINZpor4sJ3",
    priceId: "price_1RJxwZJPD51CqUc4CagzIwMK",
    price: 9,
    sendLimit: 5000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0D0QpnB7zNfO",
    priceId: "price_1RJxxgJPD51CqUc497rj5N6m",
    price: 18,
    sendLimit: 10000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0EMgnmn9yzxB",
    priceId: "price_1RJxyWJPD51CqUc4w6OOdOOt",
    price: 36,
    sendLimit: 20000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0E46a7LnSdnp",
    priceId: "price_1RFlO4JPD51CqUc41nUQizDK",
    price: 54,
    sendLimit: 30000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5gwIHqyWktAd",
    priceId: "price_1RFlV0JPD51CqUc42nzlT0N3",
    price: 72,
    sendLimit: 40000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0FtAuo7d83fN",
    priceId: "price_1RJyByJPD51CqUc49jqPYTyv",
    price: 90,
    sendLimit: 50000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5fimnn0jaI8x",
    priceId: "price_1RFlUUJPD51CqUc4Qr2jgzZA",
    price: 108,
    sendLimit: 60000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0GpfPkf6tmuo",
    priceId: "price_1RFlOqJPD51CqUc4Go9flhn5",
    price: 126,
    sendLimit: 70000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5fPv9RJhg6Xb",
    priceId: "price_1RFlToJPD51CqUc438x89eps",
    price: 144,
    sendLimit: 80000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0GuwNyFWV7VZ",
    priceId: "price_1RJyHRJPD51CqUc4n0u45yq4",
    price: 180,
    sendLimit: 100000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0CJ8eQeoXnXR",
    priceId: "price_1RJyJmJPD51CqUc45o6yUJNp",
    price: 9,
    sendLimit: 5000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0DuepmPHWG8b",
    priceId: "price_1RJyL9JPD51CqUc40iVKe34g",
    price: 18,
    sendLimit: 10000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0Ge0OavXMDQV",
    priceId: "price_1RJyN8JPD51CqUc4SJqQARNN",
    price: 36,
    sendLimit: 20000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GqqHFHHwqAb",
    priceId: "price_1RJyRuJPD51CqUc4i5XwAbUh",
    price: 54,
    sendLimit: 30000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5r59Tp5IYo6V",
    priceId: "price_1RJySzJPD51CqUc4XBy5SkNF",
    price: 72,
    sendLimit: 40000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GvuSloCxCMF",
    priceId: "price_1RJyUFJPD51CqUc4eplNB9nE",
    price: 90,
    sendLimit: 50000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5s8f3R9F3AmA",
    priceId: "price_1RJyV2JPD51CqUc4vXN8fv7j",
    price: 108,
    sendLimit: 60000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GTiTk5sNAIS",
    priceId: "price_1RJyW9JPD51CqUc4NYOTWKoh",
    price: 126,
    sendLimit: 70000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5sROshbuf4BN",
    priceId: "price_1RJyXLJPD51CqUc4Hn9QGmPA",
    price: 144,
    sendLimit: 80000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0G0Bo4FvAExH",
    priceId: "price_1RJyXoJPD51CqUc4cB3qK17M",
    price: 180,
    sendLimit: 100000,
    enviorment: "live",
  },
];

const addressFormSchema = z.object({
  street: z.string().min(1, "Street address cannot be blank"),
  streetLine2: z.string().optional(),
  city: z.string().min(1, "City cannot be blank"),
  state: z.string().min(1, "State cannot be blank"),
  zipCode: z.string().min(4, "Zip code must be at least 4 characters"),
  country: z.string().min(1, "Country cannot be blank"),
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
  const [domainLoading, setDomainLoading] = useState(false);
  const [emailCategoriesLoading, setEmailCategoriesLoading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [billingSetupLoading, setBillingSetupLoading] = useState(false);
  const [skipBillingLoading, setSkipBillingLoading] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [zipCodeValue, setZipCodeValue] = useState("");
  const [zipCodeError, setZipCodeError] = useState<string | null>(null);
  const [productUpdateEmails, setProductUpdateEmails] = useState(true);
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
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [categoryBgSaving, setCategoryBgSaving] = useState(false);
  const [domainValue, setDomainValue] = useState("");
  const [domainError, setDomainError] = useState<string | null>(null);
  const [isTypingDomain, setIsTypingDomain] = useState(false);
  const domainDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for selected_plan cookie on mount
  useEffect(() => {
    const selectedPlan = cookies.get("selected_plan");
    setShowBilling(!!selectedPlan);
    setSelectedPlan(selectedPlan || "free");
  }, []);

  // Validate zip code with debounce
  useEffect(() => {
    if (debouncedZipCode) {
      if (debouncedZipCode.length < 4) {
        setZipCodeError("Zip code must be at least 4 characters");
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

  const handleAddressSubmit = async (
    data: z.infer<typeof addressFormSchema>,
  ) => {
    setAddressLoading(true);

    // Optimistically proceed to next step (now domain)
    setCurrentStep(1);

    try {
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

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTypingDomain(false);
    if (domainDebounceTimerRef.current) {
      clearTimeout(domainDebounceTimerRef.current);
    }

    // Skip if no domain provided (user chose to skip)
    if (!domainValue) {
      setCurrentStep(2); // Proceed to email categories step
      return;
    }

    try {
      // Validate domain with Zod
      const cleanedDomain = domainSchema.parse(domainValue);
      setDomainError(null);
      setDomainLoading(true);

      // Optimistically proceed to next step
      setCurrentStep(2);

      // Call server action to add domain
      const response = await addDomainAction({
        organization_id: organizationId,
        domain: cleanedDomain,
        is_primary: true,
      });

      // Use any type to safely handle different response formats
      const result = response as any;

      // Check if response is successful
      const isSuccess =
        result &&
        (result.success === true ||
          (result.data && !result.error) ||
          (result.data && result.status === 201));

      if (!isSuccess) {
        // Handle error but don't go back (we already proceeded to next step)
        const errorMessage =
          result?.error ||
          (typeof result === "object" && "message" in result
            ? result.message
            : null) ||
          "Failed to add domain. You can add it later in settings.";

        toast({
          title: "Note about domain",
          description: errorMessage,
        });
      } else {
        toast({
          title: "Domain added",
          description: `${cleanedDomain} has been added to your account.`,
        });
      }
    } catch (error) {
      // Don't go back to domain step, just show a message
      if (error instanceof z.ZodError) {
        toast({
          title: "Domain validation error",
          description: error.errors[0].message,
        });
      } else {
        const errorMessage =
          typeof error === "string"
            ? error
            : "An error occurred while adding the domain. You can add it later in settings.";
        toast({
          title: "Note about domain",
          description: errorMessage,
        });
      }
    } finally {
      setDomainLoading(false);
    }
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDomainValue(value);
    setIsTypingDomain(true);
    setDomainError(null);

    // Clear any existing timer
    if (domainDebounceTimerRef.current) {
      clearTimeout(domainDebounceTimerRef.current);
    }

    // Set a new timer to turn off isTyping
    domainDebounceTimerRef.current = setTimeout(() => {
      setIsTypingDomain(false);
    }, 500);
  };

  const handleEmailCategoriesSubmit = async () => {
    setEmailCategoriesLoading(true);

    try {
      // Create a local copy of categories to work with
      const categoriesToSave = [...emailCategories];

      // If there's text in the new category input, add it
      if (newCategory.trim()) {
        // Check if we've reached the limit of 10 categories
        if (categoriesToSave.length < 10) {
          // Check if the category already exists
          const trimmedName = newCategory.trim();
          if (
            !categoriesToSave.some(
              (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase(),
            )
          ) {
            // Create a custom category with a default description
            const newId = `custom-${Date.now()}`;

            // Add to local array (not state, to avoid race condition)
            categoriesToSave.push({
              id: newId,
              name: trimmedName,
              isDefault: false,
              isRemovable: true,
              description: `Emails for ${trimmedName}`,
            });

            // Update state separately (for UI consistency)
            setEmailCategories(categoriesToSave);
          }
        }
      }

      // Proceed to next step first
      setCurrentStep(3);

      // Then start saving categories in the background
      setCategoryBgSaving(true);

      const saveResults = [];

      // Create all email categories in the database using our local copy
      for (const category of categoriesToSave) {
        try {
          const result = await createEmailCategoryAction({
            name: category.name,
            description: category.description,
            organization_id: organizationId,
          });

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
      }

      // Clear new category input
      setNewCategory("");
    } catch (error) {
      console.error("Error saving categories:", error);
      toast({
        title: "Error saving email categories",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      // If there's an error, go back to email categories step
      setCurrentStep(2);
    } finally {
      setEmailCategoriesLoading(false);
      setCategoryBgSaving(false);
    }
  };

  const handleThemeSubmit = async () => {
    setThemeLoading(true);

    try {
      const result = await updateUserPreferencesAction({
        userId: userId,
        preferences: {
          welcomeStepsCompleted: false,
          productUpdateEmails: productUpdateEmails,
        },
      });

      // Cast the result to ActionResponse type for type safety
      const typedResult = result as ActionResponse;

      if (typedResult.error) {
        toast({
          title: "Error saving preferences",
          description:
            typedResult.error || "Failed to save your preference settings",
          variant: "destructive",
        });
        return;
      }

      // If there is no selected plan or selected plan is free, update onboarding status here
      if (!showBilling || selectedPlan === "free") {
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

        // Navigate directly to welcome page
        router.push("/welcome");
      } else {
        // Continue to billing step if needed
        setCurrentStep(4);
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

  const handleBillingSetup = async () => {
    setBillingSetupLoading(true);

    try {
      // Save onboarding cookie data for redirect after Stripe checkout
      cookies.set("stripe_return_to", "/welcome", { expires: 1 });
      cookies.set("stripe_org_id", organizationId, { expires: 1 });
      cookies.set("stripe_onboarding", "true", { expires: 1 });

      // Get the selected stripe plan
      const plan = STRIPE_PLANS.find(
        (p) =>
          p.sendLimit.toString() === selectedPlan &&
          p.enviorment === process.env.NEXT_PUBLIC_STRIPE_ENV,
      );

      if (!plan) {
        toast({
          title: "Invalid plan selection",
          description: "Please select a valid plan to continue.",
          variant: "destructive",
        });
        setBillingSetupLoading(false);
        return;
      }

      // Redirect to stripe
      window.location.href = `/api/create-checkout-session?priceId=${plan.priceId}&organizationId=${organizationId}`;
    } catch (error) {
      toast({
        title: "Error processing billing setup",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setBillingSetupLoading(false);
    }
  };

  const removeCategory = (_id: string) => {
    setEmailCategories((categories) =>
      categories.filter((category) => category.id !== _id),
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
  // const handleBackButton = () => {
  //   // Update to handle the new step
  //   if (currentStep === 1) {
  //     setCurrentStep(0);
  //   } else if (currentStep === 2) {
  //     setCurrentStep(1);
  //   } else if (currentStep === 3) {
  //     setCurrentStep(2);
  //   } else if (currentStep === 4) {
  //     setCurrentStep(3);
  //   }
  // };

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
        <div className="text-center text-base text-muted-foreground">
          We&apos;ll use this address on the bottom of your emails to help with
          anti-spam laws.
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
        <div className="text-center text-base text-muted-foreground">
          Set up audience categories for your church&apos;s emails. Categories
          help people only receive the types of emails that they need.
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6 flex flex-col items-center justify-center gap-2"
      >
        <div className="text-center text-2xl font-bold">Your Preferences</div>
        <div className="text-center text-base text-muted-foreground">
          Customize your experience with Church Space
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <h3 className="mb-2 text-lg font-medium">Display Theme</h3>
            <div className="flex w-full justify-center">
              {isMounted && <ThemeSelectorToggles />}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="flex flex-col space-y-2"
            onClick={() => setProductUpdateEmails(!productUpdateEmails)}
          >
            <h3 className="text-lg font-medium">Communication</h3>
            <div className="flex items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <div className="text-base font-medium">Product Updates</div>
                <div className="text-sm text-muted-foreground">
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
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="w-full"
      >
        <Button
          className="mt-4 w-full"
          disabled={themeLoading || categoryBgSaving}
          onClick={handleThemeSubmit}
        >
          {themeLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {categoryBgSaving ? "Saving Categories..." : "Continue"}
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </motion.div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6 flex flex-col items-center justify-center gap-2"
      >
        <div className="text-center text-2xl font-bold">Complete Billing</div>
        <div className="text-center text-base text-muted-foreground">
          To continue with your selected plan from the pricing page, continue to
          billing. Otherwise, you can continue on the free plan.
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="w-full"
      >
        <Card className="w-full p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="text-lg font-medium">Your Selected Plan</div>

            {/* Plan Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="space-y-2 rounded-md bg-muted p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                  {selectedPlan === "free"
                    ? "Free Plan"
                    : `${Number(selectedPlan).toLocaleString()} emails per month`}
                </p>
                <p className="text-lg font-bold">
                  {selectedPlan === "free"
                    ? "$0"
                    : `$${
                        STRIPE_PLANS.find(
                          (plan) =>
                            plan.sendLimit.toString() === selectedPlan &&
                            plan.enviorment ===
                              process.env.NEXT_PUBLIC_STRIPE_ENV,
                        )?.price || "0"
                      }/month`}
                </p>
              </div>
            </motion.div>

            {/* Plan Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="space-y-2"
            >
              <Label>Change Your Plan</Label>
              <Select
                value={selectedPlan}
                onValueChange={(value: string) => setSelectedPlan(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    Free Plan - 500 emails/month
                  </SelectItem>
                  {STRIPE_PLANS.filter(
                    (plan) =>
                      plan.enviorment === process.env.NEXT_PUBLIC_STRIPE_ENV,
                  ).map((plan) => (
                    <SelectItem
                      key={plan.priceId}
                      value={plan.sendLimit.toString()}
                    >
                      {plan.sendLimit.toLocaleString()} emails - ${plan.price}
                      /month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="space-y-3 pt-4"
            >
              {selectedPlan !== "free" ? (
                <Button
                  className="w-full"
                  onClick={handleBillingSetup}
                  disabled={billingSetupLoading}
                >
                  {billingSetupLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Continue to Billing
                    </>
                  ) : (
                    "Continue to Billing"
                  )}
                </Button>
              ) : null}

              <Button
                className={`w-full ${selectedPlan !== "free" ? "bg-secondary text-foreground hover:bg-secondary/80" : ""}`}
                variant={selectedPlan !== "free" ? "secondary" : "default"}
                onClick={async () => {
                  setSkipBillingLoading(true);
                  try {
                    // Set client-side state first
                    setOrgFinishedOnboarding(true);

                    const result =
                      await updateOrganizationOnboardingStatusAction({
                        organizationId,
                        onboardingStatus: true,
                      });

                    // Cast the result to ActionResponse type for type safety
                    const typedResult = result as ActionResponse;

                    if (typedResult.error) {
                      toast({
                        title: "Error updating onboarding status",
                        description:
                          typedResult.error ||
                          "Failed to update onboarding status",
                        variant: "destructive",
                      });
                    }

                    // Navigate directly to welcome page
                    router.push("/welcome");
                  } catch (error) {
                    toast({
                      title: "Error saving preferences",
                      description:
                        error instanceof Error
                          ? error.message
                          : "An error occurred",
                      variant: "destructive",
                    });
                  } finally {
                    setSkipBillingLoading(false);
                  }
                }}
              >
                {skipBillingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {selectedPlan === "free"
                      ? "Continue on Free Plan"
                      : "Continue on Free Plan"}
                  </>
                ) : selectedPlan === "free" ? (
                  "Continue on Free Plan"
                ) : (
                  "Continue on Free Plan"
                )}
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderDomainForm = () => (
    <motion.div
      key="domain-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6 flex flex-col items-center justify-center gap-2"
      >
        <div className="text-center text-2xl font-bold">Add Your Domain</div>
        <div className="text-center text-base text-muted-foreground">
          Add a domain for your church&apos;s emails
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="w-full"
      >
        <form onSubmit={handleDomainSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="domain" className="ml-1">
              Domain Name
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={domainValue}
                    onChange={handleDomainChange}
                    className={`h-12 ${
                      domainError ? "border-red-500" : ""
                    } ${isTypingDomain ? "pr-8" : ""}`}
                    disabled={domainLoading}
                    maxLength={255}
                  />
                  {isTypingDomain && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {domainError && !isTypingDomain && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {domainError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={domainLoading}>
              {domainLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Domain...
                </>
              ) : (
                "Continue"
              )}
            </Button>
            {!domainLoading && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setCurrentStep(2)}
              >
                I&apos;ll do this later
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      {/* <AnimatePresence>
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
      </AnimatePresence> */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && renderAddressForm()}
        {currentStep === 1 && renderDomainForm()}
        {currentStep === 2 && renderEmailCategories()}
        {currentStep === 3 && renderThemeSelector()}
        {currentStep === 4 &&
          showBilling &&
          selectedPlan !== "free" &&
          renderBillingPage()}
      </AnimatePresence>
    </div>
  );
}
