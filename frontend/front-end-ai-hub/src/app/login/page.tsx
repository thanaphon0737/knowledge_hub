import { redirect} from "next/navigation";
import LoginForm from "../ui/login-form";
import { login, signup } from './actions'
import { createClient } from "@/lib/supabase/server";
export default async function LoginPage() {
  const supabase = await createClient();
  const { data: {user} } = await supabase.auth.getUser();
  if(user){
    redirect('/private');
  }

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="">
        {/* <LoginForm />
         */}
        <form>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" required />
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" required />
          <button className="border cursor-pointer" formAction={login}>Log in</button>
          <button className="border cursor-pointer" formAction={signup}>Sign up</button>
        </form>
      </div>
    </main>
  );
}
