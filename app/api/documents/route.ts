import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search');
    const fileType = searchParams.get('fileType');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    // Filter by folder
    if (folderId !== null) {
      where.folderId = folderId === 'null' || folderId === '' ? null : folderId;
    }

    // Filter by file type
    if (fileType) {
      where.mimeType = fileType;
    }

    // Search in filename
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.document.count({ where });

    // Get documents with relations
    const documents = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Format response
    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      tags: doc.tags.map((dt) => dt.tag),
    }));

    return NextResponse.json({
      documents: formattedDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
