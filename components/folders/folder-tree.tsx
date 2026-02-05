'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, FolderPlus, Folder as FolderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FolderNode } from './folder-node';
import { toast } from 'sonner';

interface FolderData {
  id: string;
  name: string;
  parentId?: string | null;
  children?: FolderData[];
}

interface FolderTreeProps {
  onCreateFolder?: (parentId?: string) => void;
}

export function FolderTree({ onCreateFolder }: FolderTreeProps) {
  const t = useTranslations('folders');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const [folders, setFolders] = React.useState<FolderData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchFolders = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/folders?view=tree');
      
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error(tErrors('serverError'));
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  React.useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleRename = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/folders/${id}`, {
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
      fetchFolders();
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error(
        error instanceof Error ? error.message : tErrors('updateFailed')
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/folders/${id}?cascade=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete folder');
      }

      toast.success(t('deleteSuccess'));
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error(
        error instanceof Error ? error.message : tErrors('deleteFailed')
      );
    }
  };

  const handleCreateSubfolder = (parentId: string) => {
    onCreateFolder?.(parentId);
  };

  const handleCreateRootFolder = () => {
    onCreateFolder?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-[#0B2F4A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#6B7280]/20">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-5 h-5 text-[#0B2F4A]" />
          <h2 className="text-lg font-semibold text-[#1A1A1A]">{t('title')}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateRootFolder}
          title={t('create')}
        >
          <FolderPlus className="w-5 h-5" />
        </Button>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FolderIcon className="w-12 h-12 text-[#6B7280] mb-3" />
            <p className="text-sm text-[#6B7280] mb-4">{t('noFolders')}</p>
            <Button variant="outline" size="sm" onClick={handleCreateRootFolder}>
              <FolderPlus className="mr-2 h-4 w-4" />
              {t('create')}
            </Button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {folders.map((folder) => (
              <FolderNode
                key={folder.id}
                {...folder}
                onRename={handleRename}
                onDelete={handleDelete}
                onCreateSubfolder={handleCreateSubfolder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
