import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import LogoutButton from "../ui/logout-button";
export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="">
      <div className="flex flex-col">
        Dashboard
        <div className="flex flex-col">
          <div>{user.userId}</div>
          <div>{user.email}</div>
          <LogoutButton/>
        </div>
      </div>
    </main>
  );
}
