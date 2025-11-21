'use client';

import { Download, Loader2, FileText } from 'lucide-react';
import { downloadFromWalrus } from '@/lib/walrus';
import { useState } from 'react';

interface FileRecord {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  blobId: string;
  uploadedAt: string;
}

export function FileList({ files }: { files: FileRecord[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadFile = async (file: FileRecord) => {
    setDownloadingId(file.id);
    try {
      const blob = await downloadFromWalrus(file.blobId);
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
    } finally {
      setDownloadingId(null);
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

  if (files.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-500" />
        <p className="text-gray-400 italic">No files uploaded yet.</p>
        <p className="text-sm text-gray-500 mt-1">Upload a file above to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4">
        {files.map(file => (
          <div
            key={file.id}
            className="glass rounded-xl p-4 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate text-white text-lg" title={file.filename}>
                  {file.filename}
                </h3>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <p className="text-gray-400">{formatFileSize(file.size)}</p>
                  <p className="text-gray-500">•</p>
                  <p className="text-gray-400">{formatDate(file.uploadedAt)}</p>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-2 truncate" title={file.blobId}>
                  {file.blobId}
                </p>
              </div>
              <button
                onClick={() => downloadFile(file)}
                disabled={downloadingId === file.id}
                className="btn-success text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingId === file.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
