"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { LayoutDashboard, Building2, Palette, Calculator } from 'lucide-react';

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId as string | undefined;

  const links = [
    { href: '/', label: 'My Projects', Icon: LayoutDashboard },
    ...(projectId ? [
      { href: `/project/${projectId}`, label: 'Project Dashboard', Icon: Building2 },
      { href: `/project/${projectId}/calculators`, label: 'Calculators', Icon: Calculator },
    ] : []),
    { href: '/branding', label: 'Branding', Icon: Palette },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="flex flex-col gap-2">
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname === href ? 'active' : ''}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
