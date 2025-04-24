import { Input } from "@church-space/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import { useEffect, useRef, useState } from "react";
import { SketchPicker } from "react-color";
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
                { color: "#f00", title: "red" },
                { color: "#0f0", title: "green" },
                { color: "#00f", title: "blue" },
              ]}
            />
          </PopoverContent>
        </Popover>
        <div className="relative w-full">
          <Input
            type="text"
            className={`w-full rounded-l-none bg-background ps-5 ${error && !isTyping ? "border-red-500" : ""}`}
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
      </div>
      {error && !isTyping && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
