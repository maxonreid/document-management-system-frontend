'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Search as SearchIcon, Filter, Calendar, Tag, FileText } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { DocumentList } from '@/components/documents/document-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Document, Tag as TagType } from '@/types';
import { toast } from '@/components/ui/toast';

type SortOption = 'name' | 'date' | 'size';
type FileTypeFilter = 'all' | 'pdf' | 'image' | 'document' | 'spreadsheet';

export default function SearchPage() {
  const t = useTranslations('search');
  const tCommon = useTranslations('common');
  const tDoc = useTranslations('documents');

  const [searchQuery, setSearchQuery] = React.useState('');
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [allDocuments, setAllDocuments] = React.useState<Document[]>([]);
  const [tags, setTags] = React.useState<TagType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  // Filters
  const [selectedFileType, setSelectedFileType] = React.useState<FileTypeFilter>('all');
  const [selectedTag, setSelectedTag] = React.useState<string>('all');
  const [dateRange, setDateRange] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<SortOption>('date');

  // Fetch all documents on mount
  React.useEffect(() => {
    fetchDocuments();
    fetchTags();
  }, []);

  // Apply search and filters
  React.useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedFileType, selectedTag, dateRange, sortBy, allDocuments]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      setAllDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const applyFilters = () => {
    setSearching(true);
    let filtered = [...allDocuments];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.originalName.toLowerCase().includes(query) ||
          doc.tags?.some((tag) => tag.name.toLowerCase().includes(query))
      );
    }

    // File type filter
    if (selectedFileType !== 'all') {
      filtered = filtered.filter((doc) => {
        switch (selectedFileType) {
          case 'pdf':
            return doc.mimeType === 'application/pdf';
          case 'image':
            return doc.mimeType.startsWith('image/');
          case 'document':
            return doc.mimeType.includes('word') || doc.mimeType.includes('document');
          case 'spreadsheet':
            return doc.mimeType.includes('spreadsheet') || doc.mimeType.includes('excel');
          default:
            return true;
        }
      });
    }

    // Tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter((doc) =>
        doc.tags?.some((tag) => tag.id === selectedTag)
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (dateRange !== 'all') {
        filtered = filtered.filter(
          (doc) => new Date(doc.createdAt) >= filterDate
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    setDocuments(filtered);
    setSearching(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFileType('all');
    setSelectedTag('all');
    setDateRange('all');
    setSortBy('date');
  };

  const hasActiveFilters =
    searchQuery.trim() ||
    selectedFileType !== 'all' ||
    selectedTag !== 'all' ||
    dateRange !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0B2F4A] mb-2">{t('title')}</h1>
        <p className="text-[#6B7280]">
          Search and filter your documents
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('searchPlaceholder')}
        loading={searching}
        className="max-w-2xl"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Type Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                {t('filterByType')}
              </Label>
              <Select value={selectedFileType} onValueChange={(value) => setSelectedFileType(value as FileTypeFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4" />
                {t('filterByTag')}
              </Label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTags')}</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {t('filterByDate')}
              </Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label className="text-sm">{t('sortBy')}</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t('sortByName')}</SelectItem>
                  <SelectItem value="date">{t('sortByDate')}</SelectItem>
                  <SelectItem value="size">{t('sortBySize')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Result Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              {documents.length} {documents.length === 1 ? 'result' : 'results'} found
            </p>
          </div>

          {/* Documents List */}
          {!loading && documents.length === 0 && (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-4">
                  <SearchIcon className="h-8 w-8 text-[#6B7280]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
                  {tCommon('noResults')}
                </h3>
                <p className="text-sm text-[#6B7280] mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'Start searching to find your documents'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card>
          )}

          {documents.length > 0 && (
            <DocumentList
              documents={documents}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
