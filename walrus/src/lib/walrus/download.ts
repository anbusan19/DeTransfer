"use client";

import { downloadFromWalrus } from "./client";

/**
 * Download file from Walrus by blob ID using HTTP API
 */
export async function downloadFile(blobId: string): Promise<Blob> {
    return await downloadFromWalrus(blobId);
}

/**
 * Construct filename with proper extension based on MIME type
 */
export function constructFileName(baseName: string, mimeType: string, blobId: string): string {
    let downloadName = baseName || `walrus_file_${blobId.slice(0, 6)}`;

    if (!downloadName.includes(".")) {
        if (mimeType.includes("image/png")) downloadName += ".png";
        else if (mimeType.includes("image/jpeg")) downloadName += ".jpg";
        else if (mimeType.includes("pdf")) downloadName += ".pdf";
        else if (mimeType.includes("text/plain")) downloadName += ".txt";
        else if (mimeType.includes("json")) downloadName += ".json";
    }

    return downloadName;
}

/**
 * Trigger browser download for a blob
 */
export function triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
