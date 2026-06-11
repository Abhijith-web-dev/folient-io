import Dexie, { type Table } from 'dexie';

export interface Project {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  activeTemplateId?: string;
  liveUrl?: string;
  status?: string;
  platformTarget?: string;
  netlifySiteId?: string;
  vercelProjectId?: string;
}

export interface Section {
  projectId: number;
  sectionId: string;
  html: string;
  order: number;
  isVisible: boolean;
}

export interface Telemetry {
  id?: number;
  projectId?: number;
  timestamp: number;
  model: string;
  latency: number;
  tokensIn?: number;
  tokensOut?: number;
  cost?: number;
  status: 'success' | 'error';
}

class FolientDatabase extends Dexie {
  projects!: Table<Project>;
  sections!: Table<Section>;
  telemetry!: Table<Telemetry>;

  constructor() {
    super('folient_db');
    this.version(1).stores({
      projects: '++id, name, createdAt, updatedAt',
      sections: '[projectId+sectionId], projectId, sectionId, order',
      telemetry: '++id, projectId, timestamp, model, status'
    });
  }
}

export const folientDb = new FolientDatabase();
