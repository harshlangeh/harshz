"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Home, BookOpen, Search, Loader2 } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface DocSection {
  id: string;
  title: string;
  points?: number;
  pointsNew?: number;
  pointsExisting?: number;
  keywords: string[];
}

interface DocEntry {
  id: string;
  name: string;
  fullName: string;
  color: string;
  rating: string;
  keywords: string[];
  description: string;
  readme: string;
  sections: DocSection[];
}

interface KnowledgeIndex {
  documents: DocEntry[];
}

type ViewState =
  | { type: 'home' }
  | { type: 'doc'; doc: DocEntry }
  | { type: 'section'; doc: DocEntry; section: DocSection; content: string };

// ── Markdown renderer (no library needed) ───────────────────────────────────

function renderMarkdown(md: string): string {
  return md
    // tables
    .replace(/^\|(.+)\|$/gm, (_m, row) => {
      const cells = row.split('|').map((c: string) => c.trim());
      return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join('')}</tr>`;
    })
    .replace(/^(\s*<tr>.*<\/tr>\s*)+$/gm, (block) => {
      const rows = block.trim().split('\n').filter(Boolean);
      // first row is header if it contains separator row right after
      const lines = md.split('\n');
      return `<div class="kb-table-wrap"><table class="kb-table">${rows.join('')}</table></div>`;
    })
    // headings
    .replace(/^### (.+)$/gm, '<h3 class="kb-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="kb-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="kb-h1">$1</h1>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // inline code
    .replace(/`([^`]+)`/g, '<code class="kb-code">$1</code>')
    // blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="kb-blockquote">$1</blockquote>')
    // hr
    .replace(/^---$/gm, '<hr class="kb-hr" />')
    // unordered lists
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>(\n|$))+/g, (block) => `<ul class="kb-ul">${block}</ul>`)
    // ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // code blocks
    .replace(/```[\s\S]*?```/g, (block) => {
      const code = block.replace(/```\w*\n?/, '').replace(/```$/, '');
      return `<pre class="kb-pre"><code>${code}</code></pre>`;
    })
    // paragraphs (lines not already wrapped)
    .replace(/^(?!<[hbuloprt]|<div|<block|<hr)(.+)$/gm, '<p class="kb-p">$1</p>')
    // clean up empty paragraphs
    .replace(/<p class="kb-p"><\/p>/g, '');
}

// ── Keyword matching ─────────────────────────────────────────────────────────

function scoreDoc(query: string, doc: DocEntry): number {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  let score = 0;
  for (const word of words) {
    for (const kw of doc.keywords) {
      if (kw === word) score += 10;
      else if (kw.includes(word) || word.includes(kw)) score += 5;
    }
    if (doc.name.toLowerCase().includes(word)) score += 8;
    if (doc.id.toLowerCase().includes(word)) score += 6;
    for (const s of doc.sections) {
      for (const kw of s.keywords) {
        if (kw === word) score += 3;
        else if (kw.includes(word) || word.includes(kw)) score += 1;
      }
      if (s.title.toLowerCase().includes(word)) score += 4;
    }
  }
  return score;
}

function findSections(query: string, doc: DocEntry): DocSection[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  return doc.sections
    .map(s => {
      let score = 0;
      for (const word of words) {
        for (const kw of s.keywords) {
          if (kw === word) score += 5;
          else if (kw.includes(word) || word.includes(kw)) score += 2;
        }
        if (s.title.toLowerCase().includes(word)) score += 6;
      }
      return { s, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.s);
}

// ── Color mapping ─────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  orange:    { bg: 'bg-orange/10',    text: 'text-orange',    border: 'border-orange/30',    badge: 'bg-orange text-white' },
  green:     { bg: 'bg-green/10',     text: 'text-green',     border: 'border-green/30',     badge: 'bg-green text-white' },
  'rose-red':{ bg: 'bg-rose-red/10',  text: 'text-rose-red',  border: 'border-rose-red/30',  badge: 'bg-rose-red text-white' },
  'igbc-blue':{ bg: 'bg-igbc-blue/10', text: 'text-igbc-blue', border: 'border-igbc-blue/30', badge: 'bg-igbc-blue text-white' },
};

// ── Main component ────────────────────────────────────────────────────────────

export function Chatbot({ collapsed }: { collapsed: boolean }) {
  const [index, setIndex] = useState<KnowledgeIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<{ docs: DocEntry[]; sections: DocSection[]; doc?: DocEntry } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load index once
  useEffect(() => {
    fetch('/docs/index.json')
      .then(r => r.json())
      .then(setIndex)
      .catch(() => {});
  }, []);

  // Scroll content to top on view change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [view]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (!index || q.trim().length < 2) {
      setMatches(null);
      return;
    }
    const ranked = index.documents
      .map(doc => ({ doc, score: scoreDoc(q, doc) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.doc);

    // If one doc clearly dominates, also find matching sections within it
    const topDoc = ranked[0];
    const sections = topDoc ? findSections(q, topDoc) : [];
    setMatches({ docs: ranked, sections, doc: topDoc });
  }, [index]);

  const loadSection = useCallback(async (doc: DocEntry, section: DocSection) => {
    setLoading(true);
    try {
      const res = await fetch(`/docs/${doc.id}/${section.id}.md`);
      const text = await res.text();
      setView({ type: 'section', doc, section, content: text });
    } catch {
      setView({ type: 'section', doc, section, content: '# Error\nCould not load this section. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDoc = useCallback((doc: DocEntry) => {
    setView({ type: 'doc', doc });
    setQuery('');
    setMatches(null);
  }, []);

  const goHome = () => {
    setView({ type: 'home' });
    setQuery('');
    setMatches(null);
  };

  const goDoc = (doc: DocEntry) => {
    setView({ type: 'doc', doc });
  };

  if (collapsed) return null;

  const c = view.type !== 'home' ? colorMap[view.doc.color] ?? colorMap['igbc-blue'] : null;

  return (
    <aside className="chatbot-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '0.875rem 1rem',
        borderBottom: '1px solid var(--border)',
        background: view.type !== 'home' ? `var(--card)` : 'var(--card)',
        flexShrink: 0,
      }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={goHome} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 2, color: 'var(--muted-foreground)' }}>
            <Home size={10} />
            <span>Home</span>
          </button>
          {view.type !== 'home' && (
            <>
              <ChevronRight size={10} />
              <button onClick={() => goDoc(view.doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted-foreground)' }}>
                {view.doc.name}
              </button>
            </>
          )}
          {view.type === 'section' && (
            <>
              <ChevronRight size={10} />
              <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{view.section.title}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--foreground)' }}>
          {view.type === 'home' ? 'Knowledge Base' :
           view.type === 'doc' ? view.doc.name :
           view.section.title}
        </h3>

        {/* Search */}
        {view.type === 'home' && (
          <div style={{ position: 'relative', marginTop: '0.6rem' }}>
            <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search criteria, topics..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.5rem 0.4rem 1.75rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>

        {/* HOME VIEW */}
        {view.type === 'home' && (
          <>
            {/* Search results */}
            {matches && matches.docs.length > 0 ? (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Results for "{query}"
                </p>

                {/* Section matches within top doc */}
                {matches.sections.length > 0 && matches.doc && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.35rem' }}>
                      In <strong>{matches.doc.name}</strong>:
                    </p>
                    {matches.sections.slice(0, 4).map(s => {
                      const col = colorMap[matches.doc!.color] ?? colorMap['igbc-blue'];
                      return (
                        <button
                          key={s.id}
                          onClick={() => loadSection(matches.doc!, s)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', padding: '0.45rem 0.6rem', marginBottom: '4px',
                            background: 'var(--card)', border: '1px solid var(--border)',
                            borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                            fontSize: '0.8rem', color: 'var(--foreground)',
                          }}
                        >
                          <span>{s.title}</span>
                          <ChevronRight size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Doc matches */}
                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.35rem', fontWeight: 500 }}>
                  Rating Systems:
                </p>
                {matches.docs.map(doc => {
                  const col = colorMap[doc.color] ?? colorMap['igbc-blue'];
                  return (
                    <button
                      key={doc.id}
                      onClick={() => loadDoc(doc)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '0.5rem 0.6rem', marginBottom: '4px',
                        background: 'var(--card)', border: `1px solid var(--border)`,
                        borderLeft: `3px solid`, borderLeftColor: `var(--color-${doc.color === 'igbc-blue' ? 'igbc-blue' : doc.color === 'rose-red' ? 'rose-red' : doc.color})`,
                        borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: 1 }}>{doc.description.slice(0, 60)}…</div>
                      </div>
                      <ChevronRight size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            ) : query.trim().length >= 2 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textAlign: 'center', marginTop: '1rem' }}>
                No results for "{query}".<br />Try: "energy", "water", "GRIHA", "IGBC", "rainwater"…
              </p>
            ) : (
              /* Default: show all 4 rating systems */
              <>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rating Systems
                </p>
                {index?.documents.map(doc => {
                  const col = colorMap[doc.color] ?? colorMap['igbc-blue'];
                  return (
                    <button
                      key={doc.id}
                      onClick={() => loadDoc(doc)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
                        width: '100%', padding: '0.6rem 0.75rem', marginBottom: '6px',
                        background: 'var(--card)', border: '1px solid var(--border)',
                        borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <BookOpen size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--muted-foreground)' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--foreground)' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: 1, lineHeight: 1.4 }}>{doc.description}</div>
                        </div>
                      </div>
                      <ChevronRight size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 2 }} />
                    </button>
                  );
                })}
                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.75rem', textAlign: 'center' }}>
                  Use the search box to find specific criteria
                </p>
              </>
            )}
          </>
        )}

        {/* DOCUMENT VIEW — shows sections list */}
        {view.type === 'doc' && (
          <>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
              {view.doc.description}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sections
            </p>
            {view.doc.sections.map(s => {
              const pts = s.points ?? s.pointsNew;
              return (
                <button
                  key={s.id}
                  onClick={() => loadSection(view.doc, s)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '0.5rem 0.6rem', marginBottom: '4px',
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                    fontSize: '0.8rem', color: 'var(--foreground)',
                  }}
                >
                  <span style={{ flex: 1 }}>{s.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {pts != null && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{pts} pts</span>
                    )}
                    <ChevronRight size={12} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* SECTION VIEW — renders markdown content */}
        {view.type === 'section' && (
          <>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--muted-foreground)' }} />
              </div>
            ) : (
              <div
                className="kb-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(view.content) }}
              />
            )}
          </>
        )}
      </div>

      {/* Footer navigation */}
      {view.type !== 'home' && (
        <div style={{
          padding: '0.5rem 1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 6,
          flexShrink: 0,
        }}>
          <button
            onClick={() => view.type === 'section' ? goDoc(view.doc) : goHome()}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.35rem 0.7rem', fontSize: '0.75rem',
              background: 'var(--secondary)', border: '1px solid var(--border)',
              borderRadius: '5px', cursor: 'pointer', color: 'var(--foreground)',
            }}
          >
            <ChevronLeft size={12} />
            {view.type === 'section' ? view.doc.name : 'Home'}
          </button>
          {view.type === 'section' && (
            <button
              onClick={goHome}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '0.35rem 0.7rem', fontSize: '0.75rem',
                background: 'var(--secondary)', border: '1px solid var(--border)',
                borderRadius: '5px', cursor: 'pointer', color: 'var(--foreground)',
              }}
            >
              <Home size={12} />
              Home
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
