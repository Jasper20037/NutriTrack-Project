"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Apple, Utensils, TrendingUp, Sparkles, Camera } from "lucide-react"

export default function LandingPage() {
  // State management for form inputs - keeping track of user input
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()

  // Handle login form submission - simple mock authentication for now
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation - just check if fields are filled
    if (email && password) {
      // Store user data in localStorage for persistence across sessions
      localStorage.setItem("user", JSON.stringify({ email, name: name || "User" }))
      // Redirect to tracker page after successful login
      router.push("/tracker")
    }
  }

  // Handle signup form submission - similar to login but requires name
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // All fields required for signup
    if (email && password && name) {
      // Store user data and redirect
      localStorage.setItem("user", JSON.stringify({ email, name }))
      router.push("/tracker")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Main navigation header - consistent across all pages */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo section with app branding */}
          <div className="flex items-center space-x-2">
            <Apple className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">NutriTrack</span>
          </div>
          {/* Navigation links - hidden on mobile, shown on desktop */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">
              About
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Two-column layout: content on left, auth form on right */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero content section */}
          <div className="space-y-8">
            <div className="space-y-4">
              {/* Main headline - grabbing attention */}
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Track Your Nutrition Journey
              </h1>
              {/* Subheading explaining the value proposition */}
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover healthy recipes, track your calories, and achieve your fitness goals with our comprehensive
                nutrition platform powered by AI.
              </p>
            </div>

            {/* Feature highlights - showing key benefits */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Utensils className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">AI Recipe Generator</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Camera className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Photo Analysis</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Smart Tracking</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Sparkles className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Personalized Plans</span>
              </div>
            </div>

            {/* Authentication forms - login and signup tabs */}
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Sign in to your account or create a new one</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Tab system for switching between login and signup */}
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Login form tab */}
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Signup form tab - includes name field */}
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Hero image section - visual appeal */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <Image
                src="/images/healthy-vegetables.png"
                alt="Fresh healthy vegetables and fruits - colorful sliced produce including orange, avocado, cucumber, tomato, onion, and bell pepper arranged beautifully for nutrition tracking"
                width={600}
                height={600}
                className="rounded-lg w-full h-auto"
                priority
              />
              <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-3 shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
            {/* Floating feature cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Camera className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI Photo Analysis</p>
                  <p className="text-xs text-gray-600">Scan your meals instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <section id="features" className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Healthy Living</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform combines AI technology with nutrition science to help you achieve your health
              goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Track calories, macros, and nutrients with our intelligent food database and progress visualization.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Photo Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Simply take a photo of your meal and our AI will analyze the nutritional content automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Recipe Generator</h3>
                <p className="text-gray-600 text-sm">
                  Get personalized healthy recipes based on your available ingredients and dietary preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Recipe Library</h3>
                <p className="text-gray-600 text-sm">
                  Browse thousands of healthy recipes with detailed nutritional information and filtering options.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
