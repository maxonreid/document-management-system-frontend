import { UserRole as PrismaUserRole } from '@prisma/client';

export type UserRole = PrismaUserRole;

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  children?: Folder[];
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  size: number;
  mimeType: string;
  thumbnailPath?: string | null;
  folderId?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
}

export interface DocumentTag {
  documentId: string;
  tagId: string;
}
