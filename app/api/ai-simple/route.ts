import { NextResponse } from "next/server"

// Simple recipe templates for when AI is unavailable
const recipeTemplates = {
  healthy: {
    title: "Healthy {protein} with {vegetable}",
    description: "A nutritious and balanced meal featuring {protein} and {vegetable}",
    instructions: [
      "Prepare your {protein} by seasoning with salt and pepper",
      "Heat a pan with a little olive oil over medium heat",
      "Cook the {protein} for 5-7 minutes on each side until done",
      "Steam or sauté the {vegetable} until tender",
      "Serve together with your choice of healthy sides",
    ],
    cookTime: 20,
    servings: 2,
    dietaryTags: ["Healthy", "Balanced"],
  },
}

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json()

    // Simple ingredient parsing
    const ingredientList = ingredients
      .toLowerCase()
      .split(",")
      .map((i: string) => i.trim())

    // Find protein and vegetable
    const proteins = ["chicken", "beef", "fish", "salmon", "turkey", "tofu", "eggs"]
    const vegetables = ["broccoli", "spinach", "carrots", "bell pepper", "zucchini", "asparagus"]

    const foundProtein = ingredientList.find((ing: string) => proteins.some((p) => ing.includes(p))) || "protein"

    const foundVegetable = ingredientList.find((ing: string) => vegetables.some((v) => ing.includes(v))) || "vegetables"

    // Generate simple recipe
    const template = recipeTemplates.healthy
    const recipe = {
      title: template.title.replace("{protein}", foundProtein).replace("{vegetable}", foundVegetable),
      description: template.description.replace("{protein}", foundProtein).replace("{vegetable}", foundVegetable),
      ingredients: [
        `${foundProtein} (200g)`,
        `${foundVegetable} (150g)`,
        "Olive oil (1 tbsp)",
        "Salt and pepper to taste",
        ...ingredientList.slice(0, 3).map((ing: string) => `${ing} (as needed)`),
      ],
      instructions: template.instructions.map((inst) =>
        inst.replace("{protein}", foundProtein).replace("{vegetable}", foundVegetable),
      ),
      nutritionInfo: {
        calories: 350,
        protein: 30,
        carbs: 15,
        fat: 12,
        fiber: 5,
      },
      cookTime: template.cookTime,
      servings: template.servings,
      dietaryTags: template.dietaryTags,
    }

    return NextResponse.json({
      text: JSON.stringify(recipe),
      provider: "simple-template",
      note: "This is a basic recipe template. For more personalized recipes, configure an AI provider.",
    })
  } catch (error: any) {
    console.error("Simple AI error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate simple recipe",
      },
      { status: 500 },
    )
  }
}
