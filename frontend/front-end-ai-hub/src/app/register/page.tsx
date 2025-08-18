import RegisterForm from "../ui/register-form";
import { Container, Typography } from "@mui/material";
import { Brain } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to avoid static generation issues with AuthContext
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <Container maxWidth="xl">
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Brain className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Knowledge Hub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <Container maxWidth="sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <Typography variant="h4" className="font-bold text-gray-900 mb-2">
                Create your account
              </Typography>
              <Typography variant="body1" color="text.secondary" className="max-w-sm mx-auto">
                Join thousands of teams using AI Knowledge Hub to unlock insights from their documents
              </Typography>
            </div>

            {/* Register Form */}
            <RegisterForm />

            {/* Additional Links */}
            <div className="text-center mt-6 space-y-4">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                ← Back to Home
              </Link>
              
              <div className="text-sm text-gray-600">
                <span>Already have an account? </span>
                <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="mt-8 text-center">
            <Typography variant="body2" color="text.secondary" className="mb-4">
              Start your journey with AI-powered knowledge management
            </Typography>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free Trial</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Instant Setup</span>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
