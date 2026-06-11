import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, Loader2, AlertCircle, FileText } from 'lucide-react';
import { listSupabaseFiles } from '../../services/SupabaseClient';

export default function AssetsTab() {
  const [copiedAssetUrl, setCopiedAssetUrl] = useState<string | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [savedAssets, setSavedAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadSaved = () => {
      const data = localStorage.getItem('folient_saved_assets');
      if (data) {
        try {
          setSavedAssets(JSON.parse(data));
        } catch (e) {}
      }
    };
    loadSaved();
    window.addEventListener('focus', loadSaved);
    return () => window.removeEventListener('focus', loadSaved);
  }, []);

  const fetchAssets = async () => {
    const url = localStorage.getItem('supabase_url') || '';
    const anonKey = localStorage.getItem('supabase_anon_key') || '';
    const serviceRoleKey = localStorage.getItem('supabase_service_role_key') || '';
    const bucket = localStorage.getItem('supabase_bucket') || 'folient-media';

    if (!url || !anonKey) {
      setErrorMsg('Supabase credentials are missing. Configure them on the Dashboard page.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const files = await listSupabaseFiles(url, anonKey, bucket, 0, serviceRoleKey);
      setAssets(files);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCopyAsset = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedAssetUrl(url);
    setTimeout(() => setCopiedAssetUrl(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#111111]">Supabase Media Vault</h4>
        <button 
          onClick={fetchAssets}
          disabled={loading}
          className="p-1 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-[#ECEEF2] cursor-pointer disabled:opacity-50 transition-colors"
          title="Sync/Refresh Vault"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="w-5 h-5 text-[#FF5733] animate-spin" />
          <span className="text-[9px] font-mono text-[#6B7280]">Syncing live assets...</span>
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center p-3 text-center bg-red-50 border border-red-100 rounded-xl gap-1.5">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-[8px] font-mono text-red-600 leading-normal">{errorMsg}</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-[#ECEEF2] rounded-xl text-center p-3 gap-1">
          <AlertCircle className="w-4 h-4 text-[#6B7280] opacity-50" />
          <span className="text-[9px] font-mono font-bold text-[#111111]">No assets uploaded yet</span>
          <span className="text-[8px] font-mono text-[#6B7280]">Use the floating AI chatbox file vault tool to add files.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {assets.map((asset) => {
            const isImg = asset.type === 'image';
            return (
              <div key={asset.id} className="flex flex-col bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl overflow-hidden group">
                <div className="h-20 w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center">
                  {isImg ? (
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-[#6B7280] opacity-75" />
                  )}
                  <button 
                    onClick={() => handleCopyAsset(asset.url)}
                    className="absolute bottom-1.5 right-1.5 p-1.5 bg-white border border-[#ECEEF2] rounded-lg shadow-sm hover:text-[#FF5733] transition-all cursor-pointer flex items-center justify-center"
                    title="Copy public link URL"
                  >
                    {copiedAssetUrl === asset.url ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="p-2 text-left shrink-0">
                  <p className="text-[9px] font-semibold text-[#111111] truncate">{asset.name}</p>
                  <p className="text-[7px] font-mono text-[#6B7280] truncate">{asset.size}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {savedAssets.length > 0 && (
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#ECEEF2]">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#111111]">Saved Community Assets</h4>
            <button 
              onClick={() => { localStorage.removeItem('folient_saved_assets'); setSavedAssets([]); }}
              className="text-[8px] font-mono font-bold text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {savedAssets.map((asset) => (
              <div key={asset.id} className="flex flex-col bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl overflow-hidden relative group">
                <div className="h-16 w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={asset.url} 
                    alt={asset.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <button 
                    onClick={() => handleCopyAsset(asset.url)}
                    className="absolute bottom-1 right-1 p-1 bg-white border border-[#ECEEF2] rounded-lg shadow-sm hover:text-[#FF5733] transition-all cursor-pointer flex items-center justify-center"
                    title="Copy link URL"
                  >
                    {copiedAssetUrl === asset.url ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="p-2 text-left shrink-0 flex items-center justify-between gap-1">
                  <p className="text-[8px] font-semibold text-[#111111] truncate max-w-[55px]" title={asset.name}>{asset.name}</p>
                  <button
                    onClick={() => {
                      const updated = savedAssets.filter(a => a.id !== asset.id);
                      setSavedAssets(updated);
                      localStorage.setItem('folient_saved_assets', JSON.stringify(updated));
                    }}
                    className="text-[8px] text-red-500 hover:underline border-none bg-transparent cursor-pointer p-0"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-[#F8F9FB] rounded-[16px] border border-[#ECEEF2] text-left flex flex-col gap-2">
        <span className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Paste Custom Asset Link</span>
        <input 
          type="text" 
          placeholder="https://image-source.url"
          className="w-full h-8 bg-white border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = e.currentTarget.value.trim();
              if (val) {
                handleCopyAsset(val);
                e.currentTarget.value = '';
              }
            }
          }}
        />
        <span className="text-[8px] text-[#6B7280]">Press Enter to copy layout context link instantly.</span>
      </div>
    </div>
  );
}
