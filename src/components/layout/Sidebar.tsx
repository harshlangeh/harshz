import React from 'react';
import Link from 'next/link';

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="flex flex-col gap-2">
        <Link href="/" className="nav-link">Dashboard</Link>
      </nav>
    </aside>
  );
}
