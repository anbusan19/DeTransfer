// Simple Walrus HTTP API integration for testnet
const WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';
const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

export async function uploadToWalrus(file: File): Promise<string> {
  try {
    // Convert File to Blob for upload
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload to Walrus publisher (correct endpoint: /v1/blobs)
    const response = await fetch(`${WALRUS_PUBLISHER}/v1/blobs`, {
      method: 'PUT',
      body: arrayBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    // Extract blob ID from response
    if (result.newlyCreated?.blobObject?.blobId) {
      return result.newlyCreated.blobObject.blobId;
    } else if (result.alreadyCertified?.blobId) {
      return result.alreadyCertified.blobId;
    }
    
    throw new Error('No blob ID in response');
  } catch (error) {
    console.error('Error uploading to Walrus:', error);
    throw error;
  }
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
