import Navbar from '@/app/ui/dashboard/navbar'
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen">
        <Navbar />
      <div className="p-6 md:p-10">{children}</div>
    </div>
  );
}