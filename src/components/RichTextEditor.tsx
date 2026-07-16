"use client";
import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TOOLS: { cmd: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { cmd: 'bold',              label: 'Bold',          Icon: Bold },
  { cmd: 'italic',            label: 'Italic',        Icon: Italic },
  { cmd: 'underline',         label: 'Underline',     Icon: Underline },
  { cmd: 'insertUnorderedList', label: 'Bullet list', Icon: List },
  { cmd: 'insertOrderedList',   label: 'Numbered list', Icon: ListOrdered },
];

/** Minimal Word-style rich text box (bold/italic/underline/lists) backed by contentEditable. */
export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (cmd: string) => {
    document.execCommand(cmd);
    ref.current?.focus();
    onChange(ref.current?.innerHTML || '');
  };

  return (
    <div className="rounded-md border border-input overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
        {TOOLS.map(({ cmd, label, Icon }, i) => (
          <React.Fragment key={cmd}>
            {i === 3 && <div className="w-px h-4 bg-border mx-1" />}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => exec(cmd)}
              className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label={label}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          </React.Fragment>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || '')}
        data-placeholder={placeholder}
        className="rich-text-content min-h-[160px] px-3 py-2.5 text-sm outline-none"
      />
    </div>
  );
}
