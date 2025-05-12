"use client";
import { getBrandColors } from "@/actions/get-brand-colors";
import { upsertBrandColorsAction } from "@/actions/upsert-brand-colors";
import ColorPicker from "@/components/dnd-builder/color-picker";
import {
  SettingsContent,
  SettingsDescription,
  SettingsHeader,
  SettingsRow,
  SettingsRowAction,
  SettingsRowTitle,
  SettingsSection,
  SettingsTitle,
} from "@/components/settings/settings-settings";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Skeleton } from "@church-space/ui/skeleton";
import { useToast } from "@church-space/ui/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ClientPage({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data: initialData, isLoading } = useQuery({
    queryKey: ["brand-colors", organizationId],
    queryFn: () => getBrandColors({ organizationId }),
  });

  const [colors, setColors] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization
  const hasUserMadeChangesRef = useRef(false); // Ref to track if user initiated changes
  const debouncedColors = useDebounce(colors, 800); // Debounce for 800ms
  const [showSavedStatus, setShowSavedStatus] = useState(false);

  const { toast } = useToast();

  const { mutate: saveColors } = useMutation({
    mutationFn: upsertBrandColorsAction,

    onSuccess: () => {
      setShowSavedStatus(true);
      setTimeout(() => {
        setShowSavedStatus(false);
      }, 4000);
    },

    onError: (error) => {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? error.message
          : "Failed to save brand colors due to an unknown error";
      toast({
        title: "Error",
        description: `Failed to save brand colors: ${errorMessage}`,
        variant: "destructive",
      });
    },
  });

  // Initialize colors from fetched data
  useEffect(() => {
    let initialColors: string[] = ["#000000"]; // Default color

    // Access data based on inferred type (likely initialData.data.colors.colors)
    // Use optional chaining for safety
    const fetchedColorData = initialData?.data?.colors?.colors; // Adjusted path

    if (fetchedColorData) {
      try {
        // Ensure it's an array and has color objects with string properties
        if (
          Array.isArray(fetchedColorData) &&
          fetchedColorData.length > 0 &&
          fetchedColorData.every(
            (c: any) =>
              typeof c === "object" &&
              c !== null &&
              typeof c.color === "string",
          )
        ) {
          // Extract just the color hex strings
          initialColors = fetchedColorData.map((c: any) => c.color);
        }
      } catch (error) {
        console.error("Failed to parse initial brand colors:", error);
        // Keep the default color if parsing fails
      }
    } else if (isLoading) {
      // If loading, do nothing yet, wait for data or loading to finish
      return;
    } // Handle potential errors from useQuery if needed (e.g., initialData?.error)

    // Only update colors if the component is not yet initialized
    if (!isInitialized) {
      setColors(initialColors);
      setIsInitialized(true); // Mark as initialized after setting initial state
    }
  }, [initialData, isLoading, isInitialized]);

  // Save colors when debounced state changes *after* initialization and *only if* user made changes
  useEffect(() => {
    // Don't save until the component is initialized with data
    if (!isInitialized) {
      return;
    }

    // Skip the save if the user hasn't made any changes yet
    if (!hasUserMadeChangesRef.current) {
      return;
    }

    // Proceed with saving only after initialization and if user has interacted
    const colorsToSave = debouncedColors.map((color, index) => ({
      color,
      title: `Color ${index + 1}`, // Assign a default title
    }));

    saveColors({
      organizationId,
      colors: colorsToSave,
    });
  }, [debouncedColors, saveColors, organizationId, isInitialized]); // Keep dependencies

  const handleColorChange = (index: number, newColor: string) => {
    hasUserMadeChangesRef.current = true; // Mark user interaction
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    setColors(updatedColors);
  };

  const addColor = () => {
    if (colors.length < 8) {
      hasUserMadeChangesRef.current = true; // Mark user interaction
      setColors([...colors, "#FFFFFF"]);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length <= 1) {
      toast({
        title: "Info",
        description: "You must have at least one brand color.",
      });
      return;
    }
    hasUserMadeChangesRef.current = true; // Mark user interaction
    const updatedColors = colors.filter((_, i) => i !== index);
    setColors(updatedColors);
  };

  // Show loading state or placeholder?
  if (isLoading) {
    return (
      <div className="relative">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <Link href="/settings" className="hidden md:block">
                  <BreadcrumbItem>Settings</BreadcrumbItem>
                </Link>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Brand Colors</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-16 p-4 pt-8">
          <SettingsSection>
            <SettingsHeader>
              <SettingsTitle>Brand Colors</SettingsTitle>
              <SettingsDescription>
                Customize the colors of your church&apos;s brand. Changes you
                make here are auto-saved.
              </SettingsDescription>
            </SettingsHeader>
            <SettingsContent>
              <Skeleton className="flex w-full flex-col gap-2 rounded-b-none border-b p-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex w-full gap-1 md:w-fit">
                  <Skeleton className="h-9 w-full md:w-64" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </Skeleton>

              <Skeleton className="flex w-full flex-col gap-2 rounded-none border-b p-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex w-full gap-1 md:w-fit">
                  <Skeleton className="h-9 w-full md:w-64" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </Skeleton>
              <Skeleton className="flex w-full flex-col gap-2 rounded-none p-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex w-full gap-1 md:w-fit">
                  <Skeleton className="h-9 w-full md:w-64" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </Skeleton>

              <SettingsRow
                isFirstRow={colors.length === 0}
                className={cn(
                  "cursor-pointer rounded-b-lg bg-muted text-muted-foreground transition-colors duration-200 hover:bg-background hover:text-foreground",
                  colors.length === 0 && "rounded-t-lg",
                )}
              >
                <SettingsRowTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Color
                </SettingsRowTitle>
              </SettingsRow>
            </SettingsContent>
          </SettingsSection>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <Link href="/settings" className="hidden md:block">
                <BreadcrumbItem>Settings</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Brand Colors</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-6 transition-all duration-300",
            showSavedStatus
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-4 opacity-0",
          )}
        >
          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
          <p className="text-sm text-muted-foreground">Saved</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-16 p-4 pt-8">
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Brand Colors</SettingsTitle>
            <SettingsDescription>
              Customize the colors of your church&apos;s brand. Changes you make
              here are auto-saved.
            </SettingsDescription>
          </SettingsHeader>
          <SettingsContent>
            {colors.map((color, index) => (
              <SettingsRow key={index} isFirstRow={index === 0}>
                <SettingsRowTitle>Color {index + 1}</SettingsRowTitle>
                <SettingsRowAction className="flex w-full flex-row items-center justify-start gap-1 md:justify-end">
                  <ColorPicker
                    onChange={(newColor) => handleColorChange(index, newColor)}
                    value={color}
                    brandColorsDisabled={true}
                    className="w-full md:w-fit"
                  />
                  {/* Conditionally render the remove button */}
                  {colors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColor(index)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove Color ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </SettingsRowAction>
              </SettingsRow>
            ))}
            {colors.length < 8 && ( // Only show add button if less than 8 colors
              <SettingsRow
                isFirstRow={colors.length === 0}
                onClick={addColor}
                className={cn(
                  "cursor-pointer rounded-b-lg bg-muted text-muted-foreground transition-colors duration-200 hover:bg-background hover:text-foreground",
                  colors.length === 0 && "rounded-t-lg",
                )}
              >
                <SettingsRowTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Color
                </SettingsRowTitle>
              </SettingsRow>
            )}
          </SettingsContent>
        </SettingsSection>
      </div>
    </div>
  );
}
