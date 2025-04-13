import { Input } from "@church-space/ui/input";
import React, { useState, useRef, useEffect } from "react";
import { z } from "zod";

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
}: {
  onChange: (color: string) => void;
  value: string;
}) {
  const [color, setColor] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to strip the hash from a color string
  const stripHash = (colorStr: string) => colorStr.replace(/^#/, "");

  // Function to ensure the color has a hash
  const ensureHash = (colorStr: string) => {
    return colorStr.startsWith("#") ? colorStr : `#${colorStr}`;
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="col-span-2 flex flex-col">
      <div className="flex items-center">
        <Input
          type="color"
          className="h-9 w-[42px] rounded-r-none border-r-0 bg-background px-1 py-0.5"
          value={color}
          onChange={(e) => {
            const newColor = e.target.value;
            setColor(newColor);
            onChange(newColor);
            // Color picker input always provides valid hex, so clear any errors
            setError(null);
          }}
          maxLength={6}
        />
        <div className="relative">
          <Input
            type="text"
            className={`w-full rounded-l-none bg-background ps-5 ${error && !isTyping ? "border-red-500" : ""}`}
            placeholder="ffffff"
            maxLength={6}
            value={stripHash(color)}
            onChange={(e) => {
              const inputValue = e.target.value;
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
      </div>
      {error && !isTyping && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
