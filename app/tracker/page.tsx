"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Apple, User, ChefHat, Trash2, Camera, Edit3, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { foodItemSchema } from "@/lib/validations/auth"
import { z } from "zod"

interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  serving: string
  logged_at: string
}

interface DailyGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function TrackerPage() {
  // State management
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [isAddingFood, setIsAddingFood] = useState(false)
  const [isEditingFood, setIsEditingFood] = useState(false)
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [newFood, setNewFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    sugar: "",
    serving: "",
  })
  const [editFood, setEditFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    sugar: "",
    serving: "",
  })

  const router = useRouter()
  const supabase = createClient()

  const dailyGoals: DailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  }

  // Load user and food data
  useEffect(() => {
    loadUserData()
    loadFoodItems()
  }, [])

  const loadUserData = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/")
        return
      }

      setUser(user)

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error loading profile:", profileError)
      } else {
        setProfile(profileData)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      router.push("/")
    }
  }

  const loadFoodItems = async () => {
    try {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("food_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("logged_at", today)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setFoodItems(data || [])
    } catch (error) {
      console.error("Error loading food items:", error)
      setError("Failed to load food items. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate input
      const validatedData = foodItemSchema.parse({
        name: newFood.name,
        serving: newFood.serving,
        calories: Number(newFood.calories),
        protein: Number(newFood.protein),
        carbs: Number(newFood.carbs),
        fat: Number(newFood.fat),
        sugar: Number(newFood.sugar),
      })

      const { data, error } = await supabase
        .from("food_items")
        .insert([
          {
            user_id: user.id,
            ...validatedData,
            logged_at: new Date().toISOString().split("T")[0],
          },
        ])
        .select()

      if (error) {
        throw error
      }

      // Add to local state
      if (data && data[0]) {
        setFoodItems([data[0], ...foodItems])
      }

      // Reset form
      setNewFood({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        sugar: "",
        serving: "",
      })
      setIsAddingFood(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to add food item. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditFood = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFood) return

    setIsSubmitting(true)
    setError("")

    try {
      // Validate input
      const validatedData = foodItemSchema.parse({
        name: editFood.name,
        serving: editFood.serving,
        calories: Number(editFood.calories),
        protein: Number(editFood.protein),
        carbs: Number(editFood.carbs),
        fat: Number(editFood.fat),
        sugar: Number(editFood.sugar),
      })

      const { data, error } = await supabase
        .from("food_items")
        .update(validatedData)
        .eq("id", editingFood.id)
        .eq("user_id", user.id)
        .select()

      if (error) {
        throw error
      }

      // Update local state
      if (data && data[0]) {
        setFoodItems(foodItems.map((item) => (item.id === editingFood.id ? data[0] : item)))
      }

      // Reset form
      setEditingFood(null)
      setIsEditingFood(false)
      setEditFood({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        sugar: "",
        serving: "",
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to update food item. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFood = async (id: string) => {
    try {
      const { error } = await supabase.from("food_items").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        throw error
      }

      // Remove from local state
      setFoodItems(foodItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error removing food item:", error)
      setError("Failed to remove food item. Please try again.")
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const startEditFood = (food: FoodItem) => {
    setEditingFood(food)
    setEditFood({
      name: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      sugar: food.sugar.toString(),
      serving: food.serving,
    })
    setIsEditingFood(true)
  }

  const totals = foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      sugar: acc.sugar + item.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your nutrition data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Apple className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">NutriTrack</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/tracker" className="text-green-600 font-medium">
              Tracker
            </Link>
            <Link href="/recipes" className="text-gray-600 hover:text-gray-900">
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
              <span className="text-sm text-gray-600">{profile?.name || "User"}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Daily Tracker</h1>
              <div className="flex gap-2">
                <Link href="/photo-analyzer">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>Scan Plate</span>
                  </Button>
                </Link>
                <Dialog open={isAddingFood} onOpenChange={setIsAddingFood}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Food</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Food Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddFood} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="food-name">Food Name</Label>
                          <Input
                            id="food-name"
                            value={newFood.name}
                            onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                            placeholder="e.g., Grilled Chicken Breast"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="serving">Serving Size</Label>
                          <Input
                            id="serving"
                            value={newFood.serving}
                            onChange={(e) => setNewFood({ ...newFood, serving: e.target.value })}
                            placeholder="e.g., 100g"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            min="0"
                            value={newFood.calories}
                            onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            min="0"
                            step="0.1"
                            value={newFood.protein}
                            onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            min="0"
                            step="0.1"
                            value={newFood.carbs}
                            onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            min="0"
                            step="0.1"
                            value={newFood.fat}
                            onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="sugar">Sugar (g)</Label>
                          <Input
                            id="sugar"
                            type="number"
                            min="0"
                            step="0.1"
                            value={newFood.sugar}
                            onChange={(e) => setNewFood({ ...newFood, sugar: e.target.value })}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding Food...
                          </>
                        ) : (
                          "Add Food Item"
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-4">
              {foodItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No food items logged today. Start by adding your first meal!</p>
                  </CardContent>
                </Card>
              ) : (
                foodItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.serving}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{item.calories} kcal</Badge>
                            <Badge variant="outline">Protein: {item.protein}g</Badge>
                            <Badge variant="outline">Carbs: {item.carbs}g</Badge>
                            <Badge variant="outline">Fat: {item.fat}g</Badge>
                            <Badge variant="outline">Sugar: {item.sugar}g</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditFood(item)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFood(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Daily Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="8"
                        strokeDasharray={`${(totals.calories / dailyGoals.calories) * 314} 314`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{totals.calories}</span>
                      <span className="text-sm text-gray-600">kcal</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Goal: {dailyGoals.calories} kcal</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span className="text-blue-600">
                        {totals.protein}g / {dailyGoals.protein}g
                      </span>
                    </div>
                    <Progress value={(totals.protein / dailyGoals.protein) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs</span>
                      <span className="text-green-600">
                        {totals.carbs}g / {dailyGoals.carbs}g
                      </span>
                    </div>
                    <Progress value={(totals.carbs / dailyGoals.carbs) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat</span>
                      <span className="text-yellow-600">
                        {totals.fat}g / {dailyGoals.fat}g
                      </span>
                    </div>
                    <Progress value={(totals.fat / dailyGoals.fat) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sugar</span>
                      <span className="text-red-600">{totals.sugar}g</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Remaining Calories:</span>
                    <span className={dailyGoals.calories - totals.calories >= 0 ? "text-green-600" : "text-red-600"}>
                      {dailyGoals.calories - totals.calories}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Foods Logged:</span>
                    <span>{foodItems.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Food Dialog */}
        <Dialog open={isEditingFood} onOpenChange={setIsEditingFood}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Food Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditFood} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-food-name">Food Name</Label>
                  <Input
                    id="edit-food-name"
                    value={editFood.name}
                    onChange={(e) => setEditFood({ ...editFood, name: e.target.value })}
                    placeholder="e.g., Grilled Chicken Breast"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-serving">Serving Size</Label>
                  <Input
                    id="edit-serving"
                    value={editFood.serving}
                    onChange={(e) => setEditFood({ ...editFood, serving: e.target.value })}
                    placeholder="e.g., 100g"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-calories">Calories</Label>
                  <Input
                    id="edit-calories"
                    type="number"
                    min="0"
                    value={editFood.calories}
                    onChange={(e) => setEditFood({ ...editFood, calories: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-protein">Protein (g)</Label>
                  <Input
                    id="edit-protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editFood.protein}
                    onChange={(e) => setEditFood({ ...editFood, protein: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-carbs">Carbs (g)</Label>
                  <Input
                    id="edit-carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editFood.carbs}
                    onChange={(e) => setEditFood({ ...editFood, carbs: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fat">Fat (g)</Label>
                  <Input
                    id="edit-fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editFood.fat}
                    onChange={(e) => setEditFood({ ...editFood, fat: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sugar">Sugar (g)</Label>
                  <Input
                    id="edit-sugar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editFood.sugar}
                    onChange={(e) => setEditFood({ ...editFood, sugar: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Food Item"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditingFood(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
