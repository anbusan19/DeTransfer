# File Upload System Documentation

## Overview

This project implements a decentralized file upload system using:
- **Seal SDK** - For encryption/decryption with programmable access control
- **Walrus** - For decentralized file storage on Sui blockchain
- **Next.js** - Frontend framework
- **SQLite** - Local metadata storage

---

## Table of Contents

1. [Seal SDK Integration](#seal-sdk-integration)
2. [Walrus Integration](#walrus-integration)
3. [Access Policy](#access-policy)
4. [Key Concepts](#key-concepts)
5. [Architecture](#architecture)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Seal SDK Integration

### Official Documentation
- **Getting Started**: https://seal-docs.wal.app/GettingStarted/
- **Developer Guide**: https://seal-docs.wal.app/Developer%20Guide/
- **Access Policy Examples**: https://seal-docs.wal.app/Developer%20Guide/Access%20Policy%20Example%20Patterns/
- **Security Best Practices**: https://seal-docs.wal.app/Developer%20Guide/Security%20Best%20Practices/

### Key Points to Remember

#### 1. **Encryption Flow**
```typescript
const { encryptedObject } = await sealClient.encrypt({
  packageId: SEAL_PACKAGE_ID,
  id: recipientAddress,  // The recipient's wallet address
  threshold: 1,          // Minimum key servers needed
  data: fileBuffer,      // File data as Uint8Array
});
```

**Important:**
- `id` parameter must be the recipient's wallet address (normalized)
- `threshold` determines how many key servers must approve (typically 1)
- Data must be `Uint8Array` format

#### 2. **Decryption Flow**
```typescript
// 1. Create session key
const sessionKey = await SessionKey.create({
  address: userAddress,
  packageId: SEAL_PACKAGE_ID,
  ttlMin: 5,  // Session TTL in minutes
  suiClient: client,
});

// 2. Sign personal message (REQUIRED!)
const { signature } = await signPersonalMessage({
  message: sessionKey.getPersonalMessage(),
});
sessionKey.setPersonalMessageSignature(signature);

// 3. Build authorization transaction
const tx = new Transaction();
tx.setSender(userAddress);
tx.moveCall({
  target: `${PACKAGE_ID}::${MODULE}::seal_approve`,
  arguments: [tx.pure.vector("u8", fromHex(recipientAddress))],
});
const txBytes = await tx.build({ client, onlyTransactionKind: true });

// 4. Decrypt
const decryptedBytes = await sealClient.decrypt({
  data: encryptedBytes,
  sessionKey,
  txBytes,
});
```

**Critical Points:**
- ✅ **ALWAYS sign the personal message** - Without this, decryption will fail
- ✅ **Set transaction sender** - Must match the user's wallet address
- ✅ **Use normalized addresses** - Ensure consistent address format
- ✅ **Verify recipient matches** - Only the intended recipient can decrypt

#### 3. **Key Servers**
- **Testnet**: Public key servers provided by Mysten Labs (no setup needed)
- **Mainnet**: Can use public servers or run your own
- **Configuration**: 
  ```typescript
  serverConfigs: [
    { objectId: "0x...", weight: 1 },
    { objectId: "0x...", weight: 1 },
  ]
  ```

**Remember:**
- Weight determines voting power (typically 1 per server)
- Threshold must be ≤ sum of weights
- Key servers are in "Open mode" on testnet (accept all packages)

#### 4. **Access Policies**
- **Purpose**: Define who can decrypt encrypted data
- **Implementation**: Move module with `seal_approve` function
- **Evaluation**: Key servers use `dry_run_transaction_block` to evaluate
- **Requirements**: 
  - Must be side-effect free (no state changes)
  - Must abort if access denied
  - First parameter must be `id: vector<u8>`

**Our Implementation:**
- Module: `simple_recipient`
- Logic: Only allows decryption if `tx_context::sender == id` (recipient address)

---

## Walrus Integration

### Official Documentation
- **Getting Started**: https://docs.wal.app/getting-started
- **Web API Usage**: https://docs.wal.app/usage/web-api.html
- **SDK Documentation**: https://sdk.mystenlabs.com/walrus

### Key Points to Remember

#### 1. **HTTP API Endpoints**

**Upload (Publisher):**
```
PUT https://publisher.walrus-testnet.walrus.space/v1/blobs
Content-Type: application/octet-stream
Body: File bytes (ArrayBuffer)
```

**Response:**
```json
{
  "newlyCreated": {
    "blobObject": {
      "blobId": "0x..."
    }
  }
}
```

**Download (Aggregator):**
```
GET https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blobId}
```

**Important:**
- Upload to **Publisher** endpoint
- Download from **Aggregator** endpoint
- `blobId` is permanent and immutable
- Files are stored permanently on-chain

#### 2. **Testnet Endpoints**

**Publishers:**
- `https://publisher.walrus-testnet.walrus.space`
- Many other public publishers available

**Aggregators:**
- `https://aggregator.walrus-testnet.walrus.space`
- Many other public aggregators available

**Remember:**
- Most publishers limit uploads to 10 MiB by default
- For larger files, run your own publisher or use CLI
- Aggregators fetch from multiple storage nodes

#### 3. **File Storage**
- **Permanent**: Files stored on Sui blockchain (immutable)
- **Decentralized**: Multiple storage nodes maintain copies
- **Cost**: Requires WAL tokens for uploads
- **Access**: Files accessible via `blobId` from any aggregator

#### 4. **Best Practices**
- ✅ Always store `blobId` for later retrieval
- ✅ Handle both `newlyCreated` and `alreadyCertified` responses
- ✅ Use proper Content-Type headers
- ✅ Implement retry logic for network errors

---

## Access Policy

### Our Implementation: `simple_recipient`

**Location**: `move/seal_access_policy/sources/simple_recipient.move`

**Package ID**: `0xd1d471dd362206f61194c711d9dfcd1f8fd2d3e44df102efc15fa07332996247`

**Module**: `simple_recipient`

#### How It Works

```move
public entry fun seal_approve(id: vector<u8>, ctx: &TxContext) {
    let sender = tx_context::sender(ctx);
    let sender_bytes = bcs::to_bytes(&sender);
    assert!(sender_bytes == id, 1);  // Abort if sender != recipient
}
```

**Logic:**
1. Gets transaction sender (wallet address of user trying to decrypt)
2. Converts sender to bytes using BCS encoding
3. Compares with `id` parameter (recipient address)
4. Aborts if they don't match (denies access)

**Key Points:**
- ✅ Simple and efficient - no on-chain objects needed
- ✅ Only recipient can decrypt (sender must match recipient)
- ✅ Side-effect free (no state changes)
- ✅ Works with Seal SDK's evaluation mechanism

#### Deploying Custom Access Policies

**Requirements:**
1. Move module with `seal_approve` function
2. Function signature: `seal_approve(id: vector<u8>, ctx: &TxContext)`
3. Must abort if access denied
4. Must be side-effect free

**Deployment Steps:**
```bash
cd move/seal_access_policy
sui move build
sui client publish --gas-budget 100000000
```

**Remember:**
- Use `edition = "2024"` in `Move.toml`
- Address placeholder: `"0x0"` (replaced during publish)
- Update package ID in config after deployment

---

## Key Concepts

### 1. **Address Normalization**
**Why**: Sui addresses can be in different formats (with/without 0x, different casing)

**Solution**: Always normalize addresses before comparison
```typescript
import { normalizeSuiAddress } from "@mysten/sui/utils";

const normalized = normalizeSuiAddress(address);
```

**Remember:**
- ✅ Normalize during encryption
- ✅ Normalize during decryption
- ✅ Normalize when comparing addresses
- ✅ Store normalized addresses in database

### 2. **Personal Message Signature**
**Why**: Seal SDK requires proof of wallet ownership

**Solution**: Sign the session key's personal message
```typescript
const { signature } = await signPersonalMessage({
  message: sessionKey.getPersonalMessage(),
});
sessionKey.setPersonalMessageSignature(signature);
```

**Critical:**
- ❌ **Without signature**: Decryption will fail with "Personal message signature is not set"
- ✅ **Always sign**: Required for every decryption attempt
- ✅ **User experience**: Wallet will prompt user to sign

### 3. **Transaction Building**
**Why**: Seal key servers evaluate transactions to check access

**Solution**: Build transaction with `onlyTransactionKind: true`
```typescript
const tx = new Transaction();
tx.setSender(userAddress);  // Important!
tx.moveCall({
  target: `${PACKAGE_ID}::${MODULE}::seal_approve`,
  arguments: [tx.pure.vector("u8", fromHex(recipientAddress))],
});
const txBytes = await tx.build({ client, onlyTransactionKind: true });
```

**Remember:**
- ✅ Set sender to user's wallet address
- ✅ Use `onlyTransactionKind: true` (evaluation only, not execution)
- ✅ Pass recipient address as `vector<u8>` (use `fromHex`)

### 4. **Recipient Address Storage**
**Why**: Need to know who can decrypt when downloading

**Solution**: Store recipient address in database
```typescript
// During upload
await fetch('/api/files', {
  method: 'POST',
  body: JSON.stringify({
    recipientAddress: normalizedRecipient,  // Store this!
    // ... other fields
  }),
});

// During download
const fileRecord = await fetch(`/api/files?blobId=${blobId}`);
const recipientAddress = fileRecord.recipientAddress;
```

**Remember:**
- ✅ Store recipient address when uploading
- ✅ Retrieve recipient address when downloading
- ✅ Verify user is recipient before attempting decryption

### 5. **Error Handling**

**Common Errors:**

1. **"Personal message signature is not set"**
   - **Cause**: Forgot to sign personal message
   - **Fix**: Call `signPersonalMessage()` and `setPersonalMessageSignature()`

2. **"User does not have access to one or more of the requested keys" (403)**
   - **Cause**: Access policy denied (sender != recipient)
   - **Fix**: Verify recipient address matches user's wallet address

3. **"Recipient address is required"**
   - **Cause**: Missing recipient address in database or state
   - **Fix**: Ensure recipient address is stored during upload

4. **Upload/Download failures**
   - **Cause**: Network issues, invalid endpoints, or missing WAL tokens
   - **Fix**: Check network, verify endpoints, ensure sufficient tokens

---

## Architecture

### File Structure
```
file-upload/
├── src/
│   ├── app/
│   │   ├── api/files/route.ts      # API endpoints (CRUD)
│   │   ├── lib/database.ts         # SQLite database
│   │   ├── page.tsx                # Main UI component
│   │   └── Providers.tsx           # Wallet/Query providers
│   └── lib/
│       ├── walrus/                 # Walrus utilities
│       │   ├── client.ts           # HTTP API client
│       │   ├── upload.ts           # Upload functions
│       │   └── download.ts         # Download functions
│       └── seal/                   # Seal utilities
│           ├── client.ts           # Seal client config
│           ├── encryption.ts       # Encryption functions
│           └── decryption.ts       # Decryption functions
├── move/
│   └── seal_access_policy/        # Access policy Move module
│       ├── Move.toml
│       └── sources/
│           └── simple_recipient.move
└── walrus-files.db                # SQLite database
```

### Data Flow

#### Upload Flow
1. User selects file and enters recipient address
2. File encrypted with Seal SDK (for recipient)
3. Encrypted file uploaded to Walrus (via HTTP API)
4. `blobId` received and stored in database
5. Metadata (including recipient address) saved to SQLite

#### Download Flow
1. User selects file from history
2. `blobId` used to download encrypted file from Walrus
3. Recipient address retrieved from database
4. Session key created and personal message signed
5. Authorization transaction built
6. Seal SDK decrypts file
7. Decrypted file downloaded to user's device

### Database Schema
```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletAddress TEXT NOT NULL,      -- Uploader's address
  blobId TEXT NOT NULL UNIQUE,      -- Walrus blob ID
  fileName TEXT NOT NULL,
  fileType TEXT NOT NULL,
  fileSize INTEGER NOT NULL,
  recipientAddress TEXT NOT NULL,    -- Who can decrypt
  uploadedAt TEXT NOT NULL
);
```

---

## Deployment

### Prerequisites
- Node.js 18+
- Sui CLI installed
- Sui wallet with testnet SUI tokens
- Next.js project set up

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Deploy Access Policy** (if not already deployed)
   ```bash
   cd move/seal_access_policy
   sui move build
   sui client publish --gas-budget 100000000
   ```

3. **Update Configuration**
   - Update `PACKAGE_ID` in `src/lib/seal/client.ts`
   - Update `PACKAGE_ID` in `src/app/page.tsx`
   - Set `MODULE` to `"simple_recipient"`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

---

## Troubleshooting

### Common Issues

#### 1. Build Errors
- **Move module**: Check `edition = "2024"` in `Move.toml`
- **Address resolution**: Use `"0x0"` as placeholder
- **Dependencies**: Ensure Sui framework dependency is correct

#### 2. Runtime Errors
- **403 Forbidden**: Check recipient address matches user's wallet
- **Signature errors**: Ensure personal message is signed
- **Network errors**: Verify Walrus endpoints are correct

#### 3. Configuration Issues
- **Package ID**: Must match deployed package
- **Module name**: Must match Move module name
- **Key servers**: Use correct testnet key server object IDs

### Debug Checklist

- [ ] Package ID is correct in both config files
- [ ] Module name matches deployed module
- [ ] Addresses are normalized before comparison
- [ ] Personal message is signed before decryption
- [ ] Transaction sender is set correctly
- [ ] Recipient address is stored and retrieved correctly
- [ ] Walrus endpoints are accessible
- [ ] Key servers are configured correctly

---

## Quick Reference

### Seal SDK
- **Docs**: https://seal-docs.wal.app/
- **NPM**: `@mysten/seal`
- **Key Servers**: Public testnet servers (no setup needed)
- **Access Policy**: Must have `seal_approve` function

### Walrus
- **Docs**: https://docs.wal.app/
- **Web API**: https://docs.wal.app/usage/web-api.html
- **Testnet Publisher**: `https://publisher.walrus-testnet.walrus.space`
- **Testnet Aggregator**: `https://aggregator.walrus-testnet.walrus.space`

### Sui
- **Docs**: https://docs.sui.io/
- **Testnet Explorer**: https://suiexplorer.com/?network=testnet
- **Faucet**: https://docs.sui.io/guides/developer/getting-started/get-coins

---

## Important Reminders

### ✅ Always Do
1. Normalize addresses before comparison
2. Sign personal message before decryption
3. Set transaction sender to user's address
4. Store recipient address in database
5. Verify recipient matches before decryption
6. Use `onlyTransactionKind: true` for access evaluation
7. Handle errors gracefully with user-friendly messages

### ❌ Never Do
1. Skip personal message signature
2. Compare addresses without normalization
3. Use different address formats in encryption/decryption
4. Forget to store recipient address
5. Execute transactions (use `onlyTransactionKind: true`)
6. Modify on-chain state in access policy
7. Hardcode package IDs (use configuration)

---

## Support

For issues or questions:
- **Seal SDK**: https://seal-docs.wal.app/
- **Walrus**: https://docs.wal.app/
- **Sui**: https://docs.sui.io/

---

**Last Updated**: After deployment of `simple_recipient` access policy
**Package ID**: `0xd1d471dd362206f61194c711d9dfcd1f8fd2d3e44df102efc15fa07332996247`
**Module**: `simple_recipient`

