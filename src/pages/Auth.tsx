import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { gsap } from 'gsap';
import { useSEO } from '../hooks/useSEO';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, loading } = useAuthStore();

  useSEO({
    title: 'Sign In',
    description: 'Sign in to your Folient workspace or register a new developer account to begin building your AI portfolios.',
    canonicalPath: '/auth',
  });

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // GSAP Intro & Transition Animations
  useEffect(() => {
    if (!containerRef.current || (loading && !user)) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Animate left pane elements staggering in
      tl.fromTo('.gsap-left-animate',
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
      );

      // Slide in the right card from the right with a soft spring bounce
      tl.fromTo('.gsap-right-card',
        { opacity: 0, x: 40, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.95, ease: 'back.out(1.15)' },
        '-=0.7'
      );

      // Stagger child elements of the form capsule
      tl.fromTo('.gsap-right-animate',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' },
        '-=0.65'
      );

      // Back to home button fade in
      tl.fromTo('.gsap-back-btn',
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4 },
        '-=0.5'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error("Auth submit error:", err);
      const errMsg = err instanceof Error ? err.message : "Authentication failed. Check your credentials.";
      setAuthError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error("Google login error:", err);
      const errMsg = err instanceof Error ? err.message : "Google Sign-In failed.";
      setAuthError(errMsg);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-slate-900" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-700">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex font-sans bg-slate-50">
      
      {/* Left Column: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 p-16 flex-col justify-between relative overflow-hidden border-r border-slate-900">
        {/* Shifting radial glow background */}
        <div className="absolute top-1/4 left-1/4 w-[320px] h-[320px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none animate-pulse-soft" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 gsap-left-animate opacity-0">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <img src="/logo.png" alt="Folient Logo" className="w-5.5 h-5.5 object-contain shrink-0" />
            <span className="text-white text-sm font-semibold tracking-tight">Folient</span>
          </Link>
        </div>

        {/* Core Message & Compiling Preview */}
        <div className="relative z-10 max-w-sm flex flex-col gap-8 my-auto">
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-white text-4xl leading-[1.1] tracking-tight font-normal gsap-left-animate opacity-0">
              Zero-Backend portfolio compilation, instantly.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed gsap-left-animate opacity-0">
              Compile prompts into raw HTML files, encrypt credentials client-side, and deploy directly to edge servers in seconds.
            </p>
          </div>

          {/* Code mock card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-2xl font-mono text-[11px] text-slate-300 w-full relative overflow-hidden gsap-left-animate opacity-0">
            <div className="flex items-center gap-1.5 mb-4 border-b border-slate-800/50 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] text-slate-500 ml-2">compiler.log</span>
            </div>
            <div className="space-y-1.5 text-slate-400">
              <p className="text-slate-500">// Starting build thread...</p>
              <p><span className="text-emerald-500 font-bold">✓</span> Loaded prompt config</p>
              <p><span className="text-emerald-500 font-bold">✓</span> Integrated local storage cache</p>
              <p><span className="text-indigo-400 font-bold">→</span> Packing client-side JS bundle</p>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-indigo-500 rounded-full animate-[pulse_1.5s_infinite]" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer brand indicator */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 gsap-left-animate opacity-0">
          <span>© 2026 Folient Builder.</span>
          <span>Open Source under MIT.</span>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Shifting radial glow background for light theme */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-50/50 blur-3xl pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none z-0" />

        {/* Back button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors z-20 group gsap-back-btn opacity-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>

        {/* Auth form capsule */}
        <div className="gsap-right-card opacity-0 w-full max-w-sm bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100/30 relative z-10 flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex flex-col gap-2 gsap-right-animate opacity-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-500 leading-normal">
              {isSignUp ? 'Get started compiling portfolios client-side for free' : 'Sign in to access your dashboard and compile keys'}
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs leading-relaxed gsap-right-animate opacity-0">
              {authError}
            </div>
          )}

          {/* Core Submit Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5 gsap-right-animate opacity-0">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/70 border border-slate-200/50 rounded-2xl py-3 pl-11 pr-4 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950/5 focus:border-slate-400/80 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 gsap-right-animate opacity-0">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/70 border border-slate-200/50 rounded-2xl py-3 pl-11 pr-4 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950/5 focus:border-slate-400/80 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button 
              type="submit"
              disabled={submitting}
              className="btn-primary w-full h-11 rounded-2xl flex items-center justify-center gap-2 mt-2 cursor-pointer gsap-right-animate opacity-0"
            >
              {submitting ? (
                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Splitter */}
          <div className="flex items-center text-[10px] text-slate-400 uppercase tracking-wider gsap-right-animate opacity-0">
            <div className="flex-1 h-px bg-slate-200/50"></div>
            <span className="px-3 font-semibold text-slate-400">or continue with</span>
            <div className="flex-1 h-px bg-slate-200/50"></div>
          </div>

          {/* Social Sign In */}
          <button 
            onClick={handleGoogleSignIn}
            className="btn-secondary w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-xs cursor-pointer shadow-xs gsap-right-animate opacity-0"
          >
            {/* Simple Google SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Workspace</span>
          </button>

          {/* Toggle */}
          <p className="text-center text-xs text-slate-500 font-medium gsap-right-animate opacity-0">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-950 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
