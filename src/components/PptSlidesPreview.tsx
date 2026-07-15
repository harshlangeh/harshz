"use client";
import React, { useEffect, useRef, useState } from 'react';
import type { DownloadData } from '@/types/download';
import type { BrandingInfo } from '@/types/branding';

function starsText(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

interface Props {
  data: DownloadData;
  branding: BrandingInfo;
}

const SLIDE_W = 720;
const SLIDE_H = 405; // 16:9, matches pptxgenjs's LAYOUT_16x9

/** Scales slides down to fit narrow (mobile) containers; never scales up past 1x. */
function useScaleToFit(naturalWidth: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(1, w / naturalWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalWidth]);
  return { ref, scale };
}

function Slide({ scale, children }: { scale: number; children: React.ReactNode }) {
  return (
    <div className="mx-auto" style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}>
      <div
        className="shadow-lg rounded-md overflow-hidden border border-border bg-white text-[#1E293B]"
        style={{
          width: SLIDE_W, height: SLIDE_H, position: 'relative', fontFamily: 'sans-serif',
          transform: `scale(${scale})`, transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Content-accurate mockup of every slide that pptxgenjs generates (src/lib/downloads/ppt.ts).
 * There is no reliable client-side .pptx renderer, so this reproduces the exact slide order,
 * text and table data rather than the pixel-perfect visual template (which appears in the
 * actual downloaded file).
 */
export function PptSlidesPreview({ data, branding }: Props) {
  const { ref, scale } = useScaleToFit(SLIDE_W);
  const hex = data.brandColor;
  const pi = data.projectInfo;
  const scoreStr = `${data.totalPoints} / ${data.maxPoints}`;
  const starStr = data.starsCount !== undefined ? starsText(data.starsCount) : (data.level || 'None');

  return (
    <div ref={ref} className="flex flex-col items-center gap-4 py-2 w-full">
      {/* Slide 1: Cover */}
      <Slide scale={scale}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 56, background: hex }} />
        <div style={{ position: 'absolute', top: 8, left: 16, color: '#fff' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{branding.companyName}</div>
          <div style={{ fontSize: 9 }}>{branding.tagline}</div>
        </div>
        <div style={{ position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: hex }}>{data.ratingName}</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>Compliance Checklist</div>
          {pi.name && <div style={{ fontSize: 10, color: '#64748B', marginTop: 10 }}>Project: {pi.name}</div>}
          <div style={{ fontSize: 20, fontWeight: 700, color: hex, marginTop: 18 }}>{scoreStr}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: hex, marginTop: 4 }}>{starStr}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#9CA3AF' }}>
          Powered by Harshz · {new Date().toLocaleDateString('en-IN')}
        </div>
      </Slide>

      {/* Slide 2: Summary */}
      <Slide scale={scale}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 62, background: hex }} />
        <div style={{ position: 'absolute', top: 8, left: 16, color: '#fff' }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Harshz Green Building Automation</div>
          <div style={{ fontSize: 11 }}>{data.ratingName} Checklist</div>
        </div>
        <div style={{ position: 'absolute', top: 78, left: 16, fontSize: 10, color: '#1E293B', lineHeight: 1.7 }}>
          <div>Project: {pi.name || '—'}</div>
          <div>Site Area: {pi.siteArea ? pi.siteArea + ' sq.m' : '—'}   Built-up: {pi.builtUpArea ? pi.builtUpArea + ' sq.m' : '—'}</div>
          <div>Occupancy: {pi.occupancyFixed || '—'} fixed / {pi.occupancyFloating || '—'} floating / {pi.occupancyTotal || '—'} total</div>
          <div>Climate Zone: {pi.climateZone || '—'}</div>
          <div>Address: {[pi.city, pi.state, pi.country].filter(Boolean).join(', ') || '—'}</div>
        </div>
        <div style={{ position: 'absolute', top: 74, right: 16, width: 190, height: 130, background: '#F8FAFC', border: `2px solid ${hex}`, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: hex, marginTop: 12 }}>{scoreStr}</div>
          <div style={{ fontSize: 8, color: '#64748B' }}>Total Points</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: hex, marginTop: 10 }}>{starStr}</div>
          <div style={{ fontSize: 8, color: '#64748B' }}>
            {data.starsCount !== undefined ? `${data.starsCount} / 5 Stars` : 'Certification Level'}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#64748B' }}>
          Generated: {new Date().toLocaleDateString('en-IN')} · {branding.companyName}
        </div>
      </Slide>

      {/* Section slides */}
      {data.sections.map((section, si) => (
        <Slide key={si} scale={scale}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 32, background: hex, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{section.title}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{section.sectionScore} / {section.maxPoints} pts</span>
          </div>
          <div style={{ position: 'absolute', top: 36, left: 8, right: 8, bottom: 8, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
              <thead>
                <tr style={{ background: hex, color: '#fff' }}>
                  <th style={{ padding: '3px 4px', textAlign: 'left', width: 24 }}>No.</th>
                  <th style={{ padding: '3px 4px', textAlign: 'left' }}>Criterion</th>
                  <th style={{ padding: '3px 4px', textAlign: 'center', width: 36 }}>Max</th>
                  <th style={{ padding: '3px 4px', textAlign: 'center', width: 36 }}>Score</th>
                  <th style={{ padding: '3px 4px', textAlign: 'left', width: 90 }}>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {section.criteria.map((c, ci) => (
                  <tr key={ci} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '3px 4px' }}>{c.no}</td>
                    <td style={{ padding: '3px 4px' }}>{c.name}</td>
                    <td style={{ padding: '3px 4px', textAlign: 'center' }}>{c.maxPoints}</td>
                    <td style={{ padding: '3px 4px', textAlign: 'center' }}>{c.score}</td>
                    <td style={{ padding: '3px 4px' }}>{c.compliance || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Slide>
      ))}

      {/* Final slide: Section Summary table */}
      <Slide scale={scale}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 32, background: hex, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Section Summary</span>
        </div>
        <div style={{ position: 'absolute', top: 40, left: 8, right: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ background: hex, color: '#fff' }}>
                <th style={{ padding: '4px 6px', textAlign: 'left' }}>Section</th>
                <th style={{ padding: '4px 6px', textAlign: 'center' }}>Max Points</th>
                <th style={{ padding: '4px 6px', textAlign: 'center' }}>Scored</th>
                <th style={{ padding: '4px 6px', textAlign: 'center' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {data.sections.map((s, i) => {
                const mp = typeof s.maxPoints === 'number' ? s.maxPoints : 0;
                const pct = mp > 0 ? Math.round((s.sectionScore / mp) * 100) + '%' : '—';
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '4px 6px' }}>{s.title}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'center' }}>{s.maxPoints}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'center' }}>{s.sectionScore}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'center' }}>{pct}</td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 700 }}>
                <td style={{ padding: '4px 6px' }}>TOTAL</td>
                <td style={{ padding: '4px 6px', textAlign: 'center' }}>{data.maxPoints}</td>
                <td style={{ padding: '4px 6px', textAlign: 'center', color: hex }}>{data.totalPoints}</td>
                <td style={{ padding: '4px 6px', textAlign: 'center', color: hex }}>
                  {data.maxPoints > 0 ? Math.round((data.totalPoints / data.maxPoints) * 100) + '%' : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Slide>
    </div>
  );
}
