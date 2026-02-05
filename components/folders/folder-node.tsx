'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FolderNodeProps {
  id: string;
  name: string;
  children?: FolderNodeProps[];
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onCreateSubfolder?: (parentId: string) => void;
  level?: number;
}

export function FolderNode({
  id,
  name,
  children = [],
  onRename,
  onDelete,
  onCreateSubfolder,
  level = 0,
}: FolderNodeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('folders');
  const tCommon = useTranslations('common');
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const isActive = pathname === `/folders/${id}`;
  const hasChildren = children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleNavigate = () => {
    router.push(`/folders/${id}`);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt(t('rename'), name);
    if (newName && newName !== name) {
      onRename?.(id, newName);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(tCommon('confirmDelete'))) {
      onDelete?.(id);
    }
  };

  const handleCreateSubfolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateSubfolder?.(id);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-[#F5F7FA] cursor-pointer transition-colors',
          isActive && 'bg-[#0B2F4A]/10 text-[#0B2F4A] font-medium'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleNavigate}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={handleToggle}
          className={cn(
            'flex items-center justify-center w-4 h-4 rounded hover:bg-[#6B7280]/10 transition-colors',
            !hasChildren && 'invisible'
          )}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            ) : (
              <ChevronRight className="w-3 h-3 text-[#6B7280]" />
            )
          )}
        </button>

        {/* Folder Icon */}
        {isExpanded && hasChildren ? (
          <FolderOpen className="w-4 h-4 text-[#F2B705] flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-[#F2B705] flex-shrink-0" />
        )}

        {/* Folder Name */}
        <span className="flex-1 text-sm truncate">{name}</span>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCreateSubfolder}>
              <FolderPlus className="mr-2 h-4 w-4" />
              {t('subfolder')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRename}>
              <Edit className="mr-2 h-4 w-4" />
              {t('rename')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Render Children */}
      {isExpanded && hasChildren && (
        <div>
          {children.map((child) => (
            <FolderNode
              key={child.id}
              {...child}
              onRename={onRename}
              onDelete={onDelete}
              onCreateSubfolder={onCreateSubfolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
