"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Apple, User, Search, Clock, Users } from "lucide-react"

// TypeScript interface for recipe data structure
interface Recipe {
  id: string
  title: string
  image: string
  calories: number
  protein: number
  cookTime: number
  servings: number
  dietLabels: string[]
  description: string
}

// Mock recipe data - in a real app, this would come from an API or database
const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Grilled Chicken Salad",
    image: "/placeholder.svg?height=200&width=300",
    calories: 320,
    protein: 35,
    cookTime: 15,
    servings: 2,
    dietLabels: ["High Protein", "Low Carb", "Gluten Free"],
    description: "Fresh mixed greens with perfectly grilled chicken breast",
  },
  {
    id: "2",
    title: "Vegan Buddha Bowl",
    image: "/placeholder.svg?height=200&width=300",
    calories: 450,
    protein: 18,
    cookTime: 25,
    servings: 1,
    dietLabels: ["Vegan", "High Fiber", "Plant Based"],
    description: "Colorful bowl packed with quinoa, roasted vegetables, and tahini dressing",
  },
  {
    id: "3",
    title: "Salmon with Quinoa",
    image: "/placeholder.svg?height=200&width=300",
    calories: 520,
    protein: 42,
    cookTime: 30,
    servings: 2,
    dietLabels: ["High Protein", "Omega-3", "Gluten Free"],
    description: "Pan-seared salmon served over fluffy quinoa with steamed broccoli",
  },
  {
    id: "4",
    title: "Mediterranean Wrap",
    image: "/placeholder.svg?height=200&width=300",
    calories: 380,
    protein: 22,
    cookTime: 10,
    servings: 1,
    dietLabels: ["Mediterranean", "Vegetarian"],
    description: "Whole wheat wrap filled with hummus, feta, olives, and fresh vegetables",
  },
  {
    id: "5",
    title: "Protein Smoothie Bowl",
    image: "/placeholder.svg?height=200&width=300",
    calories: 290,
    protein: 25,
    cookTime: 5,
    servings: 1,
    dietLabels: ["High Protein", "Vegetarian", "Quick"],
    description: "Thick smoothie bowl topped with fresh berries, nuts, and seeds",
  },
  {
    id: "6",
    title: "Lentil Curry",
    image: "/placeholder.svg?height=200&width=300",
    calories: 340,
    protein: 16,
    cookTime: 35,
    servings: 4,
    dietLabels: ["Vegan", "High Fiber", "Spicy"],
    description: "Hearty red lentil curry with coconut milk and aromatic spices",
  },
]

// Available diet filter options - used for filtering recipes
const dietFilters = [
  "All",
  "Vegan",
  "Vegetarian",
  "High Protein",
  "Low Carb",
  "Gluten Free",
  "Mediterranean",
  "Quick",
  "High Fiber",
]

export default function RecipesPage() {
  // State management for user authentication and recipe filtering
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes) // All available recipes
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(mockRecipes) // Filtered results
  const [selectedFilter, setSelectedFilter] = useState("All") // Currently selected diet filter
  const [searchQuery, setSearchQuery] = useState("") // Search input value
  const [isClient, setIsClient] = useState(false) // Track client-side hydration
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

  // Effect to handle filtering logic whenever filters or search query changes
  useEffect(() => {
    let filtered = recipes

    // Apply diet filter - show all recipes if "All" is selected
    if (selectedFilter !== "All") {
      filtered = filtered.filter((recipe) => recipe.dietLabels.includes(selectedFilter))
    }

    // Apply search filter - search in title, description, and diet labels
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.dietLabels.some((label) => label.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredRecipes(filtered)
  }, [selectedFilter, searchQuery, recipes])

  // Handle user logout
  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem("user")
      localStorage.removeItem("foodItems")
    }
    router.push("/")
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
            <Link href="/recipes" className="text-green-600 font-medium">
              Recipes
            </Link>
            <Link href="/ai-recipe" className="text-gray-600 hover:text-gray-900">
              AI Recipe
            </Link>
            <Link href="/photo-analyzer" className="text-gray-600 hover:text-gray-900">
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
        {/* Page header with search and filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Recipe Collection</h1>

          {/* Search bar with icon */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          {/* Diet filter buttons - horizontal scrollable on mobile */}
          <div className="flex flex-wrap gap-2">
            {dietFilters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className="rounded-full"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count display */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""}
            {selectedFilter !== "All" && ` for "${selectedFilter}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Recipe grid - responsive layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Recipe image with calorie overlay */}
              <div className="relative">
                <Image
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-gray-900">{recipe.calories} kcal</Badge>
                </div>
              </div>

              {/* Recipe information */}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{recipe.title}</CardTitle>
                <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Recipe metadata - cook time, servings, protein */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="font-medium text-blue-600">{recipe.protein}g protein</div>
                </div>

                {/* Diet labels - show first 3 with overflow indicator */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.dietLabels.slice(0, 3).map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                  {recipe.dietLabels.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.dietLabels.length - 3}
                    </Badge>
                  )}
                </div>

                {/* View recipe button - placeholder for future recipe detail page */}
                <Button className="w-full" size="sm">
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state when no recipes match filters */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms to find more recipes.</p>
          </div>
        )}
      </div>
    </div>
  )
}
