"use client";

import { useUser } from "@/stores/use-user";
import { createClient } from "@church-space/supabase/client";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import { DropdownMenuItem } from "@church-space/ui/dropdown-menu";
import { Logout } from "@church-space/ui/icons";
import { toast } from "@church-space/ui/use-toast";
import Cookies from "js-cookie";

const handleLogout = async () => {
  const supabase = createClient();
  try {
    useUser.setState({
      user: undefined,
      id: null,
      firstName: null,
      lastName: null,
      avatarUrl: null,
      email: null,
      organizationId: null,
    });

    // Clear cookies
    Cookies.remove("planning_center_session");
    Cookies.remove("organizationId");

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      throw error;
    }

    // Redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Error logging out:", error);
    toast({
      title: "Error",
      description: "Failed to log out. Please try again.",
      variant: "destructive",
    });
  }
};

export default function LogoutButton() {
  return (
    <DropdownMenuItem onClick={handleLogout}>
      <Logout />
      Log out
    </DropdownMenuItem>
  );
}

export function MarketingLogoutButton({
  showIcon = true,
}: {
  showIcon?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-fit",
        showIcon &&
          "w-full -translate-x-1 justify-start gap-2 px-1.5 text-left text-lg font-semibold",
      )}
      onClick={handleLogout}
    >
      {showIcon && <Logout />}
      Log out
    </Button>
  );
}
