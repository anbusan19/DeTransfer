"use client";

import { uploadToWalrus } from "./client";

export interface EncryptedFileData {
    encryptedContent: Uint8Array;
    fileName: string;
    mimeType: string;
    recipientAddress: string;
}

/**
 * Upload encrypted file directly to Walrus HTTP API
 */
export async function uploadEncryptedFile(fileData: EncryptedFileData): Promise<string> {
    // Ensure we have a proper Uint8Array with ArrayBuffer (not ArrayBufferLike)
    const content = new Uint8Array(fileData.encryptedContent);
    
    const encryptedFile = new File([content], fileData.fileName, {
        type: fileData.mimeType
    });

    return await uploadToWalrus(encryptedFile);
}
