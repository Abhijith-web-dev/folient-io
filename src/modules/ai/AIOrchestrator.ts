import { callGemini, type GeminiModel } from './GeminiAdapter';
import { callOpenRouter, type OpenRouterModel } from './OpenRouterAdapter';
import { callGroq, type GroqModel } from './GroqAdapter';
import { folientDb } from '../../db/dexie';

const SYSTEM_PREAMBLE = `You are an expert frontend developer specializing in responsive portfolio websites.
Generate valid, semantic HTML5 with modern visual styles (using Tailwind CSS class names if suitable, or standard CSS inline styles).
Ensure all styles and behaviors are fully contained inside the section.
The section wrapper element MUST contain the attribute: data-folient-section-id="[SECTION_ID]".
Do NOT change the section wrapper's data-folient-section-id attribute value!
No external script sources (except standard icon fonts if necessary).
Do NOT include markdown blocks, notes, comments, or explanations.
Return ONLY the raw HTML block (without \`\`\`html or \`\`\` wrappers), nothing else.`;

export interface OrchestrationOptions {
  apiKey: string;
  projectId?: number;
  sectionId: string;
  currentHtml: string;
  userPrompt: string;
  userProfile?: {
    userType?: string;
    objective?: string;
    experienceLevel?: string;
  };
  model?: string;
}

export async function orchestrateSectionRegen(options: OrchestrationOptions) {
  const {
    apiKey,
    projectId,
    sectionId,
    currentHtml,
    userPrompt,
    userProfile,
    model = 'gemini-3.5-flash'
  } = options;

  // Enhance user prompt with profile and current HTML context
  const profileContext = userProfile
    ? `User Profile: Role is ${userProfile.userType || 'Developer'}, building for ${userProfile.objective || 'Personal Branding'} (Exp Level: ${userProfile.experienceLevel || 'Intermediate'}).`
    : '';

  const prompt = `${profileContext}
Target Section ID: ${sectionId}
Current Section HTML code:
\`\`\`html
${currentHtml}
\`\`\`

User Request for Changes:
"${userPrompt}"

Generate the improved, fully updated HTML code for this section. Remember to return ONLY the HTML string starting with the section wrapper containing data-folient-section-id="${sectionId}".`;

  let response;
  if (model.includes('/')) {
    const openRouterKey = localStorage.getItem('openrouter_api_key') || apiKey;
    response = await callOpenRouter(prompt, SYSTEM_PREAMBLE, openRouterKey, model as OpenRouterModel);
  } else if (model.includes('llama-3.3') || model.includes('mixtral') || model.includes('gemma2')) {
    const groqKey = localStorage.getItem('groq_api_key') || apiKey;
    response = await callGroq(prompt, SYSTEM_PREAMBLE, groqKey, model as GroqModel);
  } else {
    const geminiKey = localStorage.getItem('gemini_api_key') || apiKey;
    response = await callGemini(prompt, SYSTEM_PREAMBLE, geminiKey, model as GeminiModel);
  }

  // Clean the response
  let cleanedText = response.text.trim();
  
  // Remove markdown code fence wrappers if the LLM ignored instructions
  if (cleanedText.startsWith('```html')) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  
  cleanedText = cleanedText.trim();

  // Log telemetry in IndexedDB in background
  if (projectId) {
    folientDb.telemetry.add({
      projectId,
      timestamp: Date.now(),
      model,
      latency: response.latency,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      cost: response.tokensIn 
        ? ((response.tokensIn * 0.075) + (response.tokensOut || 0) * 0.3) / 1000000 
        : 0,
      status: response.status
    }).catch(err => console.error("Failed to write telemetry:", err));
  }

  return {
    ...response,
    text: cleanedText
  };
}
