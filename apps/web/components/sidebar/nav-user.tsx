"use client";

import {
  ChevronUpDown,
  Computer,
  Moon,
  Settings,
  Sun,
} from "@church-space/ui/icons";
import LogoutButton from "./logout";

import { useUser } from "@/stores/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@church-space/ui/sidebar";
import { useTheme } from "next-themes";
import Link from "next/link";

export function NavUser() {
  const { firstName, lastName, email, avatarUrl } = useUser();
  const { theme, setTheme } = useTheme();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || ""} alt={email || ""} />
                <AvatarFallback>
                  {firstName?.charAt(0) || ""}
                  {lastName?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {firstName} {lastName}
                </span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronUpDown />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
              </Link>
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
