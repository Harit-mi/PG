import { NextResponse } from 'next/server.js';
import { generateGeminiContent } from '@/utils/gemini';
import { checkRateLimit } from '@/utils/rateLimiter';
import { sanitizeInput } from '@/utils/sanitizer';

export async function POST(req) {
  // Rate limit AI requests to 20 per minute per IP
  const rateLimit = checkRateLimit(req, 20, 60000);
  if (!rateLimit.success) return rateLimit.response;

  try {
    const { prompt, type = "general" } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    if (prompt.length > 2000) {
      return NextResponse.json({ error: "Prompt exceeds maximum allowed length (2000 characters)." }, { status: 400 });
    }

    let systemInstruction = "You are OUR-PG Copilot, an expert AI assistant specialized in Indian PG (Paying Guest) and Hostel operations, tenant relations, and property management.";

    if (type === "whatsapp_reminder") {
      systemInstruction += " Generate concise, professional, and courteous WhatsApp rent reminder messages. Offer English and polite Hinglish variations.";
    } else if (type === "notice") {
      systemInstruction += " Draft clear, polite, and well-structured PG notices for resident noticeboards (e.g. food timings, maintenance, festival specials, rules).";
    } else if (type === "onboarding") {
      systemInstruction += " Explain to new PG owners how to effortlessly set up rooms, beds, add tenants, and track empty vacancies in simple, clear terms.";
    }

    const result = await generateGeminiContent(prompt.trim(), systemInstruction);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      model: result.model
    });

  } catch (err) {
    console.error("AI Copilot API Error:", err);
    return NextResponse.json({ error: "An unexpected error occurred while processing AI request." }, { status: 500 });
  }
}
