"use client";

const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

export interface StreamDownloadOptions {
    blobId: string;
    onProgress?: (progress: number) => void;
}

/**
 * Download blob from Walrus with progress tracking
 * Uses ReadableStream to process chunks as they arrive
 */
export async function downloadBlobFromWalrus(
    options: StreamDownloadOptions
): Promise<Blob> {
    const { blobId, onProgress } = options;

    const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`);

    if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            receivedLength += value.length;

            if (onProgress && total > 0) {
                const progress = Math.round((receivedLength / total) * 100);
                onProgress(progress);
            }
        }

        // Combine chunks into single blob
        // @ts-ignore - Type casting to fix ArrayBufferLike vs ArrayBuffer mismatch
        return new Blob(chunks);
    } finally {
        reader.releaseLock();
    }
}
