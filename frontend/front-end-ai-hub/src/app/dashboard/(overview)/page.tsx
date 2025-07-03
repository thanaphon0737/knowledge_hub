
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/ui/logout-button";
import DocumentCard from "@/app/ui/dashboard/document-card";
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  

  return (
    
    <main className="">
      <DocumentCard/>
    </main>
  );
}
