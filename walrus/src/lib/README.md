# Library Structure

This directory contains modular utilities for Walrus and Seal SDK integrations.

## 📁 Directory Structure

```
src/lib/
├── walrus/           # Walrus SDK utilities
│   ├── client.ts     # Walrus client initialization
│   ├── upload.ts     # File upload operations
│   └── download.ts   # File download operations
│
├── seal/             # Seal SDK utilities
│   ├── client.ts     # Seal client initialization & config
│   ├── encryption.ts # File encryption operations
│   └── decryption.ts # File decryption operations
│
└── index.ts          # Main exports
```

## 🔷 Walrus Module

### `walrus/client.ts`
- **Purpose**: Initialize Walrus client with SUI testnet
- **Exports**: `walrusClient`

### `walrus/upload.ts`
- **Purpose**: Handle file upload flow to Walrus
- **Functions**:
  - `createUploadFlow()` - Create upload flow with encrypted content
  - `registerAndUpload()` - Register and upload files to Walrus
  - `certifyUpload()` - Certify uploaded files

### `walrus/download.ts`
- **Purpose**: Handle file download and metadata operations
- **Functions**:
  - `downloadFile()` - Download file from Walrus by blob ID
  - `getFileBytes()` - Extract bytes from Walrus file
  - `getFileMetadata()` - Extract metadata from file tags
  - `constructFileName()` - Build filename with proper extension
  - `triggerDownload()` - Trigger browser download

## 🔐 Seal Module

### `seal/client.ts`
- **Purpose**: Initialize Seal client and configuration
- **Exports**: 
  - `sealClient` - Seal client instance
  - `SEAL_CONFIG` - Package ID, module name, key servers

### `seal/encryption.ts`
- **Purpose**: File encryption using Seal SDK
- **Functions**:
  - `encryptFile()` - Encrypt file data for specific recipient

### `seal/decryption.ts`
- **Purpose**: File decryption using Seal SDK
- **Functions**:
  - `decryptFile()` - Decrypt file with session key and authorization

## 📝 Usage Examples

### Encrypting and Uploading

```typescript
import { encryptFile, createUploadFlow, registerAndUpload } from "@/lib";

// 1. Encrypt file
const { encryptedObject } = await encryptFile({
  data: fileBuffer,
  recipientAddress: "0x...",
});

// 2. Create upload flow
const flow = await createUploadFlow({
  encryptedContent: encryptedObject,
  fileName: "example.pdf",
  mimeType: "application/pdf",
  recipientAddress: "0x...",
});

// 3. Register and upload
await registerAndUpload(flow, ownerAddress, signAndExecute);
```

### Downloading and Decrypting

```typescript
import { downloadFile, getFileBytes, getFileMetadata, decryptFile } from "@/lib";

// 1. Download from Walrus
const walrusFile = await downloadFile(blobId);
const encryptedBytes = await getFileBytes(walrusFile);

// 2. Get metadata
const metadata = await getFileMetadata(walrusFile);

// 3. Decrypt if encrypted
if (metadata.isEncrypted) {
  const decrypted = await decryptFile({
    encryptedData: encryptedBytes,
    userAddress: currentAddress,
    recipientAddress: metadata.recipientAddress,
  });
}
```

## 🔧 Configuration

### Seal Configuration (in `seal/client.ts`)

```typescript
export const SEAL_CONFIG = {
  PACKAGE_ID: "0x3725...",  // Seal package on testnet
  MODULE: "bottled_message", // Access policy module
  KEY_SERVERS: [
    { objectId: "0x73d0...", weight: 1 },
    { objectId: "0xf5d1...", weight: 1 },
  ],
};
```

## 🎯 Benefits of This Structure

1. **Separation of Concerns**: Walrus and Seal logic are completely separated
2. **Reusability**: Functions can be easily reused across different components
3. **Testability**: Each module can be tested independently
4. **Maintainability**: Easy to locate and update specific functionality
5. **Type Safety**: TypeScript interfaces ensure type safety across modules
6. **Documentation**: Clear structure makes the codebase self-documenting

## 🚀 Adding New Features

To add new Walrus functionality:
1. Add function to appropriate file in `walrus/`
2. Export from `index.ts`

To add new Seal functionality:
1. Add function to appropriate file in `seal/`
2. Export from `index.ts`

Example:
```typescript
// In walrus/upload.ts
export async function deleteFile(blobId: string) {
  // Implementation
}

// In index.ts
export * from './walrus/upload';  // Already exported
```
