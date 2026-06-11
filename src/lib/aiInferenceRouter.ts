import { callGemini, type GeminiModel } from '../modules/ai/GeminiAdapter';
import { callGroq, type GroqModel } from '../modules/ai/GroqAdapter';
import { callOpenRouter, type OpenRouterModel } from '../modules/ai/OpenRouterAdapter';
import { folientDb } from '../db/dexie';
import { type AstNode } from '../store/useEditorStore';

export interface AIProviderConfig {
  provider: 'gemini' | 'groq' | 'openrouter';
  apiKey: string;
  model: string;
}

export function tryRepairJson(jsonStr: string): any {
  const trimmed = jsonStr.trim();
  try {
    return JSON.parse(trimmed);
  } catch (originalError) {
    let repaired = trimmed;
    const firstBrace = repaired.indexOf('{');
    const firstBracket = repaired.indexOf('[');
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      repaired = repaired.substring(firstBrace);
    } else if (firstBracket !== -1) {
      repaired = repaired.substring(firstBracket);
    }

    let inString = false;
    let escape = false;
    const stack: ('{' | '[')[] = [];
    let cleanStr = '';

    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (inString) {
        if (escape) {
          escape = false;
          cleanStr += char;
        } else if (char === '\\') {
          escape = true;
          cleanStr += char;
        } else if (char === '"') {
          inString = false;
          cleanStr += char;
        } else if (char === '\n' || char === '\r') {
          cleanStr += '\\n';
        } else {
          cleanStr += char;
        }
      } else {
        if (char === '"') {
          inString = true;
          cleanStr += char;
        } else if (char === '{') {
          stack.push('{');
          cleanStr += char;
        } else if (char === '[') {
          stack.push('[');
          cleanStr += char;
        } else if (char === '}') {
          if (stack[stack.length - 1] === '{') {
            stack.pop();
          }
          cleanStr += char;
        } else if (char === ']') {
          if (stack[stack.length - 1] === '[') {
            stack.pop();
          }
          cleanStr += char;
        } else {
          cleanStr += char;
        }
      }
    }

    if (inString) {
      cleanStr += '"';
    }

    cleanStr = cleanStr.trim();
    while (cleanStr.length > 0) {
      const lastChar = cleanStr[cleanStr.length - 1];
      if (lastChar === ',' || lastChar === ':' || lastChar === ' ') {
        cleanStr = cleanStr.slice(0, -1).trim();
      } else {
        break;
      }
    }

    // Balance stack
    const reverseStack = [...stack].reverse();
    for (const open of reverseStack) {
      if (open === '{') {
        cleanStr += '}';
      } else if (open === '[') {
        cleanStr += ']';
      }
    }

    try {
      return JSON.parse(cleanStr);
    } catch (e) {
      console.warn("JSON repair attempt failed:", cleanStr, e);
      throw originalError;
    }
  }
}

export async function sendAiCommand(
  config: AIProviderConfig,
  prompt: string,
  node: AstNode,
  projectId?: number
): Promise<any[]> {
  const systemInstruction = `You are a Visual IDE AI agent. You modify the user's layout JSON AST.
Return EXCLUSIVELY a valid JSON array of RFC 6902 Operational Patches to apply changes relative to the provided node.
Do NOT output any conversational markdown, explanation, or backticks wrapper.
Only output JSON array of patches.

The patch paths will operate on the targeted node. Example paths:
- "/classes" to replace Tailwind CSS utilities
- "/content" to change text values
- "/children/0/classes" to target first child layout classes

Example patch array:
[
  {"op": "replace", "path": "/classes", "value": "text-white bg-[#FF5733] font-mono"},
  {"op": "replace", "path": "/content", "value": "Custom Brand Text"}
]`;

  const userPrompt = `Target Node JSON:
${JSON.stringify(node, null, 2)}

User Instruction:
${prompt}`;

  let response;
  if (config.provider === 'openrouter') {
    response = await callOpenRouter(userPrompt, systemInstruction, config.apiKey, config.model as OpenRouterModel);
  } else if (config.provider === 'groq') {
    response = await callGroq(userPrompt, systemInstruction, config.apiKey, config.model as GroqModel);
  } else {
    response = await callGemini(userPrompt, systemInstruction, config.apiKey, config.model as GeminiModel);
  }

  if (projectId) {
    folientDb.telemetry.add({
      projectId,
      timestamp: Date.now(),
      model: config.model,
      latency: response.latency,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      cost: response.tokensIn ? (response.tokensIn * 0.075 + (response.tokensOut || 0) * 0.3) / 1e6 : 0,
      status: response.status
    }).catch(e => console.error('Failed to write telemetry:', e));
  }

  if (response.status === 'error') {
    throw new Error(response.errorMsg || 'An unknown error occurred during AI generation.');
  }

  let text = response.text.trim();
  if (text.startsWith("```json")) {
    text = text.slice(7);
  } else if (text.startsWith("```")) {
    text = text.slice(3);
  }
  if (text.endsWith("```")) {
    text = text.slice(0, -3);
  }
  text = text.trim();

  try {
    const patches = tryRepairJson(text);
    return patches;
  } catch (e) {
    console.error('Failed to parse AI patches JSON response:', text, e);
    throw new Error('Failed to parse AI generation response. Please ensure a valid response format.');
  }
}

export function applyPatchesToAst(ast: AstNode, nodeId: string, patches: any[]): AstNode {
  const copy = JSON.parse(JSON.stringify(ast));
  const findAndApply = (node: any): boolean => {
    if (node.id === nodeId) {
      patches.forEach(patch => {
        try {
          const pathParts = patch.path.split('/').filter(Boolean);
          let current = node;
          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            const idx = Number(part);
            if (!isNaN(idx) && Array.isArray(current)) {
              current = current[idx];
            } else if (current[part] !== undefined) {
              current = current[part];
            }
          }
          const lastKey = pathParts[pathParts.length - 1];
          if (patch.op === 'replace' || patch.op === 'add') {
            if (lastKey === undefined) return;
            const idx = Number(lastKey);
            if (!isNaN(idx) && Array.isArray(current)) {
              current[idx] = patch.value;
            } else {
              current[lastKey] = patch.value;
            }
          } else if (patch.op === 'remove') {
            if (lastKey === undefined) return;
            const idx = Number(lastKey);
            if (!isNaN(idx) && Array.isArray(current)) {
              current.splice(idx, 1);
            } else {
              delete current[lastKey];
            }
          }
        } catch (err) {
          console.error('Failed to apply patch:', patch, err);
        }
      });
      return true;
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (findAndApply(child)) return true;
      }
    }
    return false;
  };
  findAndApply(copy);
  return copy;
}

export async function orchestrateNodeReStyle(options: {
  apiKey: string;
  projectId?: number;
  nodeId: string;
  nodeType: string;
  currentClasses: string;
  currentContent?: string;
  stylePrompt: string;
  model: string;
}): Promise<{
  status: 'success' | 'error';
  classes: string;
  content?: string;
  errorMsg?: string;
}> {
  const { apiKey, projectId, nodeId, nodeType, currentClasses, currentContent, stylePrompt, model } = options;
  
  const systemInstruction = `You are a professional designer. Your task is to suggest updated Tailwind CSS classes and text content for a web element node.
You must return a valid JSON object matching this schema:
{
  "classes": "updated css class names",
  "content": "updated element text content (only include if text content is present, otherwise omit or keep same)"
}
Return ONLY the raw JSON string (without markdown formatting blocks, without \`\`\`json wrappers), nothing else.`;

  const userPrompt = `Element Node ID: ${nodeId}
Element Node Type: ${nodeType}
Current CSS Classes: "${currentClasses}"
Current Text Content: "${currentContent || ''}"

Style Modification Request:
"${stylePrompt}"

Generate the JSON response containing the updated classes and content.`;

  let response;
  if (model.includes('/')) {
    response = await callOpenRouter(userPrompt, systemInstruction, localStorage.getItem('openrouter_api_key') || apiKey, model as OpenRouterModel);
  } else if (model.includes('llama-3.3') || model.includes('mixtral') || model.includes('gemma2')) {
    response = await callGroq(userPrompt, systemInstruction, localStorage.getItem('groq_api_key') || apiKey, model as GroqModel);
  } else {
    response = await callGemini(userPrompt, systemInstruction, localStorage.getItem('gemini_api_key') || apiKey, model as GeminiModel);
  }

  let text = response.text.trim();
  if (text.startsWith("```json")) {
    text = text.slice(7);
  } else if (text.startsWith("```")) {
    text = text.slice(3);
  }
  if (text.endsWith("```")) {
    text = text.slice(0, -3);
  }
  text = text.trim();

  if (projectId) {
    folientDb.telemetry.add({
      projectId,
      timestamp: Date.now(),
      model,
      latency: response.latency,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      cost: response.tokensIn ? (response.tokensIn * 0.075 + (response.tokensOut || 0) * 0.3) / 1e6 : 0,
      status: response.status
    }).catch(e => console.error('Failed to write telemetry:', e));
  }

  try {
    const data = tryRepairJson(text);
    return {
      status: 'success',
      classes: data.classes || currentClasses,
      content: data.content === undefined ? currentContent : data.content,
      errorMsg: response.errorMsg
    };
  } catch (e) {
    console.error('Failed to parse AI re-style JSON response:', text, e);
    return {
      status: 'error',
      classes: currentClasses,
      content: currentContent,
      errorMsg: response.errorMsg || 'Failed to parse AI design suggestion. Please try again.'
    };
  }
}

// ─── Portfolio Generation ────────────────────────────────────────────────────

export interface PortfolioStyle {
  name: string;
  bg: string;
  accent: string;
  description: string;
}

export const PORTFOLIO_STYLES: PortfolioStyle[] = [
  { name: 'Minimal Dark', bg: 'bg-zinc-950', accent: '#FF5733', description: 'Clean dark with orange accent' },
  { name: 'Bold Gradient', bg: 'bg-gradient-to-br from-zinc-900 via-purple-950 to-zinc-900', accent: '#A855F7', description: 'Vivid purple gradient' },
  { name: 'Glassmorphism', bg: 'bg-slate-900', accent: '#38BDF8', description: 'Frosted glass with sky blue' },
  { name: 'Corporate Pro', bg: 'bg-gray-950', accent: '#22D3EE', description: 'Professional teal on near-black' },
];

export async function generateFullPortfolio(
  config: AIProviderConfig,
  brief: string,
  style: PortfolioStyle,
  sections: string[],
  projectId?: number
): Promise<AstNode> {

  const sectionDescriptions: Record<string, string> = {
    navbar:       'A sticky navigation bar with logo/brand name on left and nav links (Home, About, Work, Contact) on right.',
    hero:         'A full-width hero section with: badge pill, large headline, subtitle, and 2 CTA buttons (Primary + Secondary).',
    about:        'An about/bio section with: section heading, 2-column layout — left has photo placeholder, right has bio text and key traits pills.',
    skills:       'A skills section with: section heading, responsive grid of skill cards showing skill name + progress bar or icon.',
    projects:     'A projects/work section with: section heading, responsive card grid — each card has project name, description, tech stack tags, and a View Project link.',
    experience:   'A work experience timeline section with: section heading and vertical timeline — each entry shows role, company, date range, and bullet points.',
    testimonials: 'A testimonials section with: section heading, 2-column grid of quote cards — each with quote text, avatar placeholder, name, and title.',
    stats:        'A stats/numbers bar with 4 impressive metrics (e.g., 5+ Years, 30+ Projects, 15+ Clients, 99% Satisfaction).',
    contact:      'A contact section with: section heading, email/social links, and a simple contact form (name, email, message, submit button).',
    footer:       'A footer with: copyright text, nav links, and social icon links.',
  };

  const requestedSections = sections.map(s => `- ${s}: ${sectionDescriptions[s] || s}`).join('\n');

  const systemInstruction = `You are an expert portfolio website designer and frontend engineer.
Your task is to generate a complete portfolio website as a single JSON AST (Abstract Syntax Tree) based on the user's brief.

CRITICAL RULES:
1. Return ONLY a valid JSON object — NO markdown, NO backticks, NO explanation.
2. The root node must have id="root-viewport".
3. Every node must have: id (unique string), type (html tag name), classes (Tailwind string).
4. Use ONLY Tailwind CSS classes. The site will be rendered in a Tailwind CDN environment.
5. Make the portfolio look STUNNING and PROFESSIONAL — use the provided color palette.
6. Use ${style.bg} as the main background. Use ${style.accent} as the primary accent color (use in Tailwind arbitrary values like bg-[${style.accent}]).
7. ALL text must be real, personalized content based on the user's brief — NO placeholder text.
8. Each section must have a unique, descriptive id (e.g., "hero-section", "skills-section").
9. Self-closing tags (img, br, hr, input) use type as-is with no children.
10. Max depth: 6 levels. Keep children arrays concise.

AstNode Schema:
{
  "id": "string (unique)",
  "type": "string (html tag: div, section, nav, h1, p, button, img, etc.)",
  "classes": "string (Tailwind CSS classes)",
  "content": "string (text content — ONLY for leaf text nodes, omit if children present)",
  "children": [AstNode] (array of child nodes — omit if leaf node),
  "attributes": { "key": "value" } (optional — for src, href, alt, etc.)
}

The root structure must be:
{
  "id": "root-viewport",
  "type": "div",
  "classes": "w-full min-h-screen ${style.bg} text-white font-sans",
  "children": [ ...all sections as direct children... ]
}`;

  const userPrompt = `User Portfolio Brief:
${brief}

Generate the following sections in order:
${requestedSections}

Style: ${style.name} — ${style.description}
Primary accent color: ${style.accent}

Generate the complete portfolio JSON AST now. Return ONLY the JSON object.`;

  let response;
  if (config.provider === 'openrouter') {
    response = await callOpenRouter(userPrompt, systemInstruction, config.apiKey, config.model as OpenRouterModel);
  } else if (config.provider === 'groq') {
    response = await callGroq(userPrompt, systemInstruction, config.apiKey, config.model as GroqModel);
  } else {
    response = await callGemini(userPrompt, systemInstruction, config.apiKey, config.model as GeminiModel);
  }

  if (projectId) {
    folientDb.telemetry.add({
      projectId,
      timestamp: Date.now(),
      model: config.model,
      latency: response.latency,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      cost: response.tokensIn ? (response.tokensIn * 0.075 + (response.tokensOut || 0) * 0.3) / 1e6 : 0,
      status: response.status
    }).catch(e => console.error('Failed to write telemetry:', e));
  }

  if (response.status === 'error') {
    throw new Error(response.errorMsg || 'AI portfolio generation failed.');
  }

  let text = response.text.trim();
  // Strip any markdown wrappers
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  text = text.trim();

  try {
    const ast = tryRepairJson(text) as AstNode;
    // Ensure root ID is always correct
    if (ast && typeof ast === 'object') {
      ast.id = 'root-viewport';
      return ast;
    }
    throw new Error('Generated AST is not a valid object.');
  } catch (e) {
    console.error('Failed to parse portfolio generation response:', text, e);
    throw new Error('Failed to parse AI portfolio response. Try a different model or simplify your brief.');
  }
}

// ─── Smart Section Targeting ─────────────────────────────────────────────────

interface SectionKeywords {
  keywords: string[];
  nodeHints: string[];  // partial node ID matches to look for
}

const SECTION_KEYWORD_MAP: Record<string, SectionKeywords> = {
  navbar:       { keywords: ['nav', 'navbar', 'navigation', 'header', 'menu', 'logo', 'links', 'top bar'], nodeHints: ['nav', 'navbar', 'header', 'navigation'] },
  hero:         { keywords: ['hero', 'headline', 'title', 'banner', 'tagline', 'main heading', 'cta', 'call to action', 'jumbotron'], nodeHints: ['hero', 'banner', 'jumbotron'] },
  about:        { keywords: ['about', 'bio', 'biography', 'who i am', 'profile', 'introduction', 'intro', 'myself'], nodeHints: ['about', 'bio', 'profile', 'intro'] },
  skills:       { keywords: ['skill', 'skills', 'technology', 'stack', 'tools', 'expertise', 'abilities', 'languages', 'frameworks'], nodeHints: ['skill', 'tech', 'stack', 'expertise'] },
  projects:     { keywords: ['project', 'projects', 'work', 'portfolio', 'case study', 'showcase', 'work showcase'], nodeHints: ['project', 'work', 'portfolio', 'showcase'] },
  experience:   { keywords: ['experience', 'timeline', 'career', 'job', 'company', 'employment', 'history', 'role'], nodeHints: ['experience', 'timeline', 'career', 'job'] },
  testimonials: { keywords: ['testimonial', 'review', 'quote', 'feedback', 'client', 'recommendation'], nodeHints: ['testimonial', 'review', 'quote'] },
  contact:      { keywords: ['contact', 'reach me', 'email', 'get in touch', 'message', 'form', 'hire'], nodeHints: ['contact', 'reach', 'form'] },
  footer:       { keywords: ['footer', 'bottom', 'copyright', 'social', 'links'], nodeHints: ['footer', 'bottom'] },
  stats:        { keywords: ['stats', 'statistics', 'numbers', 'metrics', 'achievements', 'counter'], nodeHints: ['stats', 'metric', 'number', 'count'] },
};

export function detectTargetSection(prompt: string, ast: AstNode): string {
  const lowerPrompt = prompt.toLowerCase();

  // Walk AST to collect all section-level node IDs
  const sectionIds: string[] = [];
  const walk = (node: AstNode) => {
    if (['section', 'header', 'footer', 'nav', 'main', 'aside'].includes(node.type) || 
        node.id.includes('section') || node.id.includes('hero') || node.id.includes('nav')) {
      sectionIds.push(node.id);
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(ast);

  // Score each section category by keyword matches
  let bestMatch = { nodeId: 'root-viewport', score: 0 };

  for (const [_category, config] of Object.entries(SECTION_KEYWORD_MAP)) {
    const keywordScore = config.keywords.filter(kw => lowerPrompt.includes(kw)).length;
    if (keywordScore === 0) continue;

    // Try to find a real node in the AST that matches the hint
    for (const hint of config.nodeHints) {
      const matchedId = sectionIds.find(id => id.toLowerCase().includes(hint));
      if (matchedId && keywordScore > bestMatch.score) {
        bestMatch = { nodeId: matchedId, score: keywordScore };
        break;
      }
    }
  }

  return bestMatch.nodeId;
}

