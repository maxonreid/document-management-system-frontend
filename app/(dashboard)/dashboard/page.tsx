import * as React from 'react';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardClient } from './page-client';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <DashboardClient userName={session.user.name} />;
}
