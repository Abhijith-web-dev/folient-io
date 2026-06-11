import { create } from 'zustand';
import { folientDb, type Project, type Section } from '../db/dexie';
import { parseTemplateHtml } from './useEditorStore';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  loadAllProjects: () => Promise<void>;
  createProject: (name: string, templateId?: string, initialSections?: Omit<Section, 'projectId'>[]) => Promise<number>;
  loadProject: (id: number) => Promise<Project | null>;
  duplicateProject: (id: number) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  updateProjectName: (id: number, name: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  loading: false,

  loadAllProjects: async () => {
    set({ loading: true });
    try {
      const projects = await folientDb.projects.reverse().toArray();
      set({ projects, loading: false });
    } catch (error) {
      console.error("Failed to load projects:", error);
      set({ loading: false });
    }
  },

  createProject: async (name, templateId, initialSections) => {
    const timestamp = Date.now();
    let parsedAst: any = null;
    let unifiedCss = '';

    if (initialSections && initialSections.length > 0) {
      try {
        const parsed = parseTemplateHtml(initialSections as any);
        parsedAst = parsed.rootAst;
        unifiedCss = parsed.unifiedCss;
      } catch (err) {
        console.error("Failed to parse template HTML to AST:", err);
      }
    }

    const projectId = await folientDb.projects.add({
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
      activeTemplateId: templateId,
      ast: parsedAst ? JSON.stringify(parsedAst) : undefined,
      css: unifiedCss || undefined
    } as any);

    if (initialSections && initialSections.length > 0) {
      const sectionsToInsert = initialSections.map(s => ({
        ...s,
        projectId
      }));
      await folientDb.sections.bulkAdd(sectionsToInsert);
    }

    await get().loadAllProjects();
    return projectId;
  },

  loadProject: async (id) => {
    set({ loading: true });
    try {
      const project = await folientDb.projects.get(id);
      if (project) {
        set({ activeProject: project, loading: false });
        return project;
      }
      set({ loading: false });
      return null;
    } catch (error) {
      console.error("Failed to load project:", error);
      set({ loading: false });
      return null;
    }
  },

  duplicateProject: async (id) => {
    const project = await folientDb.projects.get(id);
    if (!project) return;

    const timestamp = Date.now();
    const newProjectId = await folientDb.projects.add({
      name: `${project.name} (Copy)`,
      createdAt: timestamp,
      updatedAt: timestamp,
      activeTemplateId: project.activeTemplateId
    });

    const sections = await folientDb.sections.where('projectId').equals(id).toArray();
    if (sections.length > 0) {
      const duplicatedSections = sections.map(s => ({
        projectId: newProjectId,
        sectionId: s.sectionId,
        html: s.html,
        order: s.order,
        isVisible: s.isVisible
      }));
      await folientDb.sections.bulkAdd(duplicatedSections);
    }

    await get().loadAllProjects();
  },

  deleteProject: async (id) => {
    await folientDb.projects.delete(id);
    await folientDb.sections.where('projectId').equals(id).delete();
    await get().loadAllProjects();
    if (get().activeProject?.id === id) {
      set({ activeProject: null });
    }
  },

  updateProjectName: async (id, name) => {
    await folientDb.projects.update(id, { name, updatedAt: Date.now() });
    await get().loadAllProjects();
    if (get().activeProject?.id === id) {
      const updated = await folientDb.projects.get(id);
      set({ activeProject: updated || null });
    }
  }
}));
