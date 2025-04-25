"use client";
import React, { useState, useEffect } from "react";
import ColorPicker from "@/components/dnd-builder/color-picker";
import {
  SettingsRow,
  SettingsRowAction,
  SettingsRowTitle,
} from "@/components/settings/settings-settings";
import { Plus, X } from "lucide-react";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import { upsertBrandColorsAction } from "@/actions/upsert-brand-colors";
import { useDebounce } from "@/hooks/use-debounce";
import { getBrandColors } from "@/actions/get-brand-colors";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@church-space/ui/use-toast";

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
  const debouncedColors = useDebounce(colors, 500); // Debounce for 500ms

  const { toast } = useToast();

  const { mutate: saveColors } = useMutation({
    mutationFn: upsertBrandColorsAction,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brand colors saved successfully!",
        variant: "default",
      });
      // Optionally refetch or update query data here if needed
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save brand colors: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Initialize colors from fetched data
  useEffect(() => {
    let initialColors: string[] = ["#000000"]; // Default color
    if (initialData?.data?.colors) {
      // Assuming initialData.data.colors is stored as a JSON array of strings
      try {
        const parsedColors = initialData.data.colors;
        if (
          Array.isArray(parsedColors) &&
          parsedColors.every((c) => typeof c === "string") &&
          parsedColors.length > 0
        ) {
          initialColors = parsedColors;
        }
      } catch (error) {
        console.error("Failed to parse initial brand colors:", error);
        // Keep the default color if parsing fails
      }
    } else if (isLoading) {
      // If loading, do nothing yet, wait for data or loading to finish
      return;
    }

    setColors(initialColors);
    setIsInitialized(true); // Mark as initialized

    // initialData is stable, no need to include in dependency array if using isInitialized flag
  }, [initialData, isLoading]);

  // Save colors when debounced state changes *after* initialization
  useEffect(() => {
    if (isInitialized) {
      // Map the colors array to the expected format { color: string, title: string }[]
      const colorsToSave = debouncedColors.map((color, index) => ({
        color,
        title: `Color ${index + 1}`, // Assign a default title
      }));

      saveColors({
        organizationId,
        colors: colorsToSave,
      });
    }
    // Only trigger save when debouncedColors changes, after initialization
  }, [debouncedColors, saveColors, organizationId, isInitialized]);

  const handleColorChange = (index: number, newColor: string) => {
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    setColors(updatedColors);
  };

  const addColor = () => {
    if (colors.length < 8) {
      // Add a default color, maybe white? Or the last color? Let's use white for now.
      setColors([...colors, "#FFFFFF"]);
    }
  };

  const removeColor = (index: number) => {
    // Prevent removing the last color
    if (colors.length <= 1) {
      toast({
        title: "Info",
        description: "You must have at least one brand color.",
      });
      return;
    }
    const updatedColors = colors.filter((_, i) => i !== index);
    setColors(updatedColors);
  };

  // Show loading state or placeholder?
  if (isLoading) {
    return <div>Loading brand colors...</div>; // Replace with a proper loader/skeleton
  }

  return (
    <>
      {colors.map((color, index) => (
        <SettingsRow key={index} isFirstRow={index === 0}>
          <SettingsRowTitle>Color {index + 1}</SettingsRowTitle>
          <SettingsRowAction className="flex w-full flex-row items-center justify-start gap-1 md:justify-end">
            <ColorPicker
              onChange={(newColor) => handleColorChange(index, newColor)}
              value={color}
              brandColorsDisabled={true}
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
    </>
  );
}
