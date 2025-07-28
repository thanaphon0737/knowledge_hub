import RegisterForm from "../ui/register-form";

// Force dynamic rendering to avoid static generation issues with AuthContext
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
        <div className="">
            <RegisterForm />
        </div>
    </main>
  )
}
