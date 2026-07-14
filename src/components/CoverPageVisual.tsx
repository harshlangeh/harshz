"use client";
import React from 'react';
import type { BrandingInfo } from '@/types/branding';

export interface CoverMeta {
  ratingName: string;
  projectName: string;
  brandColor: string;
  totalPoints: number;
  maxPoints: number;
  starsCount?: number;
  level?: string;
  format: 'pdf' | 'excel' | 'ppt' | 'word';
}

const FORMAT_LABEL: Record<string, string> = {
  pdf: 'PDF Report',
  excel: 'Excel Workbook',
  ppt: 'PowerPoint Presentation',
  word: 'Word Document',
};

function Stars({ count, color }: { count: number; color: string }) {
  return (
    <span style={{ letterSpacing: 2, fontSize: 18, color }}>
      {'★'.repeat(count)}
      <span style={{ opacity: 0.25 }}>{'★'.repeat(5 - count)}</span>
    </span>
  );
}

function Logo({ dataUrl, companyName, color, size = 48 }: { dataUrl: string; companyName: string; color: string; size?: number }) {
  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt="Logo"
        style={{ height: size, maxWidth: size * 4, objectFit: 'contain', display: 'block' }}
      />
    );
  }
  const initials = companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── Classic ──────────────────────────────────────────────────────────────────
function Classic({ b, m }: { b: BrandingInfo; m: CoverMeta }) {
  const c = m.brandColor;
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      {/* Top band */}
      <div style={{ background: c, padding: '28px 36px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Logo dataUrl={b.logoDataUrl} companyName={b.companyName} color="#fff" size={52} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{b.companyName}</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 3 }}>{b.tagline}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{FORMAT_LABEL[m.format]}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: c, lineHeight: 1.15, marginBottom: 6 }}>{m.ratingName}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 24 }}>Compliance Checklist</div>

        <div style={{ width: 64, height: 3, background: c, borderRadius: 2, marginBottom: 28 }} />

        {m.projectName && (
          <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>Project: </span>{m.projectName}
          </div>
        )}

        <div style={{ fontSize: 22, fontWeight: 800, color: c, marginBottom: 4 }}>
          {m.totalPoints} <span style={{ fontSize: 13, fontWeight: 400, color: '#9CA3AF' }}>/ {m.maxPoints} pts</span>
        </div>

        {m.starsCount !== undefined
          ? <Stars count={m.starsCount} color={c} />
          : <span style={{ fontSize: 16, fontWeight: 700, color: c }}>{m.level || 'None'}</span>
        }
      </div>

      {/* Footer */}
      <div style={{ borderTop: `3px solid ${c}`, padding: '14px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#9CA3AF' }}>Powered by Harshz</span>
        <span style={{ fontSize: 9, color: '#9CA3AF' }}>{new Date().toLocaleDateString('en-IN')}</span>
      </div>
    </div>
  );
}

// ── Modern ───────────────────────────────────────────────────────────────────
function Modern({ b, m }: { b: BrandingInfo; m: CoverMeta }) {
  const c = m.brandColor;
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', fontFamily: 'sans-serif' }}>
      {/* Left sidebar */}
      <div style={{ width: '34%', background: c, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center' }}>
        <Logo dataUrl={b.logoDataUrl} companyName={b.companyName} color={c} size={56} />
        <div style={{ width: 32, height: 2, background: 'rgba(255,255,255,0.4)', margin: '16px 0' }} />
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>{b.companyName}</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 5 }}>{b.tagline}</div>
      </div>

      {/* Right content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '36px 28px' }}>
        <div style={{ fontSize: 9, color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{FORMAT_LABEL[m.format]}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 4 }}>{m.ratingName}</div>
        <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Compliance Checklist</div>

        <div style={{ width: 40, height: 4, background: c, borderRadius: 2, marginBottom: 28 }} />

        <div style={{ fontSize: 13, color: '#374151', marginBottom: 10 }}>
          <span style={{ color: '#9CA3AF' }}>Project  </span>{m.projectName || '—'}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: c, marginBottom: 6 }}>
          {m.totalPoints}<span style={{ fontSize: 13, fontWeight: 400, color: '#9CA3AF' }}>/{m.maxPoints}</span>
        </div>
        {m.starsCount !== undefined
          ? <Stars count={m.starsCount} color={c} />
          : <span style={{ fontSize: 16, fontWeight: 700, color: c }}>{m.level || 'None'}</span>
        }

        <div style={{ marginTop: 'auto', paddingTop: 36, fontSize: 9, color: '#D1D5DB' }}>
          {new Date().toLocaleDateString('en-IN')} · Powered by Harshz
        </div>
      </div>
    </div>
  );
}

// ── Minimal ───────────────────────────────────────────────────────────────────
function Minimal({ b, m }: { b: BrandingInfo; m: CoverMeta }) {
  const c = m.brandColor;
  return (
    <div style={{ width: '100%', height: '100%', background: '#FAFAFA', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', padding: '36px 40px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
        <Logo dataUrl={b.logoDataUrl} companyName={b.companyName} color={c} size={44} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>{b.companyName}</div>
          <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>{b.tagline}</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 9, color: c, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>{FORMAT_LABEL[m.format]}</div>
        <div style={{ fontSize: 34, fontWeight: 300, color: '#111827', lineHeight: 1.15, marginBottom: 2 }}>{m.ratingName}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 24 }}>Compliance Checklist</div>
        <div style={{ width: '100%', height: 1, background: '#E5E7EB', marginBottom: 24 }} />
        {m.projectName && <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>{m.projectName}</div>}
        <div style={{ fontSize: 24, fontWeight: 700, color: c }}>
          {m.totalPoints} <span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF' }}>/ {m.maxPoints} pts</span>
        </div>
        {m.starsCount !== undefined
          ? <div style={{ marginTop: 8 }}><Stars count={m.starsCount} color={c} /></div>
          : <span style={{ fontSize: 14, fontWeight: 600, color: c, marginTop: 8 }}>{m.level || 'None'}</span>
        }
      </div>

      {/* Bottom accent */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
        <div style={{ height: 3, width: 40, background: c, borderRadius: 2 }} />
        <span style={{ fontSize: 9, color: '#9CA3AF' }}>{new Date().toLocaleDateString('en-IN')} · Powered by Harshz</span>
      </div>
    </div>
  );
}

// ── Bold ─────────────────────────────────────────────────────────────────────
function Bold({ b, m }: { b: BrandingInfo; m: CoverMeta }) {
  const c = m.brandColor;
  return (
    <div style={{ width: '100%', height: '100%', background: c, display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', padding: '36px 40px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', left: -40, bottom: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'auto', zIndex: 1 }}>
        <Logo dataUrl={b.logoDataUrl} companyName={b.companyName} color={c} size={44} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{b.companyName}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{b.tagline}</div>
        </div>
      </div>

      {/* Center */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>{FORMAT_LABEL[m.format]}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 4 }}>{m.ratingName}</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 28 }}>Compliance Checklist</div>

        {m.projectName && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 20 }}>{m.projectName}</div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '16px 24px', display: 'inline-flex', flexDirection: 'column', alignSelf: 'flex-start' }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {m.totalPoints}<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.65 }}>/{m.maxPoints}</span>
          </div>
          <div style={{ marginTop: 6 }}>
            {m.starsCount !== undefined
              ? <Stars count={m.starsCount} color="#fff" />
              : <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{m.level || 'None'}</span>
            }
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 24 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Powered by Harshz</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{new Date().toLocaleDateString('en-IN')}</span>
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export interface CoverPageVisualProps {
  branding: BrandingInfo;
  meta: CoverMeta;
  /** Scale factor for thumbnails (default 1 = full size) */
  scale?: number;
  /** Explicit width in px for the outer wrapper (default 420) */
  width?: number;
}

export function CoverPageVisual({ branding, meta, scale = 1, width = 420 }: CoverPageVisualProps) {
  const height = Math.round(width * 1.414); // A4 ratio
  const Inner = { classic: Classic, modern: Modern, minimal: Minimal, bold: Bold }[branding.template];

  return (
    <div
      style={{
        width: width * scale,
        height: height * scale,
        overflow: 'hidden',
        borderRadius: 8 * scale,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Inner b={branding} m={meta} />
      </div>
    </div>
  );
}
