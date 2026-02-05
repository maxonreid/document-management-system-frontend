import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { folderCreateSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'tree';

    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (view === 'flat') {
      return NextResponse.json({ folders });
    }

    // Build tree structure
    const folderMap = new Map();
    const rootFolders: any[] = [];

    // First pass: create map of all folders
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Second pass: build tree
    folders.forEach((folder) => {
      const folderNode = folderMap.get(folder.id);
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(folderNode);
        } else {
          rootFolders.push(folderNode);
        }
      } else {
        rootFolders.push(folderNode);
      }
    });

    return NextResponse.json({ folders: rootFolders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = folderCreateSchema.parse(body);

    // Validate parent folder exists and belongs to user
    if (validatedData.parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentFolder) {
        return NextResponse.json(
          { error: 'Parent folder not found' },
          { status: 404 }
        );
      }

      if (parentFolder.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to create a folder in this parent folder' },
          { status: 403 }
        );
      }
    }

    // Check for duplicate folder name in the same parent
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
        parentId: validatedData.parentId || null,
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in this location' },
        { status: 409 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name: validatedData.name,
        parentId: validatedData.parentId || null,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid folder data', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
