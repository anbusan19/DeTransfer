"use client";

import { sealClient, SEAL_CONFIG } from "./client";

export interface EncryptOptions {
    data: Uint8Array;
    recipientAddress: string;
}

export interface EncryptResult {
    encryptedObject: Uint8Array;
}

/**
 * Encrypt file data for a specific recipient using Seal SDK
 * 
 * @param options - Encryption options including data and recipient address
 * @returns Encrypted data object
 */
export async function encryptFile(options: EncryptOptions): Promise<EncryptResult> {
    // @ts-ignore - Suppress ArrayBuffer/SharedArrayBuffer mismatch
    const { encryptedObject } = await sealClient.encrypt({
        packageId: SEAL_CONFIG.PACKAGE_ID,
        id: options.recipientAddress,
        threshold: 1, // Minimum 1 key server needed
        data: options.data,
    });

    return { encryptedObject };
}
