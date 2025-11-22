"use client";

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Simple Walrus HTTP API integration for testnet
const WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';
const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

export async function uploadToWalrus(
  file: File,
  onProgress?: (progress: number, timeRemaining: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const timeElapsed = (Date.now() - startTime) / 1000; // Seconds
        const uploadedBytes = event.loaded;
        const totalBytes = event.total;
        const speed = uploadedBytes / timeElapsed; // Bytes per second
        const remainingBytes = totalBytes - uploadedBytes;
        const secondsLeft = speed > 0 ? Math.ceil(remainingBytes / speed) : 0;
        const progress = Math.round((uploadedBytes / totalBytes) * 100);

        onProgress(progress, secondsLeft);
      }
    };

    xhr.open('PUT', `${WALRUS_PUBLISHER}/v1/blobs`);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          if (result.newlyCreated?.blobObject?.blobId) {
            resolve(result.newlyCreated.blobObject.blobId);
          } else if (result.alreadyCertified?.blobId) {
            resolve(result.alreadyCertified.blobId);
          } else {
            reject(new Error('No blob ID in response'));
          }
        } catch (e) {
          reject(new Error('Invalid JSON response from Walrus'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    // Send the file directly as the body
    xhr.send(file);
  });
}

export async function downloadFromWalrus(blobId: string): Promise<Blob> {
  try {
    // Download from Walrus aggregator (correct endpoint: /v1/blobs/{blobId})
    const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error downloading from Walrus:', error);
    throw error;
  }
}

export function extractBlobId(blobId: string): string {
  return blobId;
}

/**
 * Walrus client initialized with SUI testnet
 */
export const walrusClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
  // @ts-ignore – The Walrus SDK strictly requires this property to be present
  network: "testnet",
});
