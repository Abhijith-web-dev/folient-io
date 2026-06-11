import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { uploadSupabaseFile } from '../services/SupabaseClient';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Undo2, 
  Redo2, 
  FileCode, 
  Settings, 
  ArrowLeft,
  Server,
  Cloud,
  Save,
  Download,
  Sparkles,
  User,
  Check,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { useDeploymentEngine } from '../hooks/useDeploymentEngine';
import { useCloudAuth } from '../modules/hosting/useCloudAuth';
import { folientDb } from '../db/dexie';

export default function TopNavigationBar() {
  const { loginNetlify, loginVercel } = useCloudAuth();
  const { 
    devicePreview, 
    setDevicePreview, 
    undo, 
    redo,
    addTelemetryLog,
    codeViewOpen,
    setCodeViewOpen,
    projectName,
    setProjectName,
    updateProjectNameInDb,
    editMode,
    setEditMode,
    compileAstToHtml,
    saveProjectToDb,
    activeProjectId
  } = useEditorStore();

  const navigate = useNavigate();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [netlifyToken, setNetlifyToken] = useState(localStorage.getItem('netlify_token') || '');
  const [vercelToken, setVercelToken] = useState(localStorage.getItem('vercel_token') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [groqKey, setGroqKey] = useState(localStorage.getItem('groq_api_key') || '');

  const saveConfig = () => {
    localStorage.setItem('netlify_token', netlifyToken);
    localStorage.setItem('vercel_token', vercelToken);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('groq_api_key', groqKey);
    addTelemetryLog("Credentials store updated successfully.", "success");
    setShowConfigModal(false);
  };

  const handleManualSave = async () => {
    setIsSavingLocal(true);
    try {
      await saveProjectToDb();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleExportHtml = () => {
    const innerHtml = compileAstToHtml();
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 overflow-x-hidden min-h-screen">
  ${innerHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-') || 'portfolio'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    addTelemetryLog(`Portfolio HTML successfully compiled & exported.`, 'success');
  };

  const [showHostingSetup, setShowHostingSetup] = useState(false);
  const [hostingProvider, setHostingProvider] = useState<'netlify' | 'vercel' | null>(null);
  const [platformTarget, setPlatformTarget] = useState<'netlify' | 'vercel' | null>(null);
  const [subdomainName, setSubdomainName] = useState('');
  const [isValidatingSubdomain, setIsValidatingSubdomain] = useState(false);
  const [validationResult, setValidationResult] = useState<{ checked: boolean; available: boolean; error?: string }>({ checked: false, available: false });
  const [hasLiveUrl, setHasLiveUrl] = useState(false);
  const [isSyncingLive, setIsSyncingLive] = useState(false);

  const [shareMode, setShareMode] = useState<'feed' | 'template' | null>(null);
  const [shareContent, setShareContent] = useState('');
  const [shareTitle, setShareTitle] = useState('');
  const [shareCategory, setShareCategory] = useState('Product Engineering');
  const [shareTags, setShareTags] = useState('');
  const [sharePermission, setSharePermission] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [customDialog, setCustomDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'confirm';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText: 'Dismiss'
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel'
    });
  };
  
  const { 
    deploying, 
    deployLogs, 
    deployToNetlify, 
    deployToVercel, 
    validateNetlifySubdomain, 
    validateVercelSubdomain,
    extractAstFromLiveUrl,
    generatePackagedHtml
  } = useDeploymentEngine();

  useEffect(() => {
    const checkLiveStatus = async () => {
      if (activeProjectId) {
        const proj = await folientDb.projects.get(activeProjectId);
        if (proj && proj.liveUrl) {
          setHasLiveUrl(true);
          setPlatformTarget(proj.platformTarget?.toLowerCase() as 'netlify' | 'vercel');
        } else {
          setHasLiveUrl(false);
          setPlatformTarget(null);
        }
      }
    };
    checkLiveStatus();
  }, [activeProjectId, showHostingSetup]);

  const handleOpenHostingSetup = async (provider: 'netlify' | 'vercel') => {
    setHostingProvider(provider);
    let nameToUse = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'my-portfolio';
    setValidationResult({ checked: false, available: false });
    
    if (activeProjectId) {
      const proj = await folientDb.projects.get(activeProjectId);
      if (proj && proj.liveUrl) {
        setHasLiveUrl(true);
        setPlatformTarget(proj.platformTarget?.toLowerCase() as 'netlify' | 'vercel');
        try {
          const parsed = new URL(proj.liveUrl);
          const parts = parsed.hostname.split('.');
          if (parts.length >= 2) {
            nameToUse = parts[0];
          }
        } catch {}
      } else {
        setHasLiveUrl(false);
      }
    } else {
      setHasLiveUrl(false);
    }
    
    setSubdomainName(nameToUse);
    setShowHostingSetup(true);
  };

  const handleValidateSubdomain = async () => {
    if (!subdomainName.trim()) return;
    setIsValidatingSubdomain(true);
    setValidationResult({ checked: false, available: false });
    try {
      const token = hostingProvider === 'netlify' ? netlifyToken : vercelToken;
      const res = hostingProvider === 'netlify' 
        ? await validateNetlifySubdomain(token, subdomainName)
        : await validateVercelSubdomain(token, subdomainName);
      
      setValidationResult({
        checked: true,
        available: res.available,
        error: res.reason
      });
    } catch (e: any) {
      setValidationResult({
        checked: true,
        available: false,
        error: e.message || String(e)
      });
    } finally {
      setIsValidatingSubdomain(false);
    }
  };

  const handleShareToFeed = async () => {
    if (!activeProjectId || !shareContent.trim()) return;
    setIsSharing(true);
    try {
      const project = await folientDb.projects.get(activeProjectId);
      if (!project || !project.liveUrl) {
        throw new Error('Project must be deployed live before sharing.');
      }

      const sUrl = localStorage.getItem('supabase_url') || '';
      const sKey = localStorage.getItem('supabase_anon_key') || '';
      const sSKey = localStorage.getItem('supabase_service_role_key') || '';
      const sBucket = localStorage.getItem('supabase_bucket') || 'folient-media';

      if (!sUrl || (!sKey && !sSKey)) {
        throw new Error('Supabase storage credentials are not configured. Configure them in Dashboard > Connectors.');
      }

      const htmlContent = generatePackagedHtml();
      const filename = `${project.name.toLowerCase().replace(/[^a-z0-9-]/g, '')}-${Date.now()}-index.html`;
      const file = new File([htmlContent], filename, { type: 'text/html' });

      const uploadRes = await uploadSupabaseFile(sUrl, sSKey || sKey, sBucket, file, 0, sSKey);
      const codeUrl = uploadRes.url;

      const { user } = useAuthStore.getState();

      const newPostData = {
        creator: user?.displayName || 'Developer Partner',
        creatorTitle: 'Workspace Architect',
        timestamp: 'Just now',
        timestamp_epoch: Date.now(),
        content: shareContent,
        likes: 0,
        liked: false,
        commentsCount: 0,
        liveUrl: project.liveUrl,
        codeUrl: codeUrl
      };

      await addDoc(collection(db, 'community_posts'), newPostData);

      setShareContent('');
      setShareMode(null);
      showAlert('Shared Successfully', 'Your portfolio live link and code have been shared with the community feed!', 'success');
    } catch (e: any) {
      console.error(e);
      showAlert('Sharing Failed', e.message || String(e), 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareAsTemplate = async () => {
    if (!activeProjectId) return;
    setIsSharing(true);
    try {
      const project = await folientDb.projects.get(activeProjectId);
      if (!project) {
        throw new Error('Project not found.');
      }

      const isScratch = !project.activeTemplateId || project.activeTemplateId === 'blank';
      if (!isScratch) {
        throw new Error('Only portfolios built from scratch can be published to the Templates catalog.');
      }

      const sUrl = localStorage.getItem('supabase_url') || '';
      const sKey = localStorage.getItem('supabase_anon_key') || '';
      const sSKey = localStorage.getItem('supabase_service_role_key') || '';
      const sBucket = localStorage.getItem('supabase_bucket') || 'folient-media';

      if (!sUrl || (!sKey && !sSKey)) {
        throw new Error('Supabase storage credentials are not configured. Configure them in Dashboard > Connectors.');
      }

      const htmlContent = generatePackagedHtml();
      const filename = `${project.name.toLowerCase().replace(/[^a-z0-9-]/g, '')}-${Date.now()}-index.html`;
      const file = new File([htmlContent], filename, { type: 'text/html' });

      const uploadRes = await uploadSupabaseFile(sUrl, sSKey || sKey, sBucket, file, 0, sSKey);
      const codeUrl = uploadRes.url;

      const { user } = useAuthStore.getState();

      const newTemplateData = {
        title: shareTitle || project.name,
        creator: user?.displayName || 'Developer Partner',
        category: shareCategory,
        model: 'gemini-2.0-flash',
        thumbsUp: 0,
        thumbsDown: 0,
        usedCount: 0,
        tags: shareTags ? shareTags.split(',').map(t => t.trim()) : ['Custom', 'Template'],
        codeUrl: codeUrl,
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'community_templates'), newTemplateData);

      setShareTags('');
      setShareMode(null);
      setSharePermission(false);
      showAlert('Template Published', 'Your scratch portfolio has been published as a community template!', 'success');
    } catch (e: any) {
      console.error(e);
      showAlert('Publishing Failed', e.message || String(e), 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSyncFromLive = async () => {
    const { activeProjectId } = useEditorStore.getState();
    if (!activeProjectId) return;
    try {
      setIsSyncingLive(true);
      const project = await folientDb.projects.get(activeProjectId);
      if (!project || !project.liveUrl) {
        throw new Error('No live URL found for this project.');
      }
      
      const result = await extractAstFromLiveUrl(project.liveUrl);
      useEditorStore.getState().setFullAst(result.ast, result.css);
      
      // Update IndexedDB with the loaded AST/CSS
      await folientDb.projects.update(activeProjectId, {
        ast: result.ast,
        css: result.css,
        updatedAt: Date.now()
      } as any);
      
      setShowHostingSetup(false);
      showAlert('Sync Complete', `Synchronized successfully! Your workspace has been updated with the live website's structure.`, 'success');
    } catch (e: any) {
      showAlert('Sync Failed', `Sync failed: ${e.message || String(e)}`, 'error');
    } finally {
      setIsSyncingLive(false);
    }
  };

  const handleDeploy = async () => {
    if (!hostingProvider) return;
    const token = hostingProvider === 'netlify' ? netlifyToken : vercelToken;
    if (!token) return;

    try {
      const { activeProjectId } = useEditorStore.getState();
      let existingSiteId: string | undefined;
      
      if (activeProjectId) {
        const project = await folientDb.projects.get(activeProjectId);
        if (project) {
          existingSiteId = hostingProvider === 'netlify' ? project.netlifySiteId : project.vercelProjectId;
        }
      }

      if (hostingProvider === 'netlify') {
        const res = await deployToNetlify(token, existingSiteId, subdomainName);
        if (activeProjectId) {
          await folientDb.projects.update(activeProjectId, {
            liveUrl: res.url,
            netlifySiteId: res.siteId,
            status: 'Live',
            platformTarget: 'Netlify',
            updatedAt: Date.now()
          });
          addTelemetryLog(`Netlify deploy synced with project record.`, 'success');
        }
        setShowHostingSetup(false);
        showAlert('Deploy Successful', `Site published successfully to Netlify! URL: ${res.url}`, 'success');
      } else {
        const res = await deployToVercel(token, undefined, subdomainName);
        if (activeProjectId) {
          await folientDb.projects.update(activeProjectId, {
            liveUrl: res.url,
            vercelProjectId: res.projectId,
            status: 'Live',
            platformTarget: 'Vercel',
            updatedAt: Date.now()
          });
          addTelemetryLog(`Vercel deploy synced with project record.`, 'success');
        }
        setShowHostingSetup(false);
        showAlert('Deploy Successful', `Site published successfully to Vercel! URL: ${res.url}`, 'success');
      }
    } catch (e: any) {
      showAlert('Deployment Failed', `Deployment failed: ${e.message || e}`, 'error');
    }
  };


  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showConfirm(
      'Return to Dashboard',
      'Are you sure you want to return to the Dashboard? Make sure your changes are saved.',
      () => navigate('/dashboard')
    );
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowAvatarDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const activeProvider = geminiKey ? 'Gemini' : groqKey ? 'Groq' : 'None';

  return (
    <header className="w-full h-[72px] bg-white border border-[#ECEEF2] rounded-[24px] px-6 flex items-center justify-between select-none relative z-45 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Left section: Logo & Project Name */}
      <div className="flex items-center gap-4">
        <a 
          href="/dashboard" 
          onClick={handleHomeClick}
          className="p-2 bg-[#F8F9FB] border border-[#ECEEF2] hover:bg-[#ECEEF2] rounded-[14px] text-[#6B7280] hover:text-[#111111] transition-all cursor-pointer flex items-center justify-center"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </a>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border-r border-[#ECEEF2] pr-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5733]" />
            <span className="text-xs font-bold text-[#111111] font-mono tracking-wider">
              FOLIENT
            </span>
          </div>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            onBlur={e => updateProjectNameInDb(e.target.value)}
            className="h-8 max-w-[140px] bg-transparent border-b border-transparent hover:border-[#ECEEF2] focus:border-[#FF5733] text-xs font-bold text-[#111111] font-mono px-1 focus:outline-none transition-colors"
            placeholder="Portfolio Name"
            title="Click to rename portfolio"
          />
        </div>
      </div>

      {/* Center Section: Controls & Mode Switch */}
      <div className="flex items-center gap-5">
        {/* Device select */}
        <div className="flex items-center gap-1.5 bg-[#F8F9FB] p-1 rounded-full border border-[#ECEEF2]">
          <button 
            onClick={() => setDevicePreview('desktop')}
            className={`p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors ${devicePreview === 'desktop' ? 'bg-[#111111] text-white' : 'text-[#6B7280] hover:text-[#111111]'}`}
            title="Desktop Mode"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDevicePreview('tablet')}
            className={`p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors ${devicePreview === 'tablet' ? 'bg-[#111111] text-white' : 'text-[#6B7280] hover:text-[#111111]'}`}
            title="Tablet Mode"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDevicePreview('mobile')}
            className={`p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors ${devicePreview === 'mobile' ? 'bg-[#111111] text-white' : 'text-[#6B7280] hover:text-[#111111]'}`}
            title="Mobile Mode"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-[#ECEEF2]" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 bg-[#F8F9FB] p-1 rounded-full border border-[#ECEEF2]">
          <button 
            onClick={undo}
            className="p-2 rounded-full hover:bg-white text-[#6B7280] hover:text-[#111111] cursor-pointer transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            className="p-2 rounded-full hover:bg-white text-[#6B7280] hover:text-[#111111] cursor-pointer transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-[#ECEEF2]" />

        {/* Edit/Preview Toggle */}
        <button
          onClick={() => setEditMode(!editMode)}
          className={`h-8 px-3.5 rounded-[10px] text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
            editMode 
              ? 'bg-[#FF5733] text-white shadow-md shadow-[#FF5733]/15' 
              : 'bg-[#F8F9FB] border border-[#ECEEF2] text-[#6B7280] hover:text-[#111111]'
          }`}
          title="Toggle Canvas Mode (Ctrl+E)"
        >
          {editMode ? 'Edit Mode' : 'Preview Mode'}
        </button>

        {/* Code View button */}
        <button 
          onClick={() => setCodeViewOpen(!codeViewOpen)}
          className={`p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors ${codeViewOpen ? 'bg-[#111111] text-white' : 'bg-[#F8F9FB] border border-[#ECEEF2] text-[#6B7280] hover:text-[#111111]'}`}
          title="Toggle Monaco Code Editor (Ctrl+Shift+C)"
        >
          <FileCode className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section: AI Badge, Actions, Dropdown */}
      <div className="flex items-center gap-3">
        {/* Save/Export */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleManualSave}
            disabled={isSavingLocal}
            className="p-2 bg-[#F8F9FB] border border-[#ECEEF2] hover:bg-[#ECEEF2] rounded-full text-[#6B7280] hover:text-[#111111] transition-all cursor-pointer flex items-center justify-center disabled:opacity-55"
            title="Save Project (Ctrl+S)"
          >
            {isSavingLocal ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FF5733]" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-[#22C55E]" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleExportHtml}
            className="p-2 bg-[#F8F9FB] border border-[#ECEEF2] hover:bg-[#ECEEF2] rounded-full text-[#6B7280] hover:text-[#111111] transition-all cursor-pointer flex items-center justify-center"
            title="Export HTML File (Ctrl+Shift+E)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-[#ECEEF2]" />

        {/* AI Provider Badge */}
        <button
          onClick={() => setShowConfigModal(true)}
          className="h-10 px-3.5 bg-[#FF5733]/5 border border-[#FF5733]/15 text-[#FF5733] rounded-[14px] hover:bg-[#FF5733]/10 transition-all text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#FF5733]/5"
          title="Click to configure API settings"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF5733]" />
          <span>{activeProvider}</span>
        </button>

        {/* Deployment utilities */}
        {hasLiveUrl && platformTarget ? (
          <button 
            disabled={deploying}
            onClick={() => handleOpenHostingSetup(platformTarget)}
            className="h-10 px-4 bg-[#FF5733] hover:bg-[#E04F2E] text-white rounded-[14px] text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-55 shadow-sm shadow-[#FF5733]/15 flex items-center gap-1.5"
            title={`Publish updates to your live ${platformTarget === 'netlify' ? 'Netlify' : 'Vercel'} site`}
          >
            {deploying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : platformTarget === 'netlify' ? (
              <Cloud className="w-3.5 h-3.5" />
            ) : (
              <Server className="w-3.5 h-3.5" />
            )}
            <span>Publish Updates</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#F8F9FB] p-1 rounded-[14px] border border-[#ECEEF2]">
            <button 
              disabled={deploying}
              onClick={() => handleOpenHostingSetup('netlify')}
              className="h-8 px-3.5 bg-white text-[#6B7280] hover:text-[#111111] border border-[#ECEEF2] rounded-[10px] text-[10px] font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1.5 font-mono shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <Cloud className="w-3.5 h-3.5 text-[#00AD9F]" />
              <span>Netlify</span>
            </button>
            <button 
              disabled={deploying}
              onClick={() => handleOpenHostingSetup('vercel')}
              className="h-8 px-3.5 bg-white text-[#6B7280] hover:text-[#111111] border border-[#ECEEF2] rounded-[10px] text-[10px] font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1.5 font-mono shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <Server className="w-3.5 h-3.5 text-black" />
              <span>Vercel</span>
            </button>
          </div>
        )}

        <div className="h-5 w-px bg-[#ECEEF2]" />

        {/* User avatar with dropdown */}
        <div className="relative dropdown-container">
          <button 
            onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
            className="w-10 h-10 rounded-full border border-[#ECEEF2] hover:border-[#FF5733] bg-[#F8F9FB] flex items-center justify-center text-[#6B7280] hover:text-[#111111] cursor-pointer overflow-hidden transition-all"
            title="User Settings"
          >
            <User className="w-5 h-5" />
          </button>
          {showAvatarDropdown && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-[#ECEEF2] rounded-2xl p-2.5 shadow-xl shadow-black/5 flex flex-col gap-1 z-50 text-left animate-modal-enter">
              <div className="px-2 py-1.5 border-b border-[#ECEEF2] mb-1">
                <p className="text-xs font-bold text-[#111111] truncate">Folient Developer</p>
                <p className="text-[9px] font-mono text-[#9CA3AF] truncate">dev@folient.io</p>
              </div>
              <Link to="/dashboard" className="px-2 py-1.5 text-xs text-[#6B7280] hover:text-[#111111] hover:bg-[#F8F9FB] rounded-lg transition-colors flex items-center gap-2">
                Dashboard
              </Link>
              <Link to="/docs" className="px-2 py-1.5 text-xs text-[#6B7280] hover:text-[#111111] hover:bg-[#F8F9FB] rounded-lg transition-colors flex items-center gap-2">
                Guides & Docs
              </Link>
              <div className="h-px bg-[#ECEEF2] my-1" />
              <button 
                onClick={() => { showAlert('Signed Out', 'Signed out of Folient successfully.', 'success'); }}
                className="w-full text-left px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#ECEEF2] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] animate-modal-enter text-left">
            <h3 className="text-sm font-bold text-[#111111] font-mono mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-[#FF5733]" />
              <span>API Credentials Configuration</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-[#6B7280] mb-1.5 font-bold">Google Gemini API Key</label>
                <input 
                  type="password" 
                  value={geminiKey} 
                  onChange={e => setGeminiKey(e.target.value)} 
                  placeholder="AI Studio API key"
                  className="w-full h-9 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-3 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF5733] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#6B7280] mb-1.5 font-bold">Groq Console API Key</label>
                <input 
                  type="password" 
                  value={groqKey} 
                  onChange={e => setGroqKey(e.target.value)} 
                  placeholder="gsk_..."
                  className="w-full h-9 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-3 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF5733] transition-colors"
                />
              </div>

              <div className="h-px bg-[#ECEEF2] my-4" />

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#6B7280] mb-1.5 font-bold">Netlify Personal Access Token</label>
                <input 
                  type="password" 
                  value={netlifyToken} 
                  onChange={e => setNetlifyToken(e.target.value)} 
                  placeholder="Netlify token"
                  className="w-full h-9 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-3 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF5733] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#6B7280] mb-1.5 font-bold">Vercel Personal Access Token</label>
                <input 
                  type="password" 
                  value={vercelToken} 
                  onChange={e => setVercelToken(e.target.value)} 
                  placeholder="Vercel token"
                  className="w-full h-9 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-3 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF5733] transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button 
                onClick={saveConfig} 
                className="flex-1 h-9 bg-[#111111] hover:bg-black text-white text-xs font-bold font-mono uppercase rounded-lg transition-colors cursor-pointer"
              >
                Save Setup
              </button>
              <button 
                onClick={() => setShowConfigModal(false)} 
                className="flex-1 h-9 bg-[#F8F9FB] hover:bg-[#ECEEF2] text-[#6B7280] text-xs font-bold font-mono uppercase rounded-lg transition-colors cursor-pointer border border-[#ECEEF2]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subdomain Hosting Validation Modal rendered at body level using a portal fallback to escape parent overflow/z-index */}
      {showHostingSetup && hostingProvider && typeof document !== 'undefined' && (
        (() => {
          const modalContent = (
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <div className="w-[500px] max-h-[85vh] bg-white border border-[#ECEEF2] rounded-[24px] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.12)] animate-modal-enter text-left flex flex-col overflow-hidden gap-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#ECEEF2] shrink-0">
                  <div className="flex items-center gap-2">
                    {hostingProvider === 'netlify' ? (
                      <Cloud className="w-5 h-5 text-[#00AD9F]" />
                    ) : (
                      <Server className="w-5 h-5 text-black" />
                    )}
                    <div>
                      <h3 className="text-xs font-bold font-sans text-[#111111] uppercase tracking-wider">
                        {hostingProvider === 'netlify' ? 'Netlify Hosting Pipeline' : 'Vercel Hosting Pipeline'}
                      </h3>
                      <p className="text-[8px] font-sans text-[#6B7280]">Configure desired subdomain and validate credentials</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowHostingSetup(false)}
                    className="p-1 hover:bg-[#F8F9FB] rounded-lg text-[#6B7280] hover:text-[#111111] transition-all cursor-pointer border-none bg-transparent"
                  >
                    <Settings className="w-4 h-4 rotate-45" />
                  </button>
                </div>

                {/* Modal Scrollable Content Container */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-2 scrollbar-thin">
                  {!(hostingProvider === 'netlify' ? netlifyToken : vercelToken) ? (
                    /* Zero-Server Unconnected State */
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-[#F8F9FB] border border-[#ECEEF2] rounded-2xl gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF5733]/5 border border-[#FF5733]/15 flex items-center justify-center text-[#FF5733]">
                        <Sparkles className="w-6 h-6 animate-pulse-soft" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider font-sans">Connect {hostingProvider === 'netlify' ? 'Netlify' : 'Vercel'}</h4>
                        <p className="text-[10px] text-[#6B7280] leading-relaxed max-w-[280px]">
                          Securely link your account via our serverless OAuth pipeline to provision subdomains and deploy portfolios in one click.
                        </p>
                      </div>
                      <button 
                        onClick={hostingProvider === 'netlify' ? loginNetlify : loginVercel}
                        className="h-9 px-6 bg-[#111111] hover:bg-black text-white text-xs font-bold font-mono uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-black/5"
                      >
                        One-Click Connect
                      </button>
                    </div>
                  ) : (
                    /* Connected Configuration & Validation State */
                    <>
                      {hasLiveUrl ? (
                        <div className="flex flex-col gap-4">
                          <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-xs flex flex-col gap-2">
                            <div className="flex items-center gap-2 font-bold text-emerald-800">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>This portfolio is currently live!</span>
                            </div>
                            <p className="text-emerald-700 leading-relaxed">
                              Updates will be directly published to your existing site domain:
                            </p>
                            <a 
                              href={`https://${subdomainName}${hostingProvider === 'netlify' ? '.netlify.app' : '.vercel.app'}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#FF5733] font-bold font-mono underline hover:text-[#E04F2E] truncate block"
                            >
                              {subdomainName}{hostingProvider === 'netlify' ? '.netlify.app' : '.vercel.app'}
                            </a>
                          </div>

                          {shareMode === null ? (
                            <div className="border border-[#ECEEF2] rounded-2xl p-4 flex flex-col gap-3 text-left bg-[#F8F9FB]">
                              <span className="text-[10px] font-bold text-[#FF5733] font-mono uppercase tracking-wider">Showcase & Share</span>
                              <h4 className="text-xs font-bold text-[#111111] font-sans">Promote your Portfolio</h4>
                              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                                Share your live link and code structure to the public community feed, or publish this scratch-built portfolio as a reusable template.
                              </p>
                              
                              <div className="flex gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => setShareMode('feed')}
                                  className="flex-1 h-9 bg-white border border-[#ECEEF2] hover:bg-[#F3F4F6] text-[#111111] text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <span>Post to Feed</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (activeProjectId) {
                                      const p = await folientDb.projects.get(activeProjectId);
                                      if (p && (!p.activeTemplateId || p.activeTemplateId === 'blank')) {
                                        setShareMode('template');
                                        setShareTitle(p.name);
                                      } else {
                                        showAlert('Template Warning', 'Only portfolios built from scratch can be published to the Templates catalog.', 'error');
                                      }
                                    }
                                  }}
                                  className="flex-1 h-9 bg-white border border-[#ECEEF2] hover:bg-[#F3F4F6] text-[#111111] text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <span>Publish Template</span>
                                </button>
                              </div>
                            </div>
                          ) : shareMode === 'feed' ? (
                            <div className="border border-[#ECEEF2] rounded-2xl p-4 flex flex-col gap-3 text-left bg-white">
                              <span className="text-[10px] font-bold text-indigo-650 font-mono uppercase tracking-wider">Share to Feed</span>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase font-mono font-bold text-[#111111]">Post Message</label>
                                <textarea
                                  value={shareContent}
                                  onChange={(e) => setShareContent(e.target.value)}
                                  placeholder="What details make this portfolio special? Write your description..."
                                  className="w-full h-20 p-2.5 bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl text-xs text-[#111111] placeholder-zinc-400 focus:outline-none focus:border-[#FF5733] resize-none"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={isSharing || !shareContent.trim()}
                                  onClick={handleShareToFeed}
                                  className="flex-1 h-9 bg-[#111111] text-white hover:bg-black text-[10px] font-bold uppercase rounded-xl cursor-pointer disabled:opacity-55 flex items-center justify-center gap-1"
                                >
                                  {isSharing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                  <span>Publish Post</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setShareMode(null); setShareContent(''); }}
                                  className="px-3 h-9 bg-[#F8F9FB] hover:bg-[#ECEEF2] border border-[#ECEEF2] text-gray-500 text-[10px] font-bold uppercase rounded-xl cursor-pointer"
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="border border-[#ECEEF2] rounded-2xl p-4 flex flex-col gap-3 text-left bg-white">
                              <span className="text-[10px] font-bold text-indigo-650 font-mono uppercase tracking-wider">Publish as Custom Template</span>
                              
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase font-mono font-bold text-[#111111]">Template Name</label>
                                <input
                                  type="text"
                                  value={shareTitle}
                                  onChange={(e) => setShareTitle(e.target.value)}
                                  placeholder="Name your template"
                                  className="w-full h-8 px-2.5 bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#FF5733]"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase font-mono font-bold text-[#111111]">Category</label>
                                <select
                                  value={shareCategory}
                                  onChange={(e) => setShareCategory(e.target.value)}
                                  className="w-full h-8 px-2.5 bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer font-sans font-medium"
                                >
                                  <option value="Product Engineering">Product Engineering</option>
                                  <option value="UI/UX Design">UI/UX Design</option>
                                  <option value="Agency">Agency</option>
                                  <option value="Freelancer">Freelancer</option>
                                </select>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase font-mono font-bold text-[#111111]">Tags (comma separated)</label>
                                <input
                                  type="text"
                                  value={shareTags}
                                  onChange={(e) => setShareTags(e.target.value)}
                                  placeholder="e.g. Bento, Minimalist, Glassmorphism"
                                  className="w-full h-8 px-2.5 bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#FF5733]"
                                />
                              </div>

                              <label className="flex items-start gap-2 py-1.5 cursor-pointer text-[10px] font-semibold text-[#6B7280] hover:text-[#111111]">
                                <input
                                  type="checkbox"
                                  checked={sharePermission}
                                  onChange={(e) => setSharePermission(e.target.checked)}
                                  className="rounded border-[#ECEEF2] text-[#111111] focus:ring-[#111111] h-3.5 w-3.5 mt-0.5"
                                />
                                <span>I grant permission to make this project template code public.</span>
                              </label>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={isSharing || !sharePermission || !shareTitle.trim()}
                                  onClick={handleShareAsTemplate}
                                  className="flex-1 h-9 bg-[#111111] text-white hover:bg-black text-[10px] font-bold uppercase rounded-xl cursor-pointer disabled:opacity-55 flex items-center justify-center gap-1"
                                >
                                  {isSharing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                  <span>Publish Template</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setShareMode(null); setShareTags(''); setSharePermission(false); }}
                                  className="px-3 h-9 bg-[#F8F9FB] hover:bg-[#ECEEF2] border border-[#ECEEF2] text-gray-500 text-[10px] font-bold uppercase rounded-xl cursor-pointer"
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed">
                            Choose a subdomain name for your portfolio. We will validate its availability live with the platform provider before provisioning.
                          </p>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#111111]">Desired Subdomain</label>
                            <div className="flex items-stretch gap-2">
                              <div className="flex-1 relative flex items-center bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl overflow-hidden focus-within:border-[#FF5733] transition-colors">
                                <input 
                                  type="text" 
                                  value={subdomainName}
                                  onChange={(e) => {
                                    setSubdomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                                    setValidationResult({ checked: false, available: false });
                                  }}
                                  placeholder="my-portfolio"
                                  className="w-full h-10 px-3 bg-transparent text-xs font-semibold text-[#111111] focus:outline-none"
                                />
                                <span className="text-[10px] font-mono text-[#9CA3AF] pr-3 select-none">
                                  {hostingProvider === 'netlify' ? '.netlify.app' : '.vercel.app'}
                                </span>
                              </div>
                              <button 
                                onClick={handleValidateSubdomain}
                                disabled={isValidatingSubdomain || !subdomainName.trim()}
                                className="h-10 px-4 bg-[#111111] hover:bg-black disabled:bg-[#ECEEF2] text-white disabled:text-[#9CA3AF] text-xs font-bold font-mono uppercase rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                              >
                                {isValidatingSubdomain && <Loader2 className="w-3 h-3 animate-spin" />}
                                <span>Validate</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Live validation feedback */}
                      {validationResult.checked && (
                        <div className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                          validationResult.available 
                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                            : 'bg-rose-50/50 border-rose-100 text-rose-800'
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold">
                            <div className={`w-1.5 h-1.5 rounded-full ${validationResult.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{validationResult.available ? 'Subdomain is Available!' : 'Subdomain Unavailable'}</span>
                          </div>
                          {validationResult.error && (
                            <p className="text-[10px] text-rose-600 font-medium font-mono">{validationResult.error}</p>
                          )}
                          {validationResult.available && (
                            <p className="text-[10px] text-emerald-600">Your site will be provisioned at: <strong className="font-mono">{subdomainName}{hostingProvider === 'netlify' ? '.netlify.app' : '.vercel.app'}</strong></p>
                          )}
                        </div>
                      )}

                      {/* Deployment progress logs display */}
                      {deploying && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#111111] flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin text-[#FF5733]" />
                            <span>Provisioning Pipeline Logs</span>
                          </label>
                          <div className="h-28 bg-[#111111] rounded-xl p-3 font-mono text-[9px] text-[#ECEEF2] overflow-y-auto flex flex-col gap-1 text-left">
                            {deployLogs.map((logStr: string, i: number) => (
                              <div key={i} className="leading-relaxed">{logStr}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Modal Footer Controls */}
                <div className="flex gap-2.5 pt-4 border-t border-[#ECEEF2] shrink-0">
                  {(hostingProvider === 'netlify' ? netlifyToken : vercelToken) && (
                    <button 
                      onClick={handleDeploy}
                      disabled={deploying || !subdomainName.trim() || (!hasLiveUrl && validationResult.checked && !validationResult.available)}
                      className="flex-1 h-10 bg-[#FF5733] hover:bg-[#E04F2E] disabled:bg-[#ECEEF2] text-white disabled:text-[#9CA3AF] text-xs font-bold font-mono uppercase rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                    >
                      {deploying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Deploying...</span>
                        </>
                      ) : (
                        <span>Deploy Now</span>
                      )}
                    </button>
                  )}
                  {hasLiveUrl && (
                    <button 
                      onClick={handleSyncFromLive}
                      disabled={isSyncingLive || deploying}
                      className="h-10 px-4 bg-[#F8F9FB] hover:bg-[#ECEEF2] text-[#111111] disabled:opacity-50 text-xs font-bold font-mono uppercase rounded-xl cursor-pointer border border-[#ECEEF2] flex items-center gap-1.5"
                      title="Sync workspace from live website code"
                    >
                      {isSyncingLive ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-[#FF5733]" />
                      )}
                      <span>Pull Live</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setShowHostingSetup(false)}
                    disabled={deploying}
                    className="h-10 px-5 bg-[#F8F9FB] hover:bg-[#ECEEF2] disabled:opacity-50 text-[#6B7280] text-xs font-bold font-mono uppercase rounded-xl cursor-pointer border border-[#ECEEF2] flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          );

          return createPortal(modalContent, document.body);
        })()
      )}

      {/* Custom Alert/Confirm Modal Dialog using React Portal */}
      {customDialog && customDialog.isOpen && typeof document !== 'undefined' && (
        (() => {
          const dialogContent = (
            <div className="fixed inset-0 z-[10000] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <div className="w-[400px] max-w-full bg-white border border-[#ECEEF2] rounded-[24px] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.12)] animate-modal-enter text-left flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#ECEEF2]">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    customDialog.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : customDialog.type === 'error'
                        ? 'bg-rose-50 text-rose-600'
                        : customDialog.type === 'confirm'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {customDialog.type === 'success' ? '✓' : customDialog.type === 'error' ? '✕' : customDialog.type === 'confirm' ? '?' : 'ℹ'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans text-[#111111] uppercase tracking-wider">
                      {customDialog.title}
                    </h3>
                    <p className="text-[10px] text-zinc-400">System Notification</p>
                  </div>
                </div>

                <div className="py-2">
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {customDialog.message}
                  </p>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-[#ECEEF2]">
                  {customDialog.type === 'confirm' ? (
                    <>
                      <button
                        onClick={() => {
                          if (customDialog.onConfirm) customDialog.onConfirm();
                          setCustomDialog(null);
                        }}
                        className="flex-1 h-10 bg-[#FF5733] hover:bg-[#E04F2E] text-white text-xs font-bold font-mono uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center shadow-md shadow-[#FF5733]/15"
                      >
                        {customDialog.confirmText || 'Yes, Proceed'}
                      </button>
                      <button
                        onClick={() => setCustomDialog(null)}
                        className="flex-1 h-10 bg-[#F8F9FB] hover:bg-[#ECEEF2] text-[#6B7280] text-xs font-bold font-mono uppercase rounded-xl cursor-pointer border border-[#ECEEF2] transition-colors"
                      >
                        {customDialog.cancelText || 'Cancel'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCustomDialog(null)}
                      className="w-full h-10 bg-[#111111] hover:bg-black text-white text-xs font-bold font-mono uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center"
                    >
                      {customDialog.confirmText || 'Dismiss'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
          return createPortal(dialogContent, document.body);
        })()
      )}
    </header>
  );
}