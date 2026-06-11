export type OpenRouterModel = 
  | 'deepseek/deepseek-r1:free' 
  | 'mistralai/mistral-7b-instruct:free' 
  | 'meta-llama/llama-3-8b-instruct:free'
  | 'google/gemma-4-31b-it:free'
  | 'nvidia/nemotron-nano-12b-v2-vl:free';

export interface OpenRouterResponse {
  text: string;
  latency: number;
  tokensIn?: number;
  tokensOut?: number;
  status: 'success' | 'error';
  errorMsg?: string;
}

export async function callOpenRouter(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: OpenRouterModel = 'deepseek/deepseek-r1:free'
): Promise<OpenRouterResponse> {
  const startTime = Date.now();
  
  if (!apiKey) {
    return {
      text: '',
      latency: 0,
      status: 'error',
      errorMsg: 'OpenRouter API key is missing. Please configure it in the Connectors tab.'
    };
  }

  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const requestBody = {
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://folient.io',
        'X-Title': 'Folient Builder'
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
        errorMsg: `OpenRouter API Error: ${errorMsg}`
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
    const errorMsg = error instanceof Error ? error.message : 'Network error occurred while calling OpenRouter API.';
    return {
      text: '',
      latency,
      status: 'error',
      errorMsg
    };
  }
}
