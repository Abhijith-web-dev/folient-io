import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function NotFound() {

  useSEO({
    title: 'Page Not Found',
    description: 'The requested page could not be found. Return to your workspace or explore documentation.',
    canonicalPath: '/404',
  });

  return (
    <main className="min-h-screen bg-[#F3F4F6] text-[#111111] font-sans flex items-center justify-center p-6 relative overflow-x-hidden">
      {/* Background decoration grid matching Dashboard */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none z-0" />
      
      {/* Main card box styled exactly like Dashboard modules */}
      <div className="w-full max-w-md bg-white border border-[#ECEEF2] rounded-[32px] p-8 md:p-10 shadow-[0_8px_24px_rgba(0,0,0,0.03)] text-center relative z-10 flex flex-col items-center gap-6">
        
        {/* Large high-contrast metric typography */}
        <div className="flex flex-col gap-2 items-center">
          <span className="text-[120px] font-bold leading-none tracking-tighter text-[#111111] select-none">
            404
          </span>
          <div className="w-12 h-1 bg-[#111111] rounded-full my-2" />
          <h1 className="text-xl font-bold tracking-tight text-[#111111]">
            Page Not Found
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs mt-1">
            The workspace or route you are looking for does not exist or has been moved to another coordinate.
          </p>
        </div>

        {/* Action button container */}
        <div className="flex flex-col gap-3 w-full mt-4">
          <Link 
            to="/dashboard"
            className="w-full h-11 bg-[#111111] hover:bg-[#222222] text-white rounded-[14px] text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Dashboard</span>
          </Link>
          
          <Link 
            to="/docs"
            className="w-full h-11 bg-[#F8F9FB] hover:bg-[#F1F3F5] text-[#111111] border border-[#ECEEF2] rounded-[14px] text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>View Documentation</span>
          </Link>
        </div>

        {/* Footer info banner */}
        <div className="text-[10px] text-[#9CA3AF] mt-2 font-mono">
          SYSTEM_ROUTE_ERR // 0x404_NOT_FOUND
        </div>
      </div>
    </main>
  );
}
