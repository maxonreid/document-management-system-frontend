'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface FolderOption {
  id: string;
  name: string;
  parentId?: string | null;
}

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  parentId?: string;
}

export function CreateFolderModal({
  open,
  onOpenChange,
  onSuccess,
  parentId: initialParentId,
}: CreateFolderModalProps) {
  const t = useTranslations('folders');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const [name, setName] = React.useState('');
  const [parentId, setParentId] = React.useState<string | undefined>(
    initialParentId
  );
  const [folders, setFolders] = React.useState<FolderOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [fetchingFolders, setFetchingFolders] = React.useState(false);

  // Fetch folders for parent selection
  React.useEffect(() => {
    if (open) {
      fetchFolders();
    }
  }, [open]);

  const fetchFolders = async () => {
    try {
      setFetchingFolders(true);
      const response = await fetch('/api/folders?view=flat');
      
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error(tErrors('serverError'));
    } finally {
      setFetchingFolders(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          parentId: parentId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create folder');
      }

      toast.success(t('createSuccess'));
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(
        error instanceof Error ? error.message : tErrors('createFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setParentId(initialParentId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create')}</DialogTitle>
          <DialogDescription>
            {t('newFolder')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Folder Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('folderName')}</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('folderName')}
                required
                autoFocus
              />
            </div>

            {/* Parent Folder Selection */}
            <div className="space-y-2">
              <Label htmlFor="parent">{t('parentFolder')}</Label>
              {fetchingFolders ? (
                <div className="flex items-center justify-center p-4 border border-[#6B7280]/20 rounded-md">
                  <Loader2 className="w-4 h-4 text-[#0B2F4A] animate-spin" />
                </div>
              ) : (
                <Select
                  value={parentId || 'root'}
                  onValueChange={(value) =>
                    setParentId(value === 'root' ? undefined : value)
                  }
                >
                  <SelectTrigger id="parent">
                    <SelectValue placeholder={t('rootFolder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">{t('rootFolder')}</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
