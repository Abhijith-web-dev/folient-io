import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { gsap } from 'gsap';

export default function CookieConsentBanner() {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    // Check local consent status
    const hasAcceptedLocal = localStorage.getItem('folient_terms_accepted') === 'true';
    const hasDeclinedLocal = sessionStorage.getItem('folient_cookie_banner_dismissed') === 'true';

    if (!hasAcceptedLocal && !hasDeclinedLocal) {
      // Small delay for premium entry feel
      const timer = setTimeout(() => {
        setIsVisible(true);
        // GSAP Slide Up
        gsap.fromTo('.gsap-cookie-banner',
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = async () => {
    setIsAccepting(true);
    const now = new Date().toISOString();

    // 1. Save locally via Storage
    localStorage.setItem('folient_terms_accepted', 'true');
    localStorage.setItem('folient_terms_accepted_at', now);
    
    // 2. Set browser cookie
    document.cookie = "folient_terms_accepted=true; max-age=31536000; path=/; SameSite=Lax";

    // 3. Sync to Firestore if logged in
    if (user) {
      try {
        await setDoc(doc(db, 'terms_acceptances', user.uid), {
          accepted: true,
          acceptedAt: now,
          email: user.email,
          version: '1.0.0',
          userAgent: navigator.userAgent
        });
      } catch (error) {
        console.error("Error syncing cookie consent terms to cloud:", error);
      }
    }

    // GSAP Exit animation
    gsap.to('.gsap-cookie-banner', {
      y: 100,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.in',
      onComplete: () => {
        setIsVisible(false);
        setIsAccepting(false);
        // Dispatch custom event to notify Terms page or other components of changes
        window.dispatchEvent(new Event('folient_compliance_updated'));
      }
    });
  };

  const handleDismiss = () => {
    sessionStorage.setItem('folient_cookie_banner_dismissed', 'true');
    gsap.to('.gsap-cookie-banner', {
      y: 100,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.in',
      onComplete: () => setIsVisible(false)
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md w-auto z-50 gsap-cookie-banner print:hidden">
      <div className="bg-white dark:bg-slate-900 border border-[#ECEEF2] dark:border-slate-850 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4">
        
        {/* Banner Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-[#22C55E] border border-[#ECEEF2] dark:border-slate-800">
              <Cookie className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-[#111111] dark:text-white uppercase tracking-wider font-mono">Cookie & Terms Consent</span>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-[#111111] dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Info Text */}
        <div className="space-y-2">
          <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed font-sans">
            We use secure browser cookies to cache your compiler workspaces, local configurations, and key credentials. By clicking <strong className="text-[#111111] dark:text-white font-semibold">"Accept All"</strong>, you consent to our use of cookies and accept our <Link to="/terms" className="text-[#111111] dark:text-white underline font-semibold hover:text-[#6B7280] transition-colors">Terms of Service</Link>.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={handleAcceptAll}
            disabled={isAccepting}
            className="flex-1 bg-[#111111] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#111111] rounded-[14px] h-10 px-3 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {isAccepting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Consent...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Accept All</span>
              </>
            )}
          </button>
          
          <Link
            to="/terms"
            onClick={handleDismiss}
            className="rounded-[14px] border border-[#ECEEF2] dark:border-slate-800 text-[#111111] dark:text-white bg-[#F8F9FB] dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 px-3 text-xs font-semibold text-center flex items-center justify-center gap-1 hover:scale-[1.02]"
          >
            <span>Learn More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
