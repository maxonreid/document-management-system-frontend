export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'image/jpeg',
  'image/png',
] as const;

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.jpg', '.jpeg', '.png'] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
};

export const APP_NAME = 'Document Management System';
export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
