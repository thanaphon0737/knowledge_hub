"use client";
// import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
export default function LogoutButton() {
  // const {logout, isAuthenticated} = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let { error } = await supabase.auth.signOut();

      router.push("/login");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to logout", error);
    }
  };

    

  return (
    <Button variant="outlined" onClick={handleLogout}>
      Logout
    </Button>
  );
}
