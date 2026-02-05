'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Grid3x3,
  List,
  SortAsc,
  Filter,
  Loader2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentCard } from './document-card';
import { Document } from '@/types';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onMove?: (id: string, folderId: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'size';
type FilterType = 'all' | 'pdf' | 'image' | 'document' | 'spreadsheet';

export function DocumentList({
  documents,
  loading = false,
  onDelete,
  onRename,
  onMove,
}: DocumentListProps) {
  const t = useTranslations('documents');
  const tSearch = useTranslations('search');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [sortBy, setSortBy] = React.useState<SortOption>('date');
  const [filterType, setFilterType] = React.useState<FilterType>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  const filteredDocuments = React.useMemo(() => {
    let filtered = [...documents];

    // Apply filter
    if (filterType !== 'all') {
      filtered = filtered.filter((doc) => {
        switch (filterType) {
          case 'pdf':
            return doc.mimeType === 'application/pdf';
          case 'image':
            return doc.mimeType.startsWith('image/');
          case 'document':
            return (
              doc.mimeType.includes('word') ||
              doc.mimeType.includes('document')
            );
          case 'spreadsheet':
            return (
              doc.mimeType.includes('spreadsheet') ||
              doc.mimeType.includes('excel')
            );
          default:
            return true;
        }
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'date':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, filterType, sortBy]);

  const paginatedDocuments = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDocuments.slice(startIndex, endIndex);
  }, [filteredDocuments, currentPage]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#0B2F4A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-[#6B7280]/20 mx-2" />

          <span className="text-sm text-[#6B7280]">
            {filteredDocuments.length} {t('title').toLowerCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as FilterType)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tSearch('allTypes')}</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{tSearch('sortByName')}</SelectItem>
              <SelectItem value="date">{tSearch('sortByDate')}</SelectItem>
              <SelectItem value="size">{tSearch('sortBySize')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document Grid/List */}
      {paginatedDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-[#6B7280]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
            {t('noDocuments')}
          </h3>
          <p className="text-sm text-[#6B7280]">
            {filterType !== 'all'
              ? 'Try changing your filter'
              : 'Upload your first document to get started'}
          </p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2'
            )}
          >
            {paginatedDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={onDelete}
                onRename={onRename}
                onMove={onMove}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-[#6B7280]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          )}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-[#F5F7FA] rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
}
