import * as React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardLayoutClient } from './layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (!session.user.active) {
    redirect('/login');
  }

  return (
    <DashboardLayoutClient
      userName={session.user.name}
      userRole={session.user.role}
    >
      {children}
    </DashboardLayoutClient>
  );
}
