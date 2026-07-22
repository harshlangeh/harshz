"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Image, Package, Upload, Trash2, ExternalLink, Plus, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getFileRecords, saveFileRecord, deleteFileRecord,
  makeDataUrl, newFileId, formatBytes,
  type FileRecord,
} from '@/lib/file-store';

type Tab = 'all' | 'document' | 'photograph' | 'product';
type AddPanel = 'none' | 'document' | 'photograph' | 'product';

const TAB_LABELS: { key: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'all',        label: 'All',         Icon: Upload },
  { key: 'document',   label: 'Documents',   Icon: FileText },
  { key: 'photograph', label: 'Photographs', Icon: Image },
  { key: 'product',    label: 'Products',    Icon: Package },
];

interface Props {
  projectId: string;
  rating: string;
  criterionCode: string;
}

export function DataTab({ projectId, rating, criterionCode }: Props) {
  const [tab, setTab] = useState<Tab>('all');
  const [addPanel, setAddPanel] = useState<AddPanel>('none');
  const [records, setRecords] = useState<FileRecord[]>([]);

  // Product form state
  const [productName, setProductName] = useState('');
  const [productSpecs, setProductSpecs] = useState('');
  const [productDocLink, setProductDocLink] = useState('');
  const [productPhotoLink, setProductPhotoLink] = useState('');
  const [productImageDataUrl, setProductImageDataUrl] = useState<string | undefined>();
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const docInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const productImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecords(getFileRecords(projectId, rating, criterionCode));
  }, [projectId, rating, criterionCode]);

  const persist = (rec: FileRecord) => {
    saveFileRecord(projectId, rating, criterionCode, rec);
    setRecords(getFileRecords(projectId, rating, criterionCode));
  };

  const remove = (id: string) => {
    deleteFileRecord(projectId, rating, criterionCode, id);
    setRecords(getFileRecords(projectId, rating, criterionCode));
  };

  const openPanel = (panel: AddPanel) => {
    setAddPanel(prev => (prev === panel ? 'none' : panel));
    resetProductForm();
  };

  const resetProductForm = () => {
    setProductName(''); setProductSpecs('');
    setProductDocLink(''); setProductPhotoLink('');
    setProductImageDataUrl(undefined); setProductImageFile(null);
  };

  // Document upload
  const handleDocFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const rec: FileRecord = {
        id: newFileId(), type: 'document',
        name: file.name, mimeType: file.type,
        sizeBytes: file.size, createdAt: new Date().toISOString(),
      };
      persist(rec);
    }
    setAddPanel('none');
  };

  // Photograph upload
  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const dataUrl = await makeDataUrl(file, 1200);
      const rec: FileRecord = {
        id: newFileId(), type: 'photograph',
        name: file.name, mimeType: file.type,
        sizeBytes: file.size, createdAt: new Date().toISOString(),
        dataUrl,
      };
      persist(rec);
    }
    setAddPanel('none');
  };

  // Product image preview
  const handleProductImage = async (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    setProductImageFile(file);
    const dataUrl = await makeDataUrl(file, 800);
    setProductImageDataUrl(dataUrl);
  };

  const saveProduct = async () => {
    if (!productName.trim()) return;
    let dataUrl = productImageDataUrl;
    if (productImageFile && !dataUrl) {
      dataUrl = await makeDataUrl(productImageFile, 800);
    }
    const rec: FileRecord = {
      id: newFileId(), type: 'product',
      name: productName.trim(),
      mimeType: productImageFile?.type ?? '',
      sizeBytes: productImageFile?.size ?? 0,
      createdAt: new Date().toISOString(),
      dataUrl,
      specifications: productSpecs.trim() || undefined,
      documentLink: productDocLink.trim() || undefined,
      photographLink: productPhotoLink.trim() || undefined,
    };
    persist(rec);
    setAddPanel('none');
    resetProductForm();
  };

  const filtered = tab === 'all' ? records : records.filter(r => r.type === tab);

  const docRecords   = records.filter(r => r.type === 'document');
  const photoRecords = records.filter(r => r.type === 'photograph');
  const prodRecords  = records.filter(r => r.type === 'product');

  const countLabel = (type: Tab) => {
    const n = type === 'all' ? records.length
            : type === 'document'   ? docRecords.length
            : type === 'photograph' ? photoRecords.length
            : prodRecords.length;
    return n > 0 ? ` (${n})` : '';
  };

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {TAB_LABELS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}{countLabel(key)}
          </button>
        ))}
      </div>

      {/* Add buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => { openPanel('document'); docInputRef.current?.click(); }}
          className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Document
        </Button>
        <input ref={docInputRef} type="file" className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          multiple onChange={e => handleDocFiles(e.target.files)} />

        <Button variant="outline" size="sm" onClick={() => { openPanel('photograph'); photoInputRef.current?.click(); }}
          className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Photo
        </Button>
        <input ref={photoInputRef} type="file" className="hidden"
          accept="image/*" multiple onChange={e => handlePhotoFiles(e.target.files)} />

        <Button variant="outline" size="sm" onClick={() => openPanel('product')} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Product
        </Button>
      </div>

      {/* Product form panel */}
      {addPanel === 'product' && (
        <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">New Product</p>
            <button onClick={() => setAddPanel('none')} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Image preview */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Product Image (optional)</label>
            {productImageDataUrl ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productImageDataUrl} alt="preview" className="h-24 w-24 object-cover rounded border border-border" />
                <button onClick={() => { setProductImageDataUrl(undefined); setProductImageFile(null); }}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button onClick={() => productImgRef.current?.click()}
                className="h-24 w-24 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-muted/40 transition-colors">
                <Image className="h-6 w-6" />
              </button>
            )}
            <input ref={productImgRef} type="file" className="hidden" accept="image/*"
              onChange={e => handleProductImage(e.target.files)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name *</label>
            <input
              type="text" value={productName} onChange={e => setProductName(e.target.value)}
              placeholder="e.g. SunPower X21 Solar Panel"
              className="glass-input w-full h-8 px-2.5 text-sm rounded border border-input bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Specifications</label>
            <textarea
              value={productSpecs} onChange={e => setProductSpecs(e.target.value)}
              placeholder="e.g. Efficiency: 21.5%, Watt: 400W, Dimensions: 1046×1559mm"
              rows={3}
              className="glass-input w-full px-2.5 py-1.5 text-sm rounded border border-input bg-background resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Document Link (URL)</label>
              <input type="url" value={productDocLink} onChange={e => setProductDocLink(e.target.value)}
                placeholder="https://..."
                className="glass-input w-full h-8 px-2.5 text-sm rounded border border-input bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Photograph Link (URL)</label>
              <input type="url" value={productPhotoLink} onChange={e => setProductPhotoLink(e.target.value)}
                placeholder="https://..."
                className="glass-input w-full h-8 px-2.5 text-sm rounded border border-input bg-background" />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => { setAddPanel('none'); resetProductForm(); }}>Cancel</Button>
            <Button size="sm" onClick={saveProduct} disabled={!productName.trim()}>Save Product</Button>
          </div>
        </div>
      )}

      {/* File list */}
      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {tab === 'all' ? 'No files attached yet. Use the buttons above to add documents, photographs, or products.'
           : tab === 'document'   ? 'No documents yet.'
           : tab === 'photograph' ? 'No photographs yet.'
           : 'No products yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          {/* In "All" tab, group by type with headers */}
          {tab === 'all' ? (
            <>
              {docRecords.length > 0 && (
                <FileGroup label="Documents" icon={<FileText className="h-3.5 w-3.5" />}>
                  {docRecords.map(r => <DocumentRow key={r.id} record={r} onDelete={remove} />)}
                </FileGroup>
              )}
              {photoRecords.length > 0 && (
                <FileGroup label="Photographs" icon={<Image className="h-3.5 w-3.5" />}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                    {photoRecords.map(r => <PhotoCard key={r.id} record={r} onDelete={remove} />)}
                  </div>
                </FileGroup>
              )}
              {prodRecords.length > 0 && (
                <FileGroup label="Products" icon={<Package className="h-3.5 w-3.5" />}>
                  {prodRecords.map(r => <ProductCard key={r.id} record={r} onDelete={remove} />)}
                </FileGroup>
              )}
            </>
          ) : tab === 'document' ? (
            <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
              {filtered.map(r => <DocumentRow key={r.id} record={r} onDelete={remove} />)}
            </div>
          ) : tab === 'photograph' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filtered.map(r => <PhotoCard key={r.id} record={r} onDelete={remove} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(r => <ProductCard key={r.id} record={r} onDelete={remove} />)}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Files are saved locally in this browser. Connect Supabase Storage for persistent cross-device access.
      </p>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function FileGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

function DocumentRow({ record, onDelete }: { record: FileRecord; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-background hover:bg-muted/30 transition-colors">
      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{record.name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(record.sizeBytes)} · {new Date(record.createdAt).toLocaleDateString()}</p>
      </div>
      <button onClick={() => onDelete(record.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function PhotoCard({ record, onDelete }: { record: FileRecord; onDelete: (id: string) => void }) {
  return (
    <div className="relative group rounded-md overflow-hidden border border-border bg-muted/30 aspect-square">
      {record.dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={record.dataUrl} alt={record.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Image className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
        <p className="text-white text-xs text-center font-medium truncate w-full px-1">{record.name}</p>
        <button onClick={() => onDelete(record.id)} className="text-white hover:text-red-300 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ProductCard({ record, onDelete }: { record: FileRecord; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-md border border-border overflow-hidden bg-background">
      <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(e => !e)}>
        {record.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={record.dataUrl} alt={record.name}
            className="h-10 w-10 object-cover rounded flex-shrink-0 border border-border" />
        ) : (
          <div className="h-10 w-10 bg-muted rounded flex-shrink-0 flex items-center justify-center border border-border">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{record.name}</p>
          <p className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); onDelete(record.id); }}
            className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? '' : '-rotate-90'}`} />
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-border bg-muted/10 space-y-2">
          {record.specifications && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Specifications</p>
              <p className="text-sm whitespace-pre-wrap">{record.specifications}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {record.documentLink && (
              <a href={record.documentLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <FileText className="h-3.5 w-3.5" /> Document <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {record.photographLink && (
              <a href={record.photographLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Image className="h-3.5 w-3.5" /> Photograph <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
