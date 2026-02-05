'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { Menu, User, LogOut, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';

interface HeaderProps {
  userName?: string | null;
  onMenuToggle: () => void;
}

export function Header({ userName, onMenuToggle }: HeaderProps) {
  const t = useTranslations();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary-blue shadow-sm">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden text-white hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo/App Name */}
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent-gold" />
          <h1 className="text-lg font-semibold text-white hidden sm:block">
            {t('common.appName')}
          </h1>
        </div>

        <div className="flex-1" />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-text-secondary">
                  {t('nav.profile')}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>{t('nav.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('auth.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
