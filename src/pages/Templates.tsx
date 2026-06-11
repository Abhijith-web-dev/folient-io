import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import { OFFICIAL_TEMPLATES, type Template } from '../templates/templates';
import { folientDb } from '../db/dexie';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { useDeploymentEngine } from '../hooks/useDeploymentEngine';

// Enhanced Template interface with metadata
interface TemplateMetadata extends Template {
  author: string;
  rating: number;
  reviewsCount: number;
  popularity: number;
  dateAdded: string;
  githubUrl?: string;
}

// Extend official templates with SaaS metadata
const METADATA_MAP: Record<string, Partial<TemplateMetadata>> = {
  horizon: {
    author: 'Folient Official',
    rating: 4.9,
    reviewsCount: 142,
    popularity: 950,
    dateAdded: '2026-05-01',
    githubUrl: 'https://github.com/folient/templates/tree/main/horizon'
  },
  carbon: {
    author: 'Folient Official',
    rating: 4.8,
    reviewsCount: 89,
    popularity: 720,
    dateAdded: '2026-05-15',
    githubUrl: 'https://github.com/folient/templates/tree/main/carbon'
  },
  lumina: {
    author: 'Folient Official',
    rating: 4.7,
    reviewsCount: 64,
    popularity: 540,
    dateAdded: '2026-06-01',
    githubUrl: 'https://github.com/folient/templates/tree/main/lumina'
  },
  slate: {
    author: 'Folient Official',
    rating: 4.6,
    reviewsCount: 41,
    popularity: 320,
    dateAdded: '2026-06-05',
    githubUrl: 'https://github.com/folient/templates/tree/main/slate'
  },
  prism: {
    author: 'Folient Official',
    rating: 4.9,
    reviewsCount: 78,
    popularity: 410,
    dateAdded: '2026-06-06',
    githubUrl: 'https://github.com/folient/templates/tree/main/prism'
  },
  focus: {
    author: 'Folient Official',
    rating: 4.8,
    reviewsCount: 35,
    popularity: 280,
    dateAdded: '2026-06-07',
    githubUrl: 'https://github.com/folient/templates/tree/main/focus'
  },
  pulse: {
    author: 'Folient Official',
    rating: 4.9,
    reviewsCount: 92,
    popularity: 640,
    dateAdded: '2026-06-07',
    githubUrl: 'https://github.com/folient/templates/tree/main/pulse'
  },
  mono: {
    author: 'Folient Official',
    rating: 4.7,
    reviewsCount: 57,
    popularity: 490,
    dateAdded: '2026-06-08',
    githubUrl: 'https://github.com/folient/templates/tree/main/mono'
  },
  vivid: {
    author: 'Folient Official',
    rating: 4.8,
    reviewsCount: 44,
    popularity: 350,
    dateAdded: '2026-06-08',
    githubUrl: 'https://github.com/folient/templates/tree/main/vivid'
  },
  studio: {
    author: 'Folient Official',
    rating: 4.9,
    reviewsCount: 110,
    popularity: 810,
    dateAdded: '2026-06-08',
    githubUrl: 'https://github.com/folient/templates/tree/main/studio'
  }
};

const ENHANCED_TEMPLATES: TemplateMetadata[] = OFFICIAL_TEMPLATES.map(t => ({
  ...t,
  author: METADATA_MAP[t.id]?.author || 'Community Contributor',
  rating: METADATA_MAP[t.id]?.rating || 4.5,
  reviewsCount: METADATA_MAP[t.id]?.reviewsCount || 12,
  popularity: METADATA_MAP[t.id]?.popularity || 100,
  dateAdded: METADATA_MAP[t.id]?.dateAdded || '2026-06-07',
  githubUrl: METADATA_MAP[t.id]?.githubUrl
}));

import { useSEO } from '../hooks/useSEO';

export default function Templates() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const { createProject } = useProjectStore();
  const { extractAstFromLiveUrl } = useDeploymentEngine();

  const [communityTemplates, setCommunityTemplates] = useState<any[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'official' | 'community'>('official');
  const [isImporting, setIsImporting] = useState<string | null>(null);

  useEffect(() => {
    if (db.app.options.apiKey?.includes('placeholder')) {
      return;
    }
    setIsLoadingCommunity(true);
    const templatesCol = collection(db, 'community_templates');
    const unsubscribe = onSnapshot(templatesCol, (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setCommunityTemplates(list);
      setIsLoadingCommunity(false);
    }, (err) => {
      console.warn("Firestore community templates load failed:", err);
      setIsLoadingCommunity(false);
    });
    return () => unsubscribe();
  }, []);

  useSEO({
    title: 'Portfolio Templates',
    description: 'Browse the catalog of official templates for Folient. Launch developer resumes, interactive bento layouts, CV showcases, and modern tech portfolios.',
    canonicalPath: '/templates',
  });


  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rated'>('popular');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [showSectionFilter, setShowSectionFilter] = useState(false);
  
  // Custom Prompt Modal state
  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [customPromptText, setCustomPromptText] = useState('');
  const [templateToUse, setTemplateToUse] = useState<Template | null>(null);

  // Preview Modal state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateBlankProject = async () => {
    try {
      const newProjectId = await createProject("Blank Portfolio", "blank", []);
      const blankAst = {
        id: 'root-viewport',
        type: 'div',
        classes: 'w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative p-6 items-center justify-center',
        children: []
      };
      await folientDb.projects.update(newProjectId, {
        ast: JSON.stringify(blankAst),
        css: '',
        updatedAt: Date.now()
      } as any);
      navigate(`/editor?projectId=${newProjectId}`);
    } catch (error) {
      console.error("Failed to create blank project:", error);
      alert("Failed to create blank project.");
    }
  };

  const handleUseTemplate = (template: Template) => {
    setTemplateToUse(template);
    setCustomPromptOpen(true);
  };

  const handleConfirmUseTemplate = async (usePrompt: boolean) => {
    if (!templateToUse) return;

    try {
      // Structure initial sections
      const initialSections = templateToUse.sections.map(s => ({
         sectionId: s.sectionId,
         html: s.html,
         order: s.order,
         isVisible: s.isVisible
      }));

      const newProjectId = await createProject(
        `${templateToUse.name} Portfolio`,
        templateToUse.id,
        initialSections
      );

      let targetUrl = `/editor?projectId=${newProjectId}`;
      if (usePrompt && customPromptText.trim()) {
        targetUrl += `&prompt=${encodeURIComponent(customPromptText.trim())}`;
      }

      setCustomPromptOpen(false);
      setCustomPromptText('');
      setTemplateToUse(null);
      navigate(targetUrl);
    } catch (error) {
      console.error("Failed to inject template:", error);
      alert("Template injection failed.");
    }
  };

  const getCategories = () => {
    const cats = new Set(ENHANCED_TEMPLATES.map(t => t.category));
    return ['All', ...Array.from(cats)];
  };

  // Get all unique section types across templates
  const getAllSectionTypes = () => {
    const sections = new Set<string>();
    ENHANCED_TEMPLATES.forEach(t => {
      t.sections.forEach(s => sections.add(s.sectionId));
    });
    return Array.from(sections);
  };

  const toggleSectionFilter = (secId: string) => {
    if (selectedSections.includes(secId)) {
      setSelectedSections(selectedSections.filter(s => s !== secId));
    } else {
      setSelectedSections([...selectedSections, secId]);
    }
  };

  const filteredTemplates = ENHANCED_TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    
    // Check if the template contains all selected section types
    const matchesSections = selectedSections.every(secId => 
      t.sections.some(s => s.sectionId === secId)
    );

    return matchesSearch && matchesCategory && matchesSections;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.popularity - a.popularity;
    if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    if (sortBy === 'rated') return b.rating - a.rating;
    return 0;
  });

  const getTemplatePreviewHtml = (template: Template) => {
    const sectionsHtml = template.sections
      .filter(s => s.isVisible)
      .map(s => s.html)
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${template.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
  <style>
    body { 
      font-family: 'Inter', sans-serif; 
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
  </style>
</head>
<body class="bg-[#F3F4F6] text-[#111111] antialiased">
  <div class="w-full">
    ${sectionsHtml}
  </div>
</body>
</html>`;
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    setHasRated(true);
    // Auto reset rating success message after 2 seconds
    setTimeout(() => {
      setHasRated(false);
    }, 2500);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center text-gray-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#111111]">progress_activity</span>
          <span className="text-sm font-semibold">Loading template catalogs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 md:p-8 font-sans text-[#111111] relative overflow-x-hidden">
      {/* Top Header */}
      <header className="max-w-[1500px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[13px] font-medium text-[#6B7280]">
            <Link to="/dashboard" className="hover:underline hover:text-[#111111] transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-[#111111]">Templates</span>
          </div>
          <h1 className="text-[36px] font-bold text-[#111111] tracking-tight leading-none">Select a Template</h1>
          <p className="text-sm text-[#6B7280] mt-2 font-medium">Start fresh with an official layout, fully customisable with AI.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] text-lg">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search template name, category..."
              className="w-full pl-11 pr-4 h-10 bg-white border border-[#ECEEF2] rounded-full font-medium text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111111] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>

          {/* Start Blank Project Button */}
          <button
            onClick={handleCreateBlankProject}
            className="flex items-center gap-2 px-5 h-10 bg-[#111111] hover:bg-black text-white rounded-full text-xs font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all border-none cursor-pointer shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Start Blank Project
          </button>
        </div>
      </header>

      {/* Catalog Tab Selector */}
      <div className="max-w-[1500px] mx-auto mb-6 flex bg-[#E5E7EB] p-1 rounded-2xl max-w-xs select-none">
        <button
          onClick={() => setActiveCatalogTab('official')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border-none cursor-pointer transition-all ${activeCatalogTab === 'official' ? 'bg-[#111111] text-white shadow-xs' : 'bg-transparent text-[#6B7280] hover:text-[#111111]'}`}
        >
          Official Layouts
        </button>
        <button
          onClick={() => setActiveCatalogTab('community')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border-none cursor-pointer transition-all ${activeCatalogTab === 'community' ? 'bg-[#111111] text-white shadow-xs' : 'bg-transparent text-[#6B7280] hover:text-[#111111]'}`}
        >
          Community Shared
        </button>
      </div>

      {/* Sticky Top Filter Panel */}
      <section className="max-w-[1500px] mx-auto mb-8 bg-white border border-[#ECEEF2] rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-40 shadow-[0_8px_24px_rgba(0,0,0,0.03)] backdrop-blur-md bg-white/95">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {getCategories().map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 h-9 rounded-full text-xs font-semibold transition-all border-none cursor-pointer hover:scale-[1.02] ${activeCategory === cat ? 'bg-[#111111] text-white' : 'bg-transparent text-[#6B7280] hover:bg-[#F8F9FB] hover:text-[#111111]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced Sort and Filters */}
        <div className="flex items-center gap-3 relative">
          {/* Section filter trigger button */}
          <div className="relative">
            <button 
              onClick={() => setShowSectionFilter(!showSectionFilter)}
              className={`px-4 h-9 rounded-[14px] text-xs font-semibold flex items-center gap-2 cursor-pointer border transition-all ${selectedSections.length > 0 ? 'bg-[#F8F9FB] border-[#111111] text-[#111111]' : 'bg-white border-[#ECEEF2] text-[#6B7280] hover:bg-[#F8F9FB]'}`}
            >
              <span className="material-symbols-outlined text-base">filter_list</span>
              Sections Included {selectedSections.length > 0 && `(${selectedSections.length})`}
            </button>

            {/* Checkbox Popover */}
            {showSectionFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSectionFilter(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#ECEEF2] rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-20 flex flex-col gap-2">
                  <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Filter by Sections</div>
                  {getAllSectionTypes().map(secId => (
                    <label key={secId} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-xs font-semibold text-[#6B7280] hover:text-[#111111]">
                      <input 
                        type="checkbox" 
                        checked={selectedSections.includes(secId)}
                        onChange={() => toggleSectionFilter(secId)}
                        className="rounded border-[#ECEEF2] text-[#111111] focus:ring-[#111111] h-4 w-4"
                      />
                      <span className="capitalize">{secId}</span>
                    </label>
                  ))}
                  {selectedSections.length > 0 && (
                    <button 
                      onClick={() => setSelectedSections([])}
                      className="mt-2 text-[10px] font-bold text-[#6B7280] hover:text-[#111111] underline border-none bg-transparent cursor-pointer text-left"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sort selection dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#6B7280] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest' | 'rated')}
              className="h-9 px-3 bg-white border border-[#ECEEF2] rounded-[14px] text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Layouts</option>
              <option value="rated">Highest Rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {activeCatalogTab === 'official' ? (
          filteredTemplates.map(template => (
            <div 
              key={template.id}
              className="bg-white border border-[#ECEEF2] rounded-[32px] overflow-hidden flex flex-col hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] group"
            >
              <div className="aspect-[16/10] bg-[#F8F9FB] border-b border-[#ECEEF2] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 origin-top-left scale-[0.27] w-[370%] h-[370%] pointer-events-none opacity-90 transition-opacity duration-300 group-hover:opacity-100">
                  <iframe 
                    title={`Sandbox Card ${template.name}`}
                    srcDoc={getTemplatePreviewHtml(template)}
                    className="w-full h-full border-none pointer-events-none"
                    sandbox="allow-scripts"
                    scrolling="no"
                  />
                </div>

                <div className="absolute inset-0 bg-[#111111]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-xs">
                  <button 
                    onClick={() => setSelectedTemplate(template)}
                    className="px-4 h-10 bg-white hover:bg-[#F8F9FB] text-[#111111] rounded-[14px] text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm border-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Live Preview
                  </button>
                  <button 
                    onClick={() => handleUseTemplate(template)}
                    className="px-4 h-10 bg-[#111111] hover:bg-black text-white rounded-[14px] text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm border-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Use Layout
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-base text-[#111111] tracking-tight">{template.name}</h3>
                    <div className="flex items-center gap-1 bg-[#F8F9FB] px-2 py-0.5 rounded-full border border-[#ECEEF2]">
                      <span className="material-symbols-outlined text-[11px] text-amber-500 fill-amber-500">star</span>
                      <span className="text-[10px] font-bold text-[#111111]">{template.rating}</span>
                    </div>
                  </div>
                  
                  <div className="text-[11px] text-[#6B7280] font-medium mb-3 flex items-center gap-1">
                    <span>by</span>
                    <span className="text-[#111111] font-semibold">{template.author}</span>
                  </div>

                  <p className="text-xs text-[#6B7280] leading-relaxed font-normal line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[#ECEEF2] flex justify-between items-center text-[10px] text-[#9CA3AF]">
                  <span className="font-semibold text-[#6B7280] bg-[#F8F9FB] px-2 py-1 rounded-md border border-[#ECEEF2] capitalize">
                    {template.category}
                  </span>
                  <span className="font-semibold text-[#111111] flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#6B7280]">layers</span>
                    {template.sections.length} sections
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : isLoadingCommunity ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#111111] animate-spin">progress_activity</span>
            <p className="text-xs font-bold text-[#6B7280] font-mono uppercase tracking-wider">Loading community templates...</p>
          </div>
        ) : (
          communityTemplates.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
            return matchesSearch && matchesCategory;
          }).map(item => (
            <div 
              key={item.id}
              className="bg-white border border-[#ECEEF2] rounded-[32px] overflow-hidden flex flex-col hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] justify-between min-h-[300px]"
            >
              <div className="p-6 text-left flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{item.category}</span>
                  <span className="text-[8px] bg-slate-100 border text-slate-500 font-bold font-mono px-1.5 py-0.5 rounded uppercase">
                    {item.model}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#111111] tracking-tight">{item.title}</h3>
                <div className="text-[11px] text-[#6B7280] font-medium flex items-center gap-1">
                  <span>shared by</span>
                  <span className="text-[#111111] font-semibold">{item.creator}</span>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Interactive template shared by community developer. Custom built from scratch.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.tags?.map((tagStr: string) => (
                    <span key={tagStr} className="text-[9px] font-mono text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded">#{tagStr}</span>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-[#ECEEF2] bg-[#F8F9FB] flex gap-3">
                <button
                  disabled={isImporting !== null}
                  onClick={async () => {
                    if (!item.codeUrl) return;
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
                      alert(`Failed to import community template: ${err.message || err}`);
                    } finally {
                      setIsImporting(null);
                    }
                  }}
                  className="flex-1 h-10 bg-[#111111] hover:bg-black text-white text-xs font-bold font-mono uppercase rounded-xl cursor-pointer disabled:opacity-55 flex items-center justify-center gap-1 shadow-sm border-none"
                >
                  {isImporting === item.id && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  <span>Use Template</span>
                </button>
                {item.codeUrl && (
                  <a
                    href={item.codeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 h-10 bg-white hover:bg-slate-50 border border-[#ECEEF2] text-gray-500 rounded-xl text-xs font-bold font-mono uppercase flex items-center justify-center cursor-pointer shadow-xs"
                    title="View Supabase Source Code"
                  >
                    Code
                  </a>
                )}
              </div>
            </div>
          ))
        )}

        {((activeCatalogTab === 'official' && filteredTemplates.length === 0) || (activeCatalogTab === 'community' && communityTemplates.filter(t => {
          const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
          return matchesSearch && matchesCategory;
        }).length === 0)) && (
          <div className="col-span-full text-center text-[#6B7280] py-16 text-sm bg-white border border-[#ECEEF2] rounded-[32px]">
            <span className="material-symbols-outlined text-4xl text-[#9CA3AF] mb-2">error</span>
            <p className="font-semibold">No templates found matching your query filters.</p>
          </div>
        )}
      </section>

      {/* Full-Screen Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full h-full max-w-7xl max-h-[85vh] bg-white rounded-[32px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex overflow-hidden border border-[#ECEEF2] animate-modal-enter">
            
            {/* Left Preview Sandbox */}
            <div className="flex-1 flex flex-col bg-[#F3F4F6]">
              {/* Responsive Bar Controls */}
              <div className="h-14 bg-white border-b border-[#ECEEF2] flex justify-between items-center px-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#111111]">
                  <span className="text-[#6B7280]">Preview:</span>
                  <span>{selectedTemplate.name}</span>
                </div>
                
                {/* Device switches */}
                <div className="flex gap-1 bg-[#F8F9FB] p-1 rounded-[10px] border border-[#ECEEF2]">
                  <button 
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-[6px] flex items-center justify-center transition-colors border-none cursor-pointer ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-[#111111]' : 'text-gray-400'}`}
                    title="Desktop"
                  >
                    <span className="material-symbols-outlined text-sm">desktop_windows</span>
                  </button>
                  <button 
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-1.5 rounded-[6px] flex items-center justify-center transition-colors border-none cursor-pointer ${previewDevice === 'tablet' ? 'bg-white shadow-sm text-[#111111]' : 'text-gray-400'}`}
                    title="Tablet"
                  >
                    <span className="material-symbols-outlined text-sm">tablet_mac</span>
                  </button>
                  <button 
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-[6px] flex items-center justify-center transition-colors border-none cursor-pointer ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-[#111111]' : 'text-gray-400'}`}
                    title="Mobile"
                  >
                    <span className="material-symbols-outlined text-sm">smartphone</span>
                  </button>
                </div>

                {/* Close trigger button */}
                <button 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setUserRating(0);
                  }}
                  className="p-1 hover:bg-[#F8F9FB] rounded-[10px] text-gray-400 border-none bg-transparent cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Sandboxed iframe frame rendering live */}
              <div className="flex-1 flex justify-center items-center p-6 overflow-hidden">
                <div 
                  className="h-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-[#ECEEF2] transition-all duration-300 rounded-[24px] overflow-hidden"
                  style={{
                    width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px'
                  }}
                >
                  <iframe 
                    title="Template Preview Canvas Modal"
                    srcDoc={getTemplatePreviewHtml(selectedTemplate)}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </div>

            {/* Right Details Sidebar */}
            <div className="w-80 bg-white border-l border-[#ECEEF2] p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-[#F8F9FB] border border-[#ECEEF2] text-[#6B7280] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedTemplate.category}
                    </span>
                    {selectedTemplate.githubUrl && (
                      <a 
                        href={selectedTemplate.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-[#6B7280] hover:text-[#111111] flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">code</span>
                        GitHub
                      </a>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[#111111] tracking-tight">{selectedTemplate.name}</h2>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2 mb-4 bg-[#F8F9FB] p-3 rounded-2xl border border-[#ECEEF2]">
                  <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                    {selectedTemplate.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-[#9CA3AF]">Created by</div>
                    <div className="text-xs font-bold text-[#111111]">{selectedTemplate.author}</div>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] leading-relaxed font-sans mb-6">
                  {selectedTemplate.description}
                </p>

                {/* Included Sections list */}
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">Included Sections</h3>
                <ul className="flex flex-col gap-2 p-0 m-0 list-none mb-6">
                  {selectedTemplate.sections.map(s => (
                    <li 
                      key={s.sectionId} 
                      className="flex items-center gap-2 text-xs font-semibold bg-[#F8F9FB] px-3.5 py-2.5 rounded-xl border border-[#ECEEF2] text-[#111111]"
                    >
                      <span className="material-symbols-outlined text-base text-[#22C55E]">check_circle</span>
                      <span className="capitalize">{s.sectionId} Section</span>
                    </li>
                  ))}
                </ul>

                {/* Interactive Rating Widget */}
                <div className="pt-4 border-t border-[#ECEEF2]">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Rate this Layout</h3>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className="p-1 border-none bg-transparent cursor-pointer transition-transform hover:scale-110"
                      >
                        <span className={`material-symbols-outlined text-lg ${userRating >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}>
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                  {hasRated && (
                    <div className="text-[10px] font-bold text-[#22C55E] mt-1.5 flex items-center gap-1 animate-pulse">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Thanks for rating this layout!
                    </div>
                  )}
                </div>
              </div>

              {/* Action trigger footer inside sidebar */}
              <div className="flex flex-col gap-2 mt-8 pt-4 border-t border-[#ECEEF2]">
                <button 
                  onClick={() => {
                    const temp = selectedTemplate;
                    setSelectedTemplate(null);
                    handleUseTemplate(temp);
                  }}
                  className="w-full h-11 bg-[#111111] hover:bg-black text-white rounded-[14px] text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:scale-[1.02] border-none cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  Use Layout Template
                </button>
                <button 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setUserRating(0);
                  }}
                  className="w-full h-11 bg-[#F8F9FB] hover:bg-[#ECEEF2] text-[#111111] border border-[#ECEEF2] rounded-[14px] text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom AI Customisation Prompt Modal */}
      {customPromptOpen && templateToUse && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white border border-[#ECEEF2] rounded-[32px] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.12)] animate-modal-enter text-left flex flex-col gap-4 relative">
            <button
              onClick={() => {
                setCustomPromptOpen(false);
                setCustomPromptText('');
                setTemplateToUse(null);
              }}
              className="absolute top-5 right-5 p-1 hover:bg-[#F8F9FB] rounded-[10px] text-gray-400 border-none bg-transparent cursor-pointer flex items-center justify-center transition-colors"
              title="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div>
              <h3 className="text-lg font-bold tracking-tight text-[#111111] pr-6">Customise layout with AI</h3>
              <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                Describe how the AI should customise the <strong>{templateToUse.name}</strong> template (e.g., "make it dark mode, change accent colors to amber, and write custom developer copy").
              </p>
            </div>

            <textarea
              value={customPromptText}
              onChange={(e) => setCustomPromptText(e.target.value)}
              placeholder="Describe your design and copy instructions..."
              className="w-full h-24 p-3 bg-[#F8F9FB] border border-[#ECEEF2] rounded-2xl text-xs font-medium text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111111] transition-all resize-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleConfirmUseTemplate(false)}
                className="flex-1 h-10 bg-[#F8F9FB] hover:bg-[#ECEEF2] text-[#111111] rounded-[14px] text-xs font-semibold cursor-pointer border border-[#ECEEF2] transition-all"
              >
                Skip & Open Editor
              </button>
              <button
                type="button"
                disabled={!customPromptText.trim()}
                onClick={() => handleConfirmUseTemplate(true)}
                className="flex-1 h-10 bg-[#111111] hover:bg-black disabled:bg-[#ECEEF2] text-white disabled:text-[#9CA3AF] rounded-[14px] text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-all border-none shadow-sm flex items-center justify-center gap-1.5"
              >
                Customise with AI
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
