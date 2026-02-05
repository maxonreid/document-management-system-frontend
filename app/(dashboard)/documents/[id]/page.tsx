'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  Trash2,
  Edit,
  FolderInput,
  Tag,
  Calendar,
  FileText,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Document } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import Link from 'next/link';

interface DocumentDetailPageProps {
  params: {
    id: string;
  };
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = params;
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [doc, setDoc] = React.useState<Document | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingName, setEditingName] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [editingTags, setEditingTags] = React.useState(false);
  const [newTags, setNewTags] = React.useState('');

  const fetchDocument = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const data = await response.json();
      setDoc(data.document);
      setNewName(data.document.originalName);
      setNewTags(
        data.document.tags?.map((tag: any) => tag.name).join(', ') || ''
      );
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to load document',
      });
    } finally {
      setLoading(false);
    }
  }, [id, tCommon]);

  React.useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleDownload = async () => {
    if (!doc) return;

    try {
      const response = await fetch(`/api/documents/${doc.id}/download`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.originalName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to download document',
      });
    }
  };

  const handleDelete = async () => {
    if (!doc || !confirm(tCommon('confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success(t('deleteSuccess'));
      router.push('/documents');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to delete document',
      });
    }
  };

  const handleRename = async () => {
    if (!doc || !newName || newName === doc.originalName) {
      setEditingName(false);
      return;
    }

    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalName: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename document');
      }

      toast.success('Document renamed successfully');
      setEditingName(false);
      fetchDocument();
    } catch (error) {
      console.error('Error renaming document:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to rename document',
      });
    }
  };

  const handleUpdateTags = async () => {
    if (!doc) {
      setEditingTags(false);
      return;
    }

    try {
      const tagArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      const response = await fetch(`/api/documents/${doc.id}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: tagArray }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      toast.success('Tags updated successfully');
      setEditingTags(false);
      fetchDocument();
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to update tags',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-[#0B2F4A] animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              Document not found
            </h2>
            <p className="text-[#6B7280] mb-4">
              The document you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/documents">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Documents
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <Link href="/documents" className="hover:text-[#0B2F4A]">
          {t('title')}
        </Link>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium">{doc.originalName}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/documents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="max-w-md"
                  autoFocus
                />
                <Button size="sm" onClick={handleRename}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {doc.originalName}
              </h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditingName(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t('rename')}
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            {tCommon('download')}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon('delete')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {doc.mimeType === 'application/pdf' ? (
                <embed
                  src={doc.filePath}
                  type="application/pdf"
                  width="100%"
                  height="800px"
                  className="rounded border border-[#6B7280]/20"
                />
              ) : doc.mimeType.startsWith('image/') ? (
                <img
                  src={doc.filePath}
                  alt={doc.originalName}
                  className="w-full h-auto rounded border border-[#6B7280]/20"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <FileText className="h-24 w-24 text-[#6B7280] mb-4" />
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                    Preview not available
                  </h3>
                  <p className="text-sm text-[#6B7280] mb-4">
                    This file type cannot be previewed in the browser.
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download to view
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-[#6B7280]">
                  <FileText className="h-4 w-4" />
                  {t('fileType')}
                </Label>
                <p className="text-[#1A1A1A] font-medium mt-1">
                  {doc.mimeType}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="flex items-center gap-2 text-[#6B7280]">
                  <FileText className="h-4 w-4" />
                  {t('fileSize')}
                </Label>
                <p className="text-[#1A1A1A] font-medium mt-1">
                  {formatFileSize(doc.size)}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="flex items-center gap-2 text-[#6B7280]">
                  <Calendar className="h-4 w-4" />
                  {t('uploadDate')}
                </Label>
                <p className="text-[#1A1A1A] font-medium mt-1">
                  {formatDate(doc.createdAt)}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="flex items-center gap-2 text-[#6B7280] mb-2">
                  <Tag className="h-4 w-4" />
                  {t('tags')}
                </Label>
                {editingTags ? (
                  <div className="space-y-2">
                    <Input
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateTags();
                        if (e.key === 'Escape') setEditingTags(false);
                      }}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateTags}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTags(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {doc.tags && doc.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-[#0B2F4A]/10 text-[#0B2F4A]"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6B7280]">No tags</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTags(true)}
                      className="mt-2"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Tags
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FolderInput className="mr-2 h-4 w-4" />
                {t('move')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon('delete')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
