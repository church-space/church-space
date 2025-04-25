"use client";
import React, { useState } from "react";
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
import { useQuery } from "@tanstack/react-query";

export default function ClientPage({
  organizationId,
}: {
  organizationId: string;
}) {
  const data = useQuery({
    queryKey: ["brand-colors", organizationId],
    queryFn: () => getBrandColors({ organizationId }),
  });

  const [colors, setColors] = useState<string[]>(["#000000"]); // Initial color

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
    // Prevent removing the last color? Or ensure at least one always exists.
    // For now, allow removing until one is left.
    const updatedColors = colors.filter((_, i) => i !== index);
    setColors(updatedColors);
  };

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

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeColor(index)}
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove Color ${index + 1}`}
            >
              <X className="h-4 w-4" />
            </Button>
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
