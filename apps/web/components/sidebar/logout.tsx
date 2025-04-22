"use client";

import { signOutAction } from "@/actions/logout";
import { useUser } from "@/stores/use-user";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import { DropdownMenuItem } from "@church-space/ui/dropdown-menu";
import { Logout } from "@church-space/ui/icons";
import Cookies from "js-cookie";

const handleLogout = async () => {
  // Clear cookies first
  Cookies.remove("planning_center_session");
  Cookies.remove("organizationId");

  // Clear user state
  useUser.setState({
    user: undefined,
    id: null,
    firstName: null,
    lastName: null,
    avatarUrl: null,
    email: null,
    organizationId: null,
  });

  // Sign out from Supabase last - this will redirect
  await signOutAction();
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
