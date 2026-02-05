'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { FileText, FolderOpen, Upload, Plus, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardClientProps {
  userName?: string | null;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const t = useTranslations();

  // Placeholder data - will be replaced with real API calls
  const stats = {
    totalDocuments: 0,
    totalFolders: 0,
    recentUploads: 0,
  };

  const recentDocuments: any[] = [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          {t('nav.dashboard')}
        </h1>
        <p className="text-text-secondary">
          Welcome back, {userName || 'User'}!
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.totalDocuments')}
            </CardTitle>
            <FileText className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-blue">
              {stats.totalDocuments}
            </div>
            <p className="text-xs text-text-secondary">
              {t('documents.title')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.totalFolders')}
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-blue">
              {stats.totalFolders}
            </div>
            <p className="text-xs text-text-secondary">
              {t('folders.title')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Uploads
            </CardTitle>
            <Clock className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-blue">
              {stats.recentUploads}
            </div>
            <p className="text-xs text-text-secondary">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl">{t('common.actions')}</CardTitle>
          <CardDescription>Quick actions to get you started</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button className="bg-primary-blue hover:bg-secondary-blue text-white">
            <Upload className="mr-2 h-4 w-4" />
            {t('documents.upload')}
          </Button>
          <Button
            variant="outline"
            className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('folders.create')}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Recent Documents</CardTitle>
          <CardDescription>
            Your recently uploaded or modified documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">{t('documents.noDocuments')}</p>
              <Button className="mt-4 bg-primary-blue hover:bg-secondary-blue text-white">
                <Upload className="mr-2 h-4 w-4" />
                {t('documents.upload')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDocuments.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary-blue" />
                    <div>
                      <p className="font-medium text-text-primary">
                        {doc.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-blue hover:text-secondary-blue"
                  >
                    {t('documents.view')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
