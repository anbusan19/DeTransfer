'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface FileRecord {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  blobId: string;
  uploadedAt: string;
}

export function FileList({ refreshTrigger }: { refreshTrigger?: number }) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: FileRecord) => {
    try {
      const response = await fetch(`/api/download?blobId=${file.blobId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && files.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No files uploaded yet. Upload your first file above!
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Uploaded Files</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map(file => (
          <div
            key={file.id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-3">
              <h3 className="font-medium truncate" title={file.filename}>
                {file.filename}
              </h3>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(file.uploadedAt)}
              </p>
            </div>

            {file.mimeType.startsWith('image/') && (
              <div className="mb-3 rounded overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/download?blobId=${file.blobId}`}
                  alt={file.filename}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <button
              onClick={() => downloadFile(file)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>

            <p className="text-xs text-gray-400 font-mono mt-2 truncate" title={file.blobId}>
              {file.blobId}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
