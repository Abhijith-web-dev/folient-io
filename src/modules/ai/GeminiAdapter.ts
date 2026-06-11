export type GeminiModel = 'gemini-3.5-flash' | 'gemini-2.0-flash' | 'gemini-1.5-flash';

export interface GeminiResponse {
  text: string;
  latency: number;
  tokensIn?: number;
  tokensOut?: number;
  status: 'success' | 'error';
  errorMsg?: string;
}

export async function callGemini(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: GeminiModel = 'gemini-3.5-flash'
): Promise<GeminiResponse> {
  const startTime = Date.now();
  
  if (!apiKey) {
    return {
      text: '',
      latency: 0,
      status: 'error',
      errorMsg: 'Gemini API key is missing. Please configure it in the Connectors tab.'
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain"
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson?.error?.message || `HTTP error ${response.status}`;
      let friendlyError = `Gemini API Error: ${errorMsg}`;
      
      if (errorMsg.toLowerCase().includes('quota') || response.status === 429) {
        friendlyError += `\n\n💡 Troubleshooting: You have hit the Gemini API free-tier limits. To resolve this instantly:\n1. Enable Billing in Google AI Studio to unlock the high-throughput Pay-As-You-Go plan (which remains free of charge below standard monthly thresholds).\n2. Alternatively, switch to Groq or OpenRouter providers under the Connectors tab.`;
      }
      
      return {
        text: '',
        latency,
        status: 'error',
        errorMsg: friendlyError
      };
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Attempt to parse token usage from Gemini metadata if available
    const tokensIn = data.usageMetadata?.promptTokenCount;
    const tokensOut = data.usageMetadata?.candidatesTokenCount;

    return {
      text: textOutput,
      latency,
      tokensIn,
      tokensOut,
      status: 'success'
    };
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : 'Network error occurred while calling Gemini API.';
    return {
      text: '',
      latency,
      status: 'error',
      errorMsg
    };
  }
}
