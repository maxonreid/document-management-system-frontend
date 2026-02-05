'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadZoneProps {
  onFilesChange: (files: File[]) => void;
  files: FileWithPreview[];
  uploading?: boolean;
  uploadProgress?: { [key: string]: number };
  errors?: { [key: string]: string };
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadZone({
  onFilesChange,
  files,
  uploading = false,
  uploadProgress = {},
  errors = {},
}: UploadZoneProps) {
  const t = useTranslations('documents');

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => {
        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });
      onFilesChange([...files, ...newFiles]);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE,
      multiple: true,
      disabled: uploading,
    });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-[#F2B705] bg-[#F2B705]/10'
            : 'border-[#6B7280]/30 hover:border-[#0B2F4A]',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-[#6B7280] mb-4" />
        <p className="text-[#1A1A1A] font-medium mb-2">
          {isDragActive ? t('dragDrop') : t('dragDrop')}
        </p>
        <p className="text-sm text-[#6B7280] mb-1">{t('allowedFormats')}</p>
        <p className="text-sm text-[#6B7280]">{t('maxSize')}</p>
      </div>

      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{file.name}</p>
                <p className="text-sm text-red-700">
                  {errors.map((e) => e.message).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#1A1A1A]">
            Selected Files ({files.length})
          </p>
          {files.map((file, index) => {
            const progress = uploadProgress[file.name] || 0;
            const error = errors[file.name];
            const isComplete = progress === 100;

            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-white border border-[#6B7280]/20 rounded-md"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-10 w-10 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 bg-[#F5F7FA] rounded flex items-center justify-center flex-shrink-0">
                    <File className="h-5 w-5 text-[#6B7280]" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formatFileSize(file.size)}
                  </p>

                  {uploading && progress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-[#F5F7FA] rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all',
                            error
                              ? 'bg-red-600'
                              : isComplete
                                ? 'bg-green-600'
                                : 'bg-[#F2B705]'
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {error && (
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                      )}
                    </div>
                  )}
                </div>

                {uploading && progress > 0 ? (
                  isComplete && !error ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : error ? (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-[#0B2F4A] animate-spin flex-shrink-0" />
                  )
                ) : (
                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="p-1 hover:bg-[#F5F7FA] rounded flex-shrink-0 disabled:opacity-50"
                  >
                    <X className="h-4 w-4 text-[#6B7280]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
