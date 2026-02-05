import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { nanoid } from 'nanoid';
import { ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE, UPLOAD_DIR } from '@/lib/constants';

// Helper to validate file type
function validateFileType(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  // Check mime type
  if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !ALLOWED_FILE_EXTENSIONS.includes(extension as any)) {
    return { valid: false, error: `File extension ${extension} is not allowed` };
  }

  return { valid: true };
}

// Helper to generate thumbnail for images
async function generateImageThumbnail(buffer: Buffer, outputPath: string): Promise<void> {
  await sharp(buffer)
    .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}

// Helper to generate thumbnail for PDFs
async function generatePDFThumbnail(buffer: Buffer, outputPath: string): Promise<void> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    
    if (pages.length === 0) {
      return;
    }

    // For now, we'll skip PDF thumbnail generation as it requires more complex setup
    // In production, you'd use pdf-poppler or similar tool
    // Create a placeholder thumbnail instead
    await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 240, g: 240, b: 240 }
      }
    })
    .jpeg()
    .toFile(outputPath);
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    // Create a placeholder on error
    await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 240, g: 240, b: 240 }
      }
    })
    .jpeg()
    .toFile(outputPath);
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderId = formData.get('folderId') as string | null;
    const tagNames = formData.get('tags') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFileType(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Verify folder ownership if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Generate unique filename
    const fileExtension = file.name.match(/\.[^.]+$/)?.[0] || '';
    const uniqueId = nanoid(10);
    const filename = `${uniqueId}${fileExtension}`;

    // Create directory structure: uploads/{userId}/{folderId}/
    const userDir = join(UPLOAD_DIR, session.user.id);
    const folderDir = folderId ? join(userDir, folderId) : userDir;
    
    if (!existsSync(folderDir)) {
      await mkdir(folderDir, { recursive: true });
    }

    // File path
    const filePath = join(folderDir, filename);
    const relativeFilePath = join(session.user.id, folderId || '', filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate thumbnail
    let thumbnailPath: string | null = null;
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (isImage || isPDF) {
      const thumbnailFilename = `thumb_${filename}.jpg`;
      const thumbnailFullPath = join(folderDir, thumbnailFilename);
      const relativeThumbnailPath = join(session.user.id, folderId || '', thumbnailFilename);

      try {
        if (isImage) {
          await generateImageThumbnail(buffer, thumbnailFullPath);
        } else if (isPDF) {
          await generatePDFThumbnail(buffer, thumbnailFullPath);
        }
        thumbnailPath = relativeThumbnailPath;
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        // Continue without thumbnail
      }
    }

    // Parse tags
    let tags: string[] = [];
    if (tagNames) {
      try {
        tags = JSON.parse(tagNames);
      } catch {
        tags = tagNames.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        filename,
        originalName: file.name,
        filePath: relativeFilePath,
        size: file.size,
        mimeType: file.type,
        thumbnailPath,
        folderId: folderId || null,
        userId: session.user.id,
        tags: {
          create: await Promise.all(
            tags.map(async (tagName) => {
              // Find or create tag
              const tag = await prisma.tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName },
              });
              return {
                tag: {
                  connect: { id: tag.id },
                },
              };
            })
          ),
        },
      },
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
    });

    // Format response
    const formattedDocument = {
      ...document,
      tags: document.tags.map((dt) => dt.tag),
    };

    return NextResponse.json(
      { document: formattedDocument },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
