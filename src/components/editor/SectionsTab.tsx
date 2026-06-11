import { Layers, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { useEditorStore, type AstNode } from '../../store/useEditorStore';

const TEMPLATE_SECTIONS: { name: string; type: string; classes: string; content?: string; children?: any[]; category: string }[] = [
  // ─── Navigation ─────────────────────────────────────────────────────────────
  {
    category: 'Navigation',
    name: 'Sticky Navbar',
    type: 'header',
    classes: 'w-full sticky top-0 z-50 h-16 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 flex items-center justify-between',
    children: [
      { id: 'nav-logo', type: 'div', classes: 'text-white font-mono font-bold text-sm tracking-widest', content: 'PORTFOLIO' },
      { id: 'nav-links', type: 'nav', classes: 'hidden md:flex gap-6 text-xs text-zinc-400', children: [
        { id: 'link-about', type: 'a', classes: 'hover:text-white cursor-pointer transition-colors', content: 'About' },
        { id: 'link-work', type: 'a', classes: 'hover:text-white cursor-pointer transition-colors', content: 'Work' },
        { id: 'link-skills', type: 'a', classes: 'hover:text-white cursor-pointer transition-colors', content: 'Skills' },
        { id: 'link-contact', type: 'a', classes: 'hover:text-white cursor-pointer transition-colors', content: 'Contact' }
      ]},
      { id: 'nav-cta', type: 'button', classes: 'h-8 px-4 bg-[#FF5733] hover:bg-[#E04F2E] text-white text-xs font-bold font-mono rounded-full transition-colors', content: 'Hire Me' }
    ]
  },
  // ─── Hero ────────────────────────────────────────────────────────────────────
  {
    category: 'Hero',
    name: 'Hero — Full Width',
    type: 'section',
    classes: 'w-full min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-6 gap-6 relative overflow-hidden',
    children: [
      { id: 'hero-badge', type: 'div', classes: 'inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 font-mono', children: [
        { id: 'hero-badge-dot', type: 'div', classes: 'w-1.5 h-1.5 rounded-full bg-[#FF5733] animate-pulse' },
        { id: 'hero-badge-text', type: 'span', classes: '', content: 'Available for Opportunities' }
      ]},
      { id: 'hero-heading', type: 'h1', classes: 'text-5xl md:text-7xl font-black text-white tracking-tight max-w-4xl leading-none', content: 'Crafting Digital\nExperiences That Matter' },
      { id: 'hero-sub', type: 'p', classes: 'text-lg text-zinc-400 max-w-xl leading-relaxed', content: 'Full-Stack Engineer & UI Designer specializing in React, TypeScript, and scalable cloud systems.' },
      { id: 'hero-actions', type: 'div', classes: 'flex gap-3 flex-wrap justify-center', children: [
        { id: 'hero-cta-primary', type: 'button', classes: 'h-12 px-8 bg-[#FF5733] hover:bg-[#E04F2E] text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-[#FF5733]/25', content: 'View My Work' },
        { id: 'hero-cta-secondary', type: 'button', classes: 'h-12 px-8 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm rounded-2xl transition-all', content: 'Download CV' }
      ]}
    ]
  },
  // ─── About ────────────────────────────────────────────────────────────────────
  {
    category: 'About',
    name: 'About / Bio',
    type: 'section',
    classes: 'w-full py-24 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center',
    children: [
      { id: 'about-img-wrap', type: 'div', classes: 'w-full aspect-square max-w-sm mx-auto bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-700 flex items-center justify-center', children: [
        { id: 'about-img-placeholder', type: 'div', classes: 'text-zinc-600 text-xs font-mono text-center', content: '[ Profile Photo ]' }
      ]},
      { id: 'about-content', type: 'div', classes: 'flex flex-col gap-6', children: [
        { id: 'about-label', type: 'span', classes: 'text-xs font-mono text-[#FF5733] uppercase tracking-widest', content: 'About Me' },
        { id: 'about-title', type: 'h2', classes: 'text-4xl font-black text-white leading-tight', content: 'Passionate Builder & Creative Problem Solver' },
        { id: 'about-text', type: 'p', classes: 'text-zinc-400 text-sm leading-relaxed', content: 'I bring ideas to life through clean, scalable code and thoughtful design. With 5+ years of experience building production systems, I blend technical depth with design intuition.' },
        { id: 'about-tags', type: 'div', classes: 'flex flex-wrap gap-2', children: [
          { id: 'tag-1', type: 'span', classes: 'px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full border border-zinc-700', content: 'Systems Architect' },
          { id: 'tag-2', type: 'span', classes: 'px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full border border-zinc-700', content: 'OSS Contributor' },
          { id: 'tag-3', type: 'span', classes: 'px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full border border-zinc-700', content: 'Design Systems' }
        ]}
      ]}
    ]
  },
  // ─── Skills ────────────────────────────────────────────────────────────────────
  {
    category: 'Skills',
    name: 'Skills Grid',
    type: 'section',
    classes: 'w-full py-24 px-6 max-w-6xl mx-auto',
    children: [
      { id: 'skills-header', type: 'div', classes: 'text-center mb-12', children: [
        { id: 'skills-label', type: 'span', classes: 'text-xs font-mono text-[#FF5733] uppercase tracking-widest', content: 'Technical Stack' },
        { id: 'skills-title', type: 'h2', classes: 'text-4xl font-black text-white mt-2', content: 'Skills & Technologies' }
      ]},
      { id: 'skills-grid', type: 'div', classes: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4', children: [
        { id: 'skill-react', type: 'div', classes: 'p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2 hover:border-[#FF5733]/30 transition-colors group', children: [
          { id: 'skill-react-name', type: 'p', classes: 'text-white text-sm font-bold', content: 'React' },
          { id: 'skill-react-bar', type: 'div', classes: 'w-full h-1 bg-zinc-800 rounded-full overflow-hidden', children: [
            { id: 'skill-react-fill', type: 'div', classes: 'h-full w-4/5 bg-[#FF5733] rounded-full' }
          ]}
        ]},
        { id: 'skill-ts', type: 'div', classes: 'p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2 hover:border-[#FF5733]/30 transition-colors', children: [
          { id: 'skill-ts-name', type: 'p', classes: 'text-white text-sm font-bold', content: 'TypeScript' },
          { id: 'skill-ts-bar', type: 'div', classes: 'w-full h-1 bg-zinc-800 rounded-full overflow-hidden', children: [
            { id: 'skill-ts-fill', type: 'div', classes: 'h-full w-5/6 bg-[#FF5733] rounded-full' }
          ]}
        ]},
        { id: 'skill-node', type: 'div', classes: 'p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2 hover:border-[#FF5733]/30 transition-colors', children: [
          { id: 'skill-node-name', type: 'p', classes: 'text-white text-sm font-bold', content: 'Node.js' },
          { id: 'skill-node-bar', type: 'div', classes: 'w-full h-1 bg-zinc-800 rounded-full overflow-hidden', children: [
            { id: 'skill-node-fill', type: 'div', classes: 'h-full w-3/4 bg-[#FF5733] rounded-full' }
          ]}
        ]},
        { id: 'skill-psql', type: 'div', classes: 'p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2 hover:border-[#FF5733]/30 transition-colors', children: [
          { id: 'skill-psql-name', type: 'p', classes: 'text-white text-sm font-bold', content: 'PostgreSQL' },
          { id: 'skill-psql-bar', type: 'div', classes: 'w-full h-1 bg-zinc-800 rounded-full overflow-hidden', children: [
            { id: 'skill-psql-fill', type: 'div', classes: 'h-full w-2/3 bg-[#FF5733] rounded-full' }
          ]}
        ]}
      ]}
    ]
  },
  // ─── Projects ─────────────────────────────────────────────────────────────────
  {
    category: 'Projects',
    name: 'Projects Showcase',
    type: 'section',
    classes: 'w-full py-24 px-6 max-w-6xl mx-auto',
    children: [
      { id: 'proj-header', type: 'div', classes: 'text-center mb-12', children: [
        { id: 'proj-label', type: 'span', classes: 'text-xs font-mono text-[#FF5733] uppercase tracking-widest', content: 'Selected Work' },
        { id: 'proj-title', type: 'h2', classes: 'text-4xl font-black text-white mt-2', content: 'Featured Projects' }
      ]},
      { id: 'proj-grid', type: 'div', classes: 'grid md:grid-cols-2 gap-6', children: [
        { id: 'proj-1', type: 'div', classes: 'bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-600 transition-colors group', children: [
          { id: 'proj-1-img', type: 'div', classes: 'w-full h-48 bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs font-mono group-hover:bg-zinc-750 transition-colors', content: '[ Project Preview ]' },
          { id: 'proj-1-body', type: 'div', classes: 'p-6 flex flex-col gap-3', children: [
            { id: 'proj-1-title', type: 'h3', classes: 'text-white font-bold text-lg', content: 'FinanceSync Dashboard' },
            { id: 'proj-1-desc', type: 'p', classes: 'text-zinc-400 text-sm leading-relaxed', content: 'Real-time financial analytics platform processing 1M+ daily transactions with automated reporting.' },
            { id: 'proj-1-tags', type: 'div', classes: 'flex flex-wrap gap-2', children: [
              { id: 'proj-1-tag-1', type: 'span', classes: 'px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded', content: 'React' },
              { id: 'proj-1-tag-2', type: 'span', classes: 'px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded', content: 'Node.js' },
              { id: 'proj-1-tag-3', type: 'span', classes: 'px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded', content: 'PostgreSQL' }
            ]},
            { id: 'proj-1-link', type: 'a', classes: 'text-[#FF5733] text-xs font-bold font-mono hover:underline cursor-pointer', content: 'View Project →' }
          ]}
        ]}
      ]}
    ]
  },
  // ─── Experience ─────────────────────────────────────────────────────────────────
  {
    category: 'Experience',
    name: 'Work Timeline',
    type: 'section',
    classes: 'w-full py-24 px-6 max-w-4xl mx-auto',
    children: [
      { id: 'exp-header', type: 'div', classes: 'text-center mb-12', children: [
        { id: 'exp-label', type: 'span', classes: 'text-xs font-mono text-[#FF5733] uppercase tracking-widest', content: 'Career' },
        { id: 'exp-title', type: 'h2', classes: 'text-4xl font-black text-white mt-2', content: 'Work Experience' }
      ]},
      { id: 'exp-timeline', type: 'div', classes: 'flex flex-col gap-0 relative', children: [
        { id: 'exp-line', type: 'div', classes: 'absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800' },
        { id: 'exp-item-1', type: 'div', classes: 'flex gap-6 pb-10 relative', children: [
          { id: 'exp-dot-1', type: 'div', classes: 'w-10 h-10 bg-[#FF5733] rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-zinc-950', children: [
            { id: 'exp-dot-inner', type: 'div', classes: 'w-2 h-2 bg-white rounded-full' }
          ]},
          { id: 'exp-content-1', type: 'div', classes: 'flex flex-col gap-1', children: [
            { id: 'exp-role-1', type: 'h3', classes: 'text-white font-bold text-base', content: 'Senior Frontend Engineer' },
            { id: 'exp-company-1', type: 'p', classes: 'text-[#FF5733] text-sm font-mono', content: 'TechCorp Inc.' },
            { id: 'exp-date-1', type: 'span', classes: 'text-zinc-500 text-xs', content: '2022 — Present' },
            { id: 'exp-desc-1', type: 'p', classes: 'text-zinc-400 text-sm leading-relaxed mt-2', content: 'Led frontend architecture for core products. Built design systems serving 50k+ daily active users.' }
          ]}
        ]}
      ]}
    ]
  },
  // ─── Stats ─────────────────────────────────────────────────────────────────────
  {
    category: 'Metrics',
    name: 'Stats / Metrics Bar',
    type: 'section',
    classes: 'w-full py-16 px-6 bg-zinc-900 border-y border-zinc-800',
    children: [
      { id: 'stats-grid', type: 'div', classes: 'max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center', children: [
        { id: 'stat-1', type: 'div', classes: 'flex flex-col gap-1', children: [
          { id: 'stat-1-num', type: 'p', classes: 'text-4xl font-black text-white', content: '5+' },
          { id: 'stat-1-label', type: 'p', classes: 'text-zinc-500 text-xs uppercase tracking-widest font-mono', content: 'Years Experience' }
        ]},
        { id: 'stat-2', type: 'div', classes: 'flex flex-col gap-1', children: [
          { id: 'stat-2-num', type: 'p', classes: 'text-4xl font-black text-white', content: '30+' },
          { id: 'stat-2-label', type: 'p', classes: 'text-zinc-500 text-xs uppercase tracking-widest font-mono', content: 'Projects Shipped' }
        ]},
        { id: 'stat-3', type: 'div', classes: 'flex flex-col gap-1', children: [
          { id: 'stat-3-num', type: 'p', classes: 'text-4xl font-black text-white', content: '15+' },
          { id: 'stat-3-label', type: 'p', classes: 'text-zinc-500 text-xs uppercase tracking-widest font-mono', content: 'Happy Clients' }
        ]},
        { id: 'stat-4', type: 'div', classes: 'flex flex-col gap-1', children: [
          { id: 'stat-4-num', type: 'p', classes: 'text-4xl font-black text-[#FF5733]', content: '99%' },
          { id: 'stat-4-label', type: 'p', classes: 'text-zinc-500 text-xs uppercase tracking-widest font-mono', content: 'Client Satisfaction' }
        ]}
      ]}
    ]
  },
  // ─── Testimonials ──────────────────────────────────────────────────────────────
  {
    category: 'Social Proof',
    name: 'Testimonials Grid',
    type: 'section',
    classes: 'w-full py-24 px-6 max-w-6xl mx-auto',
    children: [
      { id: 'test-header', type: 'div', classes: 'text-center mb-12', children: [
        { id: 'test-label', type: 'span', classes: 'text-xs font-mono text-[#FF5733] uppercase tracking-widest', content: 'Testimonials' },
        { id: 'test-title', type: 'h2', classes: 'text-4xl font-black text-white mt-2', content: 'What Clients Say' }
      ]},
      { id: 'test-grid', type: 'div', classes: 'grid md:grid-cols-2 gap-6', children: [
        { id: 'test-card-1', type: 'div', classes: 'p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-4', children: [
          { id: 'test-q-1', type: 'p', classes: 'text-zinc-300 text-sm leading-relaxed italic', content: '"Outstanding work! Delivered beyond expectations with exceptional attention to detail and performance."' },
          { id: 'test-auth-1', type: 'div', classes: 'flex items-center gap-3', children: [
            { id: 'test-avatar-1', type: 'div', classes: 'w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400 font-bold', content: 'JD' },
            { id: 'test-info-1', type: 'div', classes: 'flex flex-col', children: [
              { id: 'test-name-1', type: 'p', classes: 'text-white font-bold text-sm', content: 'Jane Doe' },
              { id: 'test-title-1', type: 'p', classes: 'text-zinc-500 text-xs', content: 'CTO, StartupCo' }
            ]}
          ]}
        ]}
      ]}
    ]
  },
  // ─── Contact ──────────────────────────────────────────────────────────────────
  {
    category: 'Contact',
    name: 'Contact Form',
    type: 'section',
    classes: 'w-full py-24 px-6 max-w-2xl mx-auto',
    children: [
      { id: 'contact-header', type: 'div', classes: 'text-center mb-10', children: [
        { id: 'contact-label', type: 'span', classes: 'text-xs font-mono text-[#FF5733] uppercase tracking-widest', content: 'Contact' },
        { id: 'contact-title', type: 'h2', classes: 'text-4xl font-black text-white mt-2', content: 'Get In Touch' },
        { id: 'contact-sub', type: 'p', classes: 'text-zinc-400 text-sm mt-3', content: "Have a project in mind? I'd love to hear from you." }
      ]},
      { id: 'contact-form', type: 'div', classes: 'flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-8', children: [
        { id: 'input-name', type: 'div', classes: 'w-full h-11 bg-zinc-950 border border-zinc-800 rounded-xl px-4 flex items-center text-zinc-500 text-sm', content: 'Your Name' },
        { id: 'input-email', type: 'div', classes: 'w-full h-11 bg-zinc-950 border border-zinc-800 rounded-xl px-4 flex items-center text-zinc-500 text-sm', content: 'Email Address' },
        { id: 'input-msg', type: 'div', classes: 'w-full h-28 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 text-sm', content: 'Your message...' },
        { id: 'btn-send', type: 'button', classes: 'w-full h-12 bg-[#FF5733] hover:bg-[#E04F2E] text-white font-bold font-mono uppercase text-sm rounded-xl transition-all shadow-lg shadow-[#FF5733]/20', content: 'Send Message' }
      ]}
    ]
  },
  // ─── Footer ───────────────────────────────────────────────────────────────────
  {
    category: 'Footer',
    name: 'Footer',
    type: 'footer',
    classes: 'w-full py-10 px-6 border-t border-zinc-800 bg-zinc-950',
    children: [
      { id: 'footer-inner', type: 'div', classes: 'max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4', children: [
        { id: 'footer-brand', type: 'p', classes: 'text-zinc-500 text-xs font-mono', content: '© 2025 Your Name. All rights reserved.' },
        { id: 'footer-links', type: 'div', classes: 'flex gap-6 text-xs text-zinc-600', children: [
          { id: 'footer-link-1', type: 'a', classes: 'hover:text-white transition-colors cursor-pointer', content: 'GitHub' },
          { id: 'footer-link-2', type: 'a', classes: 'hover:text-white transition-colors cursor-pointer', content: 'LinkedIn' },
          { id: 'footer-link-3', type: 'a', classes: 'hover:text-white transition-colors cursor-pointer', content: 'Twitter' }
        ]}
      ]}
    ]
  },
  // ─── CTA ─────────────────────────────────────────────────────────────────────
  {
    category: 'Conversion',
    name: 'CTA Banner',
    type: 'section',
    classes: 'w-full py-20 px-6 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] text-center',
    children: [
      { id: 'cta-title', type: 'h2', classes: 'text-4xl font-black text-white mb-4', content: "Let's Build Something Great Together" },
      { id: 'cta-sub', type: 'p', classes: 'text-white/80 text-lg mb-8 max-w-xl mx-auto', content: "Ready to bring your vision to life? Let's connect and make it happen." },
      { id: 'cta-btn', type: 'button', classes: 'h-14 px-10 bg-white text-[#FF5733] font-black text-sm uppercase tracking-wider rounded-2xl hover:bg-zinc-100 transition-all shadow-xl cursor-pointer', content: 'Start a Project' }
    ]
  },
  // ─── Feature Grid (original) ──────────────────────────────────────────────────
  {
    category: 'Content',
    name: 'Feature Grid',
    type: 'section',
    classes: 'py-16 px-6 max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left mx-auto',
    children: [
      { id: 'feat-1', type: 'div', classes: 'p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-2', children: [
        { id: 'feat-1-title', type: 'h3', classes: 'text-sm font-bold text-white', content: 'Responsive Design' },
        { id: 'feat-1-desc', type: 'p', classes: 'text-xs text-zinc-500', content: 'Fully fluid grids adapt perfectly to mobile, tablet, and desktop breakpoints.' }
      ]},
      { id: 'feat-2', type: 'div', classes: 'p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-2', children: [
        { id: 'feat-2-title', type: 'h3', classes: 'text-sm font-bold text-white', content: 'Clean Code' },
        { id: 'feat-2-desc', type: 'p', classes: 'text-xs text-zinc-500', content: 'W3C compliant semantic markup structures optimized for browser execution.' }
      ]},
      { id: 'feat-3', type: 'div', classes: 'p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-2', children: [
        { id: 'feat-3-title', type: 'h3', classes: 'text-sm font-bold text-white', content: 'AI Optimized' },
        { id: 'feat-3-desc', type: 'p', classes: 'text-xs text-zinc-500', content: 'State nodes are mapped to support instant mutations through patch requests.' }
      ]}
    ]
  }
];

// Group sections by category for organized display
const SECTION_CATEGORIES = [...new Set(TEMPLATE_SECTIONS.map(s => s.category))];


export default function SectionsTab() {
  const { ast, setAst, selectedNodeId, setSelectedNodeId } = useEditorStore();

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!ast.children) return;
    const newChildren = [...ast.children];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newChildren.length) return;
    
    const temp = newChildren[index];
    newChildren[index] = newChildren[targetIndex];
    newChildren[targetIndex] = temp;
    
    setAst({ ...ast, children: newChildren });
  };

  const handleDeleteSection = (index: number) => {
    if (!ast.children) return;
    const newChildren = [...ast.children];
    const removed = newChildren.splice(index, 1)[0];
    setAst({ ...ast, children: newChildren });
    if (selectedNodeId === removed.id) {
      setSelectedNodeId(null);
    }
  };

  const handleInjectSection = (template: typeof TEMPLATE_SECTIONS[0]) => {
    const uid = Math.random().toString(36).substring(2, 7);
    const sectionId = `section-${template.name.toLowerCase().replace(/\s+/g, '-')}-${uid}`;
    
    // Deep-clone and remap all child IDs to guarantee uniqueness
    const remapIds = (nodes: any[]): any[] =>
      nodes.map(n => ({
        ...n,
        id: n.id ? `${n.id}-${uid}` : `node-${Math.random().toString(36).substring(2, 7)}`,
        children: n.children ? remapIds(n.children) : undefined
      }));

    const freshChildren = template.children ? remapIds(JSON.parse(JSON.stringify(template.children))) : [];
    
    const newSection: AstNode = {
      id: sectionId,
      type: template.type,
      classes: template.classes,
      content: template.content,
      children: freshChildren
    };
    
    const currentChildren = ast.children ? [...ast.children] : [];
    setAst({ ...ast, children: [...currentChildren, newSection] });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-thin">
      <div className="flex flex-col gap-2">
        <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#111111] mb-1">Layout Sections</h4>
        <div className="flex flex-col gap-1.5">
          {ast.children && ast.children.map((section, idx) => (
            <div 
              key={section.id}
              onClick={() => setSelectedNodeId(section.id)}
              className={`flex items-center justify-between p-2.5 bg-[#F8F9FB] hover:bg-[#ECEEF2] border rounded-[12px] cursor-pointer transition-all ${
                selectedNodeId === section.id ? 'border-[#FF5733] bg-[#FF5733]/5' : 'border-[#ECEEF2]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                <span className="text-xs font-semibold text-[#111111] truncate">{section.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  disabled={idx === 0}
                  onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'up'); }}
                  className="p-1 hover:bg-white text-zinc-500 rounded disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button 
                  disabled={idx === (ast.children?.length || 0) - 1}
                  onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'down'); }}
                  className="p-1 hover:bg-white text-zinc-500 rounded disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteSection(idx); }}
                  className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {(!ast.children || ast.children.length === 0) && (
            <p className="text-[10px] italic text-[#6B7280] text-center p-4">No sections generated yet.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-2 border-t border-[#ECEEF2]">
        <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#111111]">Section Library ({TEMPLATE_SECTIONS.length})</h4>
        {SECTION_CATEGORIES.map(category => (
          <div key={category} className="flex flex-col gap-1.5">
            <span className="text-[8px] font-mono uppercase tracking-widest text-[#9CA3AF] font-bold px-1">{category}</span>
            {TEMPLATE_SECTIONS.filter(t => t.category === category).map(template => (
              <div
                key={template.name}
                className="p-3 border border-[#ECEEF2] rounded-[14px] flex items-center justify-between hover:bg-[#F8F9FB] transition-colors"
              >
                <div className="flex flex-col items-start text-left gap-0.5">
                  <span className="text-[11px] font-semibold text-[#111111]">{template.name}</span>
                  <span className="text-[8px] uppercase font-mono font-bold bg-[#F3F4F6] text-[#6B7280] px-1 rounded">
                    {template.type}
                  </span>
                </div>
                <button
                  onClick={() => handleInjectSection(template)}
                  className="p-2 bg-[#FF5733] hover:bg-[#E04F2E] text-white rounded-[10px] cursor-pointer flex items-center justify-center shadow-lg shadow-[#FF5733]/15 transition-all"
                  title={`Inject ${template.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

