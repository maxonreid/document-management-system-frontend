'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@prisma/client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/documents',
      label: t('nav.documents'),
      icon: FileText,
    },
    {
      href: '/folders',
      label: t('nav.folders'),
      icon: FolderOpen,
    },
    {
      href: '/search',
      label: t('nav.search'),
      icon: Search,
    },
    {
      href: '/settings',
      label: t('nav.settings'),
      icon: Settings,
    },
    {
      href: '/admin',
      label: t('nav.admin'),
      icon: Users,
      adminOnly: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || userRole === 'ADMIN'
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform bg-primary-blue transition-transform duration-200 ease-in-out md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex h-full flex-col gap-2 p-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent-gold text-primary-blue'
                    : 'text-white hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
