import { NextResponse } from "next/server"

export async function GET() {
  // Check which AI providers are configured
  const providers = {
    groq: !!process.env.GROQ_API_KEY,
    google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    huggingface: !!process.env.HUGGINGFACE_API_KEY,
  }

  const availableProviders = Object.entries(providers)
    .filter(([_, configured]) => configured)
    .map(([name, _]) => name)

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    configuredProviders: availableProviders,
    primaryProvider: "groq",
    fallbackAvailable: true, // Simple template system always available
    recommendations: {
      groq: "Get your free API key from https://console.groq.com/keys (Primary - Fast & Free)",
      google: "Get your free API key from https://aistudio.google.com/app/apikey (Vision support)",
      huggingface: "Sign up at https://huggingface.co for free API access",
      openai: "Paid service - sign up at https://platform.openai.com",
    },
    setup: {
      groq: {
        envVar: "GROQ_API_KEY",
        url: "https://console.groq.com/keys",
        description: "Groq offers ultra-fast inference with generous free tier",
        models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant"],
        limits: "30 requests/minute, 6000 tokens/minute",
      },
      google: {
        envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
        url: "https://aistudio.google.com/app/apikey",
        description: "Google AI Studio for vision tasks and backup",
        models: ["gemini-1.5-flash", "gemini-1.5-pro"],
      },
    },
  })
}
