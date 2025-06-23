import { z } from "zod"

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
})

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const foodItemSchema = z.object({
  name: z.string().min(1, "Food name is required").max(100, "Food name must be less than 100 characters"),
  serving: z.string().min(1, "Serving size is required").max(50, "Serving size must be less than 50 characters"),
  calories: z.number().min(0, "Calories must be positive").max(10000, "Calories must be less than 10,000"),
  protein: z.number().min(0, "Protein must be positive").max(1000, "Protein must be less than 1,000g"),
  carbs: z.number().min(0, "Carbs must be positive").max(1000, "Carbs must be less than 1,000g"),
  fat: z.number().min(0, "Fat must be positive").max(1000, "Fat must be less than 1,000g"),
  sugar: z.number().min(0, "Sugar must be positive").max(1000, "Sugar must be less than 1,000g"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type FoodItemInput = z.infer<typeof foodItemSchema>
