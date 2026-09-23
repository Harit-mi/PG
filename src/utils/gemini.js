/**
 * Google Gemini AI Integration Layer
 * Supports fast reasoning with Flash Lite models (e.g. gemini-2.5-flash-lite, gemini-2.0-flash-lite)
 */

export async function generateGeminiContent(prompt, systemInstruction = "") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "Gemini API key is not configured. Please set GEMINI_API_KEY in environment variables."
    };
  }

  const configuredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  // Candidate models to try in priority order
  const modelsToTry = [
    configuredModel,
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash-lite"
  ];

  // Remove duplicates
  const uniqueModels = [...new Set(modelsToTry)];

  let lastError = null;

  for (const model of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}: Failed with model ${model}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return {
          success: true,
          model,
          text: text.trim()
        };
      }
    } catch (err) {
      lastError = err.message;
      // continue to next model fallback
    }
  }

  return {
    success: false,
    error: lastError || "Failed to generate AI response from Gemini API."
  };
}
