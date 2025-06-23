import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { google } from "@ai-sdk/google"

// This server-side route will handle AI requests securely with Groq as primary provider
export async function POST(request: Request) {
  try {
    const { prompt, system, messages, provider = "groq" } = await request.json()

    let model

    // Choose AI provider based on request or environment
    switch (provider) {
      case "groq":
        // Groq - Fast, free inference with generous limits
        model = groq("llama-3.1-70b-versatile") // Fast and capable model
        break
      case "groq-fast":
        // Groq's fastest model for simple tasks
        model = groq("llama-3.1-8b-instant") // Ultra-fast model
        break
      case "google":
        // Google AI Studio (Gemini) - backup provider
        model = google("gemini-1.5-flash")
        break
      case "google-pro":
        // Google AI Studio Pro model for complex tasks
        model = google("gemini-1.5-pro")
        break
      default:
        model = groq("llama-3.1-70b-versatile")
    }

    // Check if we have vision messages or regular text prompt
    if (messages) {
      // For vision tasks, we need to use Google AI (Groq doesn't support vision yet)
      if (provider === "groq" || provider === "groq-fast") {
        // Extract text content from vision messages for Groq
        const textContent = messages
          .map((msg: any) => {
            if (msg.content) {
              if (typeof msg.content === "string") {
                return msg.content
              } else if (Array.isArray(msg.content)) {
                return msg.content
                  .filter((c: any) => c.type === "text")
                  .map((c: any) => c.text)
                  .join(" ")
              }
            }
            return ""
          })
          .join(" ")

        const { text } = await generateText({
          model,
          prompt: textContent || prompt,
          system:
            system ||
            "You are a helpful nutrition assistant. Analyze the provided information and give detailed nutritional insights.",
        })
        return NextResponse.json({ text, provider: provider, note: "Vision converted to text for Groq" })
      } else {
        // Use Google AI for vision tasks
        const { text } = await generateText({
          model: google("gemini-1.5-flash"),
          messages,
          system,
        })
        return NextResponse.json({ text, provider: "google-vision" })
      }
    } else {
      const { text } = await generateText({
        model,
        prompt,
        system,
      })
      return NextResponse.json({ text, provider: provider })
    }
  } catch (error: any) {
    console.error("AI API error:", error)

    // Provide helpful error messages
    if (error.message?.includes("API key") || error.message?.includes("401")) {
      return NextResponse.json(
        {
          error: "Groq API key not configured",
          details: "Please set your GROQ_API_KEY environment variable",
          setup: "Get your free API key from https://console.groq.com/keys",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to generate AI response",
        details: "Check your API configuration and try again",
      },
      { status: 500 },
    )
  }
}
