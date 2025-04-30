"use client";

import { useTheme } from "next-themes";
import { Computer, Moon, Sun } from "@church-space/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { useEffect, useState } from "react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Select>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            {theme === "light" ? (
              <Sun />
            ) : theme === "dark" ? (
              <Moon />
            ) : (
              <Computer />
            )}
            {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun />
            Light
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon />
            Dark
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <Computer />
            System
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
