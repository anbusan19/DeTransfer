'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadToWalrus } from '@/lib/walrus';

interface UploadFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  blobId?: string;
}

interface FileMetadata {
  blobId: string;
  name: string;
  mimeType: string;
  size: number;
}

export function FileUploader({
  onUploadComplete
}: {
  onUploadComplete?: (metadata: FileMetadata) => void
}) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFile: UploadFile = {
      file,
      id: Math.random().toString(36).substring(7),
      status: 'uploading',
    };

    setFiles(prev => [...prev, uploadFile]);

    try {
      // Upload directly to Walrus
      const blobId = await uploadToWalrus(file);

      // Success!
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'success' as const, blobId }
            : f
        )
      );

      // Notify parent with metadata
      onUploadComplete?.({
        blobId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'error' as const, error: errorMessage }
            : f
        )
      );
    }

    // Reset input
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-input"
        />
        <label
          htmlFor="file-upload-input"
          className="block w-full text-center py-6 px-4 border-2 border-dashed rounded-xl transition-all cursor-pointer border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-purple-400" />
          <span className="text-purple-300 font-semibold">Click to select a file</span>
          <p className="text-sm text-gray-400 mt-1">Any file type supported</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map(uploadFile => (
            <div
              key={uploadFile.id}
              className="glass rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 text-purple-400 animate-spin shrink-0" />
                  )}
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-white">{uploadFile.file.name}</p>
                    <p className="text-sm text-gray-400">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(uploadFile.id)}
                  className="text-gray-400 hover:text-gray-200 shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {uploadFile.status === 'error' && (
                <p className="text-sm text-red-400 mt-2">{uploadFile.error}</p>
              )}

              {uploadFile.status === 'success' && uploadFile.blobId && (
                <div className="mt-2">
                  <p className="text-sm text-green-400">✓ Uploaded to Walrus!</p>
                  <p className="text-xs text-gray-500 font-mono mt-1 truncate">
                    Blob ID: {uploadFile.blobId}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
