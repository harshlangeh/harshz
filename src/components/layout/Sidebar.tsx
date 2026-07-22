"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { LayoutDashboard, Building2, Palette, Calculator, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId as string | undefined;
  const { user, configured, signOut } = useAuth();

  const links = [
    { href: '/', label: 'My Projects', Icon: LayoutDashboard },
    ...(projectId ? [{ href: `/project/${projectId}`, label: 'Project Dashboard', Icon: Building2 }] : []),
    ...(projectId ? [{ href: `/project/${projectId}/calculators`, label: 'Calculators', Icon: Calculator }] : []),
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

      {configured && (
        <div className="mt-auto pt-4 border-t border-border">
          {user ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground truncate px-2">{user.email}</p>
              <button
                onClick={() => signOut()}
                className="nav-link w-full text-left text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className={`nav-link ${pathname === '/login' ? 'active' : ''}`}>
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
