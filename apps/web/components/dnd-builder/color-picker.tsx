"use client";
import { Input } from "@church-space/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import { useEffect, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import { z } from "zod";
import cookies from "js-cookie";
import { getBrandColors } from "@/actions/get-brand-colors";
import { useQuery } from "@tanstack/react-query";
import { Pipette } from "lucide-react";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";

// Define a Zod schema for hex color validation
const hexColorSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{6}$/,
    "Must be a valid 6-character hex color (0-9, a-f)",
  );

export default function ColorPicker({
  onChange,
  value,
  brandColorsDisabled = false,
  className,
}: {
  onChange: (color: string) => void;
  value: string;
  brandColorsDisabled?: boolean;
  className?: string;
}) {
  const [color, setColor] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [useNativeColorPicker, setUseNativeColorPicker] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const organizationId = cookies.get("organizationId");

  // Check browser compatibility for EyeDropper API
  useEffect(() => {
    // Check if browser is Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Check if browser is Firefox
    const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

    // Use native color picker for Safari, Firefox, or if EyeDropper is not available
    const shouldUseNativeColorPicker =
      isSafari || isFirefox || !("EyeDropper" in window);

    setUseNativeColorPicker(shouldUseNativeColorPicker);
  }, []);

  const { data: brandColors } = useQuery({
    queryKey: ["brandColors", organizationId],
    queryFn: () => {
      if (!organizationId) {
        // Return a promise that resolves to undefined or handle appropriately
        return Promise.resolve(undefined);
      }
      return getBrandColors({ organizationId });
    },
    // Ensure the query is only enabled when organizationId is available
    enabled: !!organizationId,
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!organizationId) {
    return null;
  }

  const parsedBrandColors = (
    brandColors?.data?.colors?.colors as
      | { color: string; title: string }[]
      | undefined
  )?.map((color) => ({
    color: color.color,
    title: color.title,
  }));

  // Function to strip the hash from a color string
  const stripHash = (colorStr: string) => colorStr.replace(/^#/, "");

  // Function to ensure the color has a hash
  const ensureHash = (colorStr: string) => {
    return colorStr.startsWith("#") ? colorStr : `#${colorStr}`;
  };

  // Function to pick color from screen using EyeDropper API
  const pickColorFromScreen = async () => {
    // Check if the EyeDropper API is available
    if (!("EyeDropper" in window)) {
      console.warn("EyeDropper API is not supported in this browser");
      return;
    }

    try {
      // @ts-expect-error - TypeScript might not have EyeDropper types yet
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const newColor = result.sRGBHex;
      setColor(newColor);
      onChange(newColor);
    } catch (error) {
      console.log("Color picking canceled or failed", error);
    }
  };

  // Function to validate hex color
  const validateHexColor = (hexColor: string): boolean => {
    const result = hexColorSchema.safeParse(hexColor);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return false;
    }
    setError(null);
    return true;
  };

  // Function to trigger the color picker input
  const triggerColorPicker = () => {
    if (useNativeColorPicker && colorInputRef.current) {
      colorInputRef.current.click();
    } else {
      pickColorFromScreen();
    }
  };

  return (
    <div className={cn("col-span-2 flex flex-col", className)}>
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger>
            <div
              className="h-9 w-9 rounded-l border border-r-0"
              style={{ backgroundColor: color }}
            />
          </PopoverTrigger>
          <PopoverContent className="border-none p-0">
            <SketchPicker
              color={color}
              onChange={(color) => {
                setColor(color.hex);
                onChange(color.hex);
              }}
              presetColors={[
                ...(brandColorsDisabled ? [] : (parsedBrandColors ?? [])),
              ]}
            />
          </PopoverContent>
        </Popover>
        <div className="relative w-full">
          <Input
            type="text"
            className={cn(
              "w-full rounded-none bg-background ps-5",
              error && !isTyping ? "border-red-500" : "",
            )}
            placeholder="ffffff"
            maxLength={7}
            value={stripHash(color)}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/^#/, "");
              const newColor = ensureHash(inputValue);
              setColor(newColor);

              // Mark as typing
              setIsTyping(true);

              // Clear any existing timer
              if (timerRef.current) {
                clearTimeout(timerRef.current);
              }

              // Set a new timer to validate after typing stops
              timerRef.current = setTimeout(() => {
                setIsTyping(false);

                // Validate the input
                const isValid = validateHexColor(inputValue);

                // Only update the parent component if validation passes
                if (isValid) {
                  onChange(newColor);
                }
              }, 800); // 800ms debounce
            }}
            onBlur={() => {
              // When input loses focus, clear typing state and validate
              if (isTyping) {
                setIsTyping(false);

                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                  timerRef.current = null;
                }

                const hexValue = stripHash(color);
                const isValid = validateHexColor(hexValue);

                if (isValid) {
                  onChange(color);
                }
              }
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2.5 text-sm text-muted-foreground peer-disabled:opacity-50">
            #
          </span>
        </div>
        {useNativeColorPicker ? (
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-l-none border-l-0"
              onClick={triggerColorPicker}
            >
              <Pipette className="h-4 w-4" />
            </Button>
            <Input
              ref={colorInputRef}
              type="color"
              className="absolute right-1.5 top-4 h-4 w-4 opacity-0"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                onChange(e.target.value);
              }}
            />
          </div>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="aspect-square rounded-l-none border-l-0"
            onClick={pickColorFromScreen}
          >
            <Pipette className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && !isTyping && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
