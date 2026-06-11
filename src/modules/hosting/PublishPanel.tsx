import { useState, useEffect, useRef } from 'react';
import { useDeploymentEngine } from './useDeploymentEngine';
import { db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';
import { Server, ExternalLink, Terminal, Cpu, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface PublishPanelProps {
  projectId: number;
  projectName: string;
  compiledHtml: string;
  onClose?: () => void;
}

export default function PublishPanel({ projectId, projectName, compiledHtml, onClose }: PublishPanelProps) {
  const { user } = useAuthStore();
  const { deploy, deploying, logs, deployUrl } = useDeploymentEngine();
  
  const [subdomain, setSubdomain] = useState(() => projectName.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'my-portfolio');
  const [targetPlatform, setTargetPlatform] = useState<'netlify' | 'vercel'>('netlify');
  
  // Real-time Firestore credentials check
  const [netlifyConnected, setNetlifyConnected] = useState(() => !!localStorage.getItem('netlify_token'));
  const [vercelConnected, setVercelConnected] = useState(() => !!localStorage.getItem('vercel_token'));
  
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener to user's tokens record in Firestore
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.netlifyToken) {
          localStorage.setItem('netlify_token', data.netlifyToken);
          setNetlifyConnected(true);
        }
        if (data.vercelToken) {
          localStorage.setItem('vercel_token', data.vercelToken);
          setVercelConnected(true);
        }
      }
    }, (err) => {
      console.warn("Firestore snapshot listener error (likely unconfigured or offline rules):", err);
    });

    return () => unsub();
  }, [user]);

  // Scroll to bottom of terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleStartDeploy = async () => {
    await deploy({
      projectId,
      projectName,
      subdomain,
      sectionsHtml: compiledHtml,
      platform: targetPlatform
    });
  };

  const activeTokenExists = targetPlatform === 'netlify' ? netlifyConnected : vercelConnected;

  return (
    <div className="bg-[#0b0c10] border border-slate-800 rounded-[32px] p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden text-slate-100 font-sans w-full max-w-2xl mx-auto">
      {/* Background cyber details */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-violet-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Zero-Server Publishing Panel</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Vite & React Production Pipeline</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold text-xs"
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Selection platforms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Netlify Selection */}
        <div 
          onClick={() => !deploying && setTargetPlatform('netlify')}
          className={`border p-5 rounded-2xl cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden ${
            targetPlatform === 'netlify' 
              ? 'bg-slate-900/40 border-violet-500/80 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
              : 'bg-transparent border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold font-sans tracking-wide">Netlify Deploy</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${netlifyConnected ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              <span className="text-[9px] font-semibold text-slate-400">{netlifyConnected ? 'Linked' : 'Not Linked'}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Packages application in ZIP format and uploads dynamically using binary post streams.</p>
        </div>

        {/* Vercel Selection */}
        <div 
          onClick={() => !deploying && setTargetPlatform('vercel')}
          className={`border p-5 rounded-2xl cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden ${
            targetPlatform === 'vercel' 
              ? 'bg-slate-900/40 border-violet-500/80 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
              : 'bg-transparent border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold font-sans tracking-wide">Vercel Deploy</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${vercelConnected ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              <span className="text-[9px] font-semibold text-slate-400">{vercelConnected ? 'Linked' : 'Not Linked'}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Deploys project file tree structures dynamically into Vercel v13 cloud deployments.</p>
        </div>
      </div>

      {/* Subdomain Input Configuration */}
      <div className="flex flex-col gap-2 bg-[#121319] border border-slate-800 p-5 rounded-2xl">
        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Subdomain Address Slug</label>
        <div className="flex gap-2 items-center">
          <input 
            type="text"
            disabled={deploying}
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="my-portfolio-slug"
            className="h-10 bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 text-xs flex-1 focus:outline-none focus:border-violet-500 text-slate-100 font-semibold"
          />
          <span className="text-xs font-semibold text-slate-400">
            {targetPlatform === 'netlify' ? '.netlify.app' : '.vercel.app'}
          </span>
        </div>
      </div>

      {/* Zero Server Warning if Token is Missing */}
      {!activeTokenExists && (
        <div className="flex items-center gap-2.5 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="text-[10px] font-medium leading-normal">
            No API token available for {targetPlatform === 'netlify' ? 'Netlify' : 'Vercel'}. Please link your accounts in the connectors dashboard before launching production deployment.
          </span>
        </div>
      )}

      {/* Deployment Action Button */}
      <button
        onClick={handleStartDeploy}
        disabled={deploying || !activeTokenExists || !subdomain.trim()}
        className={`w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border-none transition-all cursor-pointer ${
          deploying 
            ? 'bg-slate-900 text-slate-500 cursor-not-allowed'
            : activeTokenExists 
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg hover:shadow-violet-600/15'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {deploying ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Deploying Virtual File Tree...</span>
          </>
        ) : (
          <>
            <Server className="w-3.5 h-3.5" />
            <span>Deploy to Production Site</span>
          </>
        )}
      </button>

      {/* Cyberpunk Terminal Logger View */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-slate-400" />
              <span>Compilation Logs Terminal</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Live Stream</span>
            </div>
          </div>
          
          <div className="h-44 bg-[#050608] border border-slate-800/80 rounded-2xl p-4 font-mono text-[10px] overflow-y-auto text-left flex flex-col gap-1.5 shadow-inner">
            {logs.map((log, index) => {
              const colorClass = log.type === 'success' 
                ? 'text-emerald-400' 
                : log.type === 'error' 
                  ? 'text-rose-400' 
                  : 'text-slate-400';
              return (
                <div key={index} className="flex gap-2">
                  <span className="text-violet-500 shrink-0">&gt;</span>
                  <span className={`${colorClass} leading-relaxed`}>{log.message}</span>
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* Success Link block */}
      {deployUrl && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-[scale_0.2s_ease-out]">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <h4 className="text-xs font-bold text-emerald-300">Deployment Live!</h4>
              <p className="text-[10px] text-emerald-400/80 mt-0.5">Your portfolio site is provisioned and running in production.</p>
            </div>
          </div>
          <a 
            href={deployUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase rounded-xl transition-colors cursor-pointer border-none no-underline shrink-0"
          >
            <span>Visit Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
