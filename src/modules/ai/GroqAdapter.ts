export type GroqModel = 'llama-3.3-70b-versatile' | 'mixtral-8x7b-32768' | 'gemma2-9b-it';

export interface GroqResponse {
  text: string;
  latency: number;
  tokensIn?: number;
  tokensOut?: number;
  status: 'success' | 'error';
  errorMsg?: string;
}

export async function callGroq(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: GroqModel = 'llama-3.3-70b-versatile'
): Promise<GroqResponse> {
  const startTime = Date.now();
  
  if (!apiKey) {
    return {
      text: '',
      latency: 0,
      status: 'error',
      errorMsg: 'Groq API key is missing. Please configure it in the Connectors tab.'
    };
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const requestBody = {
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 4096
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson?.error?.message || `HTTP error ${response.status}`;
      return {
        text: '',
        latency,
        status: 'error',
        errorMsg: `Groq API Error: ${errorMsg}`
      };
    }

    const data = await response.json();
    const textOutput = data.choices?.[0]?.message?.content || '';
    
    const tokensIn = data.usage?.prompt_tokens;
    const tokensOut = data.usage?.completion_tokens;

    return {
      text: textOutput,
      latency,
      tokensIn,
      tokensOut,
      status: 'success'
    };
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : 'Network error occurred while calling Groq API.';
    return {
      text: '',
      latency,
      status: 'error',
      errorMsg
    };
  }
}
