
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { getCurrentUser } from "@/lib/session";



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getCurrentUser();
  return (
    <html lang="en">
      <body
        
      >
        <AuthProvider initialUser={initialUser}>

        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
