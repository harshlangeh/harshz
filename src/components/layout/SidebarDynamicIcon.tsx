"use client";

import React from 'react';
import { useDynamicIcon } from '../IconProvider';

export function SidebarDynamicIcon({ collapsed }: { collapsed: boolean }) {
  const { dayData, IconComponent, setShowGrid } = useDynamicIcon();

  return (
    <div 
      onDoubleClick={() => setShowGrid(true)}
      className="dynamic-icon-container"
      style={{
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? 'none' : 'auto',
        transform: collapsed ? 'scale(0.8)' : 'scale(1)'
      }}
      title="Double tap to change icon"
    >
      <div className="dynamic-icon-icon">
        <IconComponent size={48} strokeWidth={1.5} />
      </div>
    </div>
  );
}
