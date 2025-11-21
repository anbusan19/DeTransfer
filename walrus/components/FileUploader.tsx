'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  blobId?: string;
}

export function FileUploader({ onUploadComplete }: { onUploadComplete?: () => void }) {
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
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Walrus
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { blobId } = await uploadResponse.json();

      // Store metadata
      const metadataResponse = await fetch('/api/store-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          blobId,
        }),
      });

      if (!metadataResponse.ok) {
        const error = await metadataResponse.json();
        throw new Error(error.error || 'Metadata storage failed');
      }

      // Success!
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'success' as const, blobId }
            : f
        )
      );

      onUploadComplete?.();
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <label className="cursor-pointer">
          <span className="text-blue-600 font-medium hover:text-blue-700">
            Click to select a file
          </span>
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        <p className="text-sm text-gray-500 mt-2">Any file type supported (max 100MB)</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-lg">Uploads</h3>
          {files.map(uploadFile => (
            <div
              key={uploadFile.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
                  )}
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{uploadFile.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(uploadFile.id)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {uploadFile.status === 'error' && (
                <p className="text-sm text-red-600 mt-2">{uploadFile.error}</p>
              )}

              {uploadFile.status === 'success' && uploadFile.blobId && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">✓ Uploaded to Walrus!</p>
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
