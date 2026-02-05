'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Upload, FolderOpen, Tag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentList } from '@/components/documents/document-list';
import { UploadModal } from '@/components/documents/upload-modal';
import { Document, Folder } from '@/types';

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  const fetchDocuments = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await fetch(`/api/documents?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to load documents',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTags, tCommon]);

  const fetchFolders = React.useCallback(async () => {
    try {
      const response = await fetch('/api/folders');
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, [fetchDocuments, fetchFolders]);

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success(t('deleteSuccess'));
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to delete document',
      });
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const newName = prompt('Enter new name:', currentName);
    if (!newName || newName === currentName) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalName: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename document');
      }

      toast.success('Document renamed successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error renaming document:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to rename document',
      });
    }
  };

  const handleMove = async (id: string, currentFolderId: string) => {
    const folderId = prompt(
      'Enter folder ID (leave empty for root):',
      currentFolderId || ''
    );
    if (folderId === null) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: folderId || null }),
      });

      if (!response.ok) {
        throw new Error('Failed to move document');
      }

      toast.success('Document moved successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error moving document:', error);
      toast.error(tCommon('error'), {
        description: 'Failed to move document',
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredDocuments = React.useMemo(() => {
    if (!searchQuery) return documents;
    return documents.filter((doc) =>
      doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">{t('title')}</h1>
          <p className="text-[#6B7280] mt-1">
            Manage and organize your documents
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          {t('upload')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                placeholder={tCommon('search')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Tag className="mr-2 h-4 w-4" />
                Tags
              </Button>
              <Button variant="outline" className="flex-1">
                <FolderOpen className="mr-2 h-4 w-4" />
                Folders
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <DocumentList
        documents={filteredDocuments}
        loading={loading}
        onDelete={handleDelete}
        onRename={handleRename}
        onMove={handleMove}
      />

      {/* Upload Modal */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        folders={folders}
        onUploadSuccess={fetchDocuments}
      />
    </div>
  );
}
