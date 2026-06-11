import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useSEO } from '../hooks/useSEO';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { 
  ArrowRight,
  Layers, 
  Terminal, 
  Activity, 
  FileCode, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  Search 
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: "Is Folient really free?",
    a: "Yes. Folient is a free, open-source client-side application. You just need to bring your own API keys (Google AI Studio, Groq, or OpenRouter) to power the generation. There are no subscription fees or locked premium tiers."
  },
  {
    q: "Are my API keys safe?",
    a: "Completely. Your keys are processed strictly inside your browser. In the final version, they are encrypted client-side using AES-256-GCM prior to being saved in your Firebase Firestore document, making them inaccessible to anyone but you."
  },
  {
    q: "How do I deploy my portfolio?",
    a: "With one click! Folient generates a self-contained HTML file which is packed and deployed directly to Netlify or Vercel via their public REST APIs. You can also export the ZIP or single HTML file to host it on your own server."
  },
  {
    q: "Can I export the raw code?",
    a: "Yes. Every portfolio generated is compiled into a single HTML file with inline CSS (Tailwind styles) and JS. You can download the file directly, copy the code via the editor pane, or host it anywhere."
  },
  {
    q: "Do I need a backend server?",
    a: "No. Folient utilizes a Zero-Backend Architecture. Database records are stored in browser IndexedDB, media is uploaded directly to your personal Supabase bucket, and deployments are executed client-side via APIs."
  },
  {
    q: "What AI models are supported?",
    a: "Folient supports Google Gemini (e.g. gemini-2.0-flash), Groq (e.g. Llama 3), and OpenRouter models. You can easily switch models dynamically in the editor chatbox."
  }
];

interface PromptTheme {
  id: 'dev' | 'agency' | 'bento' | 'cv';
  name: string;
  prompt: string;
  avatarInitials: string;
  fullName: string;
  role: string;
  bio: string;
  tags: string[];
  netlifyUrl: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  accentPulse: string;
  accentBadge: string;
  activeBtnClass: string;
}

const PROMPT_THEMES: PromptTheme[] = [
  {
    id: 'dev',
    name: 'Systems Resume',
    prompt: 'Design a clean systems engineer portfolio in slate theme with compiler logs.',
    avatarInitials: 'AR',
    fullName: 'Alex Rivera',
    role: 'Systems & Frontend Engineer',
    bio: 'Building compilers in Rust and high-performance WebAssembly engines in React.',
    tags: ['Rust', 'React', 'WASM'],
    netlifyUrl: 'alex-rivera.netlify.app',
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-50/70',
    accentBorder: 'border-emerald-200/60',
    accentPulse: 'bg-emerald-500',
    accentBadge: 'bg-emerald-100',
    activeBtnClass: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700'
  },
  {
    id: 'agency',
    name: 'Creative Agency',
    prompt: 'Create a bold typography showcase layout for an interactive design studio.',
    avatarInitials: 'VS',
    fullName: 'Vivid Studio',
    role: 'Creative WebGL Studio',
    bio: 'Crafting award-winning WebGL interfaces, custom shaders, and spatial web graphics.',
    tags: ['WebGL', 'Three.js', 'GSAP'],
    netlifyUrl: 'vivid-studio.netlify.app',
    accentText: 'text-rose-600',
    accentBg: 'bg-rose-50/70',
    accentBorder: 'border-rose-200/60',
    accentPulse: 'bg-rose-500',
    accentBadge: 'bg-rose-100',
    activeBtnClass: 'bg-rose-600 hover:bg-rose-700 border-rose-700'
  },
  {
    id: 'bento',
    name: 'Bento Portfolio',
    prompt: 'Build a gapless bento-grid developer profile showing metrics and tags.',
    avatarInitials: 'KT',
    fullName: 'Kaito Tanaka',
    role: 'Product Designer & Dev',
    bio: 'Designing spatial layouts at the intersection of aesthetic code and raw physics.',
    tags: ['Figma', 'Next.js', 'Tailwind'],
    netlifyUrl: 'kaito-design.netlify.app',
    accentText: 'text-indigo-600',
    accentBg: 'bg-indigo-50/70',
    accentBorder: 'border-indigo-200/60',
    accentPulse: 'bg-indigo-500',
    accentBadge: 'bg-indigo-100',
    activeBtnClass: 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700'
  },
  {
    id: 'cv',
    name: 'Backend CV',
    prompt: 'Design a minimal distributed systems CV detailing gRPC and Kubernetes APIs.',
    avatarInitials: 'ER',
    fullName: 'Elena Rostova',
    role: 'Backend Architect',
    bio: 'Designing fault-tolerant consensus systems, distributed databases, and gRPC microservices.',
    tags: ['Go', 'Kubernetes', 'gRPC'],
    netlifyUrl: 'elena-codes.netlify.app',
    accentText: 'text-amber-600',
    accentBg: 'bg-amber-50/70',
    accentBorder: 'border-amber-200/60',
    accentPulse: 'bg-amber-500',
    accentBadge: 'bg-amber-100',
    activeBtnClass: 'bg-amber-600 hover:bg-amber-700 border-amber-700'
  }
];



// Process steps structure with custom interactive previews
const STEPS = [
  {
    idx: 0,
    num: "01",
    title: "Setup API Key",
    desc: "Connect your Google AI Studio, Groq, or OpenRouter credentials safely. The generation logic executes entirely in your local browser sandbox.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    preview: (activeTheme: PromptTheme, hoveredStep: number | null) => (
      <div className="h-24 bg-slate-50/50 rounded-2xl border border-slate-100 p-3 flex flex-col justify-center gap-1.5 relative overflow-hidden group-hover:bg-slate-100/30 transition-colors duration-300">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>SECURE_SANDBOX</span>
          <span className={`flex items-center gap-1 font-bold ${
            hoveredStep === 0 
              ? activeTheme.id === 'dev' ? 'text-emerald-500' 
                : activeTheme.id === 'agency' ? 'text-rose-500' 
                : activeTheme.id === 'bento' ? 'text-indigo-500' 
                : 'text-amber-500'
              : 'text-emerald-500'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> AES-256
          </span>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-[10px] font-mono flex items-center justify-between shadow-xs">
          <span className="text-slate-300 select-none">••••••••••••••••••••</span>
          <span className="text-slate-400 text-xs">🔑</span>
        </div>
      </div>
    )
  },
  {
    idx: 1,
    num: "02",
    title: "Prompt Builder",
    desc: "Type your requirements or select template styles. The local AI agent translates your specifications and compiles clean, responsive layout code.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
    preview: (activeTheme: PromptTheme) => (
      <div className="h-24 bg-slate-50/50 rounded-2xl border border-slate-100 p-3 flex flex-col justify-between relative overflow-hidden group-hover:bg-slate-100/30 transition-colors duration-300">
        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${
            activeTheme.id === 'dev' ? 'bg-emerald-500' : activeTheme.id === 'agency' ? 'bg-rose-500' : activeTheme.id === 'bento' ? 'bg-indigo-500' : 'bg-amber-500'
          }`}></span>
          <span>compiler.ts</span>
        </div>
        <div className="text-[10.5px] font-mono text-slate-800 leading-normal pl-1">
          <span>&gt; Design </span>
          <span className={`font-bold underline decoration-wavy ${
            activeTheme.id === 'dev' ? 'text-emerald-600 decoration-emerald-300' 
              : activeTheme.id === 'agency' ? 'text-rose-600 decoration-rose-300' 
              : activeTheme.id === 'bento' ? 'text-indigo-600 decoration-indigo-300' 
              : 'text-amber-600 decoration-amber-300'
          }`}>
            {activeTheme.id === 'dev' && "systems profile"}
            {activeTheme.id === 'agency' && "creative studio"}
            {activeTheme.id === 'bento' && "bento show grid"}
            {activeTheme.id === 'cv' && "distributed cv"}
          </span>
          <span className="animate-pulse ml-0.5">|</span>
        </div>
        <div className="flex justify-between text-[8px] text-slate-400 font-mono">
          <span>MODEL_READY</span>
          <span>tokens: 384</span>
        </div>
      </div>
    )
  },
  {
    idx: 2,
    num: "03",
    title: "Refine Workspace",
    desc: "Fine-tune widgets, edit code block styling, and test responsiveness in real-time. Instantly switch colors, typography themes, and custom copy.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    preview: (activeTheme: PromptTheme, hoveredStep: number | null) => (
      <div className="h-24 bg-slate-50/50 rounded-2xl border border-slate-100 p-3 flex flex-col justify-between relative overflow-hidden group-hover:bg-slate-100/30 transition-colors duration-300">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>LAYOUT_VIEW</span>
          <span className={activeTheme.accentText}>responsive</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 flex-1 mt-1.5">
          <div className="col-span-2 bg-white border border-slate-150 rounded-lg p-1.5 flex flex-col justify-between shadow-xs transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            <div className={`w-6 h-1 rounded-full ${
              activeTheme.id === 'dev' ? 'bg-emerald-400' : activeTheme.id === 'agency' ? 'bg-rose-400' : activeTheme.id === 'bento' ? 'bg-indigo-400' : 'bg-amber-400'
            }`}></div>
            <div className="w-10 h-1 bg-slate-100 rounded-full"></div>
          </div>
          <div className={`col-span-1 border rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            hoveredStep === 2 
              ? activeTheme.id === 'dev' ? 'bg-emerald-500/10 border-emerald-200 text-emerald-600 scale-105' 
                : activeTheme.id === 'agency' ? 'bg-rose-500/10 border-rose-200 text-rose-600 scale-105' 
                : activeTheme.id === 'bento' ? 'bg-indigo-500/10 border-indigo-200 text-indigo-600 scale-105' 
                : 'bg-amber-500/10 border-amber-200 text-amber-600 scale-105'
              : 'bg-slate-100/80 border-slate-200 text-slate-400'
          }`}>
            +
          </div>
        </div>
      </div>
    )
  },
  {
    idx: 3,
    num: "04",
    title: "Deploy with One Tap",
    desc: "Launch instantly on Netlify or Vercel Edge networks via developer REST APIs. Or export the compiled, dependency-free HTML bundle in one click.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    preview: (activeTheme: PromptTheme, hoveredStep: number | null) => (
      <div className="h-24 bg-slate-50/50 rounded-2xl border border-slate-100 p-3 flex flex-col justify-between relative overflow-hidden group-hover:bg-slate-100/30 transition-colors duration-300">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>DEPLOYMENT</span>
          <span className={`font-bold flex items-center gap-1 ${
            hoveredStep === 3 
              ? activeTheme.id === 'dev' ? 'text-emerald-500' 
                : activeTheme.id === 'agency' ? 'text-rose-500' 
                : activeTheme.id === 'bento' ? 'text-indigo-500' 
                : 'text-amber-500'
              : 'text-emerald-500'
          }`}>
            <span>✓</span> LIVE
          </span>
        </div>
        <div className="space-y-1.5 mb-1">
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 origin-left ${
              hoveredStep === 3 
                ? activeTheme.id === 'dev' ? 'bg-emerald-500 w-full' 
                  : activeTheme.id === 'agency' ? 'bg-rose-500 w-full' 
                  : activeTheme.id === 'bento' ? 'bg-indigo-500 w-full' 
                  : 'bg-amber-500 w-full'
                : 'bg-slate-300 w-2/3'
            }`}></div>
          </div>
          <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono">
            <span className="truncate max-w-[140px]">{activeTheme.netlifyUrl}</span>
            <span>9ms ttfb</span>
          </div>
        </div>
      </div>
    )
  }
];

export default function Home() {
  const { user } = useAuthStore();
  const [designCount, setDesignCount] = useState(12458);

  useSEO({
    title: 'Home',
    description: 'Build premium, high-performance portfolios and developer resumes with Folient. Compile interactive layouts and bento grids with zero backend.',
    canonicalPath: '/',
  });


  useEffect(() => {
    const interval = setInterval(() => {
      setDesignCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(0);
  const [prevFaqSearch, setPrevFaqSearch] = useState(faqSearch);

  if (faqSearch !== prevFaqSearch) {
    setPrevFaqSearch(faqSearch);
    setActiveFaqIdx(null);
  }


  const filteredFaqs = FAQ_ITEMS.filter(item => 
    item.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    item.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Simulation state machine for interactive bento showcase
  const [selectedThemeId, setSelectedThemeId] = useState<'dev' | 'agency' | 'bento' | 'cv'>('dev');
  const [targetThemeId, setTargetThemeId] = useState<'dev' | 'agency' | 'bento' | 'cv'>('dev');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const activeTheme = PROMPT_THEMES.find(t => t.id === (isSimulating ? targetThemeId : selectedThemeId)) || PROMPT_THEMES[0];

  // Scroll and Stepper states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((currentScrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Animation Refs
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);
  const heroTechRef = useRef<HTMLDivElement>(null);
  const heroPromptRef = useRef<HTMLDivElement>(null);
  const heroPillsRef = useRef<HTMLDivElement>(null);
  
  const leftCrystalRef = useRef<HTMLDivElement>(null);
  const rightCrystalRef = useRef<HTMLDivElement>(null);

  const showcaseContainerRef = useRef<HTMLDivElement>(null);
  const featuresContainerRef = useRef<HTMLDivElement>(null);
  const faqContainerRef = useRef<HTMLDivElement>(null);
  const faqBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const faqIconRefs = useRef<(SVGSVGElement | null)[]>([]);
  const newsletterContainerRef = useRef<HTMLDivElement>(null);

  const worksContainerRef = useRef<HTMLDivElement>(null);
  const worksSvgPathRef = useRef<SVGPathElement>(null);
  const stepCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 1. Hero Section load-in animations with custom snappy timings
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    if (heroTitleRef.current) {
      heroTl.fromTo(heroTitleRef.current, 
        { opacity: 0, y: 35 }, 
        { opacity: 1, y: 0, duration: 0.6 }
      );
    }
    if (heroSubtitleRef.current) {
      heroTl.fromTo(heroSubtitleRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.45"
      );
    }
    if (heroButtonsRef.current) {
      heroTl.fromTo(heroButtonsRef.current.children, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
        "-=0.4"
      );
    }
    if (heroTechRef.current) {
      heroTl.fromTo(heroTechRef.current, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.35"
      );
    }
    if (heroPromptRef.current) {
      heroTl.fromTo(heroPromptRef.current, 
        { opacity: 0, y: 20, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
        "-=0.4"
      );
    }
    if (heroPillsRef.current) {
      heroTl.fromTo(heroPillsRef.current.children, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 },
        "-=0.4"
      );
    }

    // 2. Crystal Scroll Parallax (hardware accelerated 3D translations)
    const crystalTweens: gsap.core.Tween[] = [];
    if (leftCrystalRef.current) {
      const t1 = gsap.to(leftCrystalRef.current, {
        y: 160,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        }
      });
      crystalTweens.push(t1);
    }
    if (rightCrystalRef.current) {
      const t2 = gsap.to(rightCrystalRef.current, {
        y: -120,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        }
      });
      crystalTweens.push(t2);
    }

    // 3. Bento Showcase 3D Staggered Entrance
    let bentoTween: gsap.core.Tween | null = null;
    if (showcaseContainerRef.current) {
      const cells = showcaseContainerRef.current.querySelectorAll('.gsap-bento-cell');
      bentoTween = gsap.fromTo(cells, 
        { opacity: 0, y: 45, scale: 0.96, rotationX: -8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: showcaseContainerRef.current,
            start: "top 78%",
            end: "top 38%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    // 4. Features Section Wave Entrance
    let featuresTween: gsap.core.Tween | null = null;
    if (featuresContainerRef.current) {
      const cards = featuresContainerRef.current.querySelectorAll('.gsap-feature-card');
      featuresTween = gsap.fromTo(cards, 
        { opacity: 0, y: 35, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresContainerRef.current,
            start: "top 78%",
            end: "top 48%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    // 5. Timeline Path Scroll drawing
    let pathTween: gsap.core.Tween | null = null;
    if (worksContainerRef.current && worksSvgPathRef.current) {
      const path = worksSvgPathRef.current;
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      pathTween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: worksContainerRef.current,
          start: "top 35%",
          end: "bottom 75%",
          scrub: 0.5,
        },
      });
    }

    // 6. Stepper Bubbles glow & scale
    const bubbleTweens: gsap.core.Tween[] = [];
    if (worksContainerRef.current) {
      const bubbles = worksContainerRef.current.querySelectorAll('.gsap-step-bubble');
      bubbles.forEach((bubble) => {
        const activeColor = activeTheme.id === 'dev' ? '#22C55E' 
          : activeTheme.id === 'agency' ? '#F43F5E' 
          : activeTheme.id === 'bento' ? '#6366F1' 
          : '#F59E0B';
          
        const activeGlow = activeTheme.id === 'dev' ? 'rgba(34, 197, 94, 0.35)' 
          : activeTheme.id === 'agency' ? 'rgba(244, 63, 94, 0.35)' 
          : activeTheme.id === 'bento' ? 'rgba(99, 102, 241, 0.35)' 
          : 'rgba(245, 158, 11, 0.35)';

        const tween = gsap.fromTo(bubble, 
          { scale: 1, backgroundColor: '#0f172a', borderColor: '#ffffff', color: '#ffffff', boxShadow: '0 0 0 rgba(0,0,0,0)' },
          {
            scale: 1.12,
            backgroundColor: activeColor,
            borderColor: activeColor,
            color: '#ffffff',
            boxShadow: `0 0 20px ${activeGlow}`,
            scrollTrigger: {
              trigger: bubble,
              start: "top 55%",
              end: "top 35%",
              toggleActions: "play none none reverse",
            }
          }
        );
        bubbleTweens.push(tween);
      });
    }

    // 7. Timeline Cards slide & fade
    const cardTweens: gsap.core.Tween[] = [];
    stepCardRefs.current.forEach((card) => {
      if (!card) return;
      const tween = gsap.fromTo(card,
        { opacity: 0, y: 35, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 60%",
            toggleActions: "play none none reverse",
          }
        }
      );
      cardTweens.push(tween);
    });

    // 8. FAQ Entrance
    let faqHeaderTween: gsap.core.Tween | null = null;
    let faqItemsTween: gsap.core.Tween | null = null;
    if (faqContainerRef.current) {
      const faqHeader = faqContainerRef.current.querySelector('.gsap-faq-header');
      const faqItems = faqContainerRef.current.querySelectorAll('.gsap-faq-item');
      
      if (faqHeader) {
        faqHeaderTween = gsap.fromTo(faqHeader, 
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: faqHeader,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }
      if (faqItems.length > 0) {
        faqItemsTween = gsap.fromTo(faqItems,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            scrollTrigger: {
              trigger: faqContainerRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }
    }

    // 9. Newsletter Entrance
    let newsletterTimeline: gsap.core.Timeline | null = null;
    if (newsletterContainerRef.current) {
      const card = newsletterContainerRef.current.querySelector('.newsletter-card');
      const staggers = newsletterContainerRef.current.querySelectorAll('.newsletter-stagger');
      
      if (card) {
        newsletterTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: newsletterContainerRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          }
        });

        newsletterTimeline.fromTo(card,
          { opacity: 0, y: 45, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power3.out" }
        );

        if (staggers.length > 0) {
          newsletterTimeline.fromTo(staggers,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
            "-=0.4"
          );
        }
      }
    }

    // Cleanup all GSAP animations and triggers
    return () => {
      heroTl.kill();
      crystalTweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
      if (bentoTween) { bentoTween.scrollTrigger?.kill(); bentoTween.kill(); }
      if (featuresTween) { featuresTween.scrollTrigger?.kill(); featuresTween.kill(); }
      if (pathTween) { pathTween.scrollTrigger?.kill(); pathTween.kill(); }
      bubbleTweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
      cardTweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
      if (faqHeaderTween) { faqHeaderTween.scrollTrigger?.kill(); faqHeaderTween.kill(); }
      if (faqItemsTween) { faqItemsTween.scrollTrigger?.kill(); faqItemsTween.kill(); }
      if (newsletterTimeline) { newsletterTimeline.scrollTrigger?.kill(); newsletterTimeline.kill(); }
    };
  }, [activeTheme]);

  // Clean up refs mapping when search query updates
  useEffect(() => {
    faqBodyRefs.current = [];
    faqIconRefs.current = [];
  }, [faqSearch]);

  // GSAP FAQ accordion smooth height expansion and icon rotation
  useEffect(() => {
    filteredFaqs.forEach((_, idx) => {
      const bodyEl = faqBodyRefs.current[idx];
      const iconEl = faqIconRefs.current[idx];
      const isOpen = activeFaqIdx === idx;

      if (bodyEl) {
        if (isOpen) {
          gsap.to(bodyEl, {
            height: 'auto',
            opacity: 1,
            marginTop: 16,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          gsap.to(bodyEl, {
            height: 0,
            opacity: 0,
            marginTop: 0,
            duration: 0.35,
            ease: 'power2.inOut',
            overwrite: 'auto'
          });
        }
      }

      if (iconEl) {
        gsap.to(iconEl, {
          rotate: isOpen ? 135 : 0,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });
  }, [activeFaqIdx, filteredFaqs]);



  const runSimulation = (themeId: 'dev' | 'agency' | 'bento' | 'cv') => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(0);
    setTargetThemeId(themeId);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const timers = [
      setTimeout(() => setSimulationStep(1), 350),
      setTimeout(() => setSimulationStep(2), 700),
      setTimeout(() => setSimulationStep(3), 1050),
      setTimeout(() => {
        setSelectedThemeId(targetThemeId);
        setIsSimulating(false);
      }, 1300)
    ];

    return () => timers.forEach(clearTimeout);
  }, [isSimulating, targetThemeId]);



  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitting(true);
    try {
      await addDoc(collection(db, 'community/newsletter/subscribers'), {
        email: newsletterEmail,
        timestamp: Date.now()
      });
      alert('Success! Thank you for subscribing to Folient updates.');
      setNewsletterEmail('');
    } catch (error: unknown) {
      console.error('Newsletter Error:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      alert(`Subscription failed: ${errMsg || 'Firestore write error'}`);
    } finally {
      setNewsletterSubmitting(false);
    }
  };



  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 8;
    const rotateY = (x / rect.width) * 8;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    el.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.08)';
    el.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.boxShadow = '';
    el.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans relative overflow-x-hidden pt-20">
      {/* Floating Glassmorphic Header */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 bg-white/75 backdrop-blur-md border border-slate-200/45 rounded-2xl py-3 px-6 md:px-8 flex items-center justify-between shadow-sm shadow-slate-100/50 transition-all duration-300 overflow-hidden">
        {/* Left Brand */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Folient Logo" className="w-5.5 h-5.5 object-contain shrink-0" />
          <span className="text-[#111111] text-xs md:text-[13px] font-semibold flex items-center gap-1.5">
            <span className="text-slate-300 font-light">/</span>
            <span>hello@folient.io</span>
          </span>
        </div>
        
        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 tracking-tight">
          <a href="#showcase" className="hover:text-slate-900 hover:bg-slate-50/80 px-3 py-1.5 rounded-lg transition-all">Showcase</a>
          <span className="text-slate-200 text-[6px] select-none">•</span>
          <a href="#features" className="hover:text-slate-900 hover:bg-slate-50/80 px-3 py-1.5 rounded-lg transition-all">Features</a>
          <span className="text-slate-200 text-[6px] select-none">•</span>
          <a href="#how-it-works" className="hover:text-slate-900 hover:bg-slate-50/80 px-3 py-1.5 rounded-lg transition-all">How It Works</a>
          <span className="text-slate-200 text-[6px] select-none">•</span>
          <a href="#faq" className="hover:text-slate-900 hover:bg-slate-50/80 px-3 py-1.5 rounded-lg transition-all">FAQ</a>
        </nav>

        {/* Right Authentication */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="bg-slate-950 hover:bg-black text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors px-2.5 py-1.5">
                Log In
              </Link>
              <Link to="/auth" className="bg-slate-950 hover:bg-black text-white rounded-xl px-4.5 py-2 text-xs font-bold transition-all shadow-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Floating Scroll Progress Indicator */}
        <div 
          className="absolute bottom-0 left-0 h-[2.5px] bg-[#111111] transition-all duration-100 ease-out z-50 origin-left"
          style={{ width: `${scrollProgress}%` }}
        />
      </header>

      {/* Floating Iridescent Crystals with Scroll Parallax wrapper */}
      <div 
        ref={leftCrystalRef}
        className="absolute left-[-100px] md:left-[-140px] top-[180px] w-[260px] md:w-[360px] pointer-events-none select-none z-10"
      >
        <img 
          src="/crystal.png" 
          alt="" 
          className="w-full h-auto opacity-90 animate-float-left"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div 
        ref={rightCrystalRef}
        className="absolute right-[-90px] md:right-[-120px] top-[220px] w-[200px] md:w-[280px] pointer-events-none select-none z-10"
      >
        <img 
          src="/crystal.png" 
          alt="" 
          className="w-full h-auto opacity-90 animate-float-right"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 max-w-5xl mx-auto text-center flex flex-col items-center relative z-20">
        {/* Heading */}
        <h1 ref={heroTitleRef} className="opacity-0 text-4xl sm:text-5xl md:text-[54px] lg:text-[62px] font-serif font-normal text-slate-955 leading-[1.1] max-w-4xl mb-6 tracking-tight">
          Introducing Folient: The Ultimate <br /> Portfolio Builder for Modern Developers.
        </h1>

        {/* Subtitle */}
        <p ref={heroSubtitleRef} className="opacity-0 text-sm md:text-[15px] text-[#4B5563] max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Folient compiles, packages, and deploys from every prompt instruction, enhancing speed and Lighthouse performance across your personal platforms.
        </p>

        {/* Action Buttons */}
        <div ref={heroButtonsRef} className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6 opacity-0">
          <button 
            onClick={() => runSimulation(targetThemeId)}
            className="bg-black hover:bg-slate-900 text-white rounded-full px-7 h-12.5 text-xs font-semibold flex items-center gap-2.5 transition-all active:scale-97 cursor-pointer shadow-sm shadow-black/10"
          >
            Watch It Compile Portfolios <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <Link 
            to={user ? "/dashboard" : "/auth"}
            className="bg-transparent hover:bg-slate-50 text-slate-900 border border-slate-350 rounded-full px-7 h-12.5 text-xs font-semibold flex items-center justify-center transition-all active:scale-97"
          >
            Get Started Free
          </Link>
        </div>

        {/* Live Counters */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 mt-2 text-[10px] sm:text-xs font-semibold text-slate-500 bg-slate-50/70 border border-slate-100/80 rounded-2xl py-2.5 px-5 shadow-xs mb-8">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live compiling on Edge: <strong className="text-slate-900 font-bold">{designCount.toLocaleString()}</strong> designs</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div>
            <span>Active Creators: <strong className="text-slate-900 font-bold">1,842</strong> online</span>
          </div>
        </div>

        {/* Powered By Technology Stack Logos */}
        <div ref={heroTechRef} className="opacity-0 text-center mt-4 mb-14">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block mb-5">Trusted by builders at</span>
          <div className="flex flex-col gap-4.5 items-center justify-center">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-slate-700 text-sm tracking-tight font-semibold">
              <span className="font-sans text-base tracking-tighter text-slate-900 font-extrabold flex items-center gap-1.5">
                <svg className="w-4.5 h-4.5 text-[#00D8FF]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="50" cy="50" rx="8" ry="20" stroke="currentColor" strokeWidth="6" transform="rotate(0 50 50)"/>
                  <ellipse cx="50" cy="50" rx="8" ry="20" stroke="currentColor" strokeWidth="6" transform="rotate(60 50 50)"/>
                  <ellipse cx="50" cy="50" rx="8" ry="20" stroke="currentColor" strokeWidth="6" transform="rotate(120 50 50)"/>
                  <circle cx="50" cy="50" r="5" fill="currentColor"/>
                </svg>
                React
              </span>
              <span className="font-sans text-base tracking-tight text-slate-900 font-extrabold flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">▲</span>
                Next.js
              </span>
              <span className="font-sans text-base tracking-tight text-slate-900 font-bold flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#FF3366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 22h20L12 2z"/>
                </svg>
                Vercel
              </span>
              <span className="font-sans text-base tracking-tight text-slate-900 font-black flex items-center gap-1">
                <span className="text-[#38BDF8]">★</span> Tailwind
              </span>
            </div>
            {/* Row 2 */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-slate-700 text-sm tracking-tight font-semibold">
              <span className="font-sans text-sm text-slate-900 tracking-tight font-extrabold flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#FFCA28]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.89 15.55L5.6 4.85c.09-.57.51-1.03 1.07-1.16l8.36-1.93c.5-.12.98.2 1.05.7l1.03 7.82-13.22 5.27z"/>
                  <path d="M19.98 10.45l-1.39 9.38c-.1.66-.69 1.15-1.36 1.12L6.15 20.3c-.47-.02-.87-.34-.96-.8l-.89-4.32 15.68-6.23c.36.19.64.55.7 1.5z"/>
                </svg>
                Firebase
              </span>
              <span className="font-sans text-sm text-slate-900 tracking-tight font-bold flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#3ECF8E]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.36 9.886l-10.44-6a2 2 0 00-2 0l-6.24 3.6a2 2 0 00-1 1.732v7.2a2 2 0 001 1.732l6.24 3.6a2 2 0 002 0l10.44-6a2 2 0 001-1.732v-7.2a2 2 0 00-1-1.732z"/>
                </svg>
                Supabase
              </span>
              <span className="font-sans text-sm text-slate-900 tracking-tight font-black flex items-center gap-1">
                <svg className="w-4.5 h-4.5 text-[#BD34FE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" fill="#FFE600" fillOpacity="0.2"/>
                  <polyline points="12 2 12 22"/>
                  <polyline points="2 8.5 12 15.5 22 8.5"/>
                  <polyline points="2 15.5 12 15.5 22 15.5"/>
                </svg>
                Vite
              </span>
              <span className="font-sans text-sm text-slate-900 tracking-tight font-extrabold flex items-center gap-1">
                <svg className="w-4 h-4 text-[#24292F]" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Prompt Capsule Selector */}
        <div ref={heroPromptRef} className="opacity-0 w-full max-w-2xl mx-auto glass-surface rounded-2xl p-2 mb-4 flex items-center justify-between border border-slate-200/80 shadow-md">
          <input 
            type="text" 
            readOnly
            value={PROMPT_THEMES.find(t => t.id === targetThemeId)?.prompt || ""}
            className="bg-transparent border-none text-slate-700 text-xs md:text-sm font-medium px-4 flex-1 outline-none cursor-default truncate"
          />
          <button 
            onClick={() => runSimulation(targetThemeId)}
            disabled={isSimulating}
            className={`rounded-xl text-xs px-5 h-9 shrink-0 flex items-center gap-1.5 shadow-sm text-white font-medium transition-colors ${activeTheme.activeBtnClass}`}
          >
            {isSimulating ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> Compiling...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Generate
              </>
            )}
          </button>
        </div>

        {/* Prompt Pills Selector */}
        <div ref={heroPillsRef} className="flex flex-wrap gap-2 items-center justify-center mb-4">
          {PROMPT_THEMES.map(theme => {
            const isActive = targetThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => runSimulation(theme.id)}
                disabled={isSimulating}
                className={`opacity-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isActive 
                    ? `${theme.activeBtnClass} text-white shadow-sm scale-102` 
                    : "bg-white/60 border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                {theme.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Bento Grid Showcase */}
      <section 
        ref={showcaseContainerRef}
        id="showcase" 
        className="max-w-6xl mx-auto px-6 pb-24"
      >
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-slate-950 font-normal tracking-tight mb-4">
            Engineered for Absolute Performance
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Experience the live compiler simulation. Choose a theme below and watch the Zero-Backend AI Agent scaffold and compile code in real-time.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* Widget 1 (Live Preview Canvas) - Col-span 7 */}
          <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className={`gsap-bento-cell opacity-0 col-span-12 lg:col-span-7 bg-white rounded-3xl p-6 border transition-[box-shadow,border-color] duration-300 flex flex-col justify-between overflow-hidden relative shadow-lg shadow-slate-100/40 hover:shadow-xl hover:shadow-slate-200/50 group ${activeTheme.accentBorder}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-200 hover:bg-red-400 transition-colors"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-200 hover:bg-yellow-400 transition-colors"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-200 hover:bg-green-400 transition-colors"></span>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 ml-4 text-[10px] text-slate-400 font-mono gap-1.5 shrink-0">
                  <span className="text-slate-300">🔒</span>
                  <span>localhost:3000 / live-preview</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold tracking-tight px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${activeTheme.accentText} ${activeTheme.accentBg}`}>
                {isSimulating ? (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full animate-ping ${activeTheme.accentPulse}`}></span> compiling...
                  </>
                ) : (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTheme.accentPulse}`}></span> active preview
                  </>
                )}
              </span>
            </div>

            {/* Simulated Live Preview depending on state */}
            {isSimulating ? (
              <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex flex-col items-center justify-center min-h-[180px]">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin"></div>
                    <Sparkles className="w-4 h-4 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-800">
                      {simulationStep === 0 && "Reading prompt configuration..."}
                      {simulationStep === 1 && "Planning markup layouts..."}
                      {simulationStep === 2 && "Compiling Tailwind styles..."}
                      {simulationStep === 3 && "Hot reloading components..."}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {simulationStep === 0 && "Parsing request requirements"}
                      {simulationStep === 1 && "Generating semantic grid trees"}
                      {simulationStep === 2 && "Parsing Tailwind v4 utilities"}
                      {simulationStep === 3 && "Updating preview canvas viewport"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Dev Theme Preview */}
                {activeTheme.id === 'dev' && (
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-6 flex flex-col justify-between transition-all duration-300 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] editor-grid-pattern pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-md">
                          AR
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">{activeTheme.fullName}</h4>
                          <p className="text-[11px] font-mono text-slate-400">{activeTheme.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-5 font-normal">
                        {activeTheme.bio}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-slate-100 relative z-10">
                      <div className="flex gap-1.5">
                        {activeTheme.tags.map(t => (
                          <span key={t} className="text-[10px] font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-500 font-semibold">{t}</span>
                        ))}
                      </div>
                      <button className={`text-[10px] font-semibold text-white rounded-lg px-3.5 py-1.5 transition-all shadow-sm ${activeTheme.activeBtnClass}`}>
                        Contact Me
                      </button>
                    </div>
                  </div>
                )}

                {/* Agency Theme Preview */}
                {activeTheme.id === 'agency' && (
                  <div className="flex-1 rounded-2xl border border-slate-950 bg-slate-950 text-slate-100 p-6 flex flex-col justify-between transition-all duration-300 shadow-md relative overflow-hidden">
                    <div className="absolute top-[-10px] right-[-10px] w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                          VS
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white tracking-wide">{activeTheme.fullName}</h4>
                          <p className="text-[10px] text-rose-500 uppercase tracking-widest font-black font-sans">{activeTheme.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed mb-5 font-light">
                        {activeTheme.bio}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-slate-900 relative z-10">
                      <div className="flex gap-1.5">
                        {activeTheme.tags.map(t => (
                          <span key={t} className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">{t}</span>
                        ))}
                      </div>
                      <button className="text-[10px] font-bold bg-white text-slate-900 rounded-lg px-3.5 py-1.5 hover:bg-slate-100 transition-colors shadow-sm">
                        View Work
                      </button>
                    </div>
                  </div>
                )}

                {/* Bento Theme Preview */}
                {activeTheme.id === 'bento' && (
                  <div className="flex-1 rounded-2xl p-0 flex flex-col justify-between transition-all duration-300 relative">
                    <div className="grid grid-cols-3 gap-2.5 h-full">
                      <div className="col-span-2 border border-slate-100 bg-white rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-lg pointer-events-none"></div>
                        <div>
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-600/10">KT</div>
                          <h4 className="text-xs font-bold text-slate-900 mt-2.5">{activeTheme.fullName}</h4>
                          <p className="text-[9px] font-mono text-slate-400">{activeTheme.role}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-2 leading-relaxed">{activeTheme.bio}</p>
                      </div>
                      
                      <div className="col-span-1 border border-slate-100 bg-slate-950 text-white rounded-2xl p-4 flex flex-col justify-between text-center shadow-sm">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Projects</span>
                        <span className="text-3xl font-black text-indigo-400 tracking-tight my-1">24</span>
                        <span className="text-[8px] text-slate-400 underline hover:text-white transition-colors cursor-pointer">View All</span>
                      </div>
                      
                      <div className="col-span-3 border border-slate-100 bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm">
                        <div className="flex gap-1.5">
                          {activeTheme.tags.map(t => (
                            <span key={t} className="text-[9px] font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-500">{t}</span>
                          ))}
                        </div>
                        <span className="text-[9px] font-bold text-slate-900 underline underline-offset-2 flex items-center gap-0.5 cursor-pointer">Resume.pdf <ExternalLink className="w-2.5 h-2.5" /></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CV Theme Preview */}
                {activeTheme.id === 'cv' && (
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex flex-col justify-between transition-all duration-300 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="border-l-2 border-slate-950 pl-4 relative z-10">
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">{activeTheme.fullName}</h4>
                      <p className="text-[10px] font-mono text-slate-500">{activeTheme.role}</p>
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-light">
                        {activeTheme.bio}
                      </p>
                    </div>
                    
                    <div className="flex gap-1.5 mt-4 pt-4 border-t border-slate-200/50 relative z-10">
                      {activeTheme.tags.map(t => (
                        <span key={t} className="text-[9px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 font-semibold">{t}</span>
                      ))}
                      <span className="ml-auto text-[10px] font-bold text-slate-900 flex items-center gap-0.5 cursor-pointer">CV.pdf <ExternalLink className="w-2.5 h-2.5" /></span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" /> 
                Theme: {activeTheme.id === 'dev' && "Slate Minimalist"}
                {activeTheme.id === 'agency' && "Dark WebGL Bold"}
                {activeTheme.id === 'bento' && "Bento Grid System"}
                {activeTheme.id === 'cv' && "Fault-Tolerant Clean"}
              </span>
              <span className="font-mono text-[10px]">Viewport: Responsive</span>
            </div>
          </div>

          {/* Widget 2 (AI Chat Simulation) - Col-span 5 */}
          <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className="gsap-bento-cell opacity-0 col-span-12 lg:col-span-5 bg-slate-950 border border-slate-900 text-slate-300 font-mono text-xs rounded-3xl p-6 flex flex-col justify-between min-h-[340px] shadow-lg relative group overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" /> AI Agent Compiler
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] text-slate-600 font-bold">gemini-2.0-flash</span>
              </div>
            </div>

            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 text-[11px] leading-relaxed">
              <div>
                <span className="text-[#38BDF8] font-bold">&gt; user.prompt:</span>{" "}
                <span className="text-white italic">"{activeTheme.prompt}"</span>
              </div>
              
              {isSimulating ? (
                <>
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    <span>[1/4] Reading prompt specifications...</span>
                  </div>
                  {simulationStep >= 1 && (
                    <div className={`${activeTheme.accentText} flex items-center gap-1.5`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                      <span>[2/4] Generating grid markup tree...</span>
                    </div>
                  )}
                  {simulationStep >= 2 && (
                    <div className="text-indigo-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                      <span>[3/4] Parsing Tailwind CSS utilities...</span>
                    </div>
                  )}
                  {simulationStep >= 3 && (
                    <div className="text-slate-500 text-[10px] font-mono leading-none pl-4">
                      deploying: netlify cdn edge...
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-slate-500">[AI]: Compiling index.html bundle...</div>
                  <div>
                    <span className="text-emerald-400 font-bold">[Success]:</span>{" "}
                    <span className="text-white font-bold">Single-file bundle built in 14ms (32.4 KB)</span>
                  </div>
                  <div className="text-slate-500 text-[10px] pl-3 border-l border-slate-800 space-y-1">
                    <div>&gt; cdn.deploy --service=netlify</div>
                    <div>&gt; status: 200 OK</div>
                    <div className={activeTheme.accentText}>address: {activeTheme.netlifyUrl}</div>
                  </div>
                </>
              )}
              
              <span className={`w-1.5 h-3.5 inline-block align-middle animate-pulse ml-0.5 ${activeTheme.accentPulse}`}></span>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> edge cdn enabled</span>
              <span className="font-mono text-[9px]">ttfb: 9ms</span>
            </div>
          </div>

          {/* Widget 3 (Telemetry & KPI) - Col-span 4 */}
          <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className="gsap-bento-cell opacity-0 col-span-12 md:col-span-4 bg-white rounded-3xl p-6 border border-slate-150 flex flex-col justify-between shadow-md hover:shadow-lg transition-[box-shadow] duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Optimization</span>
              <Activity className={`w-4 h-4 ${activeTheme.accentText}`} />
            </div>
            
            <div className="my-4 flex items-center gap-6">
              {/* Circular Progress Ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                {/* Outer Ring rotating clockwise */}
                <svg className="absolute w-20 h-20 animate-spin-slow transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={activeTheme.id === 'dev' ? '#10B981' : activeTheme.id === 'agency' ? '#F43F5E' : activeTheme.id === 'bento' ? '#6366F1' : '#F59E0B'}
                    strokeWidth="1.5"
                    strokeDasharray="8 6"
                    opacity="0.6"
                  />
                </svg>
                {/* Inner Ring rotating counter-clockwise */}
                <svg className="absolute w-16 h-16 animate-spin-reverse-slow transform rotate-45" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="13"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="13"
                    fill="none"
                    stroke={activeTheme.id === 'dev' ? '#10B981' : activeTheme.id === 'agency' ? '#F43F5E' : activeTheme.id === 'bento' ? '#6366F1' : '#F59E0B'}
                    strokeWidth="2.5"
                    strokeDasharray={`${isSimulating ? (100 - (3 - simulationStep) * 4) * 0.81 : 81} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-sans font-black text-lg text-slate-900">
                  {isSimulating ? (100 - (3 - simulationStep) * 4) : 100}
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Perfect 100</h4>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Lighthouse metrics</p>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Core Web Vitals</span>
                <span className="text-emerald-600 font-bold">Passed</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal font-light">
                Zero-framework compiled HTML guarantees maximum possible loading speeds.
              </p>
            </div>
          </div>

          {/* Widget 4 (Code Snippet Editor) - Col-span 4 */}
          <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className="gsap-bento-cell opacity-0 col-span-12 md:col-span-4 bg-white rounded-3xl p-6 border border-slate-150 flex flex-col justify-between overflow-hidden shadow-md hover:shadow-lg transition-[box-shadow] duration-300 font-mono text-[11px] text-slate-600">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-[10px] text-slate-400 flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-indigo-500" /> index.html
              </span>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                <span className="w-2 h-2 rounded-full bg-slate-200"></span>
              </div>
            </div>

            <div className="flex-1 bg-slate-50/50 rounded-xl p-3 border border-slate-100 select-none overflow-x-auto relative min-h-[110px]">
              {isSimulating ? (
                <div className="flex items-center justify-center h-full text-[10px] text-slate-400 italic">
                  &lt;!-- recompiling DOM --&gt;
                </div>
              ) : (
                <div className="space-y-1 font-mono text-[10px] leading-relaxed text-slate-500">
                  {activeTheme.id === 'dev' && (
                    <>
                      <div><span className="text-slate-350 select-none">1</span> &lt;<span className="text-blue-600">section</span> <span className="text-amber-600">class</span>=<span className="text-emerald-600">"profile"</span>&gt;</div>
                      <div><span className="text-slate-350 select-none">2</span>   &lt;<span className="text-blue-600">div</span> <span className="text-amber-600">class</span>=<span className="text-emerald-600">"avatar"</span>&gt;AR&lt;/<span className="text-blue-600">div</span>&gt;</div>
                      <div><span className="text-slate-350 select-none">3</span>   &lt;<span className="text-blue-600">h2</span>&gt;Alex Rivera&lt;/<span className="text-blue-600">h2</span>&gt;</div>
                      <div><span className="text-slate-350 select-none">4</span> &lt;/<span className="text-blue-600">section</span>&gt;</div>
                    </>
                  )}
                  {activeTheme.id === 'agency' && (
                    <>
                      <div><span className="text-slate-355 select-none">1</span> &lt;<span className="text-blue-600">main</span> <span className="text-amber-600">class</span>=<span className="text-emerald-600">"studio"</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">2</span>   &lt;<span className="text-blue-600">h1</span>&gt;Vivid Studio&lt;/<span className="text-blue-600">h1</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">3</span>   &lt;<span className="text-blue-600">p</span>&gt;WebGL Creative Work&lt;/<span className="text-blue-600">p</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">4</span> &lt;/<span className="text-blue-600">main</span>&gt;</div>
                    </>
                  )}
                  {activeTheme.id === 'bento' && (
                    <>
                      <div><span className="text-slate-355 select-none">1</span> &lt;<span className="text-blue-600">div</span> <span className="text-amber-600">class</span>=<span className="text-emerald-600">"bento"</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">2</span>   &lt;<span className="text-blue-600">div</span> <span className="text-amber-600">class</span>=<span className="text-emerald-600">"grid col-7"</span>&gt;UI&lt;/<span className="text-blue-600">div</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">3</span>   &lt;<span className="text-blue-600">div</span> <span className="text-amber-600">class</span>=<span className="text-emerald-600">"grid col-5"</span>&gt;Sandbox&lt;/<span className="text-blue-600">div</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">4</span> &lt;/<span className="text-blue-600">div</span>&gt;</div>
                    </>
                  )}
                  {activeTheme.id === 'cv' && (
                    <>
                      <div><span className="text-slate-355 select-none">1</span> &lt;<span className="text-blue-600">article</span> <span className="text-amber-600">class</span>=<span className="text-emerald-600">"cv"</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">2</span>   &lt;<span className="text-blue-600">h1</span>&gt;Elena Rostova&lt;/<span className="text-blue-600">h1</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">3</span>   &lt;<span className="text-blue-600">span</span>&gt;consensus architecture&lt;/<span className="text-blue-600">span</span>&gt;</div>
                      <div><span className="text-slate-355 select-none">4</span> &lt;/<span className="text-blue-600">article</span>&gt;</div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>DOM size: 32 nodes</span>
              <span className="font-bold text-slate-500">Zero CSS dependencies</span>
            </div>
          </div>

          {/* Widget 5 (Deployment Status) - Col-span 4 */}
          <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className="gsap-bento-cell opacity-0 col-span-12 md:col-span-4 bg-white rounded-3xl p-6 border border-slate-150 flex flex-col justify-between shadow-md hover:shadow-lg transition-[box-shadow] duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distribution</span>
              <Globe className="w-4 h-4 text-slate-800" />
            </div>

            <div className="my-3 space-y-2">
              <div className="flex items-center gap-3 text-[11px]">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shadow-sm">N</div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block leading-none">Netlify Edge</span>
                </div>
                <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isSimulating ? "bg-amber-500 animate-pulse" : activeTheme.accentPulse}`}></span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center font-black text-[10px] shadow-xs">V</div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block leading-none">Vercel Edge</span>
                </div>
                <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isSimulating ? "bg-amber-500" : activeTheme.accentPulse}`}></span>
              </div>
            </div>

            <div className="my-3 h-24 bg-slate-50/50 rounded-2xl border border-slate-100 p-2.5 flex items-center justify-between relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left Source Node: Local Compiler */}
                <rect x="10" y="25" width="30" height="30" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
                <circle cx="25" cy="40" r="6" fill={activeTheme.id === 'dev' ? '#10B981' : activeTheme.id === 'agency' ? '#F43F5E' : activeTheme.id === 'bento' ? '#6366F1' : '#F59E0B'} className="animate-pulse" />
                
                {/* Connecting Flow Paths (Dashed Flow Lines) */}
                <path d="M 40 40 L 100 40 Q 110 40 120 25 L 140 25" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M 40 40 L 100 40 Q 110 40 120 55 L 140 55" stroke="#E2E8F0" strokeWidth="2" />
                
                {/* Active Flow Paths that animate */}
                <path 
                  d="M 40 40 L 100 40 Q 110 40 120 25 L 140 25" 
                  stroke={activeTheme.id === 'dev' ? '#10B981' : activeTheme.id === 'agency' ? '#F43F5E' : activeTheme.id === 'bento' ? '#6366F1' : '#F59E0B'} 
                  strokeWidth="2" 
                  strokeDasharray="6 4" 
                  className="animate-dash-flow" 
                  opacity={isSimulating ? "1" : "0.4"}
                />
                <path 
                  d="M 40 40 L 100 40 Q 110 40 120 55 L 140 55" 
                  stroke={activeTheme.id === 'dev' ? '#10B981' : activeTheme.id === 'agency' ? '#F43F5E' : activeTheme.id === 'bento' ? '#6366F1' : '#F59E0B'} 
                  strokeWidth="2" 
                  strokeDasharray="6 4" 
                  className="animate-dash-flow" 
                  opacity={isSimulating ? "1" : "0.4"}
                />

                {/* Right Target Nodes: Netlify / Vercel */}
                {/* Netlify Node */}
                <rect x="140" y="10" width="80" height="26" rx="6" fill="#FFFFFF" stroke="#ECEEF2" strokeWidth="1.5" className="shadow-xs" />
                <text x="165" y="26" fill="#1E293B" fontSize="8" fontWeight="bold" fontFamily="monospace">Netlify</text>
                <circle cx="150" cy="23" r="3" fill="#00AD9F" />
                
                {/* Vercel Node */}
                <rect x="140" y="44" width="80" height="26" rx="6" fill="#FFFFFF" stroke="#ECEEF2" strokeWidth="1.5" className="shadow-xs" />
                <text x="165" y="60" fill="#1E293B" fontSize="8" fontWeight="bold" fontFamily="monospace">Vercel</text>
                <polygon points="150,54 147,60 153,60" fill="#000000" />

                {/* Glowing checkmark indicators */}
                {!isSimulating && (
                  <>
                    <circle cx="210" cy="23" r="4.5" fill="#10B981" />
                    <path d="M 208 23 L 209.5 24.5 L 212 21.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="210" cy="57" r="4.5" fill="#10B981" />
                    <path d="M 208 57 L 209.5 58.5 L 212 55.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
              </svg>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-mono bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl flex items-center justify-between border border-slate-100">
                <span className="truncate max-w-[150px]">{activeTheme.netlifyUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Solutions (Features) Section */}
      <section 
        ref={featuresContainerRef}
        id="features" 
        className="py-24 bg-[#FAF9FB]/60 border-y border-slate-200/40 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-serif text-slate-950 font-normal tracking-tight mb-5">
              Zero-Backend. Uncompromising Speed.
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Folient compiles pure, client-side, zero-database portfolios that score perfect marks in accessibility, speed, and responsiveness.
            </p>
          </div>

          {/* Grid Layout - 4 Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 - Zero Backend */}
            <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className="gsap-feature-card opacity-0 bg-white rounded-2xl p-8 border border-slate-150 shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-[box-shadow,transform] duration-300 flex flex-col justify-between min-h-[240px] group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none transition-all duration-300 group-hover:bg-emerald-500/10"></div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 text-emerald-600 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  <svg className="w-5.5 h-5.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" className="animate-pulse" style={{ animationDelay: '0s' }} />
                    <line x1="10" y1="6" x2="10.01" y2="6" strokeWidth="3" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                    <line x1="10" y1="18" x2="10.01" y2="18" strokeWidth="3" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-955 mb-2">Zero-Backend</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Everything stores locally in browser IndexedDB. Local-first means your data never leaves your browser.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-emerald-600 font-semibold">
                <span>IndexedDB Storage</span>
                <span>100% Client-Side</span>
              </div>
            </div>

            {/* Card 2 - Double Encryption */}
            <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className="gsap-feature-card opacity-0 bg-white rounded-2xl p-8 border border-slate-150 shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-[box-shadow,transform] duration-300 flex flex-col justify-between min-h-[240px] group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none transition-all duration-300 group-hover:bg-rose-500/10"></div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 text-rose-600 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  <svg className="w-5.5 h-5.5 text-rose-600 transition-transform duration-305 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                    <path d="M12 11V7a4 4 0 0 1 8 0v4" className="transition-transform duration-300 group-hover:translate-y-[1px]" />
                    <circle cx="12" cy="16" r="1.5" />
                    <line x1="12" y1="17.5" x2="12" y2="19.5" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-955 mb-2">Double Encryption</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  API credentials are encrypted client-side using AES-256-GCM before syncing to database backups.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-rose-600 font-semibold">
                <span>AES-256-GCM</span>
                <span>Military-Grade</span>
              </div>
            </div>

            {/* Card 3 - Pure HTML Bundling */}
            <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className="gsap-feature-card opacity-0 bg-white rounded-2xl p-8 border border-slate-150 shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-[box-shadow,transform] duration-300 flex flex-col justify-between min-h-[240px] group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none transition-all duration-300 group-hover:bg-indigo-500/10"></div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 text-indigo-600 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  <svg className="w-5.5 h-5.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" className="transition-all duration-350 group-hover:translate-x-1" />
                    <line x1="16" y1="17" x2="8" y2="17" className="transition-all duration-350 group-hover:-translate-x-1" />
                    <circle cx="10" cy="11" r="1.5" fill="currentColor" className="animate-pulse" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-955 mb-2">Pure HTML Bundling</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Compiles markup, styling, and scripting into a single self-contained document file for instant loading.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-indigo-600 font-semibold">
                <span>Single File Bundle</span>
                <span>TTFB &lt; 9ms</span>
              </div>
            </div>

            {/* Card 4 - Multi-Model LLM */}
            <div onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave} className="gsap-feature-card opacity-0 bg-white rounded-2xl p-8 border border-slate-150 shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-[box-shadow,transform] duration-300 flex flex-col justify-between min-h-[240px] group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none transition-all duration-300 group-hover:bg-amber-500/10"></div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 text-amber-600 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  <svg className="w-5.5 h-5.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" className="transition-all duration-300 group-hover:stroke-amber-400" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-955 mb-2">Multi-Model LLM</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Toggle between Gemini, Llama 3, and other providers dynamically for structural layout design.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-amber-600 font-semibold">
                <span>Gemini & Llama 3</span>
                <span>Dynamic Toggle</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Process Section */}
      <section 
        ref={worksContainerRef}
        id="how-it-works" 
        className="py-24 max-w-6xl mx-auto px-6 relative overflow-hidden"
      >
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-serif text-slate-950 font-normal tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Launch your stunning visual portfolio page in four straightforward steps.
          </p>
        </div>

        {/* Desktop View (hidden md:block) */}
        <div className="hidden md:block relative mt-16 max-w-5xl mx-auto min-h-[1150px]">
          
          {/* Winding SVG Track */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[160px] pointer-events-none z-0">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-30">
              <path 
                d="M 50,0 C 10,6.25 10,18.75 50,25 C 90,31.25 90,43.75 50,50 C 10,56.25 10,68.75 50,75 C 90,81.25 90,93.75 50,100" 
                fill="none" 
                stroke="#E2E8F0" 
                strokeWidth="1.5"
              />
            </svg>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0 text-slate-200">
              <path 
                ref={worksSvgPathRef}
                d="M 50,0 C 10,6.25 10,18.75 50,25 C 90,31.25 90,43.75 50,50 C 10,56.25 10,68.75 50,75 C 90,81.25 90,93.75 50,100" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Stepper Bubbles */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[160px] pointer-events-none z-10">
            {/* Bubble 1 */}
            <div 
              className="gsap-step-bubble absolute left-[23.75%] top-[12.5%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0f172a] border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 z-20"
            >
              01
            </div>
            {/* Bubble 2 */}
            <div 
              className="gsap-step-bubble absolute left-[76.25%] top-[37.5%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0f172a] border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 z-20"
            >
              02
            </div>
            {/* Bubble 3 */}
            <div 
              className="gsap-step-bubble absolute left-[23.75%] top-[62.5%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0f172a] border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 z-20"
            >
              03
            </div>
            {/* Bubble 4 */}
            <div 
              className="gsap-step-bubble absolute left-[76.25%] top-[87.5%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0f172a] border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 z-20"
            >
              04
            </div>
          </div>

          {/* Grid Rows for Cards */}
          <div className="space-y-10 relative z-20">
            {STEPS.map((step) => {
              const isEven = step.idx % 2 === 1;
              return (
                <div key={step.idx} className="grid grid-cols-12 items-center min-h-[260px]">
                  {/* Left Column */}
                  <div className={`col-span-5 ${isEven ? 'opacity-0 pointer-events-none select-none' : ''}`}>
                    {!isEven && (
                      <div 
                        ref={el => { stepCardRefs.current[step.idx] = el; }}
                        onMouseEnter={() => setHoveredStep(step.idx)}
                        onMouseLeave={() => setHoveredStep(null)}
                        className={`bg-white rounded-3xl p-6 pt-10 border shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between min-h-[300px] group relative overflow-hidden ${
                          hoveredStep === step.idx 
                            ? activeTheme.id === 'dev' ? 'border-emerald-300 shadow-emerald-50/50' 
                              : activeTheme.id === 'agency' ? 'border-rose-300 shadow-rose-50/50' 
                              : activeTheme.id === 'bento' ? 'border-indigo-300 shadow-indigo-50/50' 
                              : 'border-amber-300 shadow-amber-50/50'
                            : 'border-slate-150'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                              hoveredStep === step.idx ? 'text-slate-900 bg-slate-100' : 'text-slate-400'
                            }`}>
                              {step.icon}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm tracking-tight">{step.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-light">
                            {step.desc}
                          </p>
                        </div>
                        <div className="mt-5">
                          {step.preview(activeTheme, hoveredStep)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Middle Column Spacer */}
                  <div className="col-span-2"></div>

                  {/* Right Column */}
                  <div className={`col-span-5 ${!isEven ? 'opacity-0 pointer-events-none select-none' : ''}`}>
                    {isEven && (
                      <div 
                        ref={el => { stepCardRefs.current[step.idx] = el; }}
                        onMouseEnter={() => setHoveredStep(step.idx)}
                        onMouseLeave={() => setHoveredStep(null)}
                        className={`bg-white rounded-3xl p-6 pt-10 border shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between min-h-[300px] group relative overflow-hidden ${
                          hoveredStep === step.idx 
                            ? activeTheme.id === 'dev' ? 'border-emerald-300 shadow-emerald-50/50' 
                              : activeTheme.id === 'agency' ? 'border-rose-300 shadow-rose-50/50' 
                              : activeTheme.id === 'bento' ? 'border-indigo-300 shadow-indigo-50/50' 
                              : 'border-amber-300 shadow-amber-50/50'
                            : 'border-slate-150'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                              hoveredStep === step.idx ? 'text-slate-900 bg-slate-100' : 'text-slate-400'
                            }`}>
                              {step.icon}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm tracking-tight">{step.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-light">
                            {step.desc}
                          </p>
                        </div>
                        <div className="mt-5">
                          {step.preview(activeTheme, hoveredStep)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile View (block md:hidden) */}
        <div className="block md:hidden relative mt-12 pl-10 space-y-12">
          {/* Vertical progress line */}
          <div className="absolute left-[16px] top-0 bottom-0 w-[2px] bg-slate-200/60 z-0">
            <div 
              className={`h-full transition-all duration-300 ${
                activeTheme.id === 'dev' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' 
                  : activeTheme.id === 'agency' ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E]' 
                  : activeTheme.id === 'bento' ? 'bg-indigo-500 shadow-[0_0_8px_#6366F1]' 
                  : 'bg-amber-500 shadow-[0_0_8px_#F59E0B]'
              }`}
              style={{ height: `${scrollProgress}%` }}
            />
          </div>

          {/* Cards for mobile */}
          {STEPS.map((step) => (
            <div 
              key={step.idx}
              className="bg-white rounded-3xl p-6 pt-10 border border-slate-150 shadow-sm relative z-10"
            >
              {/* Step Bubble */}
              <div className="absolute left-[-24px] top-8 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-xs">
                {step.num}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                    {step.icon}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight">{step.title}</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
              <div className="mt-5">
                {step.preview(activeTheme, null)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Block */}
      <section 
        ref={faqContainerRef}
        id="faq" 
        className="py-28 bg-white/40 border-t border-slate-200/50 relative overflow-hidden"
      >
        {/* Soft background ambient glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full bg-slate-100/40 blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 relative">
          
          {/* Sticky Left Column: Header and Search */}
          <div className="gsap-faq-header opacity-0 md:col-span-5 md:sticky md:top-28 h-fit">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-950 font-normal tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm">
              Have questions about Folient? Find answers to commonly asked questions or filter to find specific topics.
            </p>
            
            {/* Search Input Box */}
            <div className="relative group max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Search questions..." 
                value={faqSearch} 
                onChange={(e) => setFaqSearch(e.target.value)} 
                className="w-full bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl py-3 pl-11 pr-4 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950/5 focus:border-slate-400/80 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Right Column: Accordions */}
          <div className="md:col-span-7 space-y-4">
            {(() => {
              return filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => {
                  const isOpen = activeFaqIdx === index;
                  return (
                    <div 
                      key={index} 
                      className="gsap-faq-item opacity-0 bg-white/50 hover:bg-white/80 border border-slate-200/40 hover:border-slate-200/80 rounded-2xl p-5 hover:shadow-xs transition-all duration-300"
                    >
                      <button 
                        onClick={() => setActiveFaqIdx(isOpen ? null : index)}
                        className="w-full flex justify-between items-start gap-4 text-left focus:outline-hidden group cursor-pointer"
                      >
                        <span className="font-semibold text-slate-900 text-sm md:text-base leading-snug group-hover:text-slate-950 transition-colors">
                          {faq.q}
                        </span>
                        
                        {/* Custom animated plus icon SVG */}
                        <div className="w-6 h-6 rounded-full bg-slate-100/80 flex items-center justify-center group-hover:bg-slate-200/80 transition-colors shrink-0">
                          <svg 
                            ref={el => { if (el) faqIconRefs.current[index] = el; }}
                            className="w-3.5 h-3.5 text-slate-600" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </div>
                      </button>
                      
                      {/* Body container controlled by GSAP height tweens */}
                      <div 
                        ref={el => { if (el) faqBodyRefs.current[index] = el; }}
                        className="overflow-hidden"
                        style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? 16 : 0 }}
                      >
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-100/80 pt-4">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 glass-surface rounded-2xl text-slate-400 text-xs">
                  No matching questions found.
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Newsletter signup & Footer */}
      <section 
        ref={newsletterContainerRef}
        className="py-24 border-t border-slate-200/50 bg-slate-50/50 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          
          {/* Main Newsletter Capsule */}
          <div className="newsletter-card opacity-0 bg-white/40 border border-slate-200/40 rounded-[32px] p-10 md:p-14 max-w-3xl mx-auto mb-20 text-center relative overflow-hidden group hover:bg-white/60 hover:shadow-lg hover:border-slate-200/60 transition-all duration-500">
            
            {/* Ambient Background Aura Orbs */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-125" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-125" />
            
            {/* Interactive SVG Mail Envelope Container */}
            <div className="newsletter-stagger w-20 h-20 rounded-2xl bg-white border border-slate-200/65 shadow-xs mx-auto mb-6 flex items-center justify-center relative overflow-hidden transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1">
              <svg 
                className="w-9 h-9 text-slate-800" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Micro-letter page sliding upwards on hover */}
                <rect 
                  className="transition-transform duration-500 ease-out translate-y-2 group-hover:-translate-y-1.5" 
                  x="5" 
                  y="8" 
                  width="14" 
                  height="10" 
                  rx="1" 
                  fill="white" 
                  stroke="currentColor" 
                  strokeWidth="1.2" 
                />
                <line 
                  className="transition-transform duration-500 ease-out translate-y-2 group-hover:-translate-y-1.5 opacity-60" 
                  x1="8" 
                  y1="11" 
                  x2="16" 
                  y2="11" 
                  stroke="currentColor" 
                  strokeWidth="1.2" 
                />
                <line 
                  className="transition-transform duration-500 ease-out translate-y-2 group-hover:-translate-y-1.5 opacity-60" 
                  x1="8" 
                  y1="14" 
                  x2="13" 
                  y2="14" 
                  stroke="currentColor" 
                  strokeWidth="1.2" 
                />
                
                {/* Envelope Body */}
                <path 
                  d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z" 
                  fill="rgba(248, 250, 252, 0.9)" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                />
                
                {/* Envelope Flap: closed/opened toggled via class animations */}
                <path 
                  className="transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none" 
                  d="M2 6L12 13L22 6" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                />
                <path 
                  className="opacity-0 transition-all duration-300 group-hover:opacity-100" 
                  d="M2 6L12 0L22 6" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                />
              </svg>
            </div>

            <h3 className="text-3xl md:text-5xl font-serif text-slate-950 font-normal tracking-tight mb-4 newsletter-stagger">
              Join the community
            </h3>
            <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed newsletter-stagger">
              Subscribe to get updates on new templates, layout generation features, and core updates.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="newsletter-stagger flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="w-full bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl py-3 px-5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950/5 focus:border-slate-400/80 transition-all shadow-xs"
              />
              <button 
                type="submit" 
                disabled={newsletterSubmitting}
                className="btn-primary rounded-2xl h-12 px-6 text-xs flex items-center justify-center gap-2 group/btn cursor-pointer whitespace-nowrap"
              >
                <span>{newsletterSubmitting ? "Subscribing..." : "Subscribe"}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
            </form>
          </div>

          {/* Detailed multi-column footer */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 text-left pt-16 pb-12 border-t border-slate-200/30 mt-16">
            {/* Brand column */}
            <div className="col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Folient Logo" className="w-5.5 h-5.5 object-contain shrink-0" />
                <span className="text-slate-950 text-sm font-semibold tracking-tight">Folient</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                Zero-backend AI portfolio builder. Turn prompts into responsive React portfolios and host them on edge networks in seconds.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </a>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200/30 text-[10px] font-semibold text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Systems Operational</span>
                </div>
              </div>
            </div>
            
            {/* Product Column */}
            <div className="col-span-1 flex flex-col gap-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Product</span>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-500">
                <li><a href="#showcase" className="hover:text-slate-900 transition-colors">Showcase</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a></li>
                <li><a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Developers Column */}
            <div className="col-span-1 flex flex-col gap-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Developers</span>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-500">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">GitHub Repository</a></li>
                <li><Link to="/docs" className="hover:text-slate-900 transition-colors">Documentation</Link></li>
                <li><Link to="/docs" className="hover:text-slate-900 transition-colors">Self-Hosting Guide</Link></li>
                <li><Link to="/docs" className="hover:text-slate-900 transition-colors">API References</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="col-span-1 flex flex-col gap-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Resources</span>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-500">
                <li><Link to="/docs" className="hover:text-slate-900 transition-colors">AI Studio Keys</Link></li>
                <li><Link to="/docs" className="hover:text-slate-900 transition-colors">Groq Setup</Link></li>
                <li><Link to="/docs" className="hover:text-slate-900 transition-colors">Vercel Deployments</Link></li>
                <li><Link to="/docs" className="hover:text-slate-900 transition-colors">OpenRouter Hub</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="col-span-1 flex flex-col gap-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Company</span>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-500">
                <li><a href="mailto:hello@folient.io" className="hover:text-slate-900 transition-colors">Support Email</a></li>
                <li><Link to="/terms" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">License (MIT)</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-8 border-t border-slate-200/30">
            <span>© 2026 Folient Builder. Open Source under MIT License.</span>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="https://github.com" className="hover:text-slate-900 transition-colors">GitHub</a>
              <a href="#showcase" className="hover:text-slate-900 transition-colors">Showcase</a>
              <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
