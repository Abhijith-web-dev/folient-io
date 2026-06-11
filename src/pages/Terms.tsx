import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Printer, Shield, Scale, HelpCircle, AlertCircle, ChevronRight, Menu, X, CheckCircle, Loader2, Cloud } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { gsap } from 'gsap';
import { useSEO } from '../hooks/useSEO';

interface TermsSection {
  id: string;
  title: string;
  category: 'general' | 'usage' | 'privacy' | 'liability';
  categoryLabel: string;
  content: React.ReactNode;
}

// Cookie Helpers
const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};

export default function Terms() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useSEO({
    title: 'Terms of Service & Privacy',
    description: 'Read the terms of service and compliance rules for Folient. Learn about the zero-backend architecture, bring your own key (BYOK) policy, and Supabase client-side media storage.',
    canonicalPath: '/terms',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('1-introduction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingAcceptance, setIsLoadingAcceptance] = useState(true);
  const [acceptedDetails, setAcceptedDetails] = useState<{
    acceptedAt?: string;
    method?: 'cookie' | 'firestore';
    email?: string;
  } | null>(null);
  const isPrintFriendly = false;

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Compliance Acceptance Check and Synchronization logic
  useEffect(() => {
    const checkLocalAcceptance = () => {
      const cookieAccept = getCookie('folient_terms_accepted') === 'true';
      const localAccept = localStorage.getItem('folient_terms_accepted') === 'true';
      
      if (cookieAccept || localAccept) {
        setHasAccepted(true);
        setAcceptedDetails({
          method: 'cookie',
          acceptedAt: localStorage.getItem('folient_terms_accepted_at') || new Date().toISOString()
        });
        return true;
      }
      return false;
    };

    const checkCloudAcceptance = async () => {
      setIsLoadingAcceptance(true);
      const localDone = checkLocalAcceptance();
      
      if (user) {
        try {
          const docRef = doc(db, 'terms_acceptances', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHasAccepted(true);
            setAcceptedDetails({
              method: 'firestore',
              acceptedAt: data.acceptedAt || new Date().toISOString(),
              email: data.email || user.email || undefined
            });
            // Synchronize local states
            localStorage.setItem('folient_terms_accepted', 'true');
            localStorage.setItem('folient_terms_accepted_at', data.acceptedAt || new Date().toISOString());
            setCookie('folient_terms_accepted', 'true', 365);
          }
        } catch (error) {
          console.error("Error checking cloud terms compliance status:", error);
        }
      } else {
        // If not logged in, rely entirely on local storage compliance state
        if (!localDone) {
          setHasAccepted(false);
          setAcceptedDetails(null);
        }
      }
      setIsLoadingAcceptance(false);
    };

    checkCloudAcceptance();

    const handleUpdate = () => {
      checkCloudAcceptance();
    };

    window.addEventListener('folient_compliance_updated', handleUpdate);
    return () => {
      window.removeEventListener('folient_compliance_updated', handleUpdate);
    };
  }, [user]);

  const handleAcceptanceChange = async (checked: boolean) => {
    if (checked) {
      setIsSyncing(true);
      const now = new Date().toISOString();
      
      // 1. Store in localStorage and Cookies
      localStorage.setItem('folient_terms_accepted', 'true');
      localStorage.setItem('folient_terms_accepted_at', now);
      setCookie('folient_terms_accepted', 'true', 365);
      
      // 2. Synchronize to Firestore if authenticated
      if (user) {
        try {
          const docRef = doc(db, 'terms_acceptances', user.uid);
          await setDoc(docRef, {
            accepted: true,
            acceptedAt: now,
            email: user.email,
            version: '1.0.0',
            userAgent: navigator.userAgent
          });
          setAcceptedDetails({
            method: 'firestore',
            acceptedAt: now,
            email: user.email || undefined
          });
        } catch (error) {
          console.error("Error syncing compliance status to cloud:", error);
        }
      } else {
        setAcceptedDetails({
          method: 'cookie',
          acceptedAt: now
        });
      }
      
      setHasAccepted(true);
      setIsSyncing(false);
    } else {
      // Clear cookies, storage, and reset
      localStorage.removeItem('folient_terms_accepted');
      localStorage.removeItem('folient_terms_accepted_at');
      setCookie('folient_terms_accepted', 'false', -1);
      
      setHasAccepted(false);
      setAcceptedDetails(null);
    }
  };

  // GSAP Intro Entrance Animation
  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.gsap-sidebar-item', 
        { opacity: 0, x: -25 },
        { opacity: 1, x: 0, duration: 0.55, stagger: 0.04 }
      );

      tl.fromTo('.gsap-content-entrance',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65 },
        '-=0.45'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // GSAP Transition on Section Change
  const handleSectionSelect = (id: string) => {
    if (id === activeSectionId) return;

    gsap.to(contentWrapperRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        setActiveSectionId(id);
        setIsMobileMenuOpen(false);

        // Scroll reading pane to top
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }

        gsap.fromTo(contentWrapperRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        );
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const sections: TermsSection[] = [
    {
      id: '1-introduction',
      title: '1. Introduction & Acceptance',
      category: 'general',
      categoryLabel: 'General Terms',
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <p>
            Welcome to <strong>Folient</strong> ("we," "our," or "the Platform"). By accessing our client-side software, utilizing our generated portfolio templates, or connecting third-party API providers, you agree to comply with and be bound by these Terms and Conditions.
          </p>
          <p>
            Folient is a <strong>100% serverless, open-source client-side application</strong>. We do not operate a centralized database for your compiled HTML portfolios. Therefore, you acknowledge that your compliance with these terms is managed entirely via your local browser context.
          </p>
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-950">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs">
              <strong>Agreement Confirmation:</strong> If you do not agree with any part of these terms, you must immediately cease using the application, disconnect your local tokens, and delete your browser IndexedDB cache databases.
            </p>
          </div>
        </div>
      )
    },
    {
      id: '2-user-responsibility',
      title: '2. User Accounts & Firestore',
      category: 'general',
      categoryLabel: 'General Terms',
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <p>
            To save your active API connectors, templates registry parameters, and profile bios, you must sign up for a Folient account using Google OAuth or Email/Password. 
          </p>
          <p>
            All account data is synced directly to a client-scoped Google Firebase Firestore cluster. You are solely responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-500">
            <li>Maintaining the confidentiality of your credentials and linked Google sessions.</li>
            <li>Any activity occurring under your unique Firebase User ID (UID).</li>
            <li>Ensuring that the content uploaded to the Community Showcase does not contain copyrighted, unlawful, or offensive materials.</li>
          </ul>
        </div>
      )
    },
    {
      id: '3-api-keys',
      title: '3. Bring Your Own Key (BYOK) Policy',
      category: 'usage',
      categoryLabel: 'Usage Policy',
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <p>
            Folient is an AI-powered generator operating on a <strong>Bring Your Own Key (BYOK)</strong> architecture. We do not sell AI tokens or charge for code completions.
          </p>
          <h4 className="font-bold text-slate-900">API Key Terms:</h4>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-500">
            <li><strong>Cost Responsibility:</strong> All costs incurred from calls to Google Gemini, Groq, or OpenRouter are billed directly by those respective providers to your developer accounts.</li>
            <li><strong>Encryption Guarantee:</strong> Your keys are encrypted client-side using AES-256-GCM before syncing to Firestore. They are decrypted in-memory only during active sessions.</li>
            <li><strong>API Violations:</strong> You agree not to use Folient to generate malicious scripts, phishing pages, or violate the developer terms of use set by Google, Groq, or OpenRouter.</li>
          </ul>
        </div>
      )
    },
    {
      id: '4-storage-data',
      title: '4. Storage & Media Ownership',
      category: 'privacy',
      categoryLabel: 'Data & Privacy',
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <p>
            All media assets (images, logos, videos) uploaded through the editor are sent directly to your personal <strong>Supabase Storage bucket</strong>.
          </p>
          <h4 className="font-bold text-slate-900">Data Terms:</h4>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-500">
            <li><strong>No Centralized Asset Backups:</strong> Folient does not store or keep backup copies of your assets. If you delete your Supabase bucket or wipe your browser IndexedDB cache, your files and progress are unrecoverable.</li>
            <li><strong>Intellectual Property:</strong> You retain full copyright ownership of all code generated by the AI matching your prompts, as well as all assets uploaded to your portfolio.</li>
          </ul>
        </div>
      )
    },
    {
      id: '5-limitation-liability',
      title: '5. Limitation of Liability',
      category: 'liability',
      categoryLabel: 'Legal & Liability',
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <p>
            The software, templates, and generated outputs are provided on an <strong>"AS IS" and "AS AVAILABLE" basis</strong> without warranty of any kind.
          </p>
          <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl flex items-start gap-3 text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs">
              <strong>Liability Disclaimer:</strong> In no event shall Folient, its core open-source contributors, or partners be liable for any direct, indirect, incidental, or consequential damages (including data loss, hosting suspension by Netlify/Vercel, API key leaks due to device compromised, or AI billing overages).
            </p>
          </div>
        </div>
      )
    },
    {
      id: '6-termination',
      title: '6. Termination of Service',
      category: 'liability',
      categoryLabel: 'Legal & Liability',
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <p>
            You may terminate this agreement at any time by deleting your account from the dashboard, wiping your browser local storage cache, and deleting your configured API keys.
          </p>
          <p>
            We reserve the right to suspend or block access to the Community Showcase features for accounts violating copyright standards or submitting spam templates.
          </p>
        </div>
      )
    }
  ];

  // Filter sections by search query
  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div ref={containerRef} className={`min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden ${isPrintFriendly ? 'print:bg-white print:text-black' : ''}`}>
      
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-950" />
            <span className="font-serif text-sm font-bold text-slate-950">Terms & Conditions</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print terms</span>
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white sm:hidden text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Navigation Sidebar */}
        <aside
          className={`absolute sm:relative inset-y-0 left-0 w-64 bg-white border-r border-slate-200 py-6 px-4 z-20 shrink-0 transform transition-transform duration-300 sm:transform-none print:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
          }`}
        >
          <div className="flex flex-col gap-6 h-full">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 border border-slate-200/50 rounded-xl py-1.5 pl-9 pr-4 text-xs placeholder:text-slate-400 focus:outline-hidden focus:bg-white transition-all"
              />
            </div>

            {/* Terms Directory */}
            <nav className="flex-1 overflow-y-auto space-y-6 select-none pr-1">
              {Array.from(new Set(filteredSections.map((s) => s.category))).map((catKey) => {
                const categoryLabel = filteredSections.find((s) => s.category === catKey)?.categoryLabel || '';
                const categorySections = filteredSections.filter((s) => s.category === catKey);

                return (
                  <div key={catKey} className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5">
                      {categoryLabel}
                    </h4>
                    <div className="space-y-0.5">
                      {categorySections.map((sect) => (
                        <button
                          key={sect.id}
                          onClick={() => handleSectionSelect(sect.id)}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border-none transition-all cursor-pointer gsap-sidebar-item ${
                            activeSectionId === sect.id
                              ? 'bg-slate-950 text-white shadow-xs'
                              : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{sect.title}</span>
                          <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeSectionId === sect.id ? 'text-white' : 'text-slate-400'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredSections.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 font-medium leading-normal">
                  No terms found matching your query.
                </div>
              )}
            </nav>

            {/* Back button */}
            <div className="pt-4 border-t border-slate-100 px-2 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-medium">Last updated: June 2026</span>
            </div>

          </div>
        </aside>

        {/* Backdrop for Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs z-10 sm:hidden print:hidden"
          />
        )}

        {/* Reading view panel */}
        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-12 md:px-16 md:py-16 bg-white print:p-0"
        >
          <div ref={contentWrapperRef} className="max-w-xl mx-auto space-y-8 gsap-content-entrance">
            
            {/* Header info */}
            <div className="space-y-3 print:hidden">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full w-fit block font-mono">
                {activeSection.categoryLabel}
              </span>
              <h1 className="text-2xl md:text-3xl font-normal font-serif text-slate-950 tracking-tight leading-tight">
                {activeSection.title}
              </h1>
            </div>

            {/* Content Divider */}
            <div className="h-px bg-slate-100 print:hidden"></div>

            {/* Article Content */}
            <article className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans">
              {activeSection.content}
            </article>

            {/* Accept Box (Shown only in Introduction Section) */}
            {activeSection.id === '1-introduction' && (
              <>
                {isLoadingAcceptance ? (
                  <div className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl flex items-center justify-center gap-2 mt-8 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    <span className="text-xs text-slate-500 font-medium">Checking compliance history...</span>
                  </div>
                ) : hasAccepted ? (
                  <div className="p-5 border border-emerald-200 bg-emerald-50/20 rounded-2xl flex flex-col gap-3.5 mt-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-emerald-950 pointer-events-none">
                      <Shield className="w-24 h-24" />
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-emerald-950">Terms Accepted & Document Signed</h4>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Your compliance status is active and verified. 
                          {acceptedDetails?.method === 'firestore' ? ' Your signature is securely synced to your cloud account registry.' : ' Your signature is stored locally via cookies and device storage.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-emerald-100/50 text-[10px] text-slate-400 font-mono">
                      {acceptedDetails?.email && (
                        <span className="flex items-center gap-1">
                          <strong>Email:</strong> {acceptedDetails.email}
                        </span>
                      )}
                      {acceptedDetails?.acceptedAt && (
                        <span className="flex items-center gap-1">
                          <strong>Signed on:</strong> {new Date(acceptedDetails.acceptedAt).toLocaleDateString()} at {new Date(acceptedDetails.acceptedAt).toLocaleTimeString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Cloud className="w-3.5 h-3.5" />
                        {acceptedDetails?.method === 'firestore' ? 'Cloud Synced' : 'Local Storage'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAcceptanceChange(false)}
                      className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 transition-colors w-fit bg-transparent border-none p-0 cursor-pointer self-end mt-1"
                    >
                      Revoke Acceptance
                    </button>
                  </div>
                ) : (
                  <div className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col gap-4.5 mt-8">
                    <div className="flex items-start gap-3.5">
                      <input
                        type="checkbox"
                        id="accept-terms"
                        disabled={isSyncing}
                        checked={hasAccepted}
                        onChange={(e) => handleAcceptanceChange(e.target.checked)}
                        className="w-4.5 h-4.5 accent-slate-950 cursor-pointer rounded-sm border-slate-300 mt-0.5"
                      />
                      <div className="space-y-1">
                        <label htmlFor="accept-terms" className="text-xs text-slate-700 font-semibold cursor-pointer select-none leading-normal">
                          I acknowledge and accept the client-side BYOK terms and limitation of liability clauses.
                        </label>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          By checking this box, you sign our terms. Your choice will be stored as an encrypted session cookie and synced to Firestore.
                        </p>
                      </div>
                    </div>
                    {isSyncing && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold self-end">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Signing & Syncing...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Quick Helper Accordion */}
            <div className="pt-10 border-t border-slate-150 mt-12 print:hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                Frequently Answered Questions
              </h3>
              <div className="space-y-4 text-xs leading-normal text-slate-600">
                <div>
                  <h4 className="font-bold text-slate-900">Are my API Keys safe?</h4>
                  <p className="mt-1 text-slate-500">Yes. Because all operations are client-side, your keys are encrypted using AES-256-GCM before syncing to database storage. We never transmit them to our own servers.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Can I request a refund for AI generations?</h4>
                  <p className="mt-1 text-slate-500">No, because Folient doesn't charge for completions. You bring your own keys, and you are billed directly by Google AI Studio, Groq, or OpenRouter according to your usage.</p>
                </div>
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
