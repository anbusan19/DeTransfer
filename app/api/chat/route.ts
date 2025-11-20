import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai"

const SYSTEM_INSTRUCTION = `
You are the AI assistant for "Eco", a stablecoin liquidity network.
Tone: Minimalist, professional, helpful, and slightly futuristic. Concise answers.

About Eco:
- Eco is a stablecoin liquidity network powering fluid, real-time money movement across blockchains.
- We accelerate money movement onchain.
- We connect leading stablecoin ecosystems with unparalleled speed, capital efficiency, and control.
- Programmable liquidity and routing ensure best-in-class execution.
- We allow users to bridge assets with Portal.

If asked about things unrelated to Eco, crypto, or stablecoins, politely decline and steer back to Eco.
`

export async function POST(request: NextRequest) {
  try {
    const { history, message } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const model = 'gemini-2.5-flash'

    // Construct context from history
    let context = ""
    history.forEach((msg: { role: string; text: string }) => {
      context += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`
    })
    context += `User: ${message}\nAssistant:`

    const response = await ai.models.generateContent({
      model: model,
      contents: context,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    })

    return NextResponse.json({ 
      text: response.text || "I apologize, I couldn't process that request at the moment." 
    })
  } catch (error) {
    console.error("Gemini API Error:", error)
    return NextResponse.json(
      { error: "System connection error. Please try again later." },
      { status: 500 }
    )
  }
}

