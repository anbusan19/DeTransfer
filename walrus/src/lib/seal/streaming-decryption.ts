"use client";

import { SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";
import { sealClient, SEAL_CONFIG } from "./client";
import { walrusClient } from "../walrus/client";

export interface StreamDecryptOptions {
    encryptedBlob: Blob;
    userAddress: string;
    recipientAddress: string;
    sessionKey: SessionKey;
    onProgress?: (progress: number) => void;
}

/**
 * Decrypt blob in memory-efficient way
 * Reads encrypted data in chunks, then decrypts
 */
export async function decryptBlobStreaming(
    options: StreamDecryptOptions
): Promise<Blob> {
    const { encryptedBlob, userAddress, recipientAddress, sessionKey, onProgress } = options;

    if (onProgress) onProgress(10);

    // Read encrypted data in chunks
    const chunks: Uint8Array[] = [];
    const reader = encryptedBlob.stream().getReader();
    let bytesRead = 0;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            bytesRead += value.length;

            if (onProgress) {
                onProgress(10 + Math.round((bytesRead / encryptedBlob.size) * 30)); // 10-40%
            }
        }

        // Combine chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const encryptedData = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            encryptedData.set(chunk, offset);
            offset += chunk.length;
        }

        if (onProgress) onProgress(50);

        // Build authorization transaction
        const tx = new Transaction();
        tx.setSender(userAddress);
        tx.moveCall({
            target: `${SEAL_CONFIG.PACKAGE_ID}::${SEAL_CONFIG.MODULE}::seal_approve`,
            arguments: [tx.pure.vector("u8", fromHex(recipientAddress))],
        });

        // @ts-ignore
        const txBytes = await tx.build({ client: walrusClient, onlyTransactionKind: true });

        if (onProgress) onProgress(60);

        // Decrypt
        // @ts-ignore
        const decryptedBytes = await sealClient.decrypt({
            data: encryptedData,
            sessionKey,
            txBytes,
        });

        if (onProgress) onProgress(100);

        // @ts-ignore - Type casting to fix ArrayBufferLike vs ArrayBuffer mismatch
        return new Blob([decryptedBytes]);
    } finally {
        reader.releaseLock();
    }
}
