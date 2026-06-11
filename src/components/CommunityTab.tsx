import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
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
  UploadCloud,
  Loader2,
  FileCode,
  Trash2,
  Edit,
  AlertTriangle,
  Download,
  Eye,
  Play,
  Music,
  FileText,
  Film,
  ExternalLink,
  File
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import { db } from '../firebase/config';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  doc, 
  increment,
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { uploadSupabaseFile, listSupabaseFiles } from '../services/SupabaseClient';
import { useDeploymentEngine } from '../hooks/useDeploymentEngine';
import { folientDb } from '../db/dexie';

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
  liveUrl?: string;
  codeUrl?: string;
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
  codeUrl?: string;
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
  fileType?: 'image' | 'video' | 'audio' | 'document' | 'code' | 'svg' | 'font' | 'archive' | 'other';
  format?: string;
  fileSize?: string;
}

// Utility: detect file type from URL or extension
const FILE_TYPE_MAP: Record<string, { type: SharedAssetItem['fileType']; label: string; color: string }> = {
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

function detectFileInfo(url: string): { type: SharedAssetItem['fileType']; format: string; label: string; color: string } {
  const ext = url.split(/[?#]/)[0].split('.').pop()?.toUpperCase() || '';
  const mapped = FILE_TYPE_MAP[ext];
  if (mapped) return { ...mapped, format: ext };
  return { type: 'other', format: ext || '?', label: 'File', color: 'text-gray-600 bg-gray-50' };
}

function getFileTypeIcon(fileType: SharedAssetItem['fileType']) {
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

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  timestamp_epoch?: number;
}

interface CommunityTabProps {
  showAlert: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function CommunityTab({ showAlert }: CommunityTabProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, createProject } = useProjectStore();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'repositories' | 'assets' | 'contributions'>('feed');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const { extractAstFromLiveUrl } = useDeploymentEngine();
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingPostId, setIsEditingPostId] = useState<string | null>(null);
  const [editedPostContent, setEditedPostContent] = useState('');
  const [isEditingAssetId, setIsEditingAssetId] = useState<string | null>(null);
  const [editedAssetTitle, setEditedAssetTitle] = useState('');
  const [editedAssetDescription, setEditedAssetDescription] = useState('');
  const [editedAssetCategory, setEditedAssetCategory] = useState('');

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'post' | 'template' | 'asset' } | null>(null);
  
  // Interactive comments thread
  const [selectedPostForComments, setSelectedPostForComments] = useState<PostItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>([]);

  // Creator Hover Card State
  const [hoveredCreator, setHoveredCreator] = useState<string | null>(null);
  const [creatorHoverCoords, setCreatorHoverCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Clipboard success state
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Modals
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showPublishRepoModal, setShowPublishRepoModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  // New Post Form
  const [postContent, setPostContent] = useState('');
  const [postPromptCode, setPostPromptCode] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postGithubUrl, setPostGithubUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [vaultImages, setVaultImages] = useState<any[]>([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [showVaultPicker, setShowVaultPicker] = useState(false);

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
  const [showAssetVaultPicker, setShowAssetVaultPicker] = useState(false);
  const [vaultAllFiles, setVaultAllFiles] = useState<any[]>([]);
  const [isLoadingAssetVault, setIsLoadingAssetVault] = useState(false);

  // Asset preview lightbox
  const [previewAssetItem, setPreviewAssetItem] = useState<SharedAssetItem | null>(null);

  // Supabase credentials for sharing uploads
  const supabaseUrl = localStorage.getItem('supabase_url') || '';
  const supabaseKey = localStorage.getItem('supabase_anon_key') || '';
  const supabaseServiceKey = localStorage.getItem('supabase_service_role_key') || '';
  const supabaseBucket = localStorage.getItem('supabase_bucket') || 'folient-media';

  // State arrays connected to Firestore with fallback defaults
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [communityTemplates, setCommunityTemplates] = useState<TemplateItem[]>([]);
  const [sharedAssets, setSharedAssets] = useState<SharedAssetItem[]>([]);

  const [collaborators, setCollaborators] = useState<any[]>([]);

  // Selected Profile Modal State
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);
  const [selectedUserContributions, setSelectedUserContributions] = useState<{
    posts: PostItem[];
    templates: TemplateItem[];
    assets: SharedAssetItem[];
  }>({ posts: [], templates: [], assets: [] });
  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'templates' | 'assets'>('posts');

  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);

  // Subscribe to current authenticated user's profile
  useEffect(() => {
    if (!user) {
      setCurrentUserProfile(null);
      return;
    }
    if (db.app.options.apiKey?.includes('placeholder')) return;

    const userProfileRef = doc(db, 'user_profiles', user.uid);
    const unsubscribeMyProfile = onSnapshot(userProfileRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentUserProfile(docSnap.data());
      }
    }, (err) => {
      console.warn("Failed to load user profile in CommunityTab:", err);
    });

    return () => unsubscribeMyProfile();
  }, [user]);

  // Load Firestore data with real-time sync
  useEffect(() => {
    if (db.app.options.apiKey?.includes('placeholder')) {
      return;
    }

    // Subscribe to posts
    const postsQuery = query(collection(db, 'community_posts'), orderBy('timestamp_epoch', 'desc'), limit(50));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const loadedPosts = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as PostItem));
      setPosts(loadedPosts);
    }, (err) => {
      console.warn("Firestore posts listener error:", err);
    });

    // Subscribe to templates
    const templatesQuery = query(collection(db, 'community_templates'), limit(50));
    const unsubscribeTemplates = onSnapshot(templatesQuery, (snapshot) => {
      const loadedTemplates = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as TemplateItem));
      setCommunityTemplates(loadedTemplates);
    }, (err) => {
      console.warn("Firestore templates listener error:", err);
    });

    // Subscribe to assets
    const assetsQuery = query(collection(db, 'community_assets'), limit(50));
    const unsubscribeAssets = onSnapshot(assetsQuery, (snapshot) => {
      const loadedAssets = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as SharedAssetItem));
      setSharedAssets(loadedAssets);
    }, (err) => {
      console.warn("Firestore assets listener error:", err);
    });

    // Subscribe to user profiles
    const profilesQuery = query(collection(db, 'user_profiles'), limit(30));
    const unsubscribeProfiles = onSnapshot(profilesQuery, (snapshot) => {
      const loadedProfiles = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.displayName || 'Anonymous Creator',
          displayName: data.displayName || 'Anonymous Creator',
          role: data.userType || 'Developer',
          company: data.objective || 'Folient User',
          github: data.githubUrl || 'https://github.com',
          linkedin: data.linkedinUrl || 'https://linkedin.com',
          activeTopic: data.expLevel ? `${data.expLevel} Level` : 'Active Developer',
          bio: data.bio || '',
          photoURL: data.photoURL || '',
          publicShowcase: data.publicShowcase
        };
      }).filter(p => p.publicShowcase !== false);

      setCollaborators(loadedProfiles);
    }, (err) => {
      console.warn("Firestore profiles listener error:", err);
    });

    return () => {
      unsubscribePosts();
      unsubscribeTemplates();
      unsubscribeAssets();
      unsubscribeProfiles();
    };
  }, []);

  // Listen to comments for the selected post dynamically
  useEffect(() => {
    if (!selectedPostForComments) {
      setCommentsList([]);
      return;
    }
    if (db.app.options.apiKey?.includes('placeholder')) {
      // Mock comments fallback for sandbox placeholder keys
      setCommentsList([
        { id: 'c1', author: 'Elena Rostova', text: 'Love the monospaced log layout you attached here. Copied the prompt directly!', timestamp: '10m ago' },
        { id: 'c2', author: 'Alex Mercer', text: 'This helps resolve the local Supabase storage write authorization conflicts nicely.', timestamp: '2h ago' }
      ]);
      return;
    }

    const commentsCol = collection(db, 'community_posts', selectedPostForComments.id, 'comments');
    const commentsQuery = query(commentsCol, orderBy('timestamp_epoch', 'asc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const loadedComments = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          author: data.author || 'Anonymous Commenter',
          text: data.text || '',
          timestamp: data.timestamp || 'Just now',
          timestamp_epoch: data.timestamp_epoch || Date.now()
        } as Comment;
      });
      setCommentsList(loadedComments);
    }, (err) => {
      console.warn("Failed to load comments for post:", err);
    });

    return () => unsubscribeComments();
  }, [selectedPostForComments]);

  // Compute dynamic top contributors stats in real-time
  const contributorsStats = useMemo(() => {
    const counts: Record<string, { posts: number; templates: number; assets: number; total: number; photoURL?: string }> = {};

    // Update with loaded data counts
    posts.forEach(p => {
      if (!p.creator) return;
      if (!counts[p.creator]) {
        counts[p.creator] = { posts: 0, templates: 0, assets: 0, total: 0, photoURL: p.creatorAvatar };
      }
      counts[p.creator].posts++;
      counts[p.creator].total++;
    });

    communityTemplates.forEach(t => {
      if (!t.creator) return;
      if (!counts[t.creator]) {
        counts[t.creator] = { posts: 0, templates: 0, assets: 0, total: 0 };
      }
      counts[t.creator].templates++;
      counts[t.creator].total++;
    });

    sharedAssets.forEach(a => {
      if (!a.creator) return;
      if (!counts[a.creator]) {
        counts[a.creator] = { posts: 0, templates: 0, assets: 0, total: 0 };
      }
      counts[a.creator].assets++;
      counts[a.creator].total++;
    });

    // Sort to get top contributors
    return Object.entries(counts)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [posts, communityTemplates, sharedAssets]);

  // Synchronize contributions tab details when selected user changes
  useEffect(() => {
    if (!selectedUserProfile) return;
    const name = selectedUserProfile.displayName || selectedUserProfile.name;
    const userPosts = posts.filter(p => p.creator === name);
    const userTemplates = communityTemplates.filter(t => t.creator === name);
    const userAssets = sharedAssets.filter(a => a.creator === name);
    setSelectedUserContributions({
      posts: userPosts,
      templates: userTemplates,
      assets: userAssets
    });
  }, [selectedUserProfile, posts, communityTemplates, sharedAssets]);

  // Load vault files when either modal opens
  useEffect(() => {
    const shouldLoad = showCreatePostModal || showAssetModal;
    if (shouldLoad) {
      const fetchVaultFiles = async () => {
        if (!supabaseUrl || !supabaseKey) return;
        setIsLoadingVault(true);
        setIsLoadingAssetVault(true);
        try {
          const files = await listSupabaseFiles(supabaseUrl, supabaseKey, supabaseBucket, 0, supabaseServiceKey);
          setVaultImages(files.filter((f: any) => f.type === 'image'));
          setVaultAllFiles(files);
        } catch (err) {
          console.warn("Failed to load vault files for picker:", err);
        } finally {
          setIsLoadingVault(false);
          setIsLoadingAssetVault(false);
        }
      };
      fetchVaultFiles();
    } else {
      setShowVaultPicker(false);
      setShowAssetVaultPicker(false);
    }
  }, [showCreatePostModal, showAssetModal, supabaseUrl, supabaseKey, supabaseBucket, supabaseServiceKey]);

  const handleLikePost = async (id: string) => {
    // Optimistic Update
    let targetPost: PostItem | undefined;
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          targetPost = p;
          return { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked };
        }
        return p;
      })
    );

    // Save to Firestore if available
    if (targetPost && !db.app.options.apiKey?.includes('placeholder')) {
      try {
        const docRef = doc(db, 'community_posts', id);
        await updateDoc(docRef, {
          likes: increment(targetPost.liked ? -1 : 1)
        });
      } catch (err) {
        console.error('Failed to sync like count to Firestore:', err);
      }
    }
  };

  const handleVoteTemplate = async (id: string, direction: 'up' | 'down') => {
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

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        const docRef = doc(db, 'community_templates', id);
        await updateDoc(docRef, {
          thumbsUp: increment(direction === 'up' ? 1 : 0),
          thumbsDown: increment(direction === 'down' ? 1 : 0),
        });
      } catch (err) {
        console.error('Failed to sync vote to Firestore:', err);
      }
    }
  };

  // Upload local file to connected Supabase Storage
  const handleUploadFileToSupabase = async (file: File): Promise<string | null> => {
    if (!supabaseUrl || (!supabaseKey && !supabaseServiceKey)) {
      showAlert('Connect Supabase Storage first inside the Connectors tab.', 'error');
      return null;
    }
    setIsUploadingFile(true);
    try {
      const asset = await uploadSupabaseFile(supabaseUrl, supabaseServiceKey || supabaseKey, supabaseBucket, file, 0, supabaseServiceKey);
      return asset.url;
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Supabase storage upload failed.';
      showAlert(errMsg, 'error');
      return null;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPostData = {
      creator: currentUserProfile?.displayName || user?.displayName || 'Developer Partner',
      creatorTitle: 'Workspace Architect',
      timestamp: 'Just now',
      timestamp_epoch: Date.now(),
      content: postContent,
      likes: 0,
      liked: false,
      commentsCount: 0,
      githubUrl: postGithubUrl || undefined,
      promptCode: postPromptCode || undefined,
      imageUrl: postImageUrl || undefined
    };

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        await addDoc(collection(db, 'community_posts'), newPostData);
      } catch (err) {
        console.error('Failed to save post to Firestore:', err);
        const newPost: PostItem = { id: `po-${Date.now()}`, ...newPostData };
        setPosts(prev => [newPost, ...prev]);
      }
    } else {
      const newPost: PostItem = { id: `po-${Date.now()}`, ...newPostData };
      setPosts(prev => [newPost, ...prev]);
    }

    setShowCreatePostModal(false);
    setPostContent('');
    setPostPromptCode('');
    setPostImageUrl('');
    setPostGithubUrl('');
  };

  const handlePublishRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => String(p.id) === selectedProjectId);
    if (!proj) return;

    const newTemplateData = {
      title: proj.name.toLowerCase().replace(/\s+/g, '-'),
      creator: currentUserProfile?.displayName || user?.displayName || 'Developer Partner',
      category: portfolioCategory,
      model: 'gemini-2.0-flash',
      thumbsUp: 0,
      thumbsDown: 0,
      usedCount: 0,
      tags: portfolioTags ? portfolioTags.split(',').map(t => t.trim()) : ['Custom', 'Template'],
      githubUrl: repoGithubUrl || undefined
    };

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        await addDoc(collection(db, 'community_templates'), newTemplateData);
      } catch (err) {
        console.error('Failed to save template to Firestore:', err);
        const newTemplate: TemplateItem = { id: proj.activeTemplateId || `t-${Date.now()}`, ...newTemplateData };
        setCommunityTemplates(prev => [newTemplate, ...prev]);
      }
    } else {
      const newTemplate: TemplateItem = { id: proj.activeTemplateId || `t-${Date.now()}`, ...newTemplateData };
      setCommunityTemplates(prev => [newTemplate, ...prev]);
    }

    setShowPublishRepoModal(false);
    setSelectedProjectId('');
    setPortfolioTags('');
    setRepoGithubUrl('');
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTitle.trim() || !assetImageUrl.trim()) return;

    const fileInfo = detectFileInfo(assetImageUrl);

    const newAssetData = {
      title: assetTitle.toLowerCase().replace(/\s+/g, '-'),
      creator: currentUserProfile?.displayName || user?.displayName || 'Anonymous Designer',
      imageUrl: assetImageUrl,
      assetUrl: assetImageUrl,
      category: assetCategory,
      description: assetDescription || 'No description provided.',
      downloads: 0,
      fileType: fileInfo.type,
      format: fileInfo.format,
    };

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        await addDoc(collection(db, 'community_assets'), newAssetData);
      } catch (err) {
        console.error('Failed to save asset to Firestore:', err);
        const newAsset: SharedAssetItem = { id: `as-${Date.now()}`, ...newAssetData };
        setSharedAssets(prev => [newAsset, ...prev]);
      }
    } else {
      const newAsset: SharedAssetItem = { id: `as-${Date.now()}`, ...newAssetData };
      setSharedAssets(prev => [newAsset, ...prev]);
    }

    setShowAssetModal(false);
    setAssetTitle('');
    setAssetImageUrl('');
    setAssetDescription('');
    setShowAssetVaultPicker(false);
  };

  const handleRemixLayout = async (templateId: string, title: string) => {
    showAlert(`Forking template "${title}" into your local projects workspace...`, 'info');
    try {
      const newId = await createProject(`${title} (Fork)`, templateId);
      navigate(`/editor?id=${newId}`);
    } catch (err) {
      console.error(err);
      showAlert('Failed to remix layout.', 'error');
    }
  };

  const copyToClipboard = (id: string, text: string, isPrompt = false) => {
    navigator.clipboard.writeText(text);
    if (isPrompt) {
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } else {
      setCopiedAssetId(id);
      setTimeout(() => setCopiedAssetId(null), 2000);
    }
    showAlert('Copied to clipboard successfully!', 'success');
  };

  const handleSaveAsset = (title: string, url: string) => {
    if (!url) return;
    const currentSaved = localStorage.getItem('folient_saved_assets');
    let savedList = [];
    if (currentSaved) {
      try {
        savedList = JSON.parse(currentSaved);
      } catch (e) {
        savedList = [];
      }
    }
    if (savedList.some((item: any) => item.url === url)) {
      showAlert('Asset is already saved in your vault!', 'info');
      return;
    }
    savedList.push({
      id: `saved-${Date.now()}`,
      name: title,
      url: url,
      savedAt: Date.now()
    });
    localStorage.setItem('folient_saved_assets', JSON.stringify(savedList));
    showAlert('Asset saved to local vault library!', 'success');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPostForComments) return;

    const commentAuthor = currentUserProfile?.displayName || user?.displayName || 'Reviewer Partner';
    const newCommentData = {
      author: commentAuthor,
      text: newCommentText,
      timestamp: 'Just now',
      timestamp_epoch: Date.now()
    };

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        const commentsCol = collection(db, 'community_posts', selectedPostForComments.id, 'comments');
        await addDoc(commentsCol, newCommentData);
        
        // Increment commentsCount in posts document
        const postDocRef = doc(db, 'community_posts', selectedPostForComments.id);
        await updateDoc(postDocRef, {
          commentsCount: increment(1)
        });
      } catch (err) {
        console.error('Failed to save comment to Firestore:', err);
        // Fallback to local state if Firestore write fails
        const newComment: Comment = {
          id: `c-${Date.now()}`,
          author: commentAuthor,
          text: newCommentText,
          timestamp: 'Just now'
        };
        setCommentsList(prev => [...prev, newComment]);
      }
    } else {
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: commentAuthor,
        text: newCommentText,
        timestamp: 'Just now'
      };
      setCommentsList(prev => [...prev, newComment]);
    }

    setNewCommentText('');
    showAlert('Reply added successfully!', 'success');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPostForComments) return;
    
    // Optimistic Update
    setCommentsList(prev => prev.filter(c => c.id !== commentId));

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        const commentRef = doc(db, 'community_posts', selectedPostForComments.id, 'comments', commentId);
        await deleteDoc(commentRef);

        // Decrement commentsCount in posts document
        const postDocRef = doc(db, 'community_posts', selectedPostForComments.id);
        await updateDoc(postDocRef, {
          commentsCount: increment(-1)
        });
        showAlert('Comment deleted successfully.', 'success');
      } catch (err) {
        console.error('Failed to delete comment from Firestore:', err);
        showAlert('Failed to delete comment.', 'error');
      }
    } else {
      showAlert('Comment deleted successfully (Mock).', 'success');
    }
  };

  const handleCreatorHover = (e: React.MouseEvent, creatorName: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCreatorHoverCoords({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 100
    });
    setHoveredCreator(creatorName);

    // Increment profile visits in firestore when other users interact via community tab
    const currentCreatorName = user?.displayName || 'Developer Partner';
    if (creatorName !== currentCreatorName && !db.app.options.apiKey?.includes('placeholder')) {
      try {
        setDoc(doc(db, 'profile_visits', creatorName), {
          visits: increment(1)
        }, { merge: true }).catch(err => console.warn("Visits increment error:", err));
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const openUserProfile = (creatorName: string) => {
    const match = collaborators.find(c => c.name === creatorName);
    setSelectedUserProfile(match || {
      name: creatorName,
      displayName: creatorName,
      role: 'Developer',
      company: 'Folient Creator',
      github: '',
      linkedin: '',
      activeTopic: 'General Building',
      bio: 'Folient community member and builder.',
      photoURL: ''
    });

    const currentCreatorName = user?.displayName || 'Developer Partner';
    if (creatorName !== currentCreatorName && !db.app.options.apiKey?.includes('placeholder')) {
      try {
        setDoc(doc(db, 'profile_visits', creatorName), {
          visits: increment(1)
        }, { merge: true }).catch(err => console.warn("Visits increment error:", err));
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    // Optimistic Update
    setPosts(prev => prev.filter(p => p.id !== id));

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        await deleteDoc(doc(db, 'community_posts', id));
        showAlert('Post deleted successfully.', 'success');
      } catch (err) {
        console.error('Failed to delete post from Firestore:', err);
        showAlert('Failed to delete post.', 'error');
      }
    } else {
      showAlert('Post deleted successfully (Mock).', 'success');
    }
    setDeleteConfirm(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editedPostContent.trim()) return;

    // Optimistic Update
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, content: editedPostContent };
        }
        return p;
      })
    );

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        await updateDoc(doc(db, 'community_posts', id), {
          content: editedPostContent
        });
        showAlert('Post updated successfully.', 'success');
      } catch (err) {
        console.error('Failed to update post in Firestore:', err);
        showAlert('Failed to update post.', 'error');
      }
    } else {
      showAlert('Post updated successfully (Mock).', 'success');
    }
    setIsEditingPostId(null);
  };

  const handleDeleteAsset = async (id: string) => {
    // Optimistic Update
    setSharedAssets(prev => prev.filter(a => a.id !== id));

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        await deleteDoc(doc(db, 'community_assets', id));
        showAlert('Asset deleted successfully.', 'success');
      } catch (err) {
        console.error('Failed to delete asset from Firestore:', err);
        showAlert('Failed to delete asset.', 'error');
      }
    } else {
      showAlert('Asset deleted successfully (Mock).', 'success');
    }
    setDeleteConfirm(null);
  };

  const handleSaveAssetEdit = async (id: string) => {
    if (!editedAssetTitle.trim()) return;

    // Optimistic Update
    setSharedAssets(prev =>
      prev.map(a => {
        if (a.id === id) {
          return { 
            ...a, 
            title: editedAssetTitle, 
            description: editedAssetDescription,
            category: editedAssetCategory
          };
        }
        return a;
      })
    );

    if (!db.app.options.apiKey?.includes('placeholder')) {
      try {
        await updateDoc(doc(db, 'community_assets', id), {
          title: editedAssetTitle,
          description: editedAssetDescription,
          category: editedAssetCategory
        });
        showAlert('Asset updated successfully.', 'success');
      } catch (err) {
        console.error('Failed to update asset in Firestore:', err);
        showAlert('Failed to update asset.', 'error');
      }
    } else {
      showAlert('Asset updated successfully (Mock).', 'success');
    }
    setIsEditingAssetId(null);
  };

  const currentCreatorName = user?.displayName || 'Developer Partner';
  const sq = searchQuery.toLowerCase().trim();

  const filteredPosts = posts.filter(p => {
    if (sq && !p.creator.toLowerCase().includes(sq) && !p.content.toLowerCase().includes(sq)) return false;
    return true;
  });

  const filteredTemplates = communityTemplates.filter(item => {
    if (activeTagFilter && !item.tags.includes(activeTagFilter)) return false;
    if (sq && !item.creator.toLowerCase().includes(sq) && !item.title.toLowerCase().includes(sq) && !item.tags.some(t => t.toLowerCase().includes(sq))) return false;
    return true;
  });

  const filteredAssets = sharedAssets.filter(item => {
    if (sq && !item.creator.toLowerCase().includes(sq) && !item.title.toLowerCase().includes(sq) && !item.category.toLowerCase().includes(sq)) return false;
    return true;
  });

  const myPosts = posts.filter(p => p.creator === currentCreatorName);

  return (
    <div className="flex flex-col gap-6 text-left w-full h-full relative">
      
      {/* Sub-Header Navigation (GitHub / LinkedIn Tab system) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#ECEEF2] pb-5">
        <div className="flex bg-[#F3F4F6] p-1 rounded-2xl select-none shrink-0 w-full md:max-w-2xl">
          {[
            { id: 'feed', label: 'Social Feed', icon: MessageCircle },
            { id: 'repositories', label: 'Repositories', icon: GitFork },
            { id: 'assets', label: 'Media Assets', icon: ImageIcon },
            { id: 'contributions', label: 'My Posts', icon: FileCode }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as 'feed' | 'repositories' | 'assets' | 'contributions');
                  setActiveTagFilter(null);
                }}
                className={`flex-1 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-wider border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id ? 'bg-[#111111] text-white shadow-sm' : 'bg-transparent text-[#4B5563] hover:text-[#111111]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time search bar */}
        <div className="flex flex-1 max-w-sm w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username or tag..."
            className="w-full h-10 pl-9 pr-4 bg-[#F3F4F6] border border-[#ECEEF2] rounded-xl text-xs focus:outline-hidden focus:bg-white text-[#111111] transition-all"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <div className="flex gap-2">
          {activeTab === 'feed' && (
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="bg-[#111111] hover:scale-[1.02] text-white rounded-xl h-10 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Idea</span>
            </button>
          )}
          {activeTab === 'repositories' && (
            <button
              onClick={() => setShowPublishRepoModal(true)}
              className="bg-[#111111] hover:scale-[1.02] text-white rounded-xl h-10 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Publish Template</span>
            </button>
          )}
          {activeTab === 'assets' && (
            <button
              onClick={() => setShowAssetModal(true)}
              className="bg-[#111111] hover:scale-[1.02] text-white rounded-xl h-10 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-12 gap-6 items-start w-full">
        
        {/* LEFT COLUMN: SOCIAL FEED, REPOS OR ASSETS */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 w-full">
          
          {/* Tag Chips Filters */}
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

          {/* TAB 1: SOCIAL FEED & IDEAS */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="bg-white border border-[#ECEEF2] rounded-3xl p-10 text-center flex flex-col items-center gap-2">
                  <MessageCircle className="w-8 h-8 text-gray-300" />
                  <h4 className="text-xs font-bold text-[#111111]">{sq ? 'No matching posts found' : 'No updates shared yet'}</h4>
                  <p className="text-[10px] text-[#6B7280]">{sq ? 'Try a different search term.' : 'Be the first to share an idea or configuration prompt with the community!'}</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className="bg-white border border-[#ECEEF2] rounded-3xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4 text-left">
                    {/* Author Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => openUserProfile(post.creator)}
                          className="w-10 h-10 rounded-full bg-[#111111] text-white font-extrabold flex items-center justify-center text-xs cursor-pointer hover:opacity-85 transition-opacity"
                        >
                          {post.creator[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <h4 
                            onClick={() => openUserProfile(post.creator)}
                            onMouseEnter={(e) => handleCreatorHover(e, post.creator)}
                            onMouseLeave={() => setHoveredCreator(null)}
                            className="text-xs font-bold text-[#111111] cursor-pointer hover:underline text-left"
                          >
                            {post.creator}
                          </h4>
                          <p className="text-[10px] text-[#6B7280] font-medium text-left">{post.creatorTitle} • {formatRelativeTime(post.timestamp_epoch || post.timestamp)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {post.creator === currentCreatorName && (
                          <>
                            <button
                              onClick={() => { setIsEditingPostId(post.id); setEditedPostContent(post.content); }}
                              className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 border border-[#ECEEF2] bg-white cursor-pointer transition-colors flex items-center justify-center shrink-0"
                              title="Edit Post"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ id: post.id, type: 'post' })}
                              className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 border border-[#ECEEF2] bg-white cursor-pointer transition-colors flex items-center justify-center shrink-0"
                              title="Delete Post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {post.githubUrl && (
                          <a 
                            href={post.githubUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 hover:bg-[#F8F9FB] rounded-xl text-slate-700 border border-[#ECEEF2] flex items-center justify-center shrink-0 transition-colors"
                            title="View GitHub Repository"
                            aria-label="View GitHub Repository"
                          >
                            <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Content — inline edit mode */}
                    {isEditingPostId === post.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editedPostContent}
                          onChange={(e) => setEditedPostContent(e.target.value)}
                          rows={3}
                          className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl p-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] resize-none leading-relaxed"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setIsEditingPostId(null)}
                            className="px-3 py-1.5 bg-white border border-[#ECEEF2] hover:bg-[#F8F9FB] rounded-xl text-[10px] font-bold text-[#6B7280] cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(post.id)}
                            className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors border-none"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#111111] leading-relaxed font-sans font-medium">{post.content}</p>
                    )}

                    {/* Visual Asset if attached */}
                    {post.imageUrl && (
                      <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-[#F8F9FB] flex items-center justify-center relative group/image">
                        <img src={post.imageUrl} alt="Attached asset" className="w-full h-52 object-cover hover:scale-[1.02] transition-transform duration-300" />
                        <button
                          type="button"
                          onClick={() => handleSaveAsset(`${post.creator}'s Shared Image`, post.imageUrl!)}
                          className="absolute top-3 right-3 opacity-0 group-hover/image:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-[#ECEEF2] hover:bg-white text-[9px] font-bold text-[#111111] cursor-pointer flex items-center gap-1.5 shadow-sm z-10"
                          title="Save image to local assets vault"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#FF5733]" />
                          <span>Save to Vault</span>
                        </button>
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

                    {post.codeUrl && (
                      <div className="flex items-center gap-3 bg-[#F8F9FB] border border-[#ECEEF2] p-3 rounded-2xl">
                        <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-[#111111] truncate">index.html (Supabase Storage)</p>
                          {post.liveUrl && (
                            <p className="text-[9px] text-zinc-400 font-sans truncate block">
                              Live: <a href={post.liveUrl} target="_blank" rel="noreferrer" className="text-zinc-550 hover:underline">{post.liveUrl}</a>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2.5">
                          <button
                            disabled={isImporting !== null}
                            onClick={async () => {
                              if (!post.codeUrl) return;
                              setIsImporting(post.id);
                              try {
                                const newProjectId = await createProject(`${post.creator}'s Layout`, 'blank', []);
                                const result = await extractAstFromLiveUrl(post.codeUrl);
                                await folientDb.projects.update(newProjectId, {
                                  ast: JSON.stringify(result.ast),
                                  css: result.css,
                                  updatedAt: Date.now()
                                } as any);
                                navigate(`/editor?projectId=${newProjectId}`);
                              } catch (err: any) {
                                console.error(err);
                                showAlert(`Failed to import post code: ${err.message || err}`, 'error');
                              } finally {
                                setIsImporting(null);
                              }
                            }}
                            className="px-2.5 py-1 bg-[#111111] hover:bg-black text-white text-[9px] font-bold font-mono uppercase rounded-lg cursor-pointer shrink-0 transition-colors border-none flex items-center gap-1"
                          >
                            {isImporting === post.id && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                            <span>Use Code</span>
                          </button>
                          <a
                            href={post.codeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-white border border-[#ECEEF2] hover:bg-[#F8F9FB] rounded-lg text-[9px] font-bold text-gray-750 shrink-0 transition-colors flex items-center justify-center"
                          >
                            Source
                          </a>
                        </div>
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
                ))
              )}
            </div>
          )}

          {/* TAB 2: TEMPLATE REPOSITORIES (GitHub style) */}
          {activeTab === 'repositories' && (
            <div className="space-y-4">
              {filteredTemplates.length === 0 ? (
                <div className="bg-white border border-[#ECEEF2] rounded-3xl p-10 text-center flex flex-col items-center gap-2">
                  <GitFork className="w-8 h-8 text-gray-300" />
                  <h4 className="text-xs font-bold text-[#111111]">No templates published yet</h4>
                  <p className="text-[10px] text-[#6B7280]">Publish one of your canvas projects as a repository template for others to remix.</p>
                </div>
              ) : (
                filteredTemplates.map(item => (
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
                          <h4 className="text-xs font-mono tracking-tight text-[#111111] text-left">
                            <span 
                              onClick={() => openUserProfile(item.creator)}
                              className="font-bold cursor-pointer hover:underline"
                            >
                              {item.creator}
                            </span>
                            <span className="text-slate-400"> / </span>
                            <span className="font-bold">{item.title}</span>
                          </h4>
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
                            aria-label={`View GitHub repository code for ${item.title}`}
                          >
                            <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                        
                        <button
                          disabled={isImporting !== null}
                          onClick={async () => {
                            if (item.codeUrl) {
                              setIsImporting(item.id);
                              try {
                                const newProjectId = await createProject(`${item.title} (Fork)`, 'blank', []);
                                const result = await extractAstFromLiveUrl(item.codeUrl);
                                await folientDb.projects.update(newProjectId, {
                                  ast: JSON.stringify(result.ast),
                                  css: result.css,
                                  updatedAt: Date.now()
                                } as any);
                                navigate(`/editor?projectId=${newProjectId}`);
                              } catch (err: any) {
                                console.error(err);
                                showAlert(`Failed to fork community template: ${err.message || err}`, 'error');
                              } finally {
                                setIsImporting(null);
                              }
                            } else {
                              handleRemixLayout(item.id, item.title);
                            }
                          }}
                          className="h-10 px-4 bg-[#111111] hover:bg-black text-white rounded-xl text-xs font-bold border-none transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                        >
                          {(isImporting === item.id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <GitFork className="w-3.5 h-3.5" />
                          )}
                          <span>Fork Template</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: BRANDING & MEDIA ASSETS */}
          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAssets.length === 0 ? (
                <div className="col-span-2 bg-white border border-[#ECEEF2] rounded-3xl p-10 text-center flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                  <h4 className="text-xs font-bold text-[#111111]">{sq ? 'No matching assets found' : 'No media assets shared yet'}</h4>
                  <p className="text-[10px] text-[#6B7280]">{sq ? 'Try a different search term.' : 'Share image assets, branding logo symbols, or illustrations with other builders.'}</p>
                </div>
              ) : (
                filteredAssets.map(item => {
                  const fi = detectFileInfo(item.assetUrl || item.imageUrl);
                  const resolvedType = item.fileType || fi.type;
                  const resolvedFormat = item.format || fi.format;
                  const TypeIcon = getFileTypeIcon(resolvedType);
                  const typeInfo = FILE_TYPE_MAP[resolvedFormat] || { label: fi.label, color: fi.color };

                  return (
                    <div 
                      key={item.id} 
                      className="bg-white border border-[#ECEEF2] rounded-3xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[280px] hover:border-slate-350 transition-all duration-300 text-left overflow-hidden group"
                    >
                      {isEditingAssetId === item.id ? (
                        <div className="flex flex-col gap-3.5 w-full">
                          <div>
                            <label className="text-[9px] text-[#6B7280] font-extrabold uppercase tracking-wider block mb-1">Asset Title</label>
                            <input
                              type="text"
                              value={editedAssetTitle}
                              onChange={(e) => setEditedAssetTitle(e.target.value)}
                              className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl p-2.5 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-[#6B7280] font-extrabold uppercase tracking-wider block mb-1">Description</label>
                            <textarea
                              value={editedAssetDescription}
                              onChange={(e) => setEditedAssetDescription(e.target.value)}
                              rows={3}
                              className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl p-2.5 text-xs w-full focus:outline-none focus:bg-white text-[#111111] resize-none leading-relaxed"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-[#6B7280] font-extrabold uppercase tracking-wider block mb-1">Category</label>
                            <select
                              value={editedAssetCategory}
                              onChange={(e) => setEditedAssetCategory(e.target.value)}
                              className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl p-2.5 text-xs w-full focus:outline-none focus:bg-white text-[#111111]"
                            >
                              <option value="Typography">Typography</option>
                              <option value="Illustrations">Illustrations</option>
                              <option value="Branding">Branding</option>
                              <option value="UiComponents">UiComponents</option>
                              <option value="Mockups">Mockups</option>
                              <option value="3D Assets">3D Assets</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingAssetId(null)}
                              className="px-3.5 py-2 bg-white border border-[#ECEEF2] hover:bg-[#F8F9FB] rounded-xl text-[10px] font-bold text-[#6B7280] cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveAssetEdit(item.id)}
                              className="px-3.5 py-2 bg-[#111111] hover:bg-black text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {/* Category + Format badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{item.category}</span>
                              <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${typeInfo.color}`}>
                                .{resolvedFormat}
                              </span>
                            </div>
                            {item.creator === currentCreatorName && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditingAssetId(item.id);
                                    setEditedAssetTitle(item.title);
                                    setEditedAssetDescription(item.description || '');
                                    setEditedAssetCategory(item.category);
                                  }}
                                  className="p-1 hover:bg-[#F8F9FB] rounded-lg transition-colors border-none cursor-pointer"
                                  title="Edit Asset"
                                >
                                  <Edit className="w-3.5 h-3.5 text-slate-500 hover:text-slate-800" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirm({ id: item.id, type: 'asset' })}
                                  className="p-1 hover:bg-[#F8F9FB] rounded-lg transition-colors border-none cursor-pointer"
                                  title="Delete Asset"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400 hover:text-rose-600" />
                                </button>
                              </div>
                            )}
                          </div>
                          <h4 className="text-xs font-mono font-bold text-[#111111] mt-3 tracking-tight">{item.title}</h4>
                          <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">
                            By <strong 
                              onClick={() => openUserProfile(item.creator)}
                              className="text-[#111111] cursor-pointer hover:underline"
                            >{item.creator}</strong>
                            {item.fileSize && <span className="ml-2 text-slate-400 font-mono">({item.fileSize})</span>}
                          </p>

                          {/* Multi-format preview container */}
                          <div className="mt-3 border border-[#ECEEF2] rounded-2xl overflow-hidden h-36 bg-[#F8F9FB] relative flex items-center justify-center cursor-pointer"
                            onClick={() => setPreviewAssetItem(item)}
                          >
                            {(resolvedType === 'image' || resolvedType === 'svg') ? (
                              <img 
                                src={item.imageUrl || item.assetUrl} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                loading="lazy"
                              />
                            ) : resolvedType === 'video' ? (
                              <div className="w-full h-full relative flex items-center justify-center bg-[#111111]/5">
                                <video src={item.assetUrl} className="w-full h-full object-cover" muted preload="metadata" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Play className="w-4 h-4 text-[#111111] ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : resolvedType === 'audio' ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-pink-50 to-purple-50">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Music className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[9px] font-bold text-purple-700 font-mono">{resolvedFormat} Audio</span>
                              </div>
                            ) : resolvedType === 'document' && resolvedFormat === 'PDF' ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-red-50 to-orange-50">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[9px] font-bold text-red-700 font-mono">PDF Document</span>
                              </div>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-gray-100">
                                <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center shadow-lg">
                                  <TypeIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-600 font-mono">{resolvedFormat} {typeInfo.label}</span>
                              </div>
                            )}

                            {/* Preview hover overlay */}
                            <div className="absolute inset-0 bg-[#111111]/0 group-hover:bg-[#111111]/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                                <Eye className="w-3.5 h-3.5 text-[#111111]" />
                                <span className="text-[9px] font-bold text-[#111111]">Preview</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-gray-500 mt-3.5 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                        </div>
                      )}

                      {isEditingAssetId !== item.id && (
                        <div className="pt-4 border-t border-[#ECEEF2] mt-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-500 font-bold font-mono flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {item.downloads}
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono">{resolvedFormat}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewAssetItem(item)}
                              className="flex items-center gap-1 px-2 py-1.5 bg-[#F8F9FB] border border-[#ECEEF2] hover:bg-[#ECEEF2] text-[#111111] text-[9px] font-bold rounded-xl cursor-pointer transition-all"
                              title="Preview asset"
                            >
                              <Eye className="w-3 h-3 text-indigo-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveAsset(item.title, item.assetUrl)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F8F9FB] border border-[#ECEEF2] hover:bg-[#ECEEF2] text-[#111111] text-[9px] font-bold rounded-xl cursor-pointer transition-all"
                              title="Save to vault"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-[#FF5733]" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => copyToClipboard(item.id, item.assetUrl)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#111111] hover:bg-black text-white text-[9px] font-bold rounded-xl border-none cursor-pointer transition-all"
                            >
                              {copiedAssetId === item.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: MY POSTS / CONTRIBUTIONS */}
          {activeTab === 'contributions' && (
            <div className="space-y-6">
              {myPosts.length === 0 ? (
                <div className="bg-white border border-[#ECEEF2] rounded-3xl p-10 text-center flex flex-col items-center gap-2">
                  <FileCode className="w-8 h-8 text-gray-300" />
                  <h4 className="text-xs font-bold text-[#111111]">No contributions yet</h4>
                  <p className="text-[10px] text-[#6B7280]">Posts you share in the Social Feed will appear here for easy management.</p>
                  <button
                    onClick={() => { setActiveTab('feed'); setShowCreatePostModal(true); }}
                    className="mt-3 bg-[#111111] text-white px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-black transition-colors"
                  >
                    Create Your First Post
                  </button>
                </div>
              ) : (
                myPosts.map(post => (
                  <div key={post.id} className="bg-white border border-[#ECEEF2] rounded-3xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4 text-left">
                    {/* Header with actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#111111] text-white font-extrabold flex items-center justify-center text-xs">
                          {post.creator[0]}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#111111]">{post.creator}</h4>
                          <p className="text-[10px] text-[#6B7280] font-medium">{post.creatorTitle} • {post.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setIsEditingPostId(post.id); setEditedPostContent(post.content); }}
                          className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 border border-[#ECEEF2] bg-white cursor-pointer transition-colors flex items-center justify-center"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: post.id, type: 'post' })}
                          className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 border border-[#ECEEF2] bg-white cursor-pointer transition-colors flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline edit or content */}
                    {isEditingPostId === post.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editedPostContent}
                          onChange={(e) => setEditedPostContent(e.target.value)}
                          rows={3}
                          className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl p-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] resize-none leading-relaxed"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setIsEditingPostId(null)}
                            className="px-3 py-1.5 bg-white border border-[#ECEEF2] hover:bg-[#F8F9FB] rounded-xl text-[10px] font-bold text-[#6B7280] cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(post.id)}
                            className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors border-none"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#111111] leading-relaxed font-sans font-medium">{post.content}</p>
                    )}

                    {post.imageUrl && (
                      <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden max-h-40 bg-[#F8F9FB] flex items-center justify-center">
                        <img src={post.imageUrl} alt="Post attachment" className="max-w-full max-h-full object-cover" />
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="pt-3 border-t border-[#ECEEF2] flex items-center gap-6">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        {post.likes} Likes
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        {post.commentsCount} Comments
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: COLLABORATORS & GITHUB/LINKEDIN CONNECTIONS */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6 w-full">
          
          {/* Creator & Connection Section (LinkedIn style) */}
          <div className="bg-white border border-[#ECEEF2] rounded-3xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] text-left">
            <div className="flex items-center gap-2 mb-5">
              <LinkedinIcon className="w-4 h-4 text-indigo-650" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Connect & Collaborate</h4>
            </div>

            <div className="space-y-4">
              {collaborators.length === 0 ? (
                <div className="text-center py-4 text-[10px] font-medium text-slate-400">
                  No public creators registered yet. Opt-in via your profile to appear!
                </div>
              ) : (
                collaborators.map((collab, idx) => (
                  <div key={idx} className="flex flex-col gap-2 border-b border-[#ECEEF2]/60 pb-3.5 last:border-none last:pb-0">
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={() => setSelectedUserProfile(collab)}
                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-[10px] overflow-hidden">
                          {collab.photoURL ? (
                            <img src={collab.photoURL} alt={collab.name} className="w-full h-full object-cover" />
                          ) : (
                            collab.name[0]?.toUpperCase() || 'C'
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#111111] hover:underline text-left">{collab.name}</h5>
                          <p className="text-[9px] text-[#6B7280] font-medium text-left">{collab.role} @ {collab.company}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {collab.github && (
                          <a href={collab.github} target="_blank" rel="noreferrer" className="p-1 hover:bg-[#F8F9FB] rounded-lg text-slate-600 border border-[#ECEEF2]" aria-label={`${collab.name}'s GitHub profile`}>
                            <GithubIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {collab.linkedin && (
                          <a href={collab.linkedin} target="_blank" rel="noreferrer" className="p-1 hover:bg-[#F8F9FB] rounded-lg text-slate-600 border border-[#ECEEF2]" aria-label={`${collab.name}'s LinkedIn profile`}>
                            <LinkedinIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-500 font-medium text-left">
                      Active on: <strong className="text-slate-800">{collab.activeTopic}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* GitHub Leaderboard */}
          <div className="bg-white border border-[#ECEEF2] rounded-3xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] text-left">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Top Contributors</h4>
            </div>

            <div className="space-y-3 font-mono text-[10px] text-slate-500">
              {contributorsStats.length === 0 ? (
                <div className="text-center py-4 text-[10px] font-medium text-slate-400">
                  No active community contributions found.
                </div>
              ) : (
                contributorsStats.map((contrib, idx) => {
                  const matchingProfile = collaborators.find(c => c.name === contrib.name);
                  const clickTarget = matchingProfile || {
                    name: contrib.name,
                    displayName: contrib.name,
                    role: 'Contributor',
                    company: 'Community Partner',
                    github: '',
                    linkedin: '',
                    activeTopic: 'General Portfolio Building',
                    bio: 'Folient community builder and regular contributor.',
                    photoURL: contrib.photoURL || ''
                  };

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedUserProfile(clickTarget)}
                      className="flex justify-between items-center border-b border-[#ECEEF2]/60 pb-2.5 last:border-none last:pb-0 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                        <span className="text-slate-800 font-semibold hover:underline text-left">{contrib.name}</span>
                      </div>
                      <strong className="text-slate-900 font-bold">{contrib.total} contributions</strong>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </aside>
      </div>

      {/* FEEDBACK MATRIX / COMMENT OVERLAY DRAWER */}
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
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border border-slate-300/40 text-slate-700 font-extrabold flex items-center justify-center text-[10px] uppercase flex-shrink-0 mt-0.5 shadow-xs">
                        {comment.author[0] || 'C'}
                      </div>
                      <div className="flex-1 bg-white border border-[#ECEEF2] hover:border-slate-250 p-3.5 rounded-2xl rounded-tl-none relative transition-all duration-200 shadow-xs">
                        <div className="flex justify-between items-center pr-6">
                          <span className="text-xs font-bold text-[#111111]">{comment.author}</span>
                          <span className="text-[9px] text-slate-400 font-semibold font-mono">{formatRelativeTime(comment.timestamp_epoch || comment.timestamp)}</span>
                        </div>
                        <p className="text-xs text-gray-700 mt-1.5 font-medium leading-relaxed font-sans">{comment.text}</p>
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
      {showCreatePostModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
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
                  rows={3}
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

              {/* Upload image to Supabase connected container */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Image / Asset URL (Optional)</label>
                  <div className="flex gap-2">
                    {supabaseUrl && supabaseKey && (
                      <button
                        type="button"
                        onClick={() => setShowVaultPicker(!showVaultPicker)}
                        className="text-[9px] text-indigo-650 hover:underline font-bold cursor-pointer flex items-center gap-1 border-none bg-transparent"
                      >
                        <ImageIcon className="w-3 h-3 text-[#FF5733]" />
                        <span>Browse Vault</span>
                      </button>
                    )}
                    <label className="text-[9px] text-indigo-650 hover:underline font-bold cursor-pointer flex items-center gap-1">
                      <UploadCloud className="w-3 h-3" />
                      <span>Upload to Supabase</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadFileToSupabase(file);
                            if (url) {
                              setPostImageUrl(url);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Vault Picker Grid */}
                {showVaultPicker && (
                  <div className="border border-[#ECEEF2] rounded-xl p-3 bg-[#F8F9FB] max-h-36 overflow-y-auto flex flex-col gap-2 animate-fade-in shrink-0 scrollbar-thin">
                    <span className="text-[8px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">Select Image from Vault:</span>
                    {isLoadingVault ? (
                      <div className="flex items-center justify-center py-4 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF5733]" />
                        <span className="text-[8px] font-mono text-gray-500">Syncing vault...</span>
                      </div>
                    ) : vaultImages.length === 0 ? (
                      <span className="text-[8px] font-mono text-gray-500 py-2 text-center">No images found in your Supabase bucket.</span>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {vaultImages.map((asset) => (
                          <div 
                            key={asset.id} 
                            onClick={() => { setPostImageUrl(asset.url); setShowVaultPicker(false); }}
                            className={`aspect-square rounded-lg border-2 overflow-hidden cursor-pointer hover:scale-102 active:scale-98 transition-all ${postImageUrl === asset.url ? 'border-[#FF5733]' : 'border-transparent hover:border-[#ECEEF2]'}`}
                            title={asset.name}
                          >
                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <input 
                    type="url" 
                    value={postImageUrl}
                    onChange={(e) => setPostImageUrl(e.target.value)}
                    placeholder="e.g. https://domain.com/layout.png"
                    className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold pr-10"
                  />
                  {isUploadingFile && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Selected image preview inside post creation modal */}
                {postImageUrl && (
                  <div className="mt-2 border border-[#ECEEF2] rounded-xl overflow-hidden h-20 bg-[#F8F9FB] relative flex items-center justify-center group/create-preview shrink-0">
                    <img src={postImageUrl} alt="Vault Preview" className="h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setPostImageUrl('')}
                      className="absolute top-1 right-1 opacity-0 group-hover/create-preview:opacity-100 p-1 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-md border border-[#ECEEF2] text-[#6B7280] transition-all cursor-pointer flex items-center justify-center"
                      title="Clear image selection"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
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
        </div>,
        document.body
      )}

      {/* PUBLISH REPOSITORY MODAL */}
      {showPublishRepoModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
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
        </div>,
        document.body
      )}

      {/* SHARE DESIGN ASSET MODAL — Upgraded with Vault Picker & Multi-Format */}
      {showAssetModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white border border-[#ECEEF2] rounded-[32px] p-8 shadow-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowAssetModal(false); setShowAssetVaultPicker(false); }}
              className="absolute top-6 right-6 p-2 hover:bg-[#F8F9FB] rounded-xl text-gray-400 hover:text-[#111111] border-none bg-transparent cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-1 text-center">Share Design Asset</h3>
            <p className="text-[10px] text-[#6B7280] text-center mb-5 leading-normal">
              Share files from your Supabase vault or paste any asset URL. Supports images, videos, audio, PDFs, fonts, SVGs, and more.
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
                  <option value="Icon">Icon</option>
                  <option value="SVG">SVG / Vector</option>
                  <option value="Video">Video</option>
                  <option value="Audio">Audio</option>
                  <option value="Font">Font / Typography</option>
                  <option value="Document">Document / PDF</option>
                  <option value="Code">Code Snippet</option>
                  <option value="3D Model">3D Model</option>
                  <option value="UI Kit">UI Kit</option>
                  <option value="Archive">Archive / Bundle</option>
                </select>
              </div>

              {/* Asset Source: Upload / Vault / URL */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">File / Asset URL</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAssetVaultPicker(v => !v)}
                      className="text-[9px] text-indigo-650 hover:text-indigo-800 font-bold cursor-pointer flex items-center gap-1 bg-transparent border-none p-0 transition-colors"
                    >
                      <File className="w-3 h-3" />
                      <span>{showAssetVaultPicker ? 'Hide Vault' : 'Browse Vault'}</span>
                    </button>
                    <label className="text-[9px] text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer flex items-center gap-1">
                      <UploadCloud className="w-3 h-3" />
                      <span>Upload New</span>
                      <input 
                        type="file" 
                        accept="image/*,video/*,audio/*,.pdf,.svg,.json,.html,.css,.js,.ts,.woff,.woff2,.ttf,.otf,.zip,.rar,.md,.txt,.csv" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadFileToSupabase(file);
                            if (url) {
                              setAssetImageUrl(url);
                              if (!assetTitle.trim()) {
                                setAssetTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
                              }
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* URL input with live type badge */}
                <div className="relative">
                  <input 
                    type="url" 
                    value={assetImageUrl}
                    onChange={(e) => setAssetImageUrl(e.target.value)}
                    required
                    placeholder="Paste URL or select from vault below..."
                    className="h-10 bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl px-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] font-semibold pr-20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isUploadingFile && (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    )}
                    {assetImageUrl && !isUploadingFile && (() => {
                      const fi = detectFileInfo(assetImageUrl);
                      const mapped = FILE_TYPE_MAP[fi.format] || { label: fi.label, color: fi.color };
                      return (
                        <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${mapped.color}`}>
                          .{fi.format}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Supabase Vault Browser */}
                {showAssetVaultPicker && (
                  <div className="border border-[#ECEEF2] rounded-2xl p-3 bg-[#F9FAFB] max-h-48 overflow-y-auto mt-1">
                    {isLoadingAssetVault ? (
                      <div className="flex items-center justify-center py-6 gap-2">
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                        <span className="text-[10px] text-[#6B7280] font-medium">Loading vault files...</span>
                      </div>
                    ) : !supabaseUrl || !supabaseKey ? (
                      <div className="text-center py-4">
                        <p className="text-[10px] text-[#6B7280]">Connect Supabase in Settings to browse your vault.</p>
                      </div>
                    ) : vaultAllFiles.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-[10px] text-[#6B7280]">No files in your Supabase vault yet. Upload one above.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider px-1 mb-1">
                          {vaultAllFiles.length} files in vault
                        </div>
                        {vaultAllFiles.map((file: any) => {
                          const fi = detectFileInfo(file.url || file.name);
                          const mapped = FILE_TYPE_MAP[fi.format] || { label: fi.label, color: fi.color };
                          const TypeIcon = getFileTypeIcon(fi.type);
                          const isSelected = assetImageUrl === file.url;
                          return (
                            <button
                              key={file.id}
                              type="button"
                              onClick={() => {
                                setAssetImageUrl(file.url);
                                if (!assetTitle.trim()) {
                                  setAssetTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
                                }
                                setShowAssetVaultPicker(false);
                              }}
                              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-50 border-indigo-200' 
                                  : 'bg-white border-[#ECEEF2] hover:bg-[#F8F9FB] hover:border-slate-300'
                              }`}
                            >
                              {/* Mini preview */}
                              <div className="w-9 h-9 rounded-lg bg-[#F8F9FB] border border-[#ECEEF2] overflow-hidden flex items-center justify-center shrink-0">
                                {fi.type === 'image' || fi.type === 'svg' ? (
                                  <img src={file.url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} loading="lazy" />
                                ) : (
                                  <TypeIcon className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-[#111111] truncate">{file.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${mapped.color}`}>
                                    .{fi.format}
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-mono">{file.size}</span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Live preview of selected asset */}
              {assetImageUrl && (
                <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-[#F8F9FB]">
                  <div className="px-3 py-2 border-b border-[#ECEEF2] flex items-center justify-between">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Preview</span>
                    <a href={assetImageUrl} target="_blank" rel="noreferrer" className="text-[8px] text-indigo-600 hover:underline font-bold flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" /> Open
                    </a>
                  </div>
                  <div className="h-32 flex items-center justify-center">
                    {(() => {
                      const fi = detectFileInfo(assetImageUrl);
                      if (fi.type === 'image' || fi.type === 'svg') {
                        return <img src={assetImageUrl} alt="Preview" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
                      }
                      if (fi.type === 'video') {
                        return <video src={assetImageUrl} className="max-w-full max-h-full" controls muted preload="metadata" />;
                      }
                      if (fi.type === 'audio') {
                        return (
                          <div className="flex flex-col items-center gap-2 py-4">
                            <Music className="w-6 h-6 text-purple-500" />
                            <audio src={assetImageUrl} controls preload="metadata" className="w-56" />
                          </div>
                        );
                      }
                      const TypeIcon = getFileTypeIcon(fi.type);
                      return (
                        <div className="flex flex-col items-center gap-2 py-4 text-center">
                          <TypeIcon className="w-8 h-8 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-500">{fi.format} {fi.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Description</label>
                <textarea 
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe your asset and how other builders can use it..."
                  className="bg-[#F9FAFB] border border-[#ECEEF2] rounded-xl p-3 text-xs w-full focus:outline-none focus:bg-white text-[#111111] resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={!assetTitle.trim() || !assetImageUrl.trim() || isUploadingFile}
                  className="flex-1 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl h-10 border-none cursor-pointer transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isUploadingFile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Share Asset
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAssetModal(false); setShowAssetVaultPicker(false); }}
                  className="flex-1 bg-white hover:bg-slate-50 border border-[#ECEEF2] text-gray-500 text-xs font-bold rounded-xl h-10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
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
          </div>
        , document.body);
      })()}

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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fade-in_0.15s_ease-out]">
          <div className="bg-white border border-[#ECEEF2] rounded-[28px] p-8 shadow-2xl max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-[#111111] mb-1">Delete {deleteConfirm.type === 'post' ? 'Post' : 'Item'}?</h3>
            <p className="text-[10px] text-[#6B7280] leading-relaxed mb-6">
              This action cannot be undone. The {deleteConfirm.type} will be permanently removed from the community.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white hover:bg-[#F8F9FB] border border-[#ECEEF2] text-[#6B7280] text-xs font-bold rounded-xl h-10 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'post') {
                    handleDeletePost(deleteConfirm.id);
                  } else if (deleteConfirm.type === 'asset') {
                    handleDeleteAsset(deleteConfirm.id);
                  }
                }}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl h-10 border-none cursor-pointer transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* USER PROFILE MODAL */}
      {selectedUserProfile && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white border border-[#ECEEF2] rounded-[32px] shadow-2xl max-w-2xl w-full relative max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-slate-900 to-indigo-950 relative flex-shrink-0">
              <button
                onClick={() => setSelectedUserProfile(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/85 hover:text-white border-none cursor-pointer transition-colors"
                aria-label="Close Profile"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar & Name Block (Offset) */}
            <div className="px-8 pb-4 relative flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-4 gap-4">
                <div className="flex items-end gap-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-900 text-white font-extrabold flex items-center justify-center text-3xl overflow-hidden shadow-md">
                    {selectedUserProfile.photoURL ? (
                      <img src={selectedUserProfile.photoURL} alt={selectedUserProfile.name} className="w-full.h-full.object-cover" />
                    ) : (
                      selectedUserProfile.name[0]?.toUpperCase() || 'C'
                    )}
                  </div>
                  <div className="mb-2 text-left">
                    <h3 className="text-lg font-bold text-[#111111] leading-none mb-1.5">{selectedUserProfile.name}</h3>
                    <p className="text-[11px] text-[#6B7280] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded inline-block">
                      {selectedUserProfile.role}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-2">
                  {selectedUserProfile.github && (
                    <a
                      href={selectedUserProfile.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ECEEF2] hover:bg-[#F8F9FB] rounded-xl text-[10px] font-bold text-[#6B7280] cursor-pointer transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {selectedUserProfile.linkedin && (
                    <a
                      href={selectedUserProfile.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ECEEF2] hover:bg-[#F8F9FB] rounded-xl text-[10px] font-bold text-[#6B7280] cursor-pointer transition-colors"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Bio & Details */}
              <div className="text-left space-y-2 max-w-xl">
                {selectedUserProfile.bio && (
                  <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                    {selectedUserProfile.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-semibold pt-1">
                  {selectedUserProfile.company && (
                    <span>Company/Goal: <strong className="text-slate-800">{selectedUserProfile.company}</strong></span>
                  )}
                  {selectedUserProfile.activeTopic && (
                    <span>Specialty: <strong className="text-indigo-600">{selectedUserProfile.activeTopic}</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Contributions Section */}
            <div className="border-t border-[#ECEEF2] flex-1 overflow-hidden flex flex-col">
              {/* Tab Selector */}
              <div className="flex border-b border-[#ECEEF2] bg-[#F8F9FB] px-6">
                {(['posts', 'templates', 'assets'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveProfileTab(tab)}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer border-none bg-transparent ${
                      activeProfileTab === tab
                        ? 'border-[#111111] text-[#111111]'
                        : 'border-transparent text-gray-400 hover:text-[#111111]'
                    }`}
                  >
                    {tab} ({selectedUserContributions[tab].length})
                  </button>
                ))}
              </div>

              {/* Tab Content List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeProfileTab === 'posts' && (
                  selectedUserContributions.posts.length === 0 ? (
                    <div className="text-center py-8 text-[11px] font-medium text-[#6B7280]">No posts published by this creator yet.</div>
                  ) : (
                    selectedUserContributions.posts.map(post => (
                      <div key={post.id} className="bg-slate-50 border border-[#ECEEF2] rounded-2xl p-4 text-left">
                        <div className="text-[10px] text-gray-400 mb-1">{formatRelativeTime(post.timestamp_epoch || post.timestamp)}</div>
                        <p className="text-xs text-[#111111] font-medium leading-relaxed mb-3">{post.content}</p>
                        {post.imageUrl && (
                          <img src={post.imageUrl} alt="Post attachment" className="rounded-xl w-full h-32 object-cover mb-3 hover:scale-[1.01] transition-transform duration-250" />
                        )}
                        <div className="flex gap-4 text-[10px] text-slate-500 font-bold">
                          <span>❤️ {post.likes} Likes</span>
                          <span>💬 {post.commentsCount} Comments</span>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeProfileTab === 'templates' && (
                  selectedUserContributions.templates.length === 0 ? (
                    <div className="text-center py-8 text-[11px] font-medium text-[#6B7280]">No portfolio templates shared by this creator.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedUserContributions.templates.map(tmpl => (
                        <div key={tmpl.id} className="border border-[#ECEEF2] rounded-2xl p-4 bg-slate-50 text-left flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {tmpl.category}
                            </span>
                            <h4 className="text-xs font-bold text-[#111111] mt-1.5">{tmpl.title}</h4>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">Model: {tmpl.model}</p>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#ECEEF2]/60 text-[9px] text-gray-500 font-bold">
                            <span>👍 {tmpl.thumbsUp}</span>
                            <span>Used: {tmpl.usedCount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {activeProfileTab === 'assets' && (
                  selectedUserContributions.assets.length === 0 ? (
                    <div className="text-center py-8 text-[11px] font-medium text-[#6B7280]">No shared design assets from this creator.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedUserContributions.assets.map(asset => (
                        <div key={asset.id} className="border border-[#ECEEF2] rounded-2xl p-4 bg-slate-50 text-left flex flex-col justify-between cursor-pointer hover:border-slate-400 transition-colors"
                          onClick={() => setPreviewAssetItem(asset)}
                        >
                          <div>
                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {asset.category}
                            </span>
                            <h4 className="text-xs font-bold text-[#111111] mt-1.5 line-clamp-1">{asset.title}</h4>
                            <p className="text-[9px] text-[#6B7280] line-clamp-2 mt-1">{asset.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#ECEEF2]/60 text-[9px] text-slate-500 font-bold">
                            <span className="capitalize">{asset.fileType || 'File'} ({asset.format || '?'})</span>
                            <span>⬇️ {asset.downloads}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
