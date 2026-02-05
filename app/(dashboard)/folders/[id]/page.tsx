'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Folder,
  FolderPlus,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  Loader2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentList } from '@/components/documents/document-list';
import { CreateFolderModal } from '@/components/folders/create-folder-modal';
import { UploadModal } from '@/components/documents/upload-modal';
import { toast } from 'sonner';
import { Document } from '@/types';

interface FolderDetails {
  id: string;
  name: string;
  parentId?: string | null;
  children?: {
    id: string;
    name: string;
    _count?: {
      documents: number;
      children: number;
    };
  }[];
  documents?: Document[];
  _count?: {
    documents: number;
    children: number;
  };
}

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('folders');
  const tDocs = useTranslations('documents');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const tErrors = useTranslations('errors');
  
  const [folder, setFolder] = React.useState<FolderDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [breadcrumb, setBreadcrumb] = React.useState<{ id: string; name: string }[]>([]);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);

  const folderId = params.id as string;

  const fetchFolder = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/folders/${folderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error(tErrors('notFound'));
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch folder');
      }

      const data = await response.json();
      setFolder(data);
      
      // Build breadcrumb
      await buildBreadcrumb(data.parentId);
    } catch (error) {
      console.error('Error fetching folder:', error);
      toast.error(tErrors('serverError'));
    } finally {
      setLoading(false);
    }
  }, [folderId, tErrors, router]);

  const buildBreadcrumb = async (parentId?: string | null) => {
    const crumbs: { id: string; name: string }[] = [];
    let currentParentId = parentId;

    while (currentParentId) {
      try {
        const response = await fetch(`/api/folders/${currentParentId}`);
        if (response.ok) {
          const parentFolder = await response.json();
          crumbs.unshift({ id: parentFolder.id, name: parentFolder.name });
          currentParentId = parentFolder.parentId;
        } else {
          break;
        }
      } catch (error) {
        console.error('Error building breadcrumb:', error);
        break;
      }
    }

    setBreadcrumb(crumbs);
  };

  React.useEffect(() => {
    fetchFolder();
  }, [fetchFolder]);

  const handleRenameFolder = async () => {
    if (!folder) return;

    const newName = prompt(t('rename'), folder.name);
    if (newName && newName !== folder.name) {
      try {
        const response = await fetch(`/api/folders/${folderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to rename folder');
        }

        toast.success(tCommon('success'));
        fetchFolder();
      } catch (error) {
        console.error('Error renaming folder:', error);
        toast.error(
          error instanceof Error ? error.message : tErrors('updateFailed')
        );
      }
    }
  };

  const handleDeleteFolder = async () => {
    if (!folder) return;

    if (!confirm(tCommon('confirmDelete'))) return;

    try {
      const response = await fetch(`/api/folders/${folderId}?cascade=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete folder');
      }

      toast.success(t('deleteSuccess'));
      
      // Navigate to parent or dashboard
      if (folder.parentId) {
        router.push(`/folders/${folder.parentId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error(
        error instanceof Error ? error.message : tErrors('deleteFailed')
      );
    }
  };

  const handleCreateSubfolder = () => {
    setCreateModalOpen(true);
  };

  const handleUpload = () => {
    setUploadModalOpen(true);
  };

  const handleFolderClick = (id: string) => {
    router.push(`/folders/${id}`);
  };

  const handleBreadcrumbClick = (id: string) => {
    router.push(`/folders/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#0B2F4A] animate-spin" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Folder className="w-16 h-16 text-[#6B7280] mb-4" />
        <p className="text-lg text-[#6B7280]">{t('noFolders')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-[#6B7280] hover:text-[#0B2F4A] transition-colors"
        >
          {tNav('dashboard')}
        </button>
        {breadcrumb.map((crumb) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            <button
              onClick={() => handleBreadcrumbClick(crumb.id)}
              className="text-sm text-[#6B7280] hover:text-[#0B2F4A] transition-colors"
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
        <ChevronRight className="w-4 h-4 text-[#6B7280]" />
        <span className="text-sm font-medium text-[#1A1A1A]">{folder.name}</span>
      </nav>

      {/* Folder Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-8 h-8 text-[#F2B705]" />
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">{folder.name}</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {folder._count?.documents || 0} {tDocs('title').toLowerCase()} • {folder._count?.children || 0} {t('subfolder').toLowerCase()}s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            {tDocs('upload')}
          </Button>
          <Button variant="outline" onClick={handleCreateSubfolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            {t('subfolder')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRenameFolder}>
                <Edit className="mr-2 h-4 w-4" />
                {t('rename')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteFolder} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subfolders Grid */}
      {folder.children && folder.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            {t('subfolder')}s
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folder.children.map((subfolder) => (
              <Card
                key={subfolder.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleFolderClick(subfolder.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Folder className="w-10 h-10 text-[#F2B705] flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#1A1A1A] truncate">
                        {subfolder.name}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {subfolder._count?.documents || 0} files
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      <div>
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          {tDocs('title')}
        </h2>
        {folder.documents && folder.documents.length > 0 ? (
          <DocumentList
            documents={folder.documents}
            onDelete={async () => fetchFolder()}
          />
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <FileText className="w-16 h-16 text-[#6B7280] mb-4" />
                <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
                  {tDocs('noDocuments')}
                </h3>
                <p className="text-sm text-[#6B7280] mb-6">
                  Upload documents to this folder
                </p>
                <Button onClick={handleUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  {tDocs('upload')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchFolder}
        parentId={folderId}
      />
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={fetchFolder}
        folders={[]}
        defaultFolderId={folderId}
      />
    </div>
  );
}
