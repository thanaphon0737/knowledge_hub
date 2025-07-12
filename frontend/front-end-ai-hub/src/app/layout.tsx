
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { getCurrentUser } from "@/lib/session";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';


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
        <AppRouterCacheProvider>

        <AuthProvider initialUser={initialUser}>

        {children}
        </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
