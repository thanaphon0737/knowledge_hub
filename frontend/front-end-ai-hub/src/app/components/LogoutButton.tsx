"use client"
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // หลังจาก logout ให้ redirect ไปหน้า login
    router.push("/login");
    
    // และ refresh เพื่อให้แน่ใจว่า server state ถูกล้างค่าทั้งหมด
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
      Logout
    </button>
  );
}