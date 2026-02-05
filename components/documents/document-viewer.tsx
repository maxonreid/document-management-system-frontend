'use client';

import { useState } from 'react';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  fileUrl: string;
  mimeType: string;
  fileName: string;
}

export function DocumentViewer({ fileUrl, mimeType, fileName }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  if (mimeType === 'application/pdf') {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-text-secondary">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-text-secondary">{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale((prev) => Math.min(prev + 0.2, 2.0))}
              disabled={scale >= 2.0}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-auto rounded-lg border border-border bg-white p-4">
          <PDFDocument
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="p-8 text-center">Loading PDF...</div>}
            error={<div className="p-8 text-center text-red-500">Failed to load PDF</div>}
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </PDFDocument>
        </div>
      </div>
    );
  }

  if (mimeType.startsWith('image/')) {
    return (
      <div className="flex justify-center">
        <img
          src={fileUrl}
          alt={fileName}
          className="max-h-[600px] rounded-lg border border-border object-contain"
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-8 text-center">
      <p className="text-text-secondary">
        Preview not available for this file type. Please download to view.
      </p>
    </div>
  );
}
