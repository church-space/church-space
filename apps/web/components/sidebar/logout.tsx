import { useUser } from "@/stores/use-user";
import { createClient } from "@church-space/supabase/client";
import { DropdownMenuItem } from "@church-space/ui/dropdown-menu";
import { Logout } from "@church-space/ui/icons";
import { toast } from "@church-space/ui/use-toast";
import Cookies from "js-cookie";

export default function LogoutButton() {
  const supabase = createClient();

  const handleLogout = async () => {
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

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <Logout />
      Log out
    </DropdownMenuItem>
  );
}
