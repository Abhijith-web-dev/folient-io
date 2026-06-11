import { create } from 'zustand';
import { folientDb } from '../db/dexie';

export interface AstNode {
  id: string;
  type: string;
  classes: string;
  content?: string;
  children?: AstNode[];
  attributes?: Record<string, string>;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

interface EditorState {
  ast: AstNode;
  selectedNodeId: string | null;
  devicePreview: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
  isGenerating: boolean;
  telemetryLogs: TelemetryLog[];
  history: AstNode[];
  historyIndex: number;
  activeProjectId: number | null;
  projectName: string;
  editMode: boolean;
  codeViewOpen: boolean;
  projectCss: string;
  structureVersion: number;

  setAst: (ast: AstNode) => void;
  updateNodeClass: (id: string, classes: string) => void;
  updateNodeContent: (id: string, content: string) => void;
  updateNodeClassAndContent: (id: string, classes: string, content: string) => void;
  deleteNode: (id: string) => void;
  addNode: (parentId: string, child: AstNode) => void;
  setSelectedNodeId: (id: string | null) => void;
  setDevicePreview: (device: 'desktop' | 'tablet' | 'mobile') => void;
  setZoom: (zoom: number) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setEditMode: (mode: boolean) => void;
  setProjectName: (name: string) => void;
  updateProjectNameInDb: (name: string) => Promise<void>;
  setCodeViewOpen: (isOpen: boolean) => void;
  addTelemetryLog: (message: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  clearTelemetryLogs: () => void;
  compileAstToHtml: () => string;
  pushToHistory: (ast: AstNode) => void;
  undo: () => void;
  redo: () => void;
  loadProjectFromDb: (projectId: number) => Promise<void>;
  saveProjectToDb: () => Promise<void>;
  setProjectCss: (css: string) => void;
  setFullAst: (newAst: AstNode, css?: string) => void;
}

const defaultInitialAst: AstNode = {
  id: 'root-viewport',
  type: 'container',
  classes: 'w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans py-12 px-6 items-center justify-center relative overflow-hidden',
  children: [
    {
      id: 'hero-section',
      type: 'section',
      classes: 'max-w-3xl w-full text-center flex flex-col items-center gap-6 py-12',
      children: [
        {
          id: 'hero-badge',
          type: 'div',
          classes: 'px-3 py-1 bg-zinc-900 border border-zinc-800 text-[#FF5733] text-[10px] uppercase tracking-widest rounded-full font-mono font-bold animate-pulse',
          content: 'Workspace Compiled Successfully'
        },
        {
          id: 'hero-title',
          type: 'h1',
          classes: 'text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-serif',
          content: 'Building the Future of Portfolio Engineering'
        },
        {
          id: 'hero-description',
          type: 'p',
          classes: 'text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed',
          content: 'Use the bottom command dock to trigger agent modifications or double click text nodes to edit inline attributes instantly.'
        },
        {
          id: 'hero-actions',
          type: 'div',
          classes: 'flex items-center gap-4 mt-4 justify-center',
          children: [
            {
              id: 'btn-explore',
              type: 'button',
              classes: 'h-10 px-6 bg-[#FF5733] text-white hover:bg-[#E04F2E] text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-lg shadow-[#FF5733]/15 font-mono uppercase tracking-wider',
              content: 'Primary Call'
            },
            {
              id: 'btn-docs',
              type: 'button',
              classes: 'h-10 px-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-350 text-xs font-bold rounded-lg cursor-pointer transition-colors font-mono uppercase tracking-wider',
              content: 'Learn More'
            }
          ]
        }
      ]
    }
  ]
};

const updateNodeInAst = (node: AstNode, id: string, updater: (n: AstNode) => void): AstNode => {
  if (node.id === id) {
    const copy = { ...node };
    updater(copy);
    return copy;
  }
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(child => updateNodeInAst(child, id, updater))
    };
  }
  return node;
};

const deleteNodeFromAst = (node: AstNode, id: string): AstNode => {
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      children: node.children.filter(child => child.id !== id).map(child => deleteNodeFromAst(child, id))
    };
  }
  return node;
};

const addChildNodeToAst = (node: AstNode, parentId: string, childNode: AstNode): AstNode => {
  if (node.id === parentId) {
    return {
      ...node,
      children: [...(node.children || []), childNode]
    };
  }
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(child => addChildNodeToAst(child, parentId, childNode))
    };
  }
  return node;
};

export const compileAstToHtml = (node: AstNode): string => {
  const tag = node.type === 'container' || node.type === 'grid' ? 'div' : node.type;
  const classAttr = node.classes ? `class="${node.classes}"` : '';
  const nodeAttr = `data-node-id="${node.id}"`;
  
  let customAttrs = '';
  if (node.attributes) {
    customAttrs = Object.entries(node.attributes)
      .map(([key, val]) => `${key}="${val.replace(/"/g, '&quot;')}"`)
      .join(' ');
  }
  
  const combinedAttrs = [nodeAttr, classAttr, customAttrs].filter(Boolean).join(' ');
  
  let innerHtml = '';
  if (node.children && node.children.length > 0) {
    innerHtml = node.children.map(child => compileAstToHtml(child)).join('\n');
  } else if (node.content) {
    innerHtml = node.content;
  }
  
  if (['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tag.toLowerCase())) {
    return `<${tag} ${combinedAttrs} />`;
  }
  
  return `<${tag} ${combinedAttrs}>${innerHtml}</${tag}>`;
};

// Instantly parses template section HTML elements into nested AST Nodes
export const parseHtmlToAstNode = (element: Element): AstNode => {
  const id = element.getAttribute('data-node-id') || `node-${Math.random().toString(36).substring(4)}`;
  const type = element.tagName.toLowerCase();
  const classes = element.className || '';
  
  const attributes: Record<string, string> = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    if (attr.name !== 'class' && attr.name !== 'data-node-id') {
      attributes[attr.name] = attr.value;
    }
  }
  
  const children: AstNode[] = [];
  let content = '';
  
  if (element.children.length > 0) {
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      if (child.tagName.toLowerCase() !== 'script' && child.tagName.toLowerCase() !== 'style') {
        children.push(parseHtmlToAstNode(child));
      }
    }
  } else {
    content = element.textContent || '';
  }
  
  const node: AstNode = {
    id,
    type,
    classes,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined
  };
  
  if (children.length > 0) {
    node.children = children;
  } else if (content) {
    node.content = content;
  }
  
  return node;
};

// Parses a list of template sections, extracts scoped styles, and compiles a single AST tree
export const parseTemplateHtml = (sections: { sectionId: string; html: string; order: number }[]) => {
  const parser = new DOMParser();
  let unifiedCss = '';
  const parsedSectionsAst: AstNode[] = [];
  
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  
  for (const sec of sorted) {
    const doc = parser.parseFromString(sec.html, 'text/html');
    
    // Extract and scope/group CSS styles
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach(style => {
      unifiedCss += style.textContent + '\n';
      style.remove();
    });
    
    const rootEl = doc.body.firstElementChild;
    if (rootEl) {
      rootEl.setAttribute('data-folient-section-id', sec.sectionId);
      const sectionNode = parseHtmlToAstNode(rootEl);
      parsedSectionsAst.push(sectionNode);
    }
  }
  
  const rootAst: AstNode = {
    id: 'root-viewport',
    type: 'div',
    classes: 'w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden p-6',
    children: parsedSectionsAst
  };
  
  return { rootAst, unifiedCss };
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ast: defaultInitialAst,
  selectedNodeId: null,
  devicePreview: 'desktop',
  zoom: 100,
  isGenerating: false,
  telemetryLogs: [
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString(),
      message: 'Folient Visual Core State Machine Initialized.',
      type: 'info'
    }
  ],
  history: [JSON.parse(JSON.stringify(defaultInitialAst))],
  historyIndex: 0,
  activeProjectId: null,
  projectName: 'Untitled Portfolio',
  editMode: true,
  codeViewOpen: false,
  projectCss: '',
  structureVersion: 0,
  setProjectCss: (css) => set({ projectCss: css }),

  setFullAst: (newAst, css) => {
    const freshAst = JSON.parse(JSON.stringify(newAst));
    set({
      ast: freshAst,
      history: [freshAst],
      historyIndex: 0,
      structureVersion: get().structureVersion + 1,
      selectedNodeId: null,
      ...(css !== undefined ? { projectCss: css } : {})
    });
    get().addTelemetryLog('Full portfolio AST replaced by AI generator.', 'success');
    get().saveProjectToDb();
  },

  setAst: (newAst) => {
    set({ ast: newAst, structureVersion: get().structureVersion + 1 });
    get().addTelemetryLog('Root AST node structure updated.', 'info');
    get().saveProjectToDb();
  },

  updateNodeClass: (id, classes) => {
    const { ast } = get();
    const updatedAst = updateNodeInAst(ast, id, (node) => {
      node.classes = classes;
    });
    set({ ast: updatedAst });
    get().pushToHistory(updatedAst);
    get().addTelemetryLog(`Updated classes for node [${id}]: ${classes.substring(0, 30)}...`, 'info');
    get().saveProjectToDb();

    // Fast-path DOM mutation sync to sandboxed iframe
    const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FOLIENT_DOM_MUTATE',
        id,
        classes
      }, '*');
    }
  },

  updateNodeContent: (id, content) => {
    const { ast } = get();
    const updatedAst = updateNodeInAst(ast, id, (node) => {
      node.content = content;
    });
    set({ ast: updatedAst });
    get().pushToHistory(updatedAst);
    get().addTelemetryLog(`Updated text content for node [${id}]: "${content.substring(0, 35)}"`, 'info');
    get().saveProjectToDb();

    // Fast-path DOM mutation sync to sandboxed iframe
    const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FOLIENT_DOM_MUTATE',
        id,
        content
      }, '*');
    }
  },

  updateNodeClassAndContent: (id, classes, content) => {
    const { ast } = get();
    const updatedAst = updateNodeInAst(ast, id, (node) => {
      node.classes = classes;
      node.content = content;
    });
    set({ ast: updatedAst });
    get().pushToHistory(updatedAst);
    get().addTelemetryLog(`Updated both style & text for node [${id}]`, 'info');
    get().saveProjectToDb();

    // Fast-path DOM mutation sync to sandboxed iframe
    const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FOLIENT_DOM_MUTATE',
        id,
        classes,
        content
      }, '*');
    }
  },

  deleteNode: (id) => {
    if (id === 'root-viewport') {
      get().addTelemetryLog('Cannot delete the root viewport container.', 'error');
      return;
    }
    const { ast } = get();
    const updatedAst = deleteNodeFromAst(ast, id);
    set({ ast: updatedAst, selectedNodeId: null, structureVersion: get().structureVersion + 1 });
    get().pushToHistory(updatedAst);
    get().addTelemetryLog(`Deleted AST node element [${id}]`, 'warn');
    get().saveProjectToDb();
  },

  addNode: (parentId, child) => {
    const { ast } = get();
    const updatedAst = addChildNodeToAst(ast, parentId, child);
    set({ ast: updatedAst, structureVersion: get().structureVersion + 1 });
    get().pushToHistory(updatedAst);
    get().addTelemetryLog(`Added child node [${child.id}] of type <${child.type}> to parent [${parentId}]`, 'success');
    get().saveProjectToDb();
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
    if (id) {
      get().addTelemetryLog(`Focus shifted to active node: [${id}]`, 'info');
    }
  },

  setDevicePreview: (device) => set({ devicePreview: device }),
  setZoom: (zoom) => set({ zoom }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setEditMode: (editMode) => {
    set({ editMode });
    get().addTelemetryLog(`Edit mode toggled to: ${editMode ? 'ACTIVE (Design)' : 'PREVIEW (Interactive)'}`, 'info');
  },
  setProjectName: (projectName) => set({ projectName }),
  updateProjectNameInDb: async (name: string) => {
    set({ projectName: name });
    const { activeProjectId } = get();
    if (activeProjectId) {
      try {
        await folientDb.projects.update(activeProjectId, {
          name,
          updatedAt: Date.now()
        } as any);
        get().addTelemetryLog(`Project renamed in DB to: "${name}"`, 'success');
      } catch (e) {
        console.error('Failed to update project name in DB:', e);
        get().addTelemetryLog(`Rename failed: ${e}`, 'error');
      }
    }
  },
  setCodeViewOpen: (isOpen) => set({ codeViewOpen: isOpen }),

  addTelemetryLog: (message, type = 'info') => {
    const newLog: TelemetryLog = {
      id: Math.random().toString(36).substring(4),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    set((state) => ({
      telemetryLogs: [...state.telemetryLogs, newLog].slice(-100)
    }));
  },

  clearTelemetryLogs: () => set({ telemetryLogs: [] }),
  compileAstToHtml: () => {
    return compileAstToHtml(get().ast);
  },

  pushToHistory: (newAst) => {
    const { history, historyIndex } = get();
    const slicedHistory = history.slice(0, historyIndex + 1);
    const copy = JSON.parse(JSON.stringify(newAst));
    if (slicedHistory.length >= 100) {
      slicedHistory.shift();
    }
    set({
      history: [...slicedHistory, copy],
      historyIndex: slicedHistory.length >= 100 ? 99 : slicedHistory.length
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        ast: JSON.parse(JSON.stringify(history[newIndex])),
        structureVersion: get().structureVersion + 1
      });
      get().addTelemetryLog('Undo action performed.', 'warn');
      get().saveProjectToDb();
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        ast: JSON.parse(JSON.stringify(history[newIndex])),
        structureVersion: get().structureVersion + 1
      });
      get().addTelemetryLog('Redo action performed.', 'success');
      get().saveProjectToDb();
    }
  },

  loadProjectFromDb: async (projectId) => {
    try {
      const project = await folientDb.projects.get(projectId);
      if (project) {
        set({ 
          activeProjectId: projectId, 
          projectName: project.name,
          projectCss: (project as any).css || '',
          structureVersion: get().structureVersion + 1
        });
        // cast to any to retrieve AST key dynamically
        const projectAst = (project as any).ast;
        if (projectAst) {
          const parsedAst = typeof projectAst === 'string' ? JSON.parse(projectAst) : projectAst;
          set({
            ast: parsedAst,
            history: [JSON.parse(JSON.stringify(parsedAst))],
            historyIndex: 0
          });
          get().addTelemetryLog(`Loaded project [${project.name}] successfully.`, 'success');
        } else {
          set({
            ast: defaultInitialAst,
            history: [JSON.parse(JSON.stringify(defaultInitialAst))],
            historyIndex: 0
          });
          get().addTelemetryLog(`Initialized workspace for project [${project.name}] with fallback AST.`, 'warn');
        }
      }
    } catch (e) {
      console.error('Failed to load project from database:', e);
      get().addTelemetryLog(`Failed to load project from database: ${e}`, 'error');
    }
  },

  saveProjectToDb: async () => {
    const { activeProjectId, ast, projectCss } = get();
    if (activeProjectId) {
      try {
        const html = get().compileAstToHtml();
        await folientDb.projects.update(activeProjectId, {
          ast,
          css: projectCss,
          updatedAt: Date.now()
        } as any);
        await folientDb.sections.put({
          projectId: activeProjectId,
          sectionId: 'compiled-entire',
          html,
          order: 0,
          isVisible: true
        });
        get().addTelemetryLog('Progress auto-saved to IndexedDB.', 'success');
      } catch (e) {
        console.error('Auto-save failed:', e);
        get().addTelemetryLog(`Auto-save failed: ${e}`, 'error');
      }
    }
  }
}));
