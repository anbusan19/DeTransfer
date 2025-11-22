"use client";

import { SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";
import { sealClient, SEAL_CONFIG } from "./client";
import { walrusClient } from "../walrus/client";

export interface DecryptOptions {
    encryptedData: Uint8Array;
    userAddress: string;
    recipientAddress: string;
}

/**
 * Create a session key for decryption
 */
async function createSessionKey(userAddress: string) {
    return await SessionKey.create({
        address: userAddress,
        packageId: SEAL_CONFIG.PACKAGE_ID,
        ttlMin: 5, // 5 minute TTL for the session
        suiClient: walrusClient,
    });
}

/**
 * Build authorization transaction for Seal decryption
 */
async function buildAuthTransaction(recipientAddress: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${SEAL_CONFIG.PACKAGE_ID}::${SEAL_CONFIG.MODULE}::seal_approve`,
        arguments: [
            tx.pure.vector("u8", fromHex(recipientAddress)),
        ]
    });

    // @ts-ignore - Suppress potential type mismatch
    return await tx.build({ client: walrusClient, onlyTransactionKind: true });
}

/**
 * Decrypt file data using Seal SDK
 * 
 * @param options - Decryption options including encrypted data and addresses
 * @returns Decrypted file data
 */
export async function decryptFile(options: DecryptOptions): Promise<Uint8Array> {
    // Generate session key
    const sessionKey = await createSessionKey(options.userAddress);

    // Build authorization transaction
    const txBytes = await buildAuthTransaction(options.recipientAddress);

    // Decrypt using Seal
    // @ts-ignore - Suppress ArrayBuffer/SharedArrayBuffer mismatch
    const decryptedBytes = await sealClient.decrypt({
        data: options.encryptedData,
        sessionKey,
        txBytes,
    });

    return decryptedBytes;
}
