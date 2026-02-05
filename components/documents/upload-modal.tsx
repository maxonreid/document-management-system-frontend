'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Upload, Loader2, FolderOpen, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UploadZone } from './upload-zone';
import { Folder } from '@/types';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders?: Folder[];
  onUploadSuccess?: () => void;
  defaultFolderId?: string;
}

export function UploadModal({
  open,
  onOpenChange,
  folders = [],
  onUploadSuccess,
  defaultFolderId,
}: UploadModalProps) {
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');
  const [files, setFiles] = React.useState<File[]>([]);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string>(defaultFolderId || '');
  const [tags, setTags] = React.useState<string>('');
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<{
    [key: string]: number;
  }>({});
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  // Update selected folder when defaultFolderId changes
  React.useEffect(() => {
    if (defaultFolderId) {
      setSelectedFolderId(defaultFolderId);
    }
  }, [defaultFolderId]);

  const resetForm = () => {
    setFiles([]);
    setSelectedFolderId('');
    setTags('');
    setUploadProgress({});
    setErrors({});
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error(tCommon('error'), {
        description: 'Please select at least one file',
      });
      return;
    }

    setUploading(true);
    const newProgress: { [key: string]: number } = {};
    const newErrors: { [key: string]: string } = {};

    try {
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          if (selectedFolderId) {
            formData.append('folderId', selectedFolderId);
          }
          if (tags) {
            const tagArray = tags.split(',').map((t) => t.trim());
            formData.append('tags', JSON.stringify(tagArray));
          }

          // Simulate progress
          newProgress[file.name] = 10;
          setUploadProgress({ ...newProgress });

          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData,
          });

          newProgress[file.name] = 50;
          setUploadProgress({ ...newProgress });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
          }

          newProgress[file.name] = 100;
          setUploadProgress({ ...newProgress });
        } catch (error) {
          newErrors[file.name] =
            error instanceof Error ? error.message : 'Upload failed';
          newProgress[file.name] = 0;
          setUploadProgress({ ...newProgress });
          setErrors({ ...newErrors });
        }
      }

      const successCount = files.length - Object.keys(newErrors).length;
      if (successCount > 0) {
        toast.success(t('uploadSuccess'), {
          description: `${successCount} file(s) uploaded successfully`,
        });
        onUploadSuccess?.();
        
        if (Object.keys(newErrors).length === 0) {
          onOpenChange(false);
          resetForm();
        }
      }

      if (Object.keys(newErrors).length > 0) {
        toast.error(tCommon('error'), {
          description: `${Object.keys(newErrors).length} file(s) failed to upload`,
        });
      }
    } catch (error) {
      toast.error(tCommon('error'), {
        description: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!uploading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('upload')}
          </DialogTitle>
          <DialogDescription>
            Upload documents to your document management system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <UploadZone
            files={files}
            onFilesChange={setFiles}
            uploading={uploading}
            uploadProgress={uploadProgress}
            errors={errors}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="folder" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                {t('folder')}
              </Label>
              <Select
                value={selectedFolderId}
                onValueChange={setSelectedFolderId}
                disabled={uploading}
              >
                <SelectTrigger id="folder">
                  <SelectValue placeholder="Select folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t('tags')}
              </Label>
              <Input
                id="tags"
                placeholder="work, important, project (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {tCommon('upload')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
