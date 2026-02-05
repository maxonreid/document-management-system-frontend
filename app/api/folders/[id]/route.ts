import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { folderUpdateSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        children: {
          include: {
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
        },
        documents: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
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

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this folder' },
        { status: 403 }
      );
    }

    // Format documents with flattened tags
    const formattedFolder = {
      ...folder,
      documents: folder.documents.map((doc) => ({
        ...doc,
        tags: doc.tags.map((dt) => dt.tag),
      })),
    };

    return NextResponse.json(formattedFolder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this folder' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = folderUpdateSchema.parse(body);

    // Check if moving to a new parent
    if (validatedData.parentId !== undefined) {
      // Can't move folder to itself
      if (validatedData.parentId === params.id) {
        return NextResponse.json(
          { error: 'Cannot move a folder into itself' },
          { status: 400 }
        );
      }

      // Validate new parent folder exists and belongs to user
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
            { error: 'You do not have permission to move folder to this location' },
            { status: 403 }
          );
        }

        // Check if moving to a descendant (prevent circular reference)
        const isDescendant = await checkIfDescendant(params.id, validatedData.parentId);
        if (isDescendant) {
          return NextResponse.json(
            { error: 'Cannot move a folder into one of its descendants' },
            { status: 400 }
          );
        }
      }
    }

    // Check for duplicate folder name in the target location
    if (validatedData.name || validatedData.parentId !== undefined) {
      const targetName = validatedData.name || folder.name;
      const targetParentId = validatedData.parentId !== undefined 
        ? validatedData.parentId 
        : folder.parentId;

      const existingFolder = await prisma.folder.findFirst({
        where: {
          userId: session.user.id,
          name: targetName,
          parentId: targetParentId,
          id: { not: params.id },
        },
      });

      if (existingFolder) {
        return NextResponse.json(
          { error: 'A folder with this name already exists in this location' },
          { status: 409 }
        );
      }
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.parentId !== undefined && { 
          parentId: validatedData.parentId 
        }),
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

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid folder data', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this folder' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cascade = searchParams.get('cascade') === 'true';

    // Check if folder has contents
    if (!cascade && (folder._count.documents > 0 || folder._count.children > 0)) {
      return NextResponse.json(
        { 
          error: 'Folder is not empty. Use cascade=true to delete folder with all contents.',
          documentsCount: folder._count.documents,
          childrenCount: folder._count.children,
        },
        { status: 400 }
      );
    }

    // Delete folder (cascade is handled by Prisma schema onDelete: Cascade)
    await prisma.folder.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Folder deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}

// Helper function to check if targetId is a descendant of folderId
async function checkIfDescendant(folderId: string, targetId: string): Promise<boolean> {
  let currentId: string | null = targetId;
  
  while (currentId) {
    if (currentId === folderId) {
      return true;
    }
    
    const currentFolder: { parentId: string | null } | null = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    
    currentId = currentFolder?.parentId || null;
  }
  
  return false;
}
