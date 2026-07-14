export type CoverTemplate = 'classic' | 'modern' | 'minimal' | 'bold';

export interface BrandingInfo {
  companyName: string;
  tagline: string;
  logoDataUrl: string;
  template: CoverTemplate;
}

export const DEFAULT_BRANDING: BrandingInfo = {
  companyName: 'Harshz Technologies Private Limited',
  tagline: 'Green Building Certification Consultants',
  logoDataUrl: '',
  template: 'classic',
};

export function getBranding(): BrandingInfo {
  if (typeof window === 'undefined') return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem('branding_info');
    if (!raw) return DEFAULT_BRANDING;
    return { ...DEFAULT_BRANDING, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveBranding(b: BrandingInfo) {
  localStorage.setItem('branding_info', JSON.stringify(b));
}
