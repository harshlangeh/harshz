export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = 'projects';

function newId() {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(name: string): Project {
  const project: Project = { id: newId(), name: name.trim(), createdAt: new Date().toISOString() };
  saveProjects([...listProjects(), project]);
  return project;
}

export function getProject(id: string): Project | undefined {
  return listProjects().find(p => p.id === id);
}

export function renameProject(id: string, name: string) {
  saveProjects(listProjects().map(p => (p.id === id ? { ...p, name: name.trim() } : p)));
}

export function deleteProject(id: string) {
  saveProjects(listProjects().filter(p => p.id !== id));
}

/** Namespaces a legacy global localStorage key under a project id, e.g. "proj-123::project_info". */
export function scopedKey(projectId: string, key: string): string {
  return `${projectId}::${key}`;
}
