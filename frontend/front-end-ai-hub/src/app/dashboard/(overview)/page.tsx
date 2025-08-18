

import { redirect } from "next/navigation";
import DocumentCard from "@/app/ui/dashboard/document-card";
import { createClient } from "@/lib/supabase/server";
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  

  return (
    
    <main className="">
      <DocumentCard/>
    </main>
  );
}
