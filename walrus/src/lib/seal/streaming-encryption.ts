"use client";

import { sealClient, SEAL_CONFIG } from "./client";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export interface StreamEncryptOptions {
    file: File;
    recipientAddress: string;
    onProgress?: (progress: number) => void;
}

/**
 * Encrypt file in chunks to avoid memory issues
 * Note: Seal SDK doesn't support streaming natively,
 * so we need to read the full file but in a memory-efficient way
 */
export async function encryptFileStreaming(
    options: StreamEncryptOptions
): Promise<Blob> {
    const { file, recipientAddress, onProgress } = options;

    // For Seal SDK, we still need the full file data
    // But we can read it more efficiently using streams
    const chunks: Uint8Array[] = [];
    const reader = file.stream().getReader();
    let bytesRead = 0;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            bytesRead += value.length;

            if (onProgress) {
                onProgress(Math.round((bytesRead / file.size) * 50)); // 0-50% for reading
            }
        }

        // Combine chunks efficiently
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        if (onProgress) onProgress(60); // Reading complete

        // Encrypt using Seal SDK
        // @ts-ignore
        const { encryptedObject } = await sealClient.encrypt({
            packageId: SEAL_CONFIG.PACKAGE_ID,
            id: recipientAddress,
            threshold: 1,
            data: combined,
        });

        if (onProgress) onProgress(100);

        return new Blob([encryptedObject]);
    } finally {
        reader.releaseLock();
    }
}
