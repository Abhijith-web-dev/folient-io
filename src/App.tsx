import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CloudCallback from './modules/hosting/CloudCallback';
import CookieConsentBanner from './components/CookieConsentBanner';
import ErrorBoundary from './components/ErrorBoundary';
import Lenis from 'lenis';

// Safe dynamic import wrapper to automatically resolve browser out-of-sync chunk loading/HMR errors
const lazyWithRetry = (importFunc: () => Promise<any>) => {
  return lazy(() =>
    importFunc().catch((err) => {
      console.error("Dynamic import failed. Force reloading to synchronize workspace...", err);
      window.location.reload();
      return { default: () => null };
    })
  );
};

// Lazy load heavy page chunks safely
const Home = lazyWithRetry(() => import('./pages/Home'));
const Auth = lazyWithRetry(() => import('./pages/Auth'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Templates = lazyWithRetry(() => import('./pages/Templates'));
const Editor = lazyWithRetry(() => import('./pages/Editor'));
const Docs = lazyWithRetry(() => import('./pages/Docs'));
const Terms = lazyWithRetry(() => import('./pages/Terms'));

// Premium, flat aesthetic route loader
function RouteLoader() {
  return (
    <div className="fixed inset-0 bg-[#F4F5F8] dark:bg-[#0E1118] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#ECEEF2] dark:border-[#222630] border-t-slate-800 dark:border-t-slate-200 rounded-full animate-spin"></div>
        <p className="text-[11px] font-mono tracking-widest uppercase text-slate-450 dark:text-slate-500 animate-pulse">
          Loading Workspace
        </p>
      </div>
    </div>
  );
}




function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    (window as unknown as { lenis: Lenis | undefined }).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Smooth scroll for anchor clicks using Lenis
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement instanceof HTMLElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, {
            offset: -90, // Offset for the fixed header
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      (window as unknown as { lenis: Lenis | undefined }).lenis = undefined;
    };
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard/:tab?" element={<Dashboard />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/community" element={<Navigate to="/dashboard/community" replace />} />
            <Route path="/auth/callback" element={<CloudCallback />} />
            <Route path="/auth/vercel" element={<CloudCallback />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <CookieConsentBanner />
    </BrowserRouter>
  );
}

export default App;

