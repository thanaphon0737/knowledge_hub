import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import LogoutButton from "@/app/ui/logout-button";

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <>
      <h1>Welcome to the Private Page</h1>
      <p>Hello {data.user.email}</p>
      <LogoutButton />
    </>
  );
}
