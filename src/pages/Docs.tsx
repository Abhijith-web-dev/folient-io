import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronRight, Menu, X, Info, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { gsap } from 'gsap';
import { useSEO } from '../hooks/useSEO';

interface DocArticle {
  id: string;
  category: 'getting-started' | 'connectors' | 'supabase' | 'deployment' | 'editor';
  categoryLabel: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

export default function Docs() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useSEO({
    title: 'Documentation',
    description: 'Read the official documentation for Folient. Learn how to configure your API keys, connect Supabase storage, build portfolios with AI, and deploy to Vercel/Netlify.',
    canonicalPath: '/docs',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticleId, setActiveArticleId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('article') || 'what-is-folient';
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sandbox validator state
  const [testKey, setTestKey] = useState('');
  const [validationResult, setValidationResult] = useState<{ status: 'idle' | 'valid' | 'invalid'; msg: string }>({ status: 'idle', msg: '' });

  const containerRef = useRef<HTMLDivElement>(null);
  const articleContainerRef = useRef<HTMLDivElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);

  // GSAP Intro & Sidebar Entrance Animation
  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Stagger sidebar items
      tl.fromTo('.gsap-sidebar-item', 
        { opacity: 0, x: -25 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.05 }
      );

      // Fade in main article header & content
      tl.fromTo('.gsap-article-entrance',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.4'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // GSAP Transition on Article Change
  const handleArticleSelect = (id: string) => {
    if (id === activeArticleId) return;

    // Fade out current content, switch state, fade in new content
    gsap.to(articleContentRef.current, {
      opacity: 0,
      y: -15,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveArticleId(id);
        setIsMobileMenuOpen(false);
        setTestKey('');
        setValidationResult({ status: 'idle', msg: '' });

        // Fade back in
        gsap.fromTo(articleContentRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
        );
      }
    });
  };

  // Track scroll progress on reading pane
  useEffect(() => {
    const handleScroll = () => {
      const element = articleContainerRef.current;
      if (!element) return;
      const totalHeight = element.scrollHeight - element.clientHeight;
      if (totalHeight === 0) return;
      const progress = (element.scrollTop / totalHeight) * 100;
      setScrollProgress(progress);
    };

    const container = articleContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeArticleId]);

  // Reset scroll on article change
  useEffect(() => {
    if (articleContainerRef.current) {
      articleContainerRef.current.scrollTop = 0;
    }
  }, [activeArticleId]);

  const handleValidateKey = () => {
    if (!testKey.trim()) {
      setValidationResult({ status: 'invalid', msg: 'Key field is empty.' });
      return;
    }
    const cleanKey = testKey.trim();
    if (cleanKey.startsWith('AIzaSy')) {
      setValidationResult({
        status: 'valid',
        msg: '✅ Syntax matches Google Gemini API format (AIzaSy prefix identified). Ready to connect!'
      });
    } else if (cleanKey.startsWith('gsk_')) {
      setValidationResult({
        status: 'valid',
        msg: '✅ Syntax matches Groq API format (gsk_ prefix identified). Ready to connect!'
      });
    } else if (cleanKey.startsWith('sk-or-')) {
      setValidationResult({
        status: 'valid',
        msg: '✅ Syntax matches OpenRouter API format (sk-or- prefix identified). Ready to connect!'
      });
    } else {
      setValidationResult({
        status: 'invalid',
        msg: '❌ Unrecognized format. Google Gemini keys start with "AIzaSy", Groq with "gsk_", and OpenRouter with "sk-or-".'
      });
    }
  };

  const articles: DocArticle[] = [
    {
      id: 'what-is-folient',
      category: 'getting-started',
      categoryLabel: 'Getting Started',
      title: 'What is Folient?',
      description: 'Introduction to the next-generation Zero-Backend AI portfolio builder.',
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p className="text-[14px]">
            <strong>Folient</strong> is a free, open-source, client-side portfolio compiler. Unlike commercial web builders that impose locked templates, branding tags, and recurring monthly subscription costs, Folient operates entirely in your web browser. 
          </p>
          <p className="text-[14px]">
            By adopting a <strong>Bring Your Own Key (BYOK)</strong> model, Folient lets you interface directly with leading AI APIs (Google Gemini, Groq, OpenRouter) to write, style, and structure professional portfolios matching your instructions.
          </p>
          
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-slate-100 p-6 rounded-2xl relative overflow-hidden my-6 border border-indigo-900">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Core Architectural Pillars
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">1. Zero-Backend Execution:</span>
                <span>All cryptography, layout compilations, database vault mappings, and deployment zip payloads run directly in-memory in your browser tab.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">2. Data Sovereignty:</span>
                <span>You connect your private Supabase storage to store portfolio assets and deploy to your personal Netlify or Vercel accounts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">3. Modular Layout System:</span>
                <span>The compiler regenerates selected layout modules surgically without modifying the surrounding codebase or styling configuration.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'quickstart-guide',
      category: 'getting-started',
      categoryLabel: 'Getting Started',
      title: 'Quickstart Guide',
      description: 'Go from creating a free API key to launching a custom portfolio in minutes.',
      content: (
        <div className="space-y-6 text-slate-700">
          <p className="text-[14px] leading-relaxed">
            Follow these 5 logical phases to generate and host your website instantly:
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl flex gap-3.5 items-start">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
              <div>
                <h4 className="text-sm font-bold text-slate-950">Generate Google Gemini Key</h4>
                <p className="text-xs text-slate-500 leading-normal mt-1">Visit Google AI Studio to fetch a free developer key. This key will authorize prompt completions directly inside the visual canvas.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl flex gap-3.5 items-start">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
              <div>
                <h4 className="text-sm font-bold text-slate-950">Configure Connectors Panel</h4>
                <p className="text-xs text-slate-500 leading-normal mt-1">Open the **Connectors** tab on your Folient dashboard. Paste your Gemini key and click **Save** to lock it securely inside Firestore using client-side AES-256 encryption.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl flex gap-3.5 items-start">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
              <div>
                <h4 className="text-sm font-bold text-slate-950">Choose a Design Template</h4>
                <p className="text-xs text-slate-500 leading-normal mt-1">Open the **Templates** gallery. Click **Use Template** on any of our official wireframes (such as Carbon, Horizon, or Vivid) to inject the initial layout components.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl flex gap-3.5 items-start">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
              <div>
                <h4 className="text-sm font-bold text-slate-950">Prompt & Personalize Layouts</h4>
                <p className="text-xs text-slate-500 leading-normal mt-1">Open the chatbox editor. Ask the assistant to add your profile bio, project catalog, and layout adjustments. Double-click any text on-canvas to refine copy inline.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl flex gap-3.5 items-start">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">5</span>
              <div>
                <h4 className="text-sm font-bold text-slate-950">Deploy to Edge Hosting</h4>
                <p className="text-xs text-slate-500 leading-normal mt-1">Under Connectors, connect Vercel or Netlify. Inside the Editor, tap **Deploy**, claim a customized subdomain, and trigger compilation. Your site goes live instantly!</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'gemini-keys',
      category: 'connectors',
      categoryLabel: 'AI Connectors',
      title: 'Google Gemini Setup',
      description: 'Acquire and configure free Gemini API keys.',
      content: (
        <div className="space-y-6 text-slate-700">
          <p className="text-[14px] leading-relaxed">
            Google Gemini powers the primary generation loops of Folient. To get a free key:
          </p>
          <ol className="list-decimal pl-4 space-y-3 text-sm text-slate-600 leading-relaxed">
            <li>Open <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold">Google AI Studio</a>.</li>
            <li>Click on **Get API key** in the top navigation panel.</li>
            <li>Select **Create API key** and pick or initialize a Google Cloud Project.</li>
            <li>Copy the generated API token character string.</li>
          </ol>

          {/* Embedded YouTube Video for Gemini Keys */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-950">Video Tutorial: How to get Google AI Studio API Key</h4>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
              <iframe
                src="https://www.youtube.com/embed/OAdHg28ROy8"
                title="Google AI Studio Setup Walkthrough"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full object-cover"
              ></iframe>
            </div>
          </div>

          {/* Interactive key validator tool */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-indigo-400 text-indigo-400" />
              Interactive Connector Sandbox
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Paste your key string below to verify its structural integrity before saving it inside your dashboard:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Paste key here (e.g. AIzaSy...)"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2 text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 text-slate-100"
              />
              <button
                onClick={handleValidateKey}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Validate Format
              </button>
            </div>
            {validationResult.status !== 'idle' && (
              <div className={`p-3 rounded-xl text-xs leading-normal ${
                validationResult.status === 'valid' ? 'bg-emerald-950/40 border border-emerald-900 text-emerald-300' : 'bg-rose-950/40 border border-rose-900 text-rose-300'
              }`}>
                {validationResult.msg}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'groq-openrouter',
      category: 'connectors',
      categoryLabel: 'AI Connectors',
      title: 'Groq & OpenRouter Setup',
      description: 'Integrate alternative providers to bypass standard free tier quota thresholds.',
      content: (
        <div className="space-y-6 text-slate-700">
          <p className="text-[14px] leading-relaxed">
            Folient Builder supports alternative model endpoints so you are never locked into a single provider.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Groq Console Setup (Llama 3.3)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Groq delivers lightning-fast token generation. Get a free developer key at <a href="https://console.groq.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">console.groq.com</a>. Save the key in your Connectors tab, and select **Groq (Llama 3)** from the editor select box.
              </p>
              {/* Embedded YouTube Video for Groq */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm max-w-xl">
                <iframe
                  src="https://www.youtube.com/embed/TTG7Uo8lS1M"
                  title="Groq Setup Walkthrough"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full object-cover"
                ></iframe>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                OpenRouter Key Setup (DeepSeek & Gemma 4)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                OpenRouter connects you to a catalog of open-weights models. Create a key at <a href="https://openrouter.ai/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">openrouter.ai</a>. OpenRouter offers free access endpoints for models like DeepSeek-R1 and Gemma-4-31B.
              </p>
              {/* Embedded YouTube Video for OpenRouter */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm max-w-xl">
                <iframe
                  src="https://www.youtube.com/embed/ZELx_OzYAQo"
                  title="OpenRouter Setup Walkthrough"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full object-cover"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'supabase-storage',
      category: 'supabase',
      categoryLabel: 'Supabase Storage',
      title: 'Supabase Media Vault Setup',
      description: 'Configure and authorize public reading buckets in Supabase Storage.',
      content: (
        <div className="space-y-6 text-slate-700">
          <p className="text-[14px] leading-relaxed">
            To make sure portfolio images and media assets load correctly for clients, they must be saved inside a public storage bucket in your personal Supabase account.
          </p>

          {/* Embedded YouTube Video for Supabase */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-950">Video Tutorial: Supabase Storage configuration</h4>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
              <iframe
                src="https://www.youtube.com/embed/DkI0_3U9n8E"
                title="Supabase Storage Setup Walkthrough"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full object-cover"
              ></iframe>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-950">Step 1: Get Access Credentials</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Go to your Supabase Project Dashboard → **Project Settings** → **API**. Copy both the **Project URL** and the **Anon Public Key**, then input them into your Folient connectors configuration.
          </p>

          <h4 className="text-sm font-bold text-slate-950">Step 2: Initialize Public Bucket and CORS Policy</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Go to **Storage** inside your Supabase dashboard and create a new bucket named <code>folient-media</code>. 
          </p>
          
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs space-y-2 leading-normal">
            <h4 className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Required Security Configuration
            </h4>
            <p>1. Make sure to toggle the bucket setting to **Public** so anonymous website visitors can view images.</p>
            <p>2. Set Storage Policies allowing all authenticated users (or anon insert requests if preferred) to write images.</p>
          </div>
        </div>
      )
    },
    {
      id: 'netlify-vercel',
      category: 'deployment',
      categoryLabel: 'Deployment',
      title: 'Netlify & Vercel edge deployment',
      description: 'One-click deployments from client-side code packages.',
      content: (
        <div className="space-y-6 text-slate-700">
          <p className="text-[14px] leading-relaxed">
            Folient compiles and compresses your layout sections in-memory, bypassing deployment servers entirely.
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-950">How the deployment loop works:</h4>
            <ol className="list-decimal pl-4 space-y-3 text-xs text-slate-500 leading-relaxed">
              <li>You request a deployment inside the editor panel.</li>
              <li>Folient queries all active layout sections and forms a single HTML bundle.</li>
              <li>Any referenced local asset URLs are loaded and integrated.</li>
              <li>The HTML file is zipped and pushed directly using your authorized Netlify or Vercel developer tokens.</li>
            </ol>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-700" />
              Troubleshooting Deploy Issues
            </h4>
            <div className="space-y-2 text-xs text-indigo-950 leading-relaxed">
              <p><strong>• Error: Callback Parameters Missing</strong> — Ensure you have linked Vercel Personal Access Tokens (format: <code>vcp_...</code>) or connected Netlify correctly inside the Connector Dashboard tab.</p>
              <p><strong>• Error: Subdomain Taken</strong> — subdomains must be globally unique. Try changing your claimed domain name in the deploy modal popup.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'editor-canvas',
      category: 'editor',
      categoryLabel: 'Editor Guide',
      title: 'Visual Editor & Monaco Sync',
      description: 'Synchronizing code views and visual elements.',
      content: (
        <div className="space-y-6 text-slate-700">
          <p className="text-[14px] leading-relaxed">
            Folient gives you a dual workspace interface:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Visual Mode</h4>
              <p className="text-xs text-slate-500 leading-normal">Hover and click elements on-canvas to edit text inline or adjust typography, spacing presets, and borders inside the Property Editor sidebar.</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Monaco Code View</h4>
              <p className="text-xs text-slate-500 leading-normal">Toggle code view to write HTML/CSS code directly. Edits are synchronized with the visual preview canvas using a debounced 500ms renderer pass.</p>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-950">Useful Keyboard Shortcuts:</h4>
          <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs">
            <div className="grid grid-cols-2 bg-slate-100 p-2.5 font-bold border-b border-slate-150">
              <span>Action</span>
              <span>Shortcut</span>
            </div>
            <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
              <span>Toggle Edit Mode</span>
              <kbd className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] w-fit font-mono">Ctrl + E</kbd>
            </div>
            <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
              <span>Toggle Code View</span>
              <kbd className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] w-fit font-mono">Ctrl + Shift + C</kbd>
            </div>
            <div className="grid grid-cols-2 p-2.5">
              <span>Deselect Element</span>
              <kbd className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] w-fit font-mono">Escape</kbd>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Filter articles based on search query
  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeArticle = articles.find((a) => a.id === activeArticleId) || articles[0];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{user ? 'Dashboard' : 'Home'}</span>
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span className="font-serif text-sm font-bold text-slate-950">Folient Docs</span>
          </div>
        </div>

        {/* Right Search & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-100/80 border border-slate-200/50 rounded-xl py-1.5 pl-9 pr-4 text-xs w-48 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-950/5 focus:bg-white transition-all"
            />
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white sm:hidden text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Scroll Progress Bar */}
        <div
          className="absolute bottom-0 left-0 h-[2.5px] bg-[#111111] transition-all duration-100 ease-out z-45 origin-left"
          style={{ width: `${scrollProgress}%` }}
        />
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Navigation - Sticky on desktop, overlay on mobile */}
        <aside
          className={`absolute sm:relative inset-y-0 left-0 w-66 bg-white border-r border-slate-200 py-6 px-4 z-20 shrink-0 transform transition-transform duration-300 sm:transform-none ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
          }`}
        >
          <div className="flex flex-col gap-6 h-full">
            
            {/* Search Input for Mobile */}
            <div className="relative sm:hidden">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 border border-slate-200/50 rounded-xl py-2 pl-9 pr-4 text-xs"
              />
            </div>

            {/* Sidebar Categories */}
            <nav className="flex-1 overflow-y-auto space-y-6 pr-1 select-none">
              
              {/* Group articles by category */}
              {Array.from(new Set(filteredArticles.map((a) => a.category))).map((categoryKey) => {
                const categoryLabel = filteredArticles.find((a) => a.category === categoryKey)?.categoryLabel || '';
                const categoryArticles = filteredArticles.filter((a) => a.category === categoryKey);

                return (
                  <div key={categoryKey} className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5">
                      {categoryLabel}
                    </h4>
                    <div className="space-y-1">
                      {categoryArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleArticleSelect(article.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border-none transition-all cursor-pointer gsap-sidebar-item ${
                            activeArticleId === article.id
                              ? 'bg-slate-950 text-white shadow-md'
                              : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                          }`}
                        >
                          <span className="truncate">{article.title}</span>
                          <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeArticleId === article.id ? 'text-white' : 'text-slate-450'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredArticles.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 font-medium leading-normal">
                  No articles match your search criteria.
                </div>
              )}
            </nav>
            
            {/* Project Footer Credits */}
            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-normal px-2">
              <p>© 2026 Folient Builder.</p>
              <p>MIT License • Open Source</p>
            </div>

          </div>
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs z-10 sm:hidden"
          />
        )}

        {/* Content Reading View */}
        <main
          ref={articleContainerRef}
          className="flex-1 overflow-y-auto px-6 py-12 md:px-16 md:py-16 bg-white transition-all duration-300"
        >
          <div ref={articleContentRef} className="max-w-2xl mx-auto space-y-8 gsap-article-entrance opacity-0">
            
            {/* Header info */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full w-fit block font-mono">
                {activeArticle.categoryLabel}
              </span>
              <h1 className="text-3xl md:text-5xl font-normal font-serif text-slate-950 tracking-tight leading-tight">
                {activeArticle.title}
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {activeArticle.description}
              </p>
            </div>

            {/* Content Divider */}
            <div className="h-px bg-slate-100"></div>

            {/* Article Body */}
            <article className="prose prose-slate max-w-none prose-sm leading-relaxed text-slate-800">
              {activeArticle.content}
            </article>

            {/* Helpful Feedback Block */}
            <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-12">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-950">Was this guide helpful?</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Your feedback helps improve our open-source documentation.</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-slate-100 hover:bg-slate-200/60 text-slate-800 border-none px-4.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs">Yes</button>
                <button className="bg-slate-100 hover:bg-slate-200/60 text-slate-800 border-none px-4.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs">No</button>
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
