'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar, Settings as SettingsIcon, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function SettingsPage() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const tAuth = useTranslations('auth');
  const { data: session } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session?.user) {
    return null;
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return tAdmin('admin');
      case 'USER':
        return tAdmin('user');
      case 'VIEWER':
        return tAdmin('viewer');
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#F2B705] text-[#0B2F4A]';
      case 'USER':
        return 'bg-[#0B2F4A] text-white';
      case 'VIEWER':
        return 'bg-[#6B7280] text-white';
      default:
        return 'bg-[#6B7280] text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0B2F4A] mb-2">Settings</h1>
        <p className="text-[#6B7280]">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#6B7280]">Name</Label>
              <div className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-lg">
                <User className="h-4 w-4 text-[#6B7280]" />
                <span className="text-[#1A1A1A]">{session.user.name || 'Not set'}</span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#6B7280]">Email</Label>
              <div className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-lg">
                <Mail className="h-4 w-4 text-[#6B7280]" />
                <span className="text-[#1A1A1A]">{session.user.email}</span>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#6B7280]">Role</Label>
              <div className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-lg">
                <Shield className="h-4 w-4 text-[#6B7280]" />
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    session.user.role
                  )}`}
                >
                  {getRoleDisplay(session.user.role)}
                </span>
              </div>
            </div>

            <Separator />

            {/* Change Password Placeholder */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#6B7280]">Password</Label>
              <div className="p-4 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">
                  Password management will be available in a future update.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language Preference */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#6B7280] flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Language
              </Label>
              <LanguageSwitcher />
            </div>

            <Separator />

            {/* Account Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#6B7280]">Account Status</Label>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Active</p>
                <p className="text-xs text-green-600 mt-1">
                  Your account is in good standing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#6B7280]">Account Created</Label>
              <div className="p-3 bg-[#F5F7FA] rounded-lg">
                <p className="text-[#1A1A1A]">
                  {/* Account creation date would come from backend */}
                  Member since {new Date().getFullYear()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#6B7280]">Account Type</Label>
              <div className="p-3 bg-[#F5F7FA] rounded-lg">
                <p className="text-[#1A1A1A]">Standard Account</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-[#0B2F4A]/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-[#0B2F4A] rounded-lg flex items-center justify-center flex-shrink-0">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-1">Need Help?</h3>
              <p className="text-sm text-[#6B7280]">
                If you need assistance or have questions about your account, please contact your
                system administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
