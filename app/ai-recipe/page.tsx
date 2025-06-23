"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Apple,
  User,
  ChefHat,
  Clock,
  Users,
  Loader2,
  Zap,
  Plus,
  Check,
} from "lucide-react";
import Link from "next/link";

// Interface for the AI-generated recipe structure
interface AIRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  cookTime: number;
  servings: number;
  dietaryTags: string[];
}

// Interface for food items (matching the tracker structure)
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  serving: string;
}

export default function AIRecipePage() {
  // State management for user authentication and recipe generation
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [ingredients, setIngredients] = useState(""); // User's available ingredients
  const [dietaryPreferences, setDietaryPreferences] = useState(""); // User's dietary restrictions/preferences
  const [generatedRecipe, setGeneratedRecipe] = useState<AIRecipe | null>(null); // AI-generated recipe
  const [isGenerating, setIsGenerating] = useState(false); // Loading state for AI generation
  const [error, setError] = useState(""); // Error handling
  const [isClient, setIsClient] = useState(false); // Track client-side hydration
  const [aiProvider, setAiProvider] = useState<string>(""); // Which AI provider was used
  const [isAddingToTracker, setIsAddingToTracker] = useState(false); // Loading state for adding to tracker
  const [addedToTracker, setAddedToTracker] = useState(false); // Success state
  const [servingSize, setServingSize] = useState(1); // How many servings to add
  const [showAddDialog, setShowAddDialog] = useState(false); // Dialog state
  const router = useRouter();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Authentication check on component mount - only run on client
  useEffect(() => {
    if (!isClient) return;

    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router, isClient]);

  // Handle user logout
  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem("user");
      localStorage.removeItem("foodItems");
    }
    router.push("/");
  };

  // Try multiple AI providers with Groq as primary
  const tryAIProviders = async (prompt: string, system: string) => {
    const providers = [
      { name: "groq", endpoint: "/api/ai" },
      { name: "google", endpoint: "/api/ai" },
      { name: "simple", endpoint: "/api/ai-simple" },
    ];

    for (const provider of providers) {
      try {
        const response = await fetch(provider.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            system,
            provider: provider.name,
            ingredients, // For simple provider
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiProvider(data.provider || provider.name);
          return data.text;
        }
      } catch (error) {
        console.log(`${provider.name} provider failed, trying next...`);
        continue;
      }
    }

    throw new Error("All AI providers failed");
  };

  // Main function to generate recipe using AI
  const handleGenerateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - ensure user has provided ingredients
    if (!ingredients.trim()) {
      setError("Please enter some ingredients you have available.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setAddedToTracker(false); // Reset success state

    try {
      // Create a detailed prompt for the AI to generate a healthy recipe
      const prompt = `Create a healthy recipe using these available ingredients: ${ingredients}
      
      ${
        dietaryPreferences
          ? `Dietary preferences/restrictions: ${dietaryPreferences}`
          : ""
      }
      
      Please provide a complete recipe in JSON format with the following structure:
      {
        "title": "Recipe Name",
        "description": "Brief description of the dish",
        "ingredients": ["ingredient 1", "ingredient 2", ...],
        "instructions": ["step 1", "step 2", ...],
        "nutritionInfo": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "fiber": number
        },
        "cookTime": number (in minutes),
        "servings": number,
        "dietaryTags": ["tag1", "tag2", ...]
      }
      
      Make sure the recipe is healthy, balanced, and uses primarily the ingredients provided. If some common pantry items (salt, pepper, oil) are needed, include them. Focus on nutritious, whole food ingredients.`;

      const system =
        "You are a professional nutritionist and chef. Create healthy, balanced recipes with accurate nutritional information. Always respond with valid JSON format.";

      // Try multiple AI providers
      const text = await tryAIProviders(prompt, system);

      // Parse the AI response as JSON
      try {
        const recipe = JSON.parse(text) as AIRecipe;
        setGeneratedRecipe(recipe);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const recipe = JSON.parse(jsonMatch[0]) as AIRecipe;
          setGeneratedRecipe(recipe);
        } else {
          throw new Error("Could not parse recipe from AI response");
        }
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      setError(
        "Failed to generate recipe. Please try again with different ingredients or check your internet connection."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to add recipe to tracker
  const handleAddToTracker = async () => {
    if (!generatedRecipe || !isClient) return;

    setIsAddingToTracker(true);

    try {
      // Calculate nutrition per serving
      const caloriesPerServing = Math.round(
        generatedRecipe.nutritionInfo.calories / generatedRecipe.servings
      );
      const proteinPerServing =
        Math.round(
          (generatedRecipe.nutritionInfo.protein / generatedRecipe.servings) *
            10
        ) / 10;
      const carbsPerServing =
        Math.round(
          (generatedRecipe.nutritionInfo.carbs / generatedRecipe.servings) * 10
        ) / 10;
      const fatPerServing =
        Math.round(
          (generatedRecipe.nutritionInfo.fat / generatedRecipe.servings) * 10
        ) / 10;
      const fiberPerServing =
        Math.round(
          (generatedRecipe.nutritionInfo.fiber / generatedRecipe.servings) * 10
        ) / 10;

      // Create food item for the tracker
      const foodItem: FoodItem = {
        id: Date.now().toString(),
        name: `${generatedRecipe.title} (AI Recipe)`,
        calories: Math.round(caloriesPerServing * servingSize),
        protein: Math.round(proteinPerServing * servingSize * 10) / 10,
        carbs: Math.round(carbsPerServing * servingSize * 10) / 10,
        fat: Math.round(fatPerServing * servingSize * 10) / 10,
        sugar: Math.round(fiberPerServing * servingSize * 10) / 10, // Using fiber as sugar estimate
        serving: `${servingSize} serving${servingSize > 1 ? "s" : ""}`,
      };

      // Get existing food items from localStorage
      const existingFoods = localStorage.getItem("foodItems");
      const foodItems = existingFoods ? JSON.parse(existingFoods) : [];

      // Add new food item
      const updatedFoods = [...foodItems, foodItem];
      localStorage.setItem("foodItems", JSON.stringify(updatedFoods));

      setAddedToTracker(true);
      setShowAddDialog(false);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setAddedToTracker(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding to tracker:", error);
      setError("Failed to add recipe to tracker. Please try again.");
    } finally {
      setIsAddingToTracker(false);
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NutriTrack...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) return null;

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
            <Link href="/ai-recipe" className="text-green-600 font-medium">
              AI Recipe
            </Link>
            <Link
              href="/photo-analyzer"
              className="text-gray-600 hover:text-gray-900"
            >
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
          {/* Success message */}
          {addedToTracker && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Recipe successfully added to your daily tracker!
                <Link
                  href="/tracker"
                  className="ml-2 text-green-600 hover:underline font-medium"
                >
                  View Tracker →
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Page header*/}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                AI Recipe Generator
              </h1>
              <Badge variant="secondary" className="ml-2">
                Powered by Groq
              </Badge>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tell me what ingredients you have at home, and I'll create a
              personalized healthy recipe just for you using ultra-fast AI!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input form section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5" />
                  <span>Create Your Recipe</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateRecipe} className="space-y-6">
                  {/* Ingredients input */}
                  <div className="space-y-2">
                    <Label htmlFor="ingredients">Available Ingredients *</Label>
                    <Textarea
                      id="ingredients"
                      placeholder="e.g., chicken breast, broccoli, rice, garlic, olive oil, onions..."
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      List all the ingredients you have available, separated by
                      commas
                    </p>
                  </div>

                  {/* Dietary preferences input */}
                  <div className="space-y-2">
                    <Label htmlFor="dietary">
                      Dietary Preferences (Optional)
                    </Label>
                    <Input
                      id="dietary"
                      placeholder="e.g., vegetarian, low-carb, gluten-free, dairy-free..."
                      value={dietaryPreferences}
                      onChange={(e) => setDietaryPreferences(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Any dietary restrictions or preferences you'd like me to
                      consider
                    </p>
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Generate button with loading state */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Recipe...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Recipe
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Generated recipe display section */}
            <div className="space-y-6">
              {!generatedRecipe && !isGenerating && (
                // Placeholder when no recipe is generated yet
                <Card>
                  <CardContent className="py-12 text-center">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Your AI-generated recipe will appear here
                    </p>
                  </CardContent>
                </Card>
              )}

              {isGenerating && (
                // Loading state during recipe generation
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">
                      Coocking up your personalized recipe...
                    </p>
                  </CardContent>
                </Card>
              )}

              {generatedRecipe && (
                // Display the generated recipe
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {generatedRecipe.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {aiProvider && (
                          <Badge variant="outline" className="text-xs">
                            {aiProvider === "simple-template"
                              ? "Template"
                              : aiProvider === "groq"
                              ? "Groq AI"
                              : "AI Generated"}
                          </Badge>
                        )}
                        {/* Add to Tracker Button */}
                        <Dialog
                          open={showAddDialog}
                          onOpenChange={setShowAddDialog}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add to Tracker</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Recipe to Tracker</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="servings">
                                  Number of Servings
                                </Label>
                                <Input
                                  id="servings"
                                  type="number"
                                  min="0.5"
                                  max="10"
                                  step="0.5"
                                  value={servingSize}
                                  onChange={(e) =>
                                    setServingSize(Number(e.target.value))
                                  }
                                />
                                <p className="text-sm text-gray-500">
                                  Recipe makes {generatedRecipe.servings}{" "}
                                  servings total
                                </p>
                              </div>

                              {/* Nutrition preview */}
                              <div className="bg-gray-50 p-3 rounded-md">
                                <h4 className="font-medium mb-2">
                                  Nutrition per {servingSize} serving(s):
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    Calories:{" "}
                                    {Math.round(
                                      (generatedRecipe.nutritionInfo.calories /
                                        generatedRecipe.servings) *
                                        servingSize
                                    )}
                                  </div>
                                  <div>
                                    Protein:{" "}
                                    {Math.round(
                                      (generatedRecipe.nutritionInfo.protein /
                                        generatedRecipe.servings) *
                                        servingSize *
                                        10
                                    ) / 10}
                                    g
                                  </div>
                                  <div>
                                    Carbs:{" "}
                                    {Math.round(
                                      (generatedRecipe.nutritionInfo.carbs /
                                        generatedRecipe.servings) *
                                        servingSize *
                                        10
                                    ) / 10}
                                    g
                                  </div>
                                  <div>
                                    Fat:{" "}
                                    {Math.round(
                                      (generatedRecipe.nutritionInfo.fat /
                                        generatedRecipe.servings) *
                                        servingSize *
                                        10
                                    ) / 10}
                                    g
                                  </div>
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  onClick={handleAddToTracker}
                                  disabled={isAddingToTracker}
                                  className="flex-1"
                                >
                                  {isAddingToTracker ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add to Tracker
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowAddDialog(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      {generatedRecipe.description}
                    </p>

                    {/* Recipe metadata */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{generatedRecipe.cookTime} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{generatedRecipe.servings} servings</span>
                      </div>
                    </div>

                    {/* Dietary tags */}
                    <div className="flex flex-wrap gap-2">
                      {generatedRecipe.dietaryTags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Nutrition information */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        Nutrition Information (Total Recipe)
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Calories:</span>
                          <span className="font-medium">
                            {generatedRecipe.nutritionInfo.calories}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein:</span>
                          <span className="font-medium">
                            {generatedRecipe.nutritionInfo.protein}g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbs:</span>
                          <span className="font-medium">
                            {generatedRecipe.nutritionInfo.carbs}g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fat:</span>
                          <span className="font-medium">
                            {generatedRecipe.nutritionInfo.fat}g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fiber:</span>
                          <span className="font-medium">
                            {generatedRecipe.nutritionInfo.fiber}g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Per Serving:</span>
                          <span className="font-medium">
                            {Math.round(
                              generatedRecipe.nutritionInfo.calories /
                                generatedRecipe.servings
                            )}{" "}
                            cal
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Ingredients list */}
                    <div>
                      <h3 className="font-semibold mb-3">Ingredients</h3>
                      <ul className="space-y-1 text-sm">
                        {generatedRecipe.ingredients.map(
                          (ingredient, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{ingredient}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <Separator />

                    {/* Cooking instructions */}
                    <div>
                      <h3 className="font-semibold mb-3">Instructions</h3>
                      <ol className="space-y-2 text-sm">
                        {generatedRecipe.instructions.map(
                          (instruction, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span>{instruction}</span>
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
