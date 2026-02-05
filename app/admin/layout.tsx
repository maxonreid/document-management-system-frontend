import * as React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Shield } from 'lucide-react';

export default async function AdminLayout({
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

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-[#0B2F4A] to-[#1F4E6D] border-b border-[#F2B705]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#F2B705] rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#0B2F4A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-[#F2B705]">System Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
