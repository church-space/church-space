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
import { cn } from "@church-space/ui/cn";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Select>
        <SelectTrigger className="w-full bg-background md:w-[180px]">
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
      <SelectTrigger className="w-full bg-background md:w-[180px]">
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

export function ThemeSelectorToggles() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid w-full grid-cols-3 items-center gap-2 rounded-md border bg-card p-2 shadow-sm">
      <div
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-transparent py-2 text-base transition-all duration-300 hover:bg-muted",
          theme === "light" && "border-border bg-muted",
        )}
        onClick={() => setTheme("light")}
      >
        <Sun height={"24"} width={"24"} />
        Light
      </div>
      <div
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-transparent py-2 text-base transition-all duration-300 hover:bg-muted",
          theme === "dark" && "border-border bg-muted",
        )}
        onClick={() => setTheme("dark")}
      >
        <Moon height={"24"} width={"24"} />
        Dark
      </div>
      <div
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-transparent py-2 text-base transition-all duration-300 hover:bg-muted",
          theme === "system" && "border-border bg-muted",
        )}
        onClick={() => setTheme("system")}
      >
        <Computer height={"24"} width={"24"} />
        System
      </div>
    </div>
  );
}
