"use client";

import { Computer, Moon, Sun } from "@church-space/ui/icons";
import LogoutButton from "./logout";

import { useUser } from "@/stores/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import { Button } from "@church-space/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { useTheme } from "next-themes";

export function NavUser() {
  const { firstName, lastName, avatarUrl } = useUser();
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-1" variant="ghost">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={avatarUrl || ""}
              alt={`${firstName} ${lastName}`}
            />
            <AvatarFallback className="border">
              {firstName?.charAt(0) || ""}
              {lastName?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-52 translate-x-2 rounded-lg"
        side="top"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              if (theme === "light") setTheme("dark");
              else if (theme === "dark") setTheme("system");
              else setTheme("light");
            }}
            className="justify-between"
          >
            <div className="flex items-center gap-2">
              {theme === "light" ? (
                <Sun />
              ) : theme === "dark" ? (
                <Moon />
              ) : (
                <Computer />
              )}
              Toggle Theme
            </div>
            <span className="text-xs text-muted-foreground">
              {theme === "light"
                ? "Light"
                : theme === "dark"
                  ? "Dark"
                  : "System"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
