import Navbar from '@/app/ui/dashboard/navbar'
import { createClient} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }


  return (
    <div className="h-screen">
        <Navbar user={user} />
      <div className="p-6 md:p-10">{children}</div>
    </div>
  );
}