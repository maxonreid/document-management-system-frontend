'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { formatDate, formatFileSize, getFileExtension } from '@/lib/utils';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Edit,
  FolderInput,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Document } from '@/types';
import Link from 'next/link';

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onMove?: (id: string, folderId: string) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-8 w-8 text-[#F2B705]" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="h-8 w-8 text-red-600" />;
  }
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  ) {
    return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="h-8 w-8 text-blue-600" />;
  }
  return <FileIcon className="h-8 w-8 text-[#6B7280]" />;
}

export function DocumentCard({
  document: doc,
  onDelete,
  onRename,
  onMove,
}: DocumentCardProps) {
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');

  const handleDownload = async () => {
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
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link
            href={`/documents/${doc.id}`}
            className="flex-1 min-w-0"
          >
            <div className="flex items-center gap-3">
              {doc.thumbnailPath ? (
                <img
                  src={doc.thumbnailPath}
                  alt={doc.originalName}
                  className="h-12 w-12 object-cover rounded border border-[#6B7280]/20"
                />
              ) : (
                <div className="h-12 w-12 bg-[#F5F7FA] rounded border border-[#6B7280]/20 flex items-center justify-center">
                  {getFileIcon(doc.mimeType)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#1A1A1A] truncate group-hover:text-[#0B2F4A] transition-colors">
                  {doc.originalName}
                </h3>
                <p className="text-xs text-[#6B7280] uppercase">
                  {getFileExtension(doc.originalName)}
                </p>
              </div>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{tCommon('actions')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/documents/${doc.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {tCommon('download')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRename?.(doc.id, doc.originalName)}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('rename')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove?.(doc.id, '')}>
                <FolderInput className="mr-2 h-4 w-4" />
                {t('move')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(doc.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2 text-sm text-[#6B7280]">
          <div className="flex justify-between">
            <span>{t('fileSize')}:</span>
            <span className="font-medium text-[#1A1A1A]">
              {formatFileSize(doc.size)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('uploadDate')}:</span>
            <span className="font-medium text-[#1A1A1A]">
              {formatDate(doc.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>

      {doc.tags && doc.tags.length > 0 && (
        <CardFooter className="pt-0">
          <div className="flex flex-wrap gap-1">
            {doc.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#0B2F4A]/10 text-[#0B2F4A]"
              >
                {tag.name}
              </span>
            ))}
            {doc.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#6B7280]/10 text-[#6B7280]">
                +{doc.tags.length - 3}
              </span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
