import { scopedKey } from './projects';

export interface FileRecord {
  id: string;
  type: 'document' | 'photograph' | 'product';
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  // For images/product photos: base64 data URL (resized thumbnail, ≤200KB images stored in full)
  dataUrl?: string;
  // Product-specific fields
  specifications?: string;
  documentLink?: string;
  photographLink?: string;
}

function storageKey(projectId: string, rating: string, criterionCode: string) {
  return scopedKey(projectId, `files_${rating}_${criterionCode}`);
}

export function getFileRecords(
  projectId: string,
  rating: string,
  criterionCode: string,
): FileRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(projectId, rating, criterionCode));
    return raw ? (JSON.parse(raw) as FileRecord[]) : [];
  } catch {
    return [];
  }
}

function persistRecords(
  projectId: string,
  rating: string,
  criterionCode: string,
  records: FileRecord[],
) {
  localStorage.setItem(storageKey(projectId, rating, criterionCode), JSON.stringify(records));
}

export function saveFileRecord(
  projectId: string,
  rating: string,
  criterionCode: string,
  record: FileRecord,
): void {
  const records = getFileRecords(projectId, rating, criterionCode);
  const idx = records.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  persistRecords(projectId, rating, criterionCode, records);
}

export function deleteFileRecord(
  projectId: string,
  rating: string,
  criterionCode: string,
  id: string,
): void {
  const records = getFileRecords(projectId, rating, criterionCode).filter(r => r.id !== id);
  persistRecords(projectId, rating, criterionCode, records);
}

/** Resize an image file and return a data URL. Falls back to null if not an image. */
export async function makeDataUrl(file: File, maxPx = 1200): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return undefined;
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(undefined); };
    img.src = url;
  });
}

export function newFileId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
