"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Plus, Building2, Trash2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { listProjects, createProject, deleteProject, type Project } from '@/lib/projects';

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(listProjects());
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName);
    setProjects(listProjects());
    setNewName('');
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(listProjects());
    setConfirmDeleteId(null);
  };

  return (
    <div className="container">
      <div className="mb-10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
            <p className="text-sm text-muted-foreground">Every project keeps its own checklist progress and details</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No projects yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first project to start tracking its green building certification.</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map(project => (
            <Card key={project.id} className="h-full border-t-4 border-t-primary transition-shadow hover:shadow-md group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{project.name || 'Untitled Project'}</CardTitle>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(project.id)}
                    aria-label="Delete project"
                    className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Created {fmtDate(project.createdAt)}</p>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/project/${project.id}`}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline"
                >
                  Open project <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create project dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Project" size="sm">
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              autoFocus
              placeholder="e.g. Emerald Heights"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create Project</Button>
          </div>
        </div>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Delete Project" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            This permanently deletes the project and all its checklist data. This can&rsquo;t be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}>Delete</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
