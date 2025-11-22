"use client";

const WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';

export interface StreamUploadOptions {
    blob: Blob;
    onProgress?: (progress: number, timeRemaining: number) => void;
}

/**
 * Upload blob to Walrus with progress tracking
 * Uses XMLHttpRequest for better progress monitoring than fetch
 */
export async function uploadBlobToWalrus(
    options: StreamUploadOptions
): Promise<string> {
    const { blob, onProgress } = options;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const timeElapsed = (Date.now() - startTime) / 1000;
                const uploadedBytes = event.loaded;
                const totalBytes = event.total;
                const speed = uploadedBytes / timeElapsed;
                const remainingBytes = totalBytes - uploadedBytes;
                const secondsLeft = speed > 0 ? Math.ceil(remainingBytes / speed) : 0;
                const progress = Math.round((uploadedBytes / totalBytes) * 100);

                onProgress(progress, secondsLeft);
            }
        };

        xhr.open('PUT', `${WALRUS_PUBLISHER}/v1/blobs`);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');

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

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.ontimeout = () => reject(new Error('Upload timeout'));

        // Set timeout to 10 minutes for large files
        xhr.timeout = 10 * 60 * 1000;

        xhr.send(blob);
    });
}
