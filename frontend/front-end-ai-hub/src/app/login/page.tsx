import { redirect } from "next/navigation";
import { login, signup } from './actions';
import { createClient } from "@/lib/supabase/server";
import { Button, Container, Typography, Box, TextField, Alert } from "@mui/material";
import { Brain, ArrowRight, Mail, Lock, UserPlus } from "lucide-react";
import Link from "next/link";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect('/dashboard');
  }

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
              <Link href="/register">
                <Button variant="outlined" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Sign Up
                </Button>
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
                Welcome back
              </Typography>
              <Typography variant="body1" color="text.secondary" className="max-w-sm mx-auto">
                Sign in to your account to continue managing your knowledge base
              </Typography>
            </div>

            {/* Login Form */}
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  formAction={login}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  type="submit"
                  formAction={signup}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Additional Links */}
            <div className="text-center space-y-4">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                ← Back to Home
              </Link>
              
              <div className="text-sm text-gray-600">
                <span>Don't have an account? </span>
                <Link href="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="mt-8 text-center">
            <Typography variant="body2" color="text.secondary" className="mb-4">
              Experience the power of AI-powered knowledge management
            </Typography>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI-Powered Search</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Team Collaboration</span>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
