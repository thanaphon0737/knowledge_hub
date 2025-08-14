"use client";
import Image from "next/image";
import Link from "next/link";
import { Button, Container, Typography, Card, CardContent, Avatar } from "@mui/material";
import { 
  Brain, 
  FileText, 
  Search, 
  MessageSquare, 
  Users, 
  Zap, 
  Globe, 
  ArrowRight,
  Star,
  Code
} from "lucide-react";
import DemoCard from "./components/DemoCard";
import AnimatedFeature from "./components/AnimatedFeature";

export default function Home() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Knowledge Management",
      description: "Intelligent document processing and semantic search capabilities"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Smart Document Processing",
      description: "Upload and process documents with automatic text extraction"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Advanced Search & Retrieval",
      description: "Find information quickly with semantic search across your documents"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Interactive Chat Interface",
      description: "Ask questions and get instant answers from your knowledge base"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Share knowledge and collaborate with your team members"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Performance",
      description: "Optimized for speed with vector-based search technology"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechCorp",
      avatar: "/api/placeholder/40/40",
      content: "AI Knowledge Hub has transformed how our team manages and accesses information. The search is incredibly fast and accurate.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Research Lead",
      company: "DataFlow Inc",
      avatar: "/api/placeholder/40/40",
      content: "The AI-powered document processing saves us hours every week. It's like having a personal research assistant.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Content Strategist",
      company: "Creative Solutions",
      avatar: "/api/placeholder/40/40",
      content: "Finally, a tool that makes sense of our vast document library. The chat interface is intuitive and powerful.",
      rating: 5
    }
  ];

  const integrations = [
    { name: "Google Drive", icon: "📁" },
    { name: "Dropbox", icon: "📦" },
    { name: "OneDrive", icon: "☁️" },
    { name: "Slack", icon: "💬" },
    { name: "Notion", icon: "📝" },
    { name: "Confluence", icon: "📚" },
    { name: "GitHub", icon: "🐙" },
    { name: "Figma", icon: "🎨" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <Container maxWidth="xl">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Knowledge Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outlined" className="hidden sm:block">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="contained" className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <Container maxWidth="xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Knowledge Management
              <span className="text-blue-600"> Powered by AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your documents into an intelligent knowledge base. Ask questions, get instant answers, and unlock insights from your data with AI-powered search and chat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="relative flex gap-3">
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="w-80 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button 
                  variant="contained" 
                  className=" bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
            
            {/* Demo Card */}
            <DemoCard />
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <Container maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for intelligent knowledge management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From document processing to AI-powered search, we've got you covered with enterprise-grade features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedFeature
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4">
        <Container maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes with our simple three-step process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
              <p className="text-gray-600">Upload your PDFs, Word docs, and other files. Our AI processes them automatically.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-gray-600">Our AI extracts text, creates embeddings, and builds a searchable knowledge base.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ask & Get Answers</h3>
              <p className="text-gray-600">Ask questions in natural language and get instant, accurate answers from your documents.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Integrations Section */}
      <section className="py-20 px-4 bg-gray-50">
        <Container maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Connect your favorite tools
            </h2>
            <p className="text-xl text-gray-600">
              Integrate with the tools you already use and love
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{integration.icon}</div>
                <p className="text-sm font-medium text-gray-700">{integration.name}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outlined" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Explore All Integrations
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <Container maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about AI Knowledge Hub
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Typography variant="body1" className="mb-4 italic">
                    "{testimonial.content}"
                  </Typography>
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10 mr-3">
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Typography variant="subtitle2" className="font-semibold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role} at {testimonial.company}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <Container maxWidth="xl">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your knowledge management?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of teams using AI Knowledge Hub to unlock insights from their documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button 
                  variant="contained" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outlined" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <Container maxWidth="xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">AI Knowledge Hub</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transform your documents into an intelligent knowledge base with AI-powered search and chat.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <Code className="w-5 h-5" />
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Support</Link></li>
                <li><Link href="#" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
                <li><Link href="#" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Knowledge Hub. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
