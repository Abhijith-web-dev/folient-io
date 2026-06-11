import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in boundary:', error, errorInfo);
    
    // Automatically attempt to reload the window if it's a dynamic import / chunk load failure.
    // This resolves issues where outdated client builds request deleted assets after hot reload/redeploys.
    const isChunkError = 
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('chunk') ||
      error.name === 'TypeError';

    if (isChunkError) {
      console.warn('Dynamic import chunk error detected. Performing automatic reload...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#F4F5F8] dark:bg-[#0E1118] flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-md bg-white/70 dark:bg-[#151A26]/70 backdrop-blur-xl border border-[#ECEEF2] dark:border-[#222630] rounded-2xl p-8 shadow-xl flex flex-col items-center text-center">
            {/* Visual Indicator: Gradient Circle */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-rose-500 text-3xl">
                warning
              </span>
            </div>

            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200 tracking-tight mb-2">
              Workspace Sync Required
            </h1>
            
            <p className="text-[13px] leading-relaxed text-slate-550 dark:text-slate-400 mb-8 max-w-xs">
              The workspace needs to synchronize with the latest updates. Refresh the browser to continue.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-205 text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-300 transition-all shadow-sm hover:scale-[1.01]"
              >
                Sync & Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
