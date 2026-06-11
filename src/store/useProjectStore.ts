import { create } from 'zustand';
import { folientDb, type Project, type Section } from '../db/dexie';
import { parseTemplateHtml } from './useEditorStore';
import { useAuthStore } from './useAuthStore';
import { syncProjectsWithFirestore, syncSingleProjectToCloud, deleteProjectFromCloud } from '../services/portfolioSync';

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
      const { user } = useAuthStore.getState();
      if (user) {
        await syncProjectsWithFirestore(user.uid);
      }
      const projects = await folientDb.projects.reverse().toArray();
      set({ projects, loading: false });
    } catch (error) {
      console.error("Failed to load projects:", error);
      set({ projects: [], loading: false });
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

    const newProject: Project = {
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
      activeTemplateId: templateId,
      ast: parsedAst ? JSON.stringify(parsedAst) : undefined,
      css: unifiedCss || undefined
    } as any;

    const projectId = await folientDb.projects.add(newProject);
    newProject.id = projectId;

    if (initialSections && initialSections.length > 0) {
      const sectionsToInsert = initialSections.map(s => ({
        ...s,
        projectId
      }));
      await folientDb.sections.bulkAdd(sectionsToInsert);
    }

    const { user } = useAuthStore.getState();
    if (user) {
      await syncSingleProjectToCloud(newProject, user.uid);
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
    const duplicatedProj: Project = {
      name: `${project.name} (Copy)`,
      createdAt: timestamp,
      updatedAt: timestamp,
      activeTemplateId: project.activeTemplateId,
      ast: project.ast,
      css: project.css
    } as any;

    const newProjectId = await folientDb.projects.add(duplicatedProj);
    duplicatedProj.id = newProjectId;

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

    const { user } = useAuthStore.getState();
    if (user) {
      await syncSingleProjectToCloud(duplicatedProj, user.uid);
    }

    await get().loadAllProjects();
  },

  deleteProject: async (id) => {
    await folientDb.projects.delete(id);
    await folientDb.sections.where('projectId').equals(id).delete();
    
    const { user } = useAuthStore.getState();
    if (user) {
      await deleteProjectFromCloud(id, user.uid);
    }

    await get().loadAllProjects();
    if (get().activeProject?.id === id) {
      set({ activeProject: null });
    }
  },

  updateProjectName: async (id, name) => {
    await folientDb.projects.update(id, { name, updatedAt: Date.now() });
    const updated = await folientDb.projects.get(id);
    
    const { user } = useAuthStore.getState();
    if (user && updated) {
      await syncSingleProjectToCloud(updated, user.uid);
    }

    await get().loadAllProjects();
    if (get().activeProject?.id === id) {
      set({ activeProject: updated || null });
    }
  }
}));
