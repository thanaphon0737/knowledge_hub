import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import LogoutButton from "@/app/ui/logout-button";
import Link from "next/link";

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Welcome to the Private Page</h1>
      <p>Hello {data.user.email}</p>
      <Link href="/dashboard" className="text-blue-500">Dashboard</Link>
      <LogoutButton />
    </div>
  );
}
