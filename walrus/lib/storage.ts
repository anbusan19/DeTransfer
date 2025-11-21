// Shared file storage (in-memory for demo)
// In production, you could store this in Walrus or a database

interface FileRecord {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  blobId: string;
  uploadedAt: string;
}

export const filesStore: FileRecord[] = [];
