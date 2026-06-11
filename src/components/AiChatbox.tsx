import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, X, Check, ArrowRight, FileText, Trash2, Plus, Search, AlertCircle, UploadCloud, Image, Zap, ChevronDown } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { sendAiCommand, applyPatchesToAst, detectTargetSection, generateFullPortfolio, PORTFOLIO_STYLES, type AIProviderConfig, type PortfolioStyle } from '../lib/aiInferenceRouter';
import { uploadSupabaseFile, listSupabaseFiles, deleteSupabaseFile } from '../services/SupabaseClient';
import { useSearchParams } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  targetNodeId?: string;
  patches?: any[];
  applied?: boolean;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
}

const CURATED_UNSPLASH_ASSETS = [
  {
    id: 'u1',
    name: 'Minimal Workspace Desk',
    category: 'workspace',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    tags: ['desk', 'office', 'workspace', 'clean', 'interior']
  },
  {
    id: 'u2',
    name: 'Laptop and Code Screen',
    category: 'tech',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    tags: ['code', 'developer', 'screen', 'tech', 'laptop']
  },
  {
    id: 'u3',
    name: 'Modern Office Room',
    category: 'workspace',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
    tags: ['office', 'interior', 'building', 'meeting']
  },
  {
    id: 'u4',
    name: 'Abstract Geometric Shapes',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
    tags: ['minimal', 'abstract', 'art', 'background']
  },
  {
    id: 'u5',
    name: 'Business Team Collaboration',
    category: 'team',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    tags: ['team', 'meeting', 'collaboration', 'business', 'people']
  },
  {
    id: 'u6',
    name: 'Workspace Analytics Dashboard',
    category: 'tech',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    tags: ['analytics', 'dashboard', 'chart', 'business', 'tech']
  },
  {
    id: 'u7',
    name: 'Laptop on Workspace Table',
    category: 'tech',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    tags: ['laptop', 'desk', 'workspace', 'computer']
  },
  {
    id: 'u8',
    name: 'Co-working Creative Studio',
    category: 'workspace',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
    tags: ['studio', 'office', 'workspace', 'interior']
  },
  {
    id: 'u9',
    name: 'Forest Mist Trail',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80',
    tags: ['forest', 'nature', 'trees', 'mist', 'outdoor']
  },
  {
    id: 'u10',
    name: 'Mountain Sunset Peak',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    tags: ['mountain', 'sunset', 'nature', 'landscape']
  },
  {
    id: 'u11',
    name: 'Clean Sandy Beach',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    tags: ['beach', 'sea', 'nature', 'minimal']
  },
  {
    id: 'u12',
    name: 'Premium Headphones Black',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    tags: ['headphones', 'minimal', 'product', 'black']
  },
  {
    id: 'u13',
    name: 'Code on Computer Monitor',
    category: 'tech',
    url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=80',
    tags: ['code', 'developer', 'screen', 'tech']
  },
  {
    id: 'u14',
    name: 'Creative Meeting Session',
    category: 'team',
    url: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&auto=format&fit=crop&q=80',
    tags: ['meeting', 'collaboration', 'creative', 'people']
  },
  {
    id: 'u15',
    name: 'Abstract Colorful Gradient',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80',
    tags: ['abstract', 'gradient', 'colorful', 'background']
  },
  {
    id: 'u16',
    name: 'Minimal Plant on Desk',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80',
    tags: ['minimal', 'plant', 'desk', 'workspace']
  }
];

const AVAILABLE_MODELS = {
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
  ],
  openrouter: [
    { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 Free' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Free' },
    { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B Free' },
    { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B Free' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron Nano Free' }
  ]
};

export default function AiChatbox() {
  const { 
    ast, 
    setAst, 
    setFullAst,
    selectedNodeId, 
    isGenerating, 
    setIsGenerating, 
    addTelemetryLog,
    activeProjectId
  } = useEditorStore();

  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'build'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Folient design partner. Select any layout node and tell me how to modify it, or switch to the Build tab to generate a full portfolio from your brief.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // Build Tab State
  const [buildBrief, setBuildBrief] = useState('');
  const [buildStyle, setBuildStyle] = useState<PortfolioStyle>(PORTFOLIO_STYLES[0]);
  const [buildSections, setBuildSections] = useState<string[]>(['navbar', 'hero', 'about', 'skills', 'projects', 'contact', 'footer']);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [buildError, setBuildError] = useState('');
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const AVAILABLE_SECTIONS = [
    { id: 'navbar', label: 'Navbar' },
    { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'About Me' },
    { id: 'skills', label: 'Skills Grid' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'stats', label: 'Stats Bar' },
    { id: 'contact', label: 'Contact' },
    { id: 'footer', label: 'Footer' },
  ];
  const toggleBuildSection = (id: string) => {
    setBuildSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'groq' | 'openrouter'>('gemini');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [contextMode, setContextMode] = useState<'auto' | 'node' | 'full'>('auto');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; type: string } | null>(null);

  // Unsplash Image Search state variables
  const [showUnsplashModal, setShowUnsplashModal] = useState(false);
  const [unsplashSearch, setUnsplashSearch] = useState('');
  const [unsplashAssets, setUnsplashAssets] = useState<any[]>([]);
  const [isLoadingUnsplash, setIsLoadingUnsplash] = useState(false);

  // Custom Dropdown Open state variables
  const [showContextDropdownInput, setShowContextDropdownInput] = useState(false);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Dragging coordinates state - default positioned at top-right below navigation
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 110 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Auto-trigger custom template customization prompt
  useEffect(() => {
    const initPrompt = searchParams.get('prompt');
    if (initPrompt && ast) {
      // Clear prompt param from URL first so it doesn't re-trigger on subsequent AST updates
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('prompt');
      setSearchParams(newParams, { replace: true });

      // Run auto trigger execution targeting the full page (root-viewport)
      const triggerAutoPrompt = async () => {
        const keyKey = provider === 'gemini' ? 'gemini_api_key' : provider === 'groq' ? 'groq_api_key' : 'openrouter_api_key';
        const apiKey = localStorage.getItem(keyKey);
        if (!apiKey) {
          addTelemetryLog('Auto-customization failed: API credentials missing.', 'error');
          return;
        }

        const userMsg: ChatMessage = {
          id: Math.random().toString(36).substring(4),
          sender: 'user',
          text: initPrompt,
          timestamp: new Date().toLocaleTimeString(),
          targetNodeId: 'root-viewport'
        };
        setMessages(prev => [...prev, userMsg]);
        setIsGenerating(true);
        addTelemetryLog(`Streaming layout customization based on template request...`, 'info');

        try {
          const providerConfig: AIProviderConfig = { provider, apiKey, model: modelName };
          const patches = await sendAiCommand(providerConfig, initPrompt, ast, activeProjectId || undefined);
          
          const aiMsg: ChatMessage = {
            id: Math.random().toString(36).substring(4),
            sender: 'ai',
            text: `I have customized the template layout based on your prompt. Review the changes:`,
            timestamp: new Date().toLocaleTimeString(),
            targetNodeId: 'root-viewport',
            patches,
            applied: false
          };
          setMessages(prev => [...prev, aiMsg]);
          addTelemetryLog(`Customization success. ${patches.length} design modifications loaded.`, 'success');
        } catch (err: any) {
          console.error(err);
          const aiErrorMsg: ChatMessage = {
            id: Math.random().toString(36).substring(4),
            sender: 'ai',
            text: `Error performing customization: ${err.message || err}`,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, aiErrorMsg]);
          addTelemetryLog(`Customization failure: ${err.message || err}`, 'error');
        } finally {
          setIsGenerating(false);
        }
      };
      
      // Delay slightly to ensure Editor and Canvas are mounted and ready
      const t = setTimeout(() => {
        triggerAutoPrompt();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [ast, searchParams, setSearchParams]);

  // Sync positions on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(window.innerWidth - 400, Math.max(16, prev.x)),
        y: Math.min(window.innerHeight - 520, Math.max(16, prev.y))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load Unsplash Images from Lorem Picsum as dynamic fallback assets
  useEffect(() => {
    if (showUnsplashModal) {
      const loadPicsumImages = async () => {
        setIsLoadingUnsplash(true);
        try {
          const res = await fetch('https://picsum.photos/v2/list?limit=60');
          const data = await res.json();
          const formatted = data.map((item: any) => ({
            id: `p-${item.id}`,
            name: `Photo by ${item.author}`,
            category: 'general',
            url: item.download_url,
            tags: ['picsum', item.author.toLowerCase(), 'general', 'photo']
          }));
          setUnsplashAssets(formatted);
        } catch (err) {
          console.error('Failed to load Picsum assets:', err);
        } finally {
          setIsLoadingUnsplash(false);
        }
      };
      loadPicsumImages();
    }
  }, [showUnsplashModal]);


  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      offsetRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const x = Math.min(window.innerWidth - 390, Math.max(16, e.clientX - offsetRef.current.x));
        const y = Math.min(window.innerHeight - 510, Math.max(16, e.clientY - offsetRef.current.y));
        setPosition({ x, y });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const executeCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !attachedFile) return;

    // Smart section targeting: auto-detect which section the prompt refers to
    const smartTargetId = contextMode === 'full'
      ? 'root-viewport'
      : contextMode === 'node'
        ? (selectedNodeId || 'root-viewport')
        : detectTargetSection(prompt, ast); // 'auto' mode uses smart detection
    
    // Retrieve Key
    const keyKey = provider === 'gemini' ? 'gemini_api_key' : provider === 'groq' ? 'groq_api_key' : 'openrouter_api_key';
    const apiKey = localStorage.getItem(keyKey);

    if (!apiKey) {
      const errLog = `API Error: Configuration credentials missing for provider [${provider}]. Setup key in Top settings panel first.`;
      addTelemetryLog(errLog, 'error');
      alert(`API Key is not configured for provider [${provider}]. Please input your credentials in the Top settings panel first.`);
      return;
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(4),
      sender: 'user',
      text: prompt || `Attached asset: ${attachedFile?.name}`,
      timestamp: new Date().toLocaleTimeString(),
      targetNodeId: smartTargetId,
      attachment: attachedFile || undefined
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Construct API prompt with reference context
    let runPrompt = prompt || `Analyze and integrate the following attached layout asset.`;
    if (attachedFile) {
      const isImg = attachedFile.type === 'image';
      runPrompt += isImg
        ? `\n\n[Context Image: ${attachedFile.name} (${attachedFile.url})]`
        : `\n\n[Context Document: ${attachedFile.name} (${attachedFile.url})]`;
    }

    setPrompt('');
    setAttachedFile(null);
    setIsGenerating(true);
    addTelemetryLog(`Smart targeting: node [${smartTargetId}] — streaming instruction execution...`, 'info');

    try {
      const findNode = (node: any): any => {
        if (node.id === smartTargetId) return node;
        if (node.children) {
          for (const child of node.children) {
            const f = findNode(child);
            if (f) return f;
          }
        }
        return null;
      };
      
      const targetAstChunk = findNode(ast) || ast;
      const providerConfig: AIProviderConfig = { provider, apiKey, model: modelName };

      const patches = await sendAiCommand(providerConfig, runPrompt, targetAstChunk, activeProjectId || undefined);
      
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substring(4),
        sender: 'ai',
        text: `${smartTargetId !== 'root-viewport' ? `🎯 Auto-targeted **${smartTargetId}**. ` : ''}Design modifications ready. Review and apply:`,
        timestamp: new Date().toLocaleTimeString(),
        targetNodeId: smartTargetId,
        patches,
        applied: false
      };
      setMessages(prev => [...prev, aiMsg]);
      addTelemetryLog(`Inference complete. ${patches.length} patches targeting [${smartTargetId}].`, 'success');
    } catch (err: any) {
      console.error(err);
      const errMessage = err.message || err;
      const aiErrorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(4),
        sender: 'ai',
        text: `Error executing command: ${errMessage}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiErrorMsg]);
      addTelemetryLog(`AI Generation Failure: ${errMessage}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Build Portfolio Handler ──────────────────────────────────────────────
  const handleBuildPortfolio = async () => {
    if (!buildBrief.trim()) {
      setBuildError('Please describe yourself — name, role, skills, and projects.');
      return;
    }
    if (buildSections.length === 0) {
      setBuildError('Please select at least one section to generate.');
      return;
    }
    const keyKey = provider === 'gemini' ? 'gemini_api_key' : provider === 'groq' ? 'groq_api_key' : 'openrouter_api_key';
    const apiKey = localStorage.getItem(keyKey);
    if (!apiKey) {
      setBuildError(`API key missing for [${provider}]. Configure it in the top settings panel.`);
      return;
    }

    setBuildError('');
    setBuildStatus('generating');
    setIsGenerating(true);
    addTelemetryLog(`Portfolio generation started — ${buildSections.length} sections, ${buildStyle.name} style.`, 'info');

    try {
      const providerConfig: AIProviderConfig = { provider, apiKey, model: modelName };
      const newAst = await generateFullPortfolio(
        providerConfig,
        buildBrief,
        buildStyle,
        buildSections,
        activeProjectId || undefined
      );
      setFullAst(newAst);
      setBuildStatus('done');
      addTelemetryLog(`Portfolio generated successfully with ${buildSections.length} sections.`, 'success');
      // Switch to chat tab to see the result
      setTimeout(() => setActiveTab('chat'), 800);
    } catch (err: any) {
      console.error(err);
      setBuildError(err.message || 'Generation failed. Try again.');
      setBuildStatus('error');
      addTelemetryLog(`Portfolio generation failed: ${err.message || err}`, 'error');
    } finally {
      setIsGenerating(false);
      if (buildStatus !== 'error') setBuildStatus('idle');
    }
  };

  const handleApplyPatches = (msgId: string, patches: any[], targetNodeId: string) => {
    try {
      const updatedAst = applyPatchesToAst(ast, targetNodeId, patches);
      setAst(updatedAst);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } : m));
      addTelemetryLog(`Applied RFC 6902 patches to node [${targetNodeId}] successfully.`, 'success');
    } catch (err: any) {
      alert(`Applying patches failed: ${err.message}`);
    }
  };

  const handleDiscardPatches = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, patches: undefined } : m));
    addTelemetryLog(`AI modifications discarded by user.`, 'warn');
  };

  const handleSelectUnsplashAsset = (asset: any) => {
    setAttachedFile({
      name: asset.name.toLowerCase().replace(/\s+/g, '_') + '.jpg',
      url: asset.url,
      type: 'image'
    });
    setShowUnsplashModal(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Retrieve Supabase credentials
    const url = localStorage.getItem('supabase_url') || '';
    const anonKey = localStorage.getItem('supabase_anon_key') || '';
    const serviceRoleKey = localStorage.getItem('supabase_service_role_key') || '';
    const bucket = localStorage.getItem('supabase_bucket') || 'folient-media';

    if (!url || !anonKey) {
      alert('Supabase account configuration is missing. Please configure your supabase_url and supabase_anon_key in the Dashboard page first.');
      setShowAttachmentMenu(false);
      return;
    }

    setIsUploading(true);
    addTelemetryLog(`Uploading file [${file.name}] to connected Supabase storage vault...`, 'info');

    try {
      const asset = await uploadSupabaseFile(url, serviceRoleKey || anonKey, bucket, file, 0, serviceRoleKey);
      const ext = file.name.split('.').pop()?.toUpperCase() || '';
      const isImg = ['PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'WEBP'].includes(ext);
      
      setAttachedFile({
        name: file.name,
        url: asset.url,
        type: isImg ? 'image' : 'document'
      });
      addTelemetryLog(`File upload success: [${file.name}] uploaded to Supabase successfully.`, 'success');
    } catch (err: any) {
      console.error(err);
      alert(`File upload failed: ${err.message || err}`);
      addTelemetryLog(`File upload error: ${err.message || err}`, 'error');
    } finally {
      setIsUploading(false);
      setShowAttachmentMenu(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fetchMediaAssets = async () => {
    const url = localStorage.getItem('supabase_url') || '';
    const anonKey = localStorage.getItem('supabase_anon_key') || '';
    const serviceRoleKey = localStorage.getItem('supabase_service_role_key') || '';
    const bucket = localStorage.getItem('supabase_bucket') || 'folient-media';
    if (!url || !anonKey) {
      alert('Supabase credentials missing. Configure them on the Dashboard page first.');
      return;
    }

    setIsLoadingAssets(true);
    try {
      const assets = await listSupabaseFiles(url, serviceRoleKey || anonKey, bucket, 0, serviceRoleKey);
      setMediaAssets(assets);
    } catch (err: any) {
      console.error(err);
      addTelemetryLog(`Failed to load Supabase assets: ${err.message || err}`, 'error');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleUploadInModal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = localStorage.getItem('supabase_url') || '';
    const anonKey = localStorage.getItem('supabase_anon_key') || '';
    const serviceRoleKey = localStorage.getItem('supabase_service_role_key') || '';
    const bucket = localStorage.getItem('supabase_bucket') || 'folient-media';

    if (!url || !anonKey) {
      alert('Supabase configuration missing.');
      return;
    }

    setIsUploading(true);
    addTelemetryLog(`Uploading file [${file.name}] from modal to Supabase storage...`, 'info');
    try {
      await uploadSupabaseFile(url, serviceRoleKey || anonKey, bucket, file, 0, serviceRoleKey);
      addTelemetryLog(`Uploaded file [${file.name}] successfully.`, 'success');
      await fetchMediaAssets();
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message || err}`);
      addTelemetryLog(`Upload failure inside modal: ${err.message || err}`, 'error');
    } finally {
      setIsUploading(false);
      if (modalFileInputRef.current) {
        modalFileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAsset = async (filename: string) => {
    const conf = window.confirm(`Are you sure you want to delete "${filename}" from Supabase storage?`);
    if (!conf) return;

    const url = localStorage.getItem('supabase_url') || '';
    const anonKey = localStorage.getItem('supabase_anon_key') || '';
    const serviceRoleKey = localStorage.getItem('supabase_service_role_key') || '';
    const bucket = localStorage.getItem('supabase_bucket') || 'folient-media';

    try {
      await deleteSupabaseFile(url, anonKey, bucket, filename, serviceRoleKey);
      addTelemetryLog(`Deleted file [${filename}] from Supabase.`, 'success');
      await fetchMediaAssets();
    } catch (err: any) {
      console.error(err);
      alert(`Deletion failed: ${err.message || err}`);
      addTelemetryLog(`Deletion failure inside modal: ${err.message || err}`, 'error');
    }
  };

  const handleSelectAsset = (asset: any) => {
    setAttachedFile({
      name: asset.name,
      url: asset.url,
      type: asset.type
    });
    setShowMediaModal(false);
  };

  return (
    <>
      {/* 1. Floating Collapsed Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-12 px-4 bg-[#111111] hover:bg-black text-white rounded-full flex items-center gap-2 cursor-pointer shadow-lg shadow-black/10 hover:shadow-black/25 z-40 transition-all border border-[#ECEEF2]/10"
        >
          <Sparkles className="w-5 h-5 text-[#FF5733] animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{modelName}</span>
        </button>
      )}

      {/* 2. Expanded Floating Panel */}
      {isOpen && (
        <div 
          ref={dragRef}
          onMouseDown={handleMouseDown}
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px` 
          }}
          className={`fixed w-[390px] h-[580px] bg-white border border-[#ECEEF2] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden z-40 select-none ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          {/* Header with Tabs */}
          <div className="border-b border-[#ECEEF2] bg-white px-4 flex flex-col drag-handle cursor-grab shrink-0">
            {/* Top row: branding + model + close */}
            <div className="h-11 flex items-center justify-between">
              <div className="flex items-center gap-1.5 select-none">
                <Sparkles className="w-4 h-4 text-[#FF5733] fill-[#FF5733]" />
                <span className="text-[11px] font-sans font-bold tracking-wider text-[#111111]">AI DESIGN PARTNER</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Model picker pill */}
                <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="bg-[#F8F9FB] hover:bg-[#ECEEF2] border border-[#ECEEF2] px-3 py-1 rounded-full text-[9px] font-mono text-[#FF5733] font-bold cursor-pointer transition-colors flex items-center gap-1 focus:outline-none"
                >
                  {modelName.includes('/') ? modelName.split('/').pop() : modelName}
                  <span className="text-[7px] text-[#9CA3AF]">▼</span>
                </button>
                {showModelDropdown && (
                  <div className="absolute right-0 top-7 w-56 bg-white border border-[#ECEEF2] rounded-xl p-2.5 shadow-xl flex flex-col gap-2 z-50 text-left max-h-80 overflow-y-auto scrollbar-thin animate-fade-in">
                    <div>
                      <div className="text-[7.5px] font-mono text-[#9CA3AF] uppercase tracking-wider font-bold mb-1 px-1">Gemini Core</div>
                      <div className="flex flex-col gap-0.5">
                        {AVAILABLE_MODELS.gemini.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setProvider('gemini');
                              setModelName(m.id);
                              setShowModelDropdown(false);
                              addTelemetryLog(`AI model switched to: ${m.name}`, 'info');
                            }}
                            className={`h-6 px-2 text-left text-[9px] font-mono rounded border-none cursor-pointer w-full transition-colors flex justify-between items-center ${
                              provider === 'gemini' && modelName === m.id ? 'bg-[#FF5733]/15 text-[#FF5733] font-bold' : 'bg-transparent text-[#6B7280] hover:bg-[#F8F9FB]'
                            }`}
                          >
                            <span>{m.name}</span>
                            <span className="text-[7px] opacity-40">{m.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#ECEEF2]/60 my-1" />

                    <div>
                      <div className="text-[7.5px] font-mono text-[#9CA3AF] uppercase tracking-wider font-bold mb-1 px-1">Groq Llama</div>
                      <div className="flex flex-col gap-0.5">
                        {AVAILABLE_MODELS.groq.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setProvider('groq');
                              setModelName(m.id);
                              setShowModelDropdown(false);
                              addTelemetryLog(`AI model switched to: ${m.name}`, 'info');
                            }}
                            className={`h-6 px-2 text-left text-[9px] font-mono rounded border-none cursor-pointer w-full transition-colors flex justify-between items-center ${
                              provider === 'groq' && modelName === m.id ? 'bg-[#FF5733]/15 text-[#FF5733] font-bold' : 'bg-transparent text-[#6B7280] hover:bg-[#F8F9FB]'
                            }`}
                          >
                            <span>{m.name}</span>
                            <span className="text-[7px] opacity-40">{m.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#ECEEF2]/60 my-1" />

                    <div>
                      <div className="text-[7.5px] font-mono text-[#9CA3AF] uppercase tracking-wider font-bold mb-1 px-1">OpenRouter Free</div>
                      <div className="flex flex-col gap-0.5">
                        {AVAILABLE_MODELS.openrouter.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setProvider('openrouter');
                              setModelName(m.id);
                              setShowModelDropdown(false);
                              addTelemetryLog(`AI model switched to: ${m.name}`, 'info');
                            }}
                            className={`h-6 px-2 text-left text-[9px] font-mono rounded border-none cursor-pointer w-full transition-colors flex justify-between items-center ${
                              provider === 'openrouter' && modelName === m.id ? 'bg-[#FF5733]/15 text-[#FF5733] font-bold' : 'bg-transparent text-[#6B7280] hover:bg-[#F8F9FB]'
                            }`}
                          >
                            <span>{m.name}</span>
                            <span className="text-[7px] opacity-40">{m.id.split('/').pop()}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#F8F9FB] rounded-lg text-[#6B7280] hover:text-[#111111] transition-all cursor-pointer border-none bg-transparent"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-[#ECEEF2] bg-[#FAFAFA] px-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0 ${
                activeTab === 'chat' ? 'border-[#FF5733] text-[#FF5733]' : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('build')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0 ${
                activeTab === 'build' ? 'border-[#FF5733] text-[#FF5733]' : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
              }`}
            >
              <Zap className="w-3 h-3" />
              Build Portfolio
            </button>
          </div>
          </div>

          {/* Chat Messages */}
          {activeTab === 'chat' && (
          <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-white">
            {messages.map((msg) => (

              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.targetNodeId && (
                  <span className="text-[7px] font-mono uppercase bg-[#ECEEF2] text-[#6B7280] px-1.5 py-0.5 rounded-sm mb-1">
                    Node: {msg.targetNodeId.slice(-10)}
                  </span>
                )}
                <div className={`max-w-[85%] rounded-[18px] p-3 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#111111] text-white rounded-tr-none' 
                    : 'bg-[#F8F9FB] border border-[#ECEEF2] text-[#111111] rounded-tl-none shadow-[0_1px_2px_rgba(0,0,0,0.01)]'
                }`}>
                  <p>{msg.text}</p>

                  {/* Visual Attachment Preview inline in message */}
                  {msg.attachment && (
                    <div className={`mt-2.5 flex items-center gap-2 p-1.5 rounded-xl border text-[9px] font-mono leading-none text-left ${
                      msg.sender === 'user'
                        ? 'bg-white/10 border-white/10 text-white'
                        : 'bg-[#F8F9FB] border-[#ECEEF2] text-[#111111]'
                    }`}>
                      {msg.attachment.type === 'image' ? (
                        <img 
                          src={msg.attachment.url} 
                          alt={msg.attachment.name} 
                          className="w-8 h-8 object-cover rounded-md"
                        />
                      ) : (
                        <FileText className="w-5 h-5 opacity-75" />
                      )}
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="font-semibold truncate max-w-[180px]">{msg.attachment.name}</span>
                        <span className="opacity-60 text-[7px] truncate">Attached Vault File</span>
                      </div>
                    </div>
                  )}

                  {/* Inline code diffs */}
                  {msg.patches && msg.patches.length > 0 && !msg.applied && (
                    <div className="mt-3 pt-3 border-t border-[#ECEEF2] flex flex-col gap-2 bg-[#F8F9FB] p-2 rounded-lg">
                      <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Patches Generated ({msg.patches.length})</div>
                      <div className="max-h-24 overflow-y-auto font-mono text-[9px] text-zinc-700 bg-white border border-[#ECEEF2] p-1.5 rounded space-y-1">
                        {msg.patches.map((p, idx) => (
                          <div key={idx} className="truncate">
                            <span className="text-blue-500">replace</span> {p.path} <ArrowRight className="w-2 h-2 inline-block mx-0.5" /> <span className="text-green-500">"{String(p.value).substring(0, 15)}..."</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApplyPatches(msg.id, msg.patches!, msg.targetNodeId!)}
                          className="flex-1 h-7 bg-[#FF5733] text-white text-[9px] font-mono uppercase font-bold rounded-md cursor-pointer border-none flex items-center justify-center gap-1 shadow-sm shadow-[#FF5733]/10"
                        >
                          <Check className="w-3 h-3" /> Apply
                        </button>
                        <button
                          onClick={() => handleDiscardPatches(msg.id)}
                          className="flex-1 h-7 bg-white border border-[#ECEEF2] text-[#6B7280] hover:text-[#111111] text-[9px] font-mono uppercase font-bold rounded-md cursor-pointer flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" /> Discard
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.applied && (
                    <div className="mt-2 text-[9px] font-mono text-[#22C55E] flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> Changes Applied
                    </div>
                  )}
                </div>
                <span className="text-[7px] text-[#9CA3AF] mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex flex-col items-start">
                <div className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-[18px] rounded-tl-none p-3 shadow-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-[#FF5733] animate-spin" />
                  <span className="text-[10px] font-mono text-[#6B7280]">AI design stream running...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Area */}
          </>
          )}

          {/* ─── Build Tab Panel ────────────────────────────────────────── */}
          {activeTab === 'build' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin bg-white">

            {/* Brief Section */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">Your Portfolio Brief</label>
              <textarea
                value={buildBrief}
                onChange={e => setBuildBrief(e.target.value)}
                disabled={buildStatus === 'generating'}
                placeholder={`Describe yourself fully. Examples:\n\nI'm Alex Chen, a Senior Fullstack Engineer with 6 years of experience. I specialize in React, Node.js, TypeScript, PostgreSQL. I've built: TradeSync (fintech SaaS), NoteAI (productivity app), and OpenStore (e-commerce). I have worked at Google and Stripe. I'm looking for my next senior role.`}
                rows={7}
                className="w-full bg-[#F8F9FB] border border-[#ECEEF2] focus:border-[#FF5733]/50 rounded-xl p-3 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none resize-none font-sans leading-relaxed transition-colors"
              />
              <p className="text-[9px] text-[#9CA3AF] font-sans">The more detail you provide, the more personalized your portfolio will be.</p>
            </div>

            {/* Style Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">Visual Style</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                  className="w-full h-9 bg-[#F8F9FB] border border-[#ECEEF2] hover:border-[#111111]/20 rounded-xl px-3 flex items-center justify-between text-xs font-sans cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: buildStyle.accent }} />
                    <span className="font-semibold text-[#111111]">{buildStyle.name}</span>
                    <span className="text-[#9CA3AF] text-[10px]">{buildStyle.description}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </button>
                {showStyleDropdown && (
                  <div className="absolute top-10 left-0 right-0 bg-white border border-[#ECEEF2] rounded-xl shadow-xl z-50 overflow-hidden">
                    {PORTFOLIO_STYLES.map(style => (
                      <button
                        key={style.name}
                        type="button"
                        onClick={() => { setBuildStyle(style); setShowStyleDropdown(false); }}
                        className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left hover:bg-[#F8F9FB] transition-colors border-none cursor-pointer ${
                          buildStyle.name === style.name ? 'bg-[#F8F9FB]' : 'bg-white'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: style.accent }} />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-[#111111]">{style.name}</span>
                          <span className="text-[9px] text-[#9CA3AF]">{style.description}</span>
                        </div>
                        {buildStyle.name === style.name && <Check className="w-3 h-3 text-[#FF5733] ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sections Selector */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">Sections</label>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setBuildSections(AVAILABLE_SECTIONS.map(s => s.id))} className="text-[8px] font-mono text-[#FF5733] cursor-pointer bg-transparent border-none hover:underline">All</button>
                  <span className="text-[8px] text-[#9CA3AF]">·</span>
                  <button type="button" onClick={() => setBuildSections([])} className="text-[8px] font-mono text-[#9CA3AF] cursor-pointer bg-transparent border-none hover:underline">None</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {AVAILABLE_SECTIONS.map(sec => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => toggleBuildSection(sec.id)}
                    className={`h-8 px-3 rounded-[10px] text-[10px] font-sans font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                      buildSections.includes(sec.id)
                        ? 'bg-[#FF5733]/10 border-[#FF5733]/30 text-[#FF5733]'
                        : 'bg-[#F8F9FB] border-[#ECEEF2] text-[#6B7280] hover:border-[#111111]/20'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${ buildSections.includes(sec.id) ? 'bg-[#FF5733]' : 'bg-[#ECEEF2]'}`} />
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {buildError && (
              <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-600 font-sans">{buildError}</p>
              </div>
            )}

            {/* Success */}
            {buildStatus === 'done' && (
              <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-100 rounded-xl">
                <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <p className="text-[10px] text-green-700 font-sans font-semibold">Portfolio generated! Switching to editor...</p>
              </div>
            )}
          </div>
          )}

          {/* ─── Build Tab Footer (Generate Button) ─────────────────────── */}
          {activeTab === 'build' && (
          <div className="p-4 border-t border-[#ECEEF2] bg-white shrink-0">
            <button
              type="button"
              onClick={handleBuildPortfolio}
              disabled={buildStatus === 'generating' || !buildBrief.trim() || buildSections.length === 0}
              className="w-full h-11 rounded-[16px] bg-[#111111] hover:bg-black disabled:bg-[#ECEEF2] disabled:text-[#9CA3AF] text-white text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {buildStatus === 'generating' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating Portfolio...</span></>
              ) : buildStatus === 'done' ? (
                <><Check className="w-4 h-4 text-green-400" /><span>Portfolio Ready!</span></>
              ) : (
                <><Zap className="w-4 h-4 text-[#FF5733]" /><span>Generate Full Portfolio</span></>
              )}
            </button>
            <p className="text-center text-[8px] text-[#9CA3AF] font-sans mt-2">
              Uses {modelName} · {buildSections.length} section{buildSections.length !== 1 ? 's' : ''} · {buildStyle.name} style
            </p>
          </div>
          )}

          {/* ─── Chat Tab Footer ─────────────────────────────────────────── */}
          {activeTab === 'chat' && (
          <>
          {/* Prompt Input Area */}
          <form onSubmit={executeCommand} className="p-4 bg-white flex flex-col gap-2 shrink-0 border-t border-[#ECEEF2]/80">
            <div className="w-full bg-[#F8F9FB] border border-[#ECEEF2] rounded-[24px] p-3 flex flex-col gap-2 transition-all focus-within:border-[#111111]/30">
              {/* 1. Reasoning/Status bar (Only when generating) */}
              {isGenerating && (
                <div className="flex items-center justify-between bg-white border border-[#ECEEF2] px-2.5 py-1 rounded-xl shrink-0 shadow-sm animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-[#111111] animate-spin" />
                    <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-[#111111]">Reasoning...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGenerating(false)}
                    className="px-2 py-0.5 bg-white border border-[#ECEEF2] hover:bg-[#F8F9FB] text-[8px] font-mono font-bold uppercase tracking-wider rounded-md cursor-pointer text-[#FF5733] transition-colors"
                  >
                    Stop
                  </button>
                </div>
              )}

              {/* 2. Text Input Area */}
              <textarea
                value={prompt}
                disabled={isGenerating}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    executeCommand(e as any);
                  }
                }}
                placeholder={
                  selectedNodeId 
                    ? `Modify active node [${selectedNodeId.slice(-8)}]...` 
                    : 'Ask AI to customize portfolio...'
                }
                rows={1}
                className="w-full bg-transparent text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none resize-none border-none px-1 py-0.5 max-h-24 min-h-[32px] font-sans"
              />

              {/* 3. Action bar row */}
              <div className="flex items-center justify-between border-t border-[#ECEEF2]/40 pt-2 px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Plus trigger button */}
                  <div className="relative">
                    <button 
                      type="button"
                      disabled={isUploading || isGenerating}
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className="h-7 w-7 bg-white hover:bg-[#ECEEF2] border border-[#ECEEF2] rounded-full text-[#6B7280] hover:text-[#111111] cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Add attachment"
                    >
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#FF5733] animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>

                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {showAttachmentMenu && (
                      <div className="absolute bottom-10 left-0 w-44 bg-white border border-[#ECEEF2] rounded-xl p-1.5 shadow-xl flex flex-col gap-1 z-50 text-left animate-fade-in">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false);
                            const url = localStorage.getItem('supabase_url') || '';
                            const anonKey = localStorage.getItem('supabase_anon_key') || '';
                            if (!url || !anonKey) {
                              alert('Supabase account configuration is missing. Please configure your supabase_url and supabase_anon_key in the Dashboard page first.');
                              return;
                            }
                            setShowMediaModal(true);
                            fetchMediaAssets();
                          }}
                          className="h-7 px-2.5 text-left text-[9px] font-sans rounded-md border-none cursor-pointer w-full bg-transparent text-[#6B7280] hover:bg-[#F8F9FB] flex items-center gap-1.5"
                        >
                          <span>Supabase Storage Vault</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false);
                            setShowUnsplashModal(true);
                          }}
                          className="h-7 px-2.5 text-left text-[9px] font-sans rounded-md border-none cursor-pointer w-full bg-transparent text-[#6B7280] hover:bg-[#F8F9FB] flex items-center gap-1.5"
                        >
                          <span>Unsplash Image Vault</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Context Mode Selector Dropdown Pill */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowContextDropdownInput(!showContextDropdownInput)}
                      className="bg-white border border-[#ECEEF2] hover:border-[#111111]/30 px-3 py-1 rounded-full text-[9px] font-sans text-[#6B7280] font-bold cursor-pointer transition-colors flex items-center gap-1 focus:outline-none"
                    >
                      {contextMode === 'auto' ? 'Auto Context' : contextMode === 'node' ? 'Node Lock' : 'Full Page'}
                      <span className="text-[7px] text-[#9CA3AF]">▼</span>
                    </button>
                    {showContextDropdownInput && (
                      <div className="absolute left-0 bottom-8 w-28 bg-white border border-[#ECEEF2] rounded-xl p-1.5 shadow-lg flex flex-col gap-1 z-50 text-left animate-fade-in">
                        {(['auto', 'node', 'full'] as const).map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setContextMode(mode);
                              setShowContextDropdownInput(false);
                            }}
                            className={`h-7 px-2.5 text-left text-[9px] font-sans rounded-md border-none cursor-pointer w-full transition-colors ${
                              contextMode === mode ? 'bg-[#111111]/5 text-[#111111] font-semibold' : 'bg-transparent text-[#6B7280] hover:bg-[#F8F9FB]'
                            }`}
                          >
                            {mode === 'auto' ? 'Auto Context' : mode === 'node' ? 'Node Lock' : 'Full Page'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attachment preview chip (Pill style) */}
                  {attachedFile && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#ECEEF2] rounded-lg text-[8px] font-mono text-[#111111] font-semibold animate-fade-in shadow-xs animate-fade-in">
                      {attachedFile.type === 'image' ? (
                        <Image className="w-3 h-3 text-[#6B7280]" />
                      ) : (
                        <FileText className="w-3 h-3 text-[#6B7280]" />
                      )}
                      <span className="truncate max-w-[80px] font-sans">{attachedFile.name}</span>
                      <button 
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Circular submit button with Upward Arrow */}
                <button
                  type="submit"
                  disabled={isGenerating || (!prompt.trim() && !attachedFile)}
                  className="h-8 w-8 rounded-full bg-[#111111] disabled:bg-[#ECEEF2] hover:bg-black text-white disabled:text-[#9CA3AF] cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center border-none shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </form>
          </>
          )}
        </div>
      )}


      {/* 3. Supabase Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-[500px] max-h-[80vh] bg-white border border-[#ECEEF2] rounded-[24px] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.12)] animate-modal-enter text-left flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ECEEF2] shrink-0">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#FF5733]" />
                <div>
                  <h3 className="text-xs font-bold font-sans text-[#111111] uppercase tracking-wider">Supabase Storage Vault</h3>
                  <p className="text-[8px] font-sans text-[#6B7280]">Select existing asset or upload new file</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMediaModal(false)}
                className="p-1 hover:bg-[#F8F9FB] rounded-lg text-[#6B7280] hover:text-[#111111] transition-all cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Area & Search */}
            <div className="py-4 flex flex-col gap-3 border-b border-[#ECEEF2] shrink-0">
              <div className="flex items-center gap-2">
                <input 
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleUploadInModal}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => modalFileInputRef.current?.click()}
                  className="flex-1 h-9 bg-[#111111] hover:bg-black text-white disabled:opacity-50 text-[10px] font-sans font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5733]" />
                      <span>Uploading Asset...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span>Upload New Asset</span>
                    </>
                  )}
                </button>

                <div className="relative w-1/2">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={e => setMediaSearch(e.target.value)}
                    placeholder="Search files..."
                    className="w-full h-9 pl-8 bg-[#F8F9FB] border border-[#ECEEF2] focus:border-[#FF5733] rounded-xl px-3 text-xs text-[#111111] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Asset Vault Grid */}
            <div className="flex-1 overflow-y-auto py-4 min-h-[250px] scrollbar-thin">
              {isLoadingAssets ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <Loader2 className="w-6 h-6 text-[#FF5733] animate-spin" />
                  <span className="text-[10px] font-sans text-[#6B7280]">Loading bucket storage vault...</span>
                </div>
              ) : mediaAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border-2 border-dashed border-[#ECEEF2] rounded-xl p-4">
                  <AlertCircle className="w-6 h-6 text-[#6B7280] opacity-50" />
                  <span className="text-[10px] font-sans font-bold text-[#111111]">No files found in storage vault</span>
                  <span className="text-[8px] font-sans text-[#6B7280]">Upload your first asset above to get started.</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaAssets
                    .filter(a => a.name.toLowerCase().includes(mediaSearch.toLowerCase()))
                    .map(asset => {
                      const isImg = asset.type === 'image';
                      return (
                        <div 
                          key={asset.id} 
                          className="flex flex-col bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl overflow-hidden group relative select-none"
                        >
                          <div className="h-24 w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center">
                            {isImg ? (
                              <img 
                                src={asset.url} 
                                alt={asset.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <FileText className="w-8 h-8 text-[#6B7280] opacity-75" />
                            )}
                            
                            {/* Hover overlay controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSelectAsset(asset)}
                                className="px-2 py-1 bg-white hover:bg-[#FF5733] hover:text-white text-[9px] font-sans font-bold uppercase rounded shadow-md border-none cursor-pointer transition-colors"
                              >
                                Select
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAsset(asset.name)}
                                className="p-1 bg-red-500 hover:bg-red-600 text-white rounded shadow-md border-none cursor-pointer transition-colors"
                                title="Delete Asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="p-2 text-left shrink-0">
                            <p className="text-[8px] font-semibold text-[#111111] truncate">{asset.name}</p>
                            <p className="text-[7px] font-sans text-[#6B7280] truncate">{asset.size}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Free Unsplash Image Vault Search Modal */}
      {showUnsplashModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-[500px] max-h-[80vh] bg-white border border-[#ECEEF2] rounded-[24px] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.12)] animate-modal-enter text-left flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ECEEF2] shrink-0">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-[#FF5733]" />
                <div>
                  <h3 className="text-xs font-bold font-sans text-[#111111] uppercase tracking-wider">Unsplash Image Vault</h3>
                  <p className="text-[8px] font-sans text-[#6B7280]">Search and select high-quality royalty-free images</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUnsplashModal(false)}
                className="p-1 hover:bg-[#F8F9FB] rounded-lg text-[#6B7280] hover:text-[#111111] transition-all cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="py-4 border-b border-[#ECEEF2] shrink-0">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={unsplashSearch}
                  onChange={e => setUnsplashSearch(e.target.value)}
                  placeholder="Search curated workspace, tech, minimal, background..."
                  className="w-full h-9 pl-8 bg-[#F8F9FB] border border-[#ECEEF2] focus:border-[#FF5733] rounded-xl px-3 text-xs text-[#111111] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Assets Grid */}
            <div className="flex-1 overflow-y-auto py-4 min-h-[250px] scrollbar-thin">
              {isLoadingUnsplash && unsplashAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <Loader2 className="w-6 h-6 text-[#FF5733] animate-spin" />
                  <span className="text-[10px] font-sans text-[#6B7280]">Loading library photos...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ...CURATED_UNSPLASH_ASSETS,
                    ...unsplashAssets
                  ]
                    .filter(asset => {
                      const q = unsplashSearch.toLowerCase();
                      return asset.name.toLowerCase().includes(q) || 
                        asset.category.toLowerCase().includes(q) ||
                        asset.tags.some((t: string) => t.toLowerCase().includes(q));
                    })
                    .map(asset => (
                      <div 
                        key={asset.id} 
                        className="flex flex-col bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl overflow-hidden group relative select-none"
                      >
                        <div className="h-24 w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center">
                          <img 
                            src={asset.url} 
                            alt={asset.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {/* Hover overlay select control */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleSelectUnsplashAsset(asset)}
                              className="px-3 py-1 bg-white hover:bg-[#FF5733] hover:text-white text-[9px] font-sans font-bold uppercase rounded shadow-md border-none cursor-pointer transition-colors"
                            >
                              Select Photo
                            </button>
                          </div>
                        </div>
                        <div className="p-2 text-left shrink-0">
                          <p className="text-[8px] font-semibold text-[#111111] truncate">{asset.name}</p>
                          <p className="text-[7px] font-sans text-[#6B7280] capitalize truncate">{asset.category}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
