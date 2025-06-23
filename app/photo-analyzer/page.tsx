"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Apple, User, Camera, Upload, Loader2, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"

// Interface for analyzed nutrition data from photo
interface NutritionAnalysis {
  foodItems: Array<{
    name: string
    estimatedAmount: string
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }>
  totalNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
  confidence: string
  notes: string[]
}

export default function PhotoAnalyzerPage() {
  // State management for user authentication and photo analysis
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null) // User's uploaded image
  const [imagePreview, setImagePreview] = useState<string | null>(null) // Preview URL for the image
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysis | null>(null) // AI analysis result
  const [isAnalyzing, setIsAnalyzing] = useState(false) // Loading state during analysis
  const [error, setError] = useState("") // Error handling
  const [isClient, setIsClient] = useState(false) // Track client-side hydration
  const fileInputRef = useRef<HTMLInputElement>(null) // Reference to file input element
  const router = useRouter()

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Authentication check on component mount - only run on client
  useEffect(() => {
    if (!isClient) return

    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router, isClient])

  // Handle user logout
  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem("user")
      localStorage.removeItem("foodItems")
    }
    router.push("/")
  }

  // Handle file selection from input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type - only allow images
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.")
        return
      }

      // Validate file size - limit to 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError("Image file is too large. Please select an image under 10MB.")
        return
      }

      setSelectedImage(file)
      setError("")

      // Create preview URL for the selected image
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Convert image file to base64 for AI analysis
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Main function to analyze the uploaded photo using AI
  const handleAnalyzePhoto = async () => {
    if (!selectedImage) {
      setError("Please select an image first.")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      // Convert image to base64 for AI processing
      const base64Image = await convertImageToBase64(selectedImage)

      // Create a detailed prompt for nutrition analysis
      const prompt = `Analyze this food image and provide detailed nutritional information. Look at the plate/meal and identify all visible food items.

    Please provide a complete analysis in JSON format with the following structure:
    {
      "foodItems": [
        {
          "name": "food item name",
          "estimatedAmount": "estimated serving size (e.g., 150g, 1 cup, 1 piece)",
          "calories": estimated_calories_number,
          "protein": estimated_protein_grams,
          "carbs": estimated_carbs_grams,
          "fat": estimated_fat_grams,
          "sugar": estimated_sugar_grams
        }
      ],
      "totalNutrition": {
        "calories": total_calories,
        "protein": total_protein,
        "carbs": total_carbs,
        "fat": total_fat,
        "sugar": total_sugar
      },
      "confidence": "high/medium/low - your confidence in the analysis",
      "notes": ["any important notes about the analysis", "assumptions made", "recommendations"]
    }

    Be as accurate as possible with portion size estimates and nutritional values. If you're unsure about something, mention it in the notes.`

      // Call our secure API route with Google AI Studio (supports vision)
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image", image: base64Image },
              ],
            },
          ],
          system:
            "You are a professional nutritionist with expertise in food analysis and portion estimation. Provide accurate nutritional information based on visual analysis of food images.",
          provider: "google", // Use Google AI Studio for vision tasks
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      const text = data.text

      // Parse the AI response as JSON
      try {
        const analysis = JSON.parse(text) as NutritionAnalysis
        setAnalysisResult(analysis)
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]) as NutritionAnalysis
          setAnalysisResult(analysis)
        } else {
          throw new Error("Could not parse analysis from AI response")
        }
      }
    } catch (error) {
      console.error("Error analyzing photo:", error)
      setError("Failed to analyze the photo. Please try again with a clearer image of your food.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Add analyzed nutrition data to the user's daily tracker
  const handleAddToTracker = () => {
    if (!analysisResult || !isClient) return

    // Get existing food items from localStorage
    const existingFoods = JSON.parse(localStorage.getItem("foodItems") || "[]")

    // Convert each analyzed food item to the tracker format
    const newFoodItems = analysisResult.foodItems.map((item) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      sugar: item.sugar,
      serving: item.estimatedAmount,
    }))

    // Add new items to existing foods and save
    const updatedFoods = [...existingFoods, ...newFoodItems]
    localStorage.setItem("foodItems", JSON.stringify(updatedFoods))

    // Redirect to tracker page to see the added items
    router.push("/tracker")
  }

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NutriTrack...</p>
        </div>
      </div>
    )
  }

  // Don't render if user is not authenticated
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header navigation - consistent with other pages */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Apple className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">NutriTrack</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/tracker" className="text-gray-600 hover:text-gray-900">
              Tracker
            </Link>
            <Link href="/recipes" className="text-gray-600 hover:text-gray-900">
              Recipes
            </Link>
            <Link href="/ai-recipe" className="text-gray-600 hover:text-gray-900">
              AI Recipe
            </Link>
            <Link href="/photo-analyzer" className="text-green-600 font-medium">
              Photo Analyzer
            </Link>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">{user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page header with camera branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Camera className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Photo Nutrition Analyzer</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Take a photo of your meal and I'll analyze the nutritional content for you!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Photo upload section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Your Meal Photo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File input (hidden) and upload button */}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                {/* Upload area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    // Show image preview if image is selected
                    <div className="space-y-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Selected meal"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-gray-600">Click to select a different image</p>
                    </div>
                  ) : (
                    // Show upload prompt if no image selected
                    <div className="space-y-4">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Upload a photo of your meal</p>
                        <p className="text-sm text-gray-500">Click here to select an image from your device</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Analyze button */}
                <Button onClick={handleAnalyzePhoto} className="w-full" disabled={!selectedImage || isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Photo...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Analyze Nutrition
                    </>
                  )}
                </Button>

                {/* Tips for better results */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Tips for better results:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Take photos in good lighting</li>
                    <li>• Show the entire plate/meal clearly</li>
                    <li>• Avoid shadows or reflections</li>
                    <li>• Include common objects for size reference</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Analysis results section */}
            <div className="space-y-6">
              {!analysisResult && !isAnalyzing && (
                // Placeholder when no analysis is done yet
                <Card>
                  <CardContent className="py-12 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your nutrition analysis will appear here</p>
                  </CardContent>
                </Card>
              )}

              {isAnalyzing && (
                // Loading state during analysis
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Analyzing your meal...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </CardContent>
                </Card>
              )}

              {analysisResult && (
                // Display analysis results
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Nutrition Analysis</CardTitle>
                      <Badge
                        variant={
                          analysisResult.confidence === "high"
                            ? "default"
                            : analysisResult.confidence === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {analysisResult.confidence} confidence
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Total nutrition summary */}
                    <div>
                      <h3 className="font-semibold mb-3">Total Nutrition</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="text-red-800 font-medium">Calories</div>
                          <div className="text-2xl font-bold text-red-900">
                            {analysisResult.totalNutrition.calories}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-blue-800 font-medium">Protein</div>
                          <div className="text-xl font-bold text-blue-900">
                            {analysisResult.totalNutrition.protein}g
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-green-800 font-medium">Carbs</div>
                          <div className="text-xl font-bold text-green-900">{analysisResult.totalNutrition.carbs}g</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="text-yellow-800 font-medium">Fat</div>
                          <div className="text-xl font-bold text-yellow-900">{analysisResult.totalNutrition.fat}g</div>
                        </div>
                      </div>
                    </div>

                    {/* Individual food items */}
                    <div>
                      <h3 className="font-semibold mb-3">Detected Food Items</h3>
                      <div className="space-y-3">
                        {analysisResult.foodItems.map((item, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{item.name}</h4>
                              <Badge variant="outline">{item.estimatedAmount}</Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                              <div>{item.calories} kcal</div>
                              <div>{item.protein}g protein</div>
                              <div>{item.carbs}g carbs</div>
                              <div>{item.fat}g fat</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Analysis notes */}
                    {analysisResult.notes.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Analysis Notes</h3>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {analysisResult.notes.map((note, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Add to tracker button */}
                    <Button onClick={handleAddToTracker} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Daily Tracker
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
