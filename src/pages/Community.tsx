import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Heart, 
  ThumbsUp, 
  Copy, 
  Check, 
  Award, 
  Image as ImageIcon,
  Plus,
  GitFork,
  MessageCircle,
  X,
  Trash2,
  ExternalLink,
  Download,
  Music,
  Film,
  FileCode,
  FileText,
  File
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const formatRelativeTime = (epoch?: number | string): string => {
  if (!epoch) return 'Just now';
  let timestampEpoch = typeof epoch === 'string' ? parseInt(epoch, 10) : epoch;
  if (isNaN(timestampEpoch)) {
    if (typeof epoch === 'string' && (epoch.includes('ago') || epoch.includes('now'))) {
      return epoch;
    }
    return 'Just now';
  }
  const now = Date.now();
  const diffMs = now - timestampEpoch;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  
  const date = new Date(timestampEpoch);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

interface PostItem {
  id: string;
  creator: string;
  creatorAvatar?: string;
  creatorTitle: string;
  timestamp: string;
  timestamp_epoch?: number;
  content: string;
  likes: number;
  liked: boolean;
  commentsCount: number;
  githubUrl?: string;
  promptCode?: string;
  imageUrl?: string;
}

interface TemplateItem {
  id: string;
  title: string;
  creator: string;
  category: string;
  model: string;
  thumbsUp: number;
  thumbsDown: number;
  usedCount: number;
  tags: string[];
  githubUrl?: string;
}

interface SharedAssetItem {
  id: string;
  title: string;
  creator: string;
  imageUrl: string;
  assetUrl: string;
  category: string;
  description: string;
  downloads: number;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  timestamp_epoch?: number;
}

const FILE_TYPE_MAP: Record<string, { type: string; label: string; color: string }> = {
  PNG: { type: 'image', label: 'Image', color: 'text-emerald-600 bg-emerald-50' },
  JPG: { type: 'image', label: 'Image', color: 'text-emerald-600 bg-emerald-50' },
  JPEG: { type: 'image', label: 'Image', color: 'text-emerald-600 bg-emerald-50' },
  GIF: { type: 'image', label: 'GIF', color: 'text-purple-600 bg-purple-50' },
  WEBP: { type: 'image', label: 'Image', color: 'text-emerald-600 bg-emerald-50' },
  AVIF: { type: 'image', label: 'Image', color: 'text-emerald-600 bg-emerald-50' },
  BMP: { type: 'image', label: 'Image', color: 'text-emerald-600 bg-emerald-50' },
  ICO: { type: 'image', label: 'Icon', color: 'text-amber-600 bg-amber-50' },
  SVG: { type: 'svg', label: 'SVG', color: 'text-orange-600 bg-orange-50' },
  MP4: { type: 'video', label: 'Video', color: 'text-blue-600 bg-blue-50' },
  WEBM: { type: 'video', label: 'Video', color: 'text-blue-600 bg-blue-50' },
  MOV: { type: 'video', label: 'Video', color: 'text-blue-600 bg-blue-50' },
  AVI: { type: 'video', label: 'Video', color: 'text-blue-600 bg-blue-50' },
  MKV: { type: 'video', label: 'Video', color: 'text-blue-600 bg-blue-50' },
  MP3: { type: 'audio', label: 'Audio', color: 'text-pink-600 bg-pink-50' },
  WAV: { type: 'audio', label: 'Audio', color: 'text-pink-600 bg-pink-50' },
  OGG: { type: 'audio', label: 'Audio', color: 'text-pink-600 bg-pink-50' },
  FLAC: { type: 'audio', label: 'Audio', color: 'text-pink-600 bg-pink-50' },
  AAC: { type: 'audio', label: 'Audio', color: 'text-pink-600 bg-pink-50' },
  PDF: { type: 'document', label: 'PDF', color: 'text-red-600 bg-red-50' },
  DOC: { type: 'document', label: 'Document', color: 'text-blue-700 bg-blue-50' },
  DOCX: { type: 'document', label: 'Document', color: 'text-blue-700 bg-blue-50' },
  TXT: { type: 'document', label: 'Text', color: 'text-slate-600 bg-slate-50' },
  MD: { type: 'document', label: 'Markdown', color: 'text-slate-600 bg-slate-50' },
  CSV: { type: 'document', label: 'CSV', color: 'text-teal-600 bg-teal-50' },
  XLS: { type: 'document', label: 'Spreadsheet', color: 'text-green-700 bg-green-50' },
  XLSX: { type: 'document', label: 'Spreadsheet', color: 'text-green-700 bg-green-50' },
  JSON: { type: 'code', label: 'JSON', color: 'text-yellow-700 bg-yellow-50' },
  JS: { type: 'code', label: 'JavaScript', color: 'text-yellow-600 bg-yellow-50' },
  TS: { type: 'code', label: 'TypeScript', color: 'text-blue-600 bg-blue-50' },
  HTML: { type: 'code', label: 'HTML', color: 'text-orange-600 bg-orange-50' },
  CSS: { type: 'code', label: 'CSS', color: 'text-indigo-600 bg-indigo-50' },
  PY: { type: 'code', label: 'Python', color: 'text-green-600 bg-green-50' },
  WOFF: { type: 'font', label: 'Font', color: 'text-violet-600 bg-violet-50' },
  WOFF2: { type: 'font', label: 'Font', color: 'text-violet-600 bg-violet-50' },
  TTF: { type: 'font', label: 'Font', color: 'text-violet-600 bg-violet-50' },
  OTF: { type: 'font', label: 'Font', color: 'text-violet-600 bg-violet-50' },
  ZIP: { type: 'archive', label: 'Archive', color: 'text-amber-700 bg-amber-50' },
  RAR: { type: 'archive', label: 'Archive', color: 'text-amber-700 bg-amber-50' },
  '7Z': { type: 'archive', label: 'Archive', color: 'text-amber-700 bg-amber-50' },
  TAR: { type: 'archive', label: 'Archive', color: 'text-amber-700 bg-amber-50' },
  GZ: { type: 'archive', label: 'Archive', color: 'text-amber-700 bg-amber-50' },
};

function detectFileInfo(url: string): { type: string; format: string; label: string; color: string } {
  const ext = url.split(/[?#]/)[0].split('.').pop()?.toUpperCase() || '';
  const mapped = FILE_TYPE_MAP[ext];
  if (mapped) return { ...mapped, format: ext };
  return { type: 'other', format: ext || '?', label: 'File', color: 'text-gray-600 bg-gray-50' };
}

function getFileTypeIcon(fileType: string) {
  switch (fileType) {
    case 'image': return ImageIcon;
    case 'svg': return FileCode;
    case 'video': return Film;
    case 'audio': return Music;
    case 'document': return FileText;
    case 'code': return FileCode;
    case 'font': return FileText;
    case 'archive': return File;
    default: return File;
  }
}

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentCreatorName = user?.displayName || 'Developer Partner';
  const { projects, createProject } = useProjectStore();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'repositories' | 'assets'>('feed');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  
  // Interactive comments thread
  const [selectedPostForComments, setSelectedPostForComments] = useState<PostItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>([
    { id: 'c1', author: 'Elena Rostova', text: 'Love the monospaced log layout you attached here. Copied the prompt directly!', timestamp: '10m ago' },
    { id: 'c2', author: 'Alex Mercer', text: 'This helps resolve the local Supabase storage write authorization conflicts nicely.', timestamp: '2h ago' }
  ]);
  
  // Creator Hover Card State
  const [hoveredCreator, setHoveredCreator] = useState<string | null>(null);
  const [creatorHoverCoords, setCreatorHoverCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Clipboard success state
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Lightbox State
  const [previewAssetItem, setPreviewAssetItem] = useState<any>(null);

  // Modals
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showPublishRepoModal, setShowPublishRepoModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  // New Post Form
  const [postContent, setPostContent] = useState('');
  const [postPromptCode, setPostPromptCode] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postGithubUrl, setPostGithubUrl] = useState('');

  // Publish Template Form
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('Product Engineering');
  const [portfolioTags, setPortfolioTags] = useState('');
  const [repoGithubUrl, setRepoGithubUrl] = useState('');

  // Asset Form
  const [assetTitle, setAssetTitle] = useState('');
  const [assetImageUrl, setAssetImageUrl] = useState('');
  const [assetCategory, setAssetCategory] = useState('Illustration');
  const [assetDescription, setAssetDescription] = useState('');

  // Hybrid Social Feed Data (LinkedIn + GitHub Updates style)
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: 'po1',
      creator: 'Elena Rostova',
      creatorTitle: 'Lead UI Architect at Folient',
      timestamp: '2 hours ago',
      content: 'I created a brand-new Bento-Grid layout using our Gemini 2.0 compiler. It features perfect 100/100 LCP score and smooth micro-animations. Sharing the prompt code below so you can clone it or try it in the canvas!',
      likes: 54,
      liked: false,
      commentsCount: 8,
      githubUrl: 'https://github.com/elena/folient-bento',
      promptCode: 'Create a responsive 3-column bento grid layout with dark mode accents and smooth translateY hover scaling.',
      imageUrl: '/crystal.png'
    },
    {
      id: 'po2',
      creator: 'Sarah Chen',
      creatorTitle: 'Full-Stack Developer',
      timestamp: '1 day ago',
      content: 'Just successfully deployed a React portfolio live on Vercel Edge using the new deployment connector! It resolved the 404 subdirectory route warnings. Drop a comment if you need the Supabase storage permission RLS script.',
      likes: 38,
      liked: false,
      commentsCount: 12,
      githubUrl: 'https://github.com/sarah-chen/vercel-edge-deploy',
      promptCode: 'create policy "Allow public uploads" on storage.objects for insert with check ( bucket_id = \'folient-media\' );'
    }
  ]);

  // Reusable Template Registries (GitHub style repos)
  const [communityTemplates, setCommunityTemplates] = useState<TemplateItem[]>([
    { id: 'carbon', title: 'carbon-dark-bento', creator: 'Elena Rostova', category: 'Product', model: 'gemini-2.0-flash', thumbsUp: 142, thumbsDown: 1, usedCount: 520, tags: ['Bento', 'Grid', 'Dark-Mode'], githubUrl: 'https://github.com/elena/folient-bento' },
    { id: 'horizon', title: 'horizon-neon-sidebar', creator: 'Alex Mercer', category: 'Creative', model: 'nvidia/nemotron-nano', thumbsUp: 89, thumbsDown: 3, usedCount: 341, tags: ['Minimalist', 'Sidebar', 'Creative'], githubUrl: 'https://github.com/alex/horizon-neon' },
    { id: 'studio', title: 'prism-glass-gallery', creator: 'Sarah Chen', category: 'Photography', model: 'groq/llama3-70b', thumbsUp: 67, thumbsDown: 0, usedCount: 112, tags: ['Gallery', 'Glassmorphism'], githubUrl: 'https://github.com/sarah/prism-glass' }
  ]);

  // Creator Shared Design Assets (Images/URLs)
  const [sharedAssets, setSharedAssets] = useState<SharedAssetItem[]>([
    {
      id: 'as1',
      title: 'iridescent-3d-crystal-graphic',
      creator: 'Elena Rostova',
      imageUrl: '/crystal.png',
      assetUrl: window.location.origin + '/crystal.png',
      category: 'Illustration',
      description: 'A premium 3D rendered iridescent glass crystal vector asset, optimized for modern visual hero canvas backgrounds.',
      downloads: 154
    },
    {
      id: 'as2',
      title: 'folient-branding-logo-symbol',
      creator: 'Folient Core',
      imageUrl: '/logo.png',
      assetUrl: window.location.origin + '/logo.png',
      category: 'Branding',
      description: 'The official visual logo container for branding, headers, footer credentials, and platform representations.',
      downloads: 98
    }
  ]);

  // Active Collaborators List (LinkedIn connections panel)
  const [collaborators] = useState([
    { name: 'Elena Rostova', role: 'UI Architect', company: 'Folient', github: 'https://github.com/elena', linkedin: 'https://linkedin.com/in/elena', activeTopic: 'Bento Grid Design' },
    { name: 'Alex Mercer', role: 'Product Designer', company: 'Freelance', github: 'https://github.com/alex', linkedin: 'https://linkedin.com/in/alex', activeTopic: 'Creative CV sidebars' },
    { name: 'Sarah Chen', role: 'Edge Integrator', company: 'Vercel Labs', github: 'https://github.com/sarah', linkedin: 'https://linkedin.com/in/sarah', activeTopic: 'Subdomains setup' }
  ]);

  const handleLikePost = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
      )
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost: PostItem = {
      id: `po-${Date.now()}`,
      creator: user?.displayName || 'Developer Partner',
      creatorTitle: 'Workspace Architect',
      timestamp: 'Just now',
      content: postContent,
      likes: 0,
      liked: false,
      commentsCount: 0,
      githubUrl: postGithubUrl || undefined,
      promptCode: postPromptCode || undefined,
      imageUrl: postImageUrl || undefined
    };

    setPosts(prev => [newPost, ...prev]);
    setShowCreatePostModal(false);
    setPostContent('');
    setPostPromptCode('');
    setPostImageUrl('');
    setPostGithubUrl('');
  };

  const handlePublishRepo = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => String(p.id) === selectedProjectId);
    if (!proj) return;

    const newTemplate: TemplateItem = {
      id: proj.activeTemplateId || `t-${Date.now()}`,
      title: proj.name.toLowerCase().replace(/\s+/g, '-'),
      creator: user?.displayName || 'Developer Partner',
      category: portfolioCategory,
      model: 'gemini-2.0-flash',
      thumbsUp: 0,
      thumbsDown: 0,
      usedCount: 0,
      tags: portfolioTags ? portfolioTags.split(',').map(t => t.trim()) : ['Custom', 'Template'],
      githubUrl: repoGithubUrl || undefined
    };

    setCommunityTemplates(prev => [newTemplate, ...prev]);
    setShowPublishRepoModal(false);
    setSelectedProjectId('');
    setPortfolioTags('');
    setRepoGithubUrl('');
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTitle.trim() || !assetImageUrl.trim()) return;

    const newAsset: SharedAssetItem = {
      id: `as-${Date.now()}`,
      title: assetTitle.toLowerCase().replace(/\s+/g, '-'),
      creator: user?.displayName || 'Anonymous Designer',
      imageUrl: assetImageUrl,
      assetUrl: assetImageUrl,
      category: assetCategory,
      description: assetDescription || 'No description provided.',
      downloads: 0
    };

    setSharedAssets(prev => [newAsset, ...prev]);
    setShowAssetModal(false);
    setAssetTitle('');
    setAssetImageUrl('');
    setAssetDescription('');
  };

  const handleRemixLayout = async (templateId: string, title: string) => {
    const newId = await createProject(`${title} (Fork)`, templateId);
    navigate(`/editor?id=${newId}`);
  };

  const handleVoteTemplate = (id: string, direction: 'up' | 'down') => {
    setCommunityTemplates(prev =>
      prev.map(t => {
        if (t.id === id) {
          if (direction === 'up') {
            return { ...t, thumbsUp: t.thumbsUp + 1 };
          } else {
            return { ...t, thumbsDown: t.thumbsDown + 1 };
          }
        }
        return t;
      })
    );
  };

  const filteredTemplates = communityTemplates.filter(item => {
    if (!activeTagFilter) return true;
    return item.tags.includes(activeTagFilter);
  });

  const copyToClipboard = (id: string, text: string, isPrompt = false) => {
    navigator.clipboard.writeText(text);
    if (isPrompt) {
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } else {
      setCopiedAssetId(id);
      setTimeout(() => setCopiedAssetId(null), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: user?.displayName || 'Reviewer Partner',
      text: newCommentText,
      timestamp: 'Just now'
    };
    setCommentsList(prev => [...prev, newComment]);
    setNewCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentsList(prev => prev.filter(c => c.id !== commentId));
  };

  const handleCreatorHover = (e: React.MouseEvent, creatorName: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCreatorHoverCoords({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 100
    });
    setHoveredCreator(creatorName);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111111] font-sans antialiased pb-20">
      
      {/* Top Glassmorphic Navigation Bar */}
      <nav className="h-[72px] bg-white border-b border-[#ECEEF2] flex justify-between items-center px-6 md:px-10 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="w-10 h-10 bg-white border border-[#ECEEF2] hover:bg-[#F8F9FB] rounded-xl text-gray-500 flex items-center justify-center transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-[#111111]" />
          </Link>
          <div className="flex flex-col text-left">
            <h1 className="text-sm font-bold text-[#111111] tracking-tight">Collaboration Hub</h1>
            <span className="text-[9px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">Where Developers Share Ideas, Prompts & Assets</span>
          </div>
        </div>

        <div className="flex gap-2">
          {activeTab === 'feed' && (
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="bg-[#111111] hover:bg-black text-white rounded-xl h-10 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Idea & Setup</span>
            </button>
          )}
          {activeTab === 'repositories' && projects.length > 0 && (
            <button
              onClick={() => setShowPublishRepoModal(true)}
              className="bg-[#111111] hover:bg-black text-white rounded-xl h-10 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Publish Repository</span>
            </button>
          )}
          {activeTab === 'assets' && (
            <button
              onClick={() => setShowAssetModal(true)}
              className="bg-[#111111] hover:bg-black text-white rounded-xl h-10 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Image Asset</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Grid Content */}
      <main className="max-w-[1440px] mx-auto py-8 px-6 grid grid-cols-12 gap-8 text-left">
        
        {/* Sub-Header Navigation (GitHub / LinkedIn Tab system) */}
        <div className="col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#ECEEF2] pb-5">
          <div className="flex bg-[#E5E7EB] p-1 rounded-2xl select-none shrink-0 w-full md:max-w-md">
            {[
              { id: 'feed', label: 'Social Feed & Ideas', icon: MessageCircle },
              { id: 'repositories', label: 'Template Repositories', icon: GitFork },
              { id: 'assets', label: 'Branding & Media Assets', icon: ImageIcon }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as 'feed' | 'repositories' | 'assets');
                    setActiveTagFilter(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-wider border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id ? 'bg-[#111111] text-white shadow-sm' : 'bg-transparent text-[#6B7280] hover:text-[#111111]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.id === 'feed' ? 'Feed' : tab.id === 'repositories' ? 'Repositories' : 'Assets'}</span>
                </button>
              );
            })}
          </div>

          {/* Minimalist Tags filter chips */}
          <div className="flex flex-wrap gap-1.5 items-center justify-start">
            {['Bento', 'Grid', 'Dark-Mode', 'Minimalist', 'Creative', 'SaaS'].map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all border cursor-pointer ${
                  activeTagFilter === tag 
                    ? 'bg-[#111111] text-white border-[#111111]' 
                    : 'bg-white border-[#ECEEF2] text-[#6B7280] hover:bg-[#F8F9FB] hover:text-[#111111]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* LEFT COLUMN: SOCIAL FEED, REPOS OR ASSETS */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

          {/* TAB 1: SOCIAL FEED & IDEAS */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white border border-[#ECEEF2] rounded-3xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4 text-left">
                  {/* Author Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#111111] text-white font-extrabold flex items-center justify-center text-xs">
                        {post.creator[0]}
                      </div>
                      <div>
                        <h4 
                          onMouseEnter={(e) => handleCreatorHover(e, post.creator)}
                          onMouseLeave={() => setHoveredCreator(null)}
                          className="text-xs font-bold text-[#111111] cursor-pointer hover:underline"
                        >
                          {post.creator}
                        </h4>
                        <p className="text-[10px] text-[#6B7280] font-medium">{post.creatorTitle} • {formatRelativeTime(post.timestamp_epoch || post.timestamp)}</p>
                      </div>
                    </div>

                    {post.githubUrl && (
                      <a 
                        href={post.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 hover:bg-[#F8F9FB] rounded-xl text-slate-700 border border-[#ECEEF2] flex items-center justify-center shrink-0 transition-colors"
                        title="View GitHub Repository"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-xs text-[#111111] leading-relaxed font-sans font-medium">{post.content}</p>

                  {/* Visual Asset if attached */}
                  {post.imageUrl && (
                    <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-[#F8F9FB] flex items-center justify-center relative group/image">
                      <img src={post.imageUrl} alt="Attached asset" className="w-full h-52 object-cover hover:scale-[1.02] transition-transform duration-300" />
                    </div>
                  )}

                  {/* Prompt Code snippet if attached */}
                  {post.promptCode && (
                    <div className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-2xl p-4.5 font-mono text-[10px] relative">
                      <button
                        onClick={() => copyToClipboard(post.id, post.promptCode!, true)}
                        className="absolute top-3 right-3 p-1.5 hover:bg-slate-200/50 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center shrink-0"
                        title="Copy Prompt"
                      >
                        {copiedPromptId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                      </button>
                      <pre className="text-[#6B7280] whitespace-pre-wrap leading-relaxed">{post.promptCode}</pre>
                    </div>
                  )}

                  {/* Actions Engagement Row */}
                  <div className="pt-4 border-t border-[#ECEEF2] flex items-center justify-between">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold border-none bg-transparent cursor-pointer transition-colors ${post.liked ? 'text-rose-500' : 'text-slate-400 hover:text-[#111111]'}`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                      <span>{post.likes} Likes</span>
                    </button>

                    <button
                      onClick={() => setSelectedPostForComments(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FB] hover:bg-[#F3F4F6] rounded-xl border-none text-[10px] text-gray-750 font-bold cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Comment ({post.commentsCount})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: TEMPLATE REPOSITORIES (GitHub style) */}
          {activeTab === 'repositories' && (
            <div className="space-y-4">
              {filteredTemplates.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border border-[#ECEEF2] rounded-3xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-350 transition-all duration-200"
                >
                  <div className="flex items-start gap-4 text-left w-full">
                    <div className="w-12 h-12 bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl flex items-center justify-center text-[#111111] shrink-0">
                      <GitFork className="w-5 h-5 text-indigo-650" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-2 items-center">
                        <h4 className="text-xs font-bold font-mono tracking-tight text-[#111111]">{item.creator} / {item.title}</h4>
                        <span className="text-[8px] bg-slate-100 border text-slate-500 font-bold font-mono px-1.5 py-0.5 rounded uppercase">
                          {item.model}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] font-medium leading-relaxed">
                        Layout category: <span className="capitalize text-[#111111] font-bold">{item.category}</span> • Starting tags:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map(t => (
                          <span key={t} className="text-[8px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-5 justify-between w-full md:w-auto border-t md:border-none pt-4 md:pt-0 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleVoteTemplate(item.id, 'up')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FB] hover:bg-[#F3F4F6] rounded-xl border-none text-[10px] text-gray-700 font-bold cursor-pointer transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{item.thumbsUp}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {item.githubUrl && (
                        <a 
                          href={item.githubUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-[#F8F9FB] hover:bg-[#F3F4F6] rounded-xl text-[#111111] border border-[#ECEEF2] flex items-center justify-center transition-colors"
                          title="View Repository Code"
                        >
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleRemixLayout(item.id, item.title)}
                        className="h-10 px-4 bg-[#111111] hover:bg-black text-white rounded-xl text-xs font-bold border-none transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        <span>Fork Template</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: BRANDING & MEDIA ASSETS */}
          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sharedAssets.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border border-[#ECEEF2] rounded-3xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[280px] hover:border-slate-350 transition-all duration-300 text-left overflow-hidden group"
                >
                  <div>
                    <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{item.category}</span>
                    <h4 className="text-xs font-mono font-bold text-[#111111] mt-3 tracking-tight">{item.title}</h4>
                    <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">
                      By <strong className="text-[#111111]">{item.creator}</strong>
                    </p>

                    {/* Shared Image preview container */}
                    <div 
                      className="mt-3 border border-[#ECEEF2] rounded-2xl overflow-hidden h-32 bg-[#F8F9FB] relative flex items-center justify-center cursor-pointer"
                      onClick={() => setPreviewAssetItem(item)}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <p className="text-[10px] text-gray-500 mt-3.5 font-medium leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[#ECEEF2] mt-4 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 font-bold font-mono">Downloads: {item.downloads}</span>
                    <button
                      onClick={() => copyToClipboard(item.id, item.assetUrl)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] hover:bg-black text-white text-[10px] font-bold rounded-xl border-none cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      {copiedAssetId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Link!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Image URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: COLLABORATORS & GITHUB/LINKEDIN CONNECTIONS */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Creator & Connection Section (LinkedIn style) */}
          <div className="bg-white border border-[#ECEEF2] rounded-3xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] text-left">
            <div className="flex items-center gap-2 mb-5">
              <LinkedinIcon className="w-4 h-4 text-indigo-650" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Connect & Collaborate</h4>
            </div>

            <div className="space-y-4">
              {collaborators.map((collab, idx) => (
                <div key={idx} className="flex flex-col gap-2 border-b border-[#ECEEF2]/60 pb-3.5 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-[10px]">
                        {collab.name[0]}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#111111]">{collab.name}</h5>
                        <p className="text-[9px] text-[#6B7280] font-medium">{collab.role} @ {collab.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a href={collab.github} target="_blank" rel="noreferrer" className="p-1 hover:bg-[#F8F9FB] rounded-lg text-slate-600 border border-[#ECEEF2]">
                        <GithubIcon className="w-3.5 h-3.5" />
                      </a>
                      <a href={collab.linkedin} target="_blank" rel="noreferrer" className="p-1 hover:bg-[#F8F9FB] rounded-lg text-slate-600 border border-[#ECEEF2]">
                        <LinkedinIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-500 font-medium">
                    Active on: <strong className="text-slate-800">{collab.activeTopic}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Leaderboard */}
          <div className="bg-white border border-[#ECEEF2] rounded-3xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] text-left">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Top Contributors</h4>
            </div>

            <div className="space-y-3.5 font-mono text-[10px] text-slate-500">
              <div className="flex justify-between items-center border-b border-[#ECEEF2]/60 pb-2">
                <span>Elena Rostova</span>
                <strong className="text-slate-900 font-bold">520 forks</strong>
              </div>
              <div className="flex justify-between items-center border-b border-[#ECEEF2]/60 pb-2">
                <span>Alex Mercer</span>
                <strong className="text-slate-900 font-bold">341 forks</strong>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span>Sarah Chen</span>
                <strong className="text-slate-900 font-bold">112 forks</strong>
              </div>
            </div>
          </div>

        </aside>

      </main>

      {selectedPostForComments && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-xs flex justify-end items-center p-4 transition-all">
          <div className="bg-white border border-[#ECEEF2] w-full max-w-md h-full max-h-[85vh] sm:max-h-[700px] flex flex-col p-0 shadow-[0_24px_48px_rgba(0,0,0,0.16)] relative overflow-hidden rounded-[28px] animate-[slide-left_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            
            {/* Header */}
            <div className="p-5 border-b border-[#ECEEF2] flex items-center justify-between bg-slate-50/50">
              <div className="text-left">
                <span className="text-[8px] font-extrabold text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Comment Thread</span>
                <h3 className="text-sm font-bold text-[#111111] mt-1.5 leading-tight">Conversation</h3>
              </div>
              <button
                onClick={() => setSelectedPostForComments(null)}
                className="p-2 hover:bg-[#ECEEF2] rounded-full text-gray-400 hover:text-[#111111] border-none bg-transparent cursor-pointer transition-colors"
                aria-label="Close comment drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original Post Context */}
            <div className="p-5 bg-[#F8F9FB] border-b border-[#ECEEF2] text-left">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-[10px] uppercase shadow-sm">
                  {selectedPostForComments.creator[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111111]">{selectedPostForComments.creator}</h4>
                  <p className="text-[8px] text-slate-400 font-semibold">{formatRelativeTime(selectedPostForComments.timestamp_epoch || selectedPostForComments.timestamp)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium line-clamp-3">{selectedPostForComments.content}</p>
              {selectedPostForComments.imageUrl && (
                <div className="mt-2.5 border border-[#ECEEF2] rounded-xl overflow-hidden h-14 bg-white flex items-center justify-start p-1.5 gap-2 cursor-pointer hover:border-slate-300 transition-colors"
                  onClick={() => setPreviewAssetItem({ 
                    imageUrl: selectedPostForComments.imageUrl!, 
                    assetUrl: selectedPostForComments.imageUrl!, 
                    title: `${selectedPostForComments.creator}'s Post Media`, 
                    creator: selectedPostForComments.creator,
                    category: 'Attachment',
                    description: selectedPostForComments.content,
                    downloads: 0
                  } as any)}
                >
                  <img src={selectedPostForComments.imageUrl} className="w-10 h-10 object-cover rounded-lg" />
                  <span className="text-[9px] font-bold text-slate-500 font-mono truncate">View Attachment</span>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/30">
              {commentsList.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <h4 className="text-xs font-bold text-slate-600">No replies yet</h4>
                  <p className="text-[10px] text-slate-400">Be the first to share your thoughts!</p>
                </div>
              ) : (
                commentsList.map(comment => {
                  const canDeleteComment = comment.author === currentCreatorName || selectedPostForComments.creator === currentCreatorName;
                  return (
                    <div key={comment.id} className="flex gap-3 text-left relative group">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border border-slate-300/40 text-slate-750 font-extrabold flex items-center justify-center text-[10px] uppercase flex-shrink-0 mt-0.5 shadow-xs">
                        {comment.author[0] || 'C'}
                      </div>
                      <div className="flex-1 bg-white border border-[#ECEEF2] hover:border-slate-250 p-3.5 rounded-2xl rounded-tl-none relative transition-all duration-200 shadow-xs">
                        <div className="flex justify-between items-center pr-6">
                          <span className="text-xs font-bold text-[#111111]">{comment.author}</span>
                          <span className="text-[9px] text-slate-400 font-semibold font-mono">{formatRelativeTime(comment.timestamp_epoch || comment.timestamp)}</span>
                        </div>
                        <p className="text-xs text-gray-770 mt-1.5 font-medium leading-relaxed font-sans">{comment.text}</p>
                        {canDeleteComment && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors border-none bg-transparent cursor-pointer"
                            title="Delete Comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Form */}
            <div className="p-4 border-t border-[#ECEEF2] bg-white">
              <form onSubmit={handleAddComment} className="space-y-3">
                <div className="flex flex-col gap-1.5 text-left relative">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[9px] text-[#6B7280] font-extrabold uppercase tracking-wider">Join the Conversation</label>
                    <span className="text-[8px] font-mono font-bold text-slate-400">Logged in as {currentCreatorName}</span>
                  </div>
                  <div className="relative group border border-[#ECEEF2] focus-within:border-slate-800 rounded-2xl p-1 transition-all duration-300 bg-slate-50 focus-within:bg-white focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      required
                      rows={2}
                      placeholder="Write a supportive reply, suggestion or ask a question..."
                      className="bg-transparent border-none p-3 text-xs w-full focus:outline-none text-[#111111] resize-none leading-relaxed font-sans"
                    />
                    <div className="flex items-center justify-end px-2 pb-1.5 pt-1">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 h-8 bg-[#111111] hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-xl border-none cursor-pointer transition-all hover:shadow-md active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* SHARE IDEA & SETUP MODAL */}
      {showCreatePostModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white border border-[#ECEEF2] rounded-[32px] p-8 shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setShowCreatePostModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-[#F8F9FB] rounded-xl text-gray-400 hover:text-[#111111] border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-2 text-center">Share Idea & Setup</h3>
            <p className="text-[10px] text-[#6B7280] text-center mb-5 leading-normal">
              Share a thought update, prompt instructions, or asset design resources with the community network.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Post Message</label>
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  required
                  rows={4}
                  placeholder="What are you working on or building? Share your thoughts..."
                  className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl p-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Prompt / Setup Code (Optional)</label>
                <input 
                  type="text" 
                  value={postPromptCode}
                  onChange={(e) => setPostPromptCode(e.target.value)}
                  placeholder="e.g. Create a minimalist portfolio hero using..."
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Image / Asset URL (Optional)</label>
                <input 
                  type="url" 
                  value={postImageUrl}
                  onChange={(e) => setPostImageUrl(e.target.value)}
                  placeholder="e.g. https://domain.com/layout.png"
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">GitHub Link (Optional)</label>
                <input 
                  type="url" 
                  value={postGithubUrl}
                  onChange={(e) => setPostGithubUrl(e.target.value)}
                  placeholder="e.g. https://github.com/username/project"
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl h-10 border-none cursor-pointer transition-colors shadow-sm"
                >
                  Publish Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-[#ECEEF2] text-gray-500 text-xs font-bold rounded-xl h-10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH REPOSITORY MODAL */}
      {showPublishRepoModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white border border-[#ECEEF2] rounded-[32px] p-8 shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setShowPublishRepoModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-[#F8F9FB] rounded-xl text-gray-400 hover:text-[#111111] border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-2 text-center">Publish Repository</h3>
            <p className="text-[10px] text-[#6B7280] text-center mb-5 leading-normal">
              Select one of your active canvas projects to share as a reusable layout template.
            </p>

            <form onSubmit={handlePublishRepo} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Select Project</label>
                <select 
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Category</label>
                <select 
                  value={portfolioCategory}
                  onChange={(e) => setPortfolioCategory(e.target.value)}
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                >
                  <option value="Product Engineering">Product Engineering</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Agency">Agency</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">GitHub URL (Optional)</label>
                <input 
                  type="url" 
                  value={repoGithubUrl}
                  onChange={(e) => setRepoGithubUrl(e.target.value)}
                  placeholder="e.g. https://github.com/username/project"
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={portfolioTags}
                  onChange={(e) => setPortfolioTags(e.target.value)}
                  placeholder="e.g. Bento, Minimalist, Tailwind"
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={!selectedProjectId}
                  className="flex-1 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl h-10 border-none cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
                >
                  Publish Repo
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishRepoModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-[#ECEEF2] text-gray-500 text-xs font-bold rounded-xl h-10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE IMAGE ASSET MODAL */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white border border-[#ECEEF2] rounded-[32px] p-8 shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setShowAssetModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-[#F8F9FB] rounded-xl text-gray-400 hover:text-[#111111] border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-2 text-center">Share Design Asset</h3>
            <p className="text-[10px] text-[#6B7280] text-center mb-5 leading-normal">
              Share your uploaded illustration, mockup template, or texture image URL.
            </p>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Asset Title</label>
                <input 
                  type="text" 
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  required
                  placeholder="e.g. Floating Iridescent Crystal PNG"
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Category</label>
                <select 
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                >
                  <option value="Illustration">Illustration</option>
                  <option value="Mockup">Mockup</option>
                  <option value="Wallpaper">Wallpaper</option>
                  <option value="Texture">Texture</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Image / Asset URL</label>
                <input 
                  type="url" 
                  value={assetImageUrl}
                  onChange={(e) => setAssetImageUrl(e.target.value)}
                  required
                  placeholder="e.g. https://domain.com/asset.png"
                  className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Description</label>
                <textarea 
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your asset and how other builders can use it..."
                  className="bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl p-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl h-10 border-none cursor-pointer transition-colors shadow-sm"
                >
                  Share Asset
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-[#ECEEF2] text-gray-500 text-xs font-bold rounded-xl h-10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATOR HOVER CARD OVERLAY */}
      {hoveredCreator && (
        <div 
          className="absolute z-50 bg-[#111111] text-white border border-slate-800 rounded-2xl p-4 shadow-2xl w-56 text-left pointer-events-none animate-[fade-in_0.15s_ease-out] font-sans font-medium"
          style={{ left: `${creatorHoverCoords.x}px`, top: `${creatorHoverCoords.y}px` }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-650 flex items-center justify-center font-bold text-white text-xs">
              {hoveredCreator[0]}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-none">{hoveredCreator}</h4>
              <span className="text-[8px] text-slate-400 mt-1 block">Folient Top Contributor</span>
            </div>
          </div>
          <div className="mt-3.5 border-t border-slate-800 pt-2.5 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-450">
            <div>
              <span className="block text-slate-550 uppercase font-extrabold text-[7px] tracking-wider">Posts</span>
              <strong className="text-white">12</strong>
            </div>
            <div>
              <span className="block text-slate-550 uppercase font-extrabold text-[7px] tracking-wider">Forks</span>
              <strong className="text-white">482</strong>
            </div>
          </div>
        </div>
      )}

      {/* ASSET PREVIEW LIGHTBOX */}
      {previewAssetItem && (() => {
        const fi = detectFileInfo(previewAssetItem.assetUrl || previewAssetItem.imageUrl);
        const resolvedType = previewAssetItem.fileType || fi.type;
        const resolvedFormat = previewAssetItem.format || fi.format;
        const typeInfo = FILE_TYPE_MAP[resolvedFormat] || { label: fi.label, color: fi.color };

        return createPortal(
          <div className="fixed inset-0 z-[100] bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-6 animate-[fade-in_0.15s_ease-out]">
            <div className="bg-white border border-[#ECEEF2] rounded-[32px] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEEF2] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${typeInfo.color}`}>
                    .{resolvedFormat}
                  </span>
                  <h3 className="text-sm font-bold text-[#111111] truncate">{previewAssetItem.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewAssetItem.assetUrl || previewAssetItem.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#F8F9FB] hover:bg-[#F3F4F6] rounded-xl text-[10px] text-gray-700 font-bold cursor-pointer transition-colors border border-[#ECEEF2] leading-none"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open URL</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewAssetItem.assetUrl || previewAssetItem.imageUrl);
                      setCopiedAssetId(previewAssetItem.id);
                      setTimeout(() => setCopiedAssetId(null), 2000);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#F8F9FB] hover:bg-[#F3F4F6] rounded-xl text-[10px] text-gray-700 font-bold cursor-pointer transition-colors border border-[#ECEEF2]"
                  >
                    {copiedAssetId === previewAssetItem.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAssetId === previewAssetItem.id ? 'Copied' : 'Copy link'}</span>
                  </button>
                  <button
                    onClick={() => setPreviewAssetItem(null)}
                    className="p-1.5 hover:bg-[#F8F9FB] rounded-xl text-gray-400 hover:text-[#111111] border-none bg-transparent cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lightbox content renderer based on type */}
              <div className="flex-1 overflow-y-auto bg-[#FAFBFD] p-6 flex items-center justify-center min-h-0">
                {resolvedType === 'image' || resolvedType === 'svg' ? (
                  <img
                    src={previewAssetItem.imageUrl || previewAssetItem.assetUrl}
                    alt={previewAssetItem.title}
                    className="max-w-full max-h-[50vh] object-contain rounded-2xl shadow-lg border border-[#ECEEF2]"
                  />
                ) : resolvedType === 'video' ? (
                  <video
                    src={previewAssetItem.assetUrl}
                    className="max-w-full max-h-[50vh] rounded-2xl shadow-lg border border-[#ECEEF2]"
                    controls
                    autoPlay
                  />
                ) : resolvedType === 'audio' ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <audio src={previewAssetItem.assetUrl} controls autoPlay className="w-72" />
                    <span className="text-[10px] text-slate-400 font-mono">Autoplaying media attachment</span>
                  </div>
                ) : resolvedType === 'document' && resolvedFormat === 'PDF' ? (
                  <iframe
                    src={previewAssetItem.assetUrl}
                    title={previewAssetItem.title}
                    className="w-full h-[55vh] rounded-2xl shadow-lg border border-[#ECEEF2]"
                  />
                ) : (
                  <div className="text-center py-10 flex flex-col items-center gap-4 bg-white border border-[#ECEEF2] rounded-3xl p-8 max-w-sm shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                      {(() => {
                        const TypeIcon = getFileTypeIcon(resolvedType);
                        return <TypeIcon className="w-8 h-8 text-slate-500" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111111]">Preview Unavailable</h4>
                      <p className="text-[10px] text-[#6B7280] mt-1 leading-relaxed">
                        This file format ({resolvedFormat}) cannot be previewed directly in the browser. You can copy the URL or download the file directly.
                      </p>
                    </div>
                    <a
                      href={previewAssetItem.assetUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-5 py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Footer metadata */}
              <div className="px-6 py-3 border-t border-[#ECEEF2] flex items-center justify-between text-[9px] text-slate-500 font-mono shrink-0">
                <div className="flex items-center gap-4">
                  <span>By <strong className="text-[#111111]">{previewAssetItem.creator}</strong></span>
                  <span>{previewAssetItem.category}</span>
                  {previewAssetItem.fileSize && <span>{previewAssetItem.fileSize}</span>}
                </div>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" /> {previewAssetItem.downloads} downloads
                </span>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
