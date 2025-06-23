import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { google } from "@ai-sdk/google"

// Fallback AI route with Groq as primary provider
export async function POST(request: Request) {
  try {
    const { prompt, system } = await request.json()

    // Try Groq first (fast and free)
    try {
      const { text } = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        prompt,
        system,
      })
      return NextResponse.json({ text, provider: "groq" })
    } catch (groqError) {
      console.log("Groq failed, trying Google AI...")

      // Fallback to Google AI Studio
      try {
        const { text } = await generateText({
          model: google("gemini-1.5-flash"),
          prompt,
          system,
        })
        return NextResponse.json({ text, provider: "google-gemini" })
      } catch (googleError) {
        console.log("Google AI failed, trying Hugging Face...")

        // Fallback to Hugging Face Inference API (free)
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-large", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `${system}\n\nUser: ${prompt}\nAssistant:`,
            parameters: {
              max_new_tokens: 1000,
              temperature: 0.7,
            },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            text: data[0]?.generated_text || "Sorry, I couldn't generate a response.",
            provider: "huggingface",
          })
        }

        throw new Error("All AI providers failed")
      }
    }
  } catch (error: any) {
    console.error("AI API error:", error)
    return NextResponse.json(
      {
        error: "All AI services are currently unavailable. Please try again later.",
        suggestion: "You can still use the manual food entry features.",
      },
      { status: 500 },
    )
  }
}
