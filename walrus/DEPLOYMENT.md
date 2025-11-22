# Deployment Guide: Simple Recipient Access Policy

## Quick Start

1. **Install Sui CLI** (if not already installed):
   ```bash
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
   ```

2. **Set up Sui wallet** (if not already done):
   ```bash
   sui client active-address
   # If no address, create one:
   sui client new-address ed25519
   ```

3. **Get testnet SUI tokens**:
   - Visit: https://docs.sui.io/guides/developer/getting-started/get-coins
   - Or use: `sui client faucet`

4. **Deploy the Move module**:
   ```bash
   cd move/seal_access_policy
   sui move build
   sui client publish --gas-budget 100000000
   ```

5. **Copy the Package ID** from the output and update `src/lib/seal/client.ts`:
   ```typescript
   PACKAGE_ID: "YOUR_PACKAGE_ID_HERE",
   MODULE: "simple_recipient",
   ```

## Detailed Steps

### Step 1: Navigate to Move Package
```bash
cd move/seal_access_policy
```

### Step 2: Build the Package
```bash
sui move build
```

Expected output:
```
UPDATING GIT DEPENDENCY https://github.com/MystenLabs/sui.git
INCLUDING DEPENDENCY Sui
BUILDING seal_access_policy
Successfully built package
```

### Step 3: Publish to Testnet
```bash
sui client publish --gas-budget 100000000 --json
```

The output will include a `packageId` field. Copy this value.

Example output:
```json
{
  "packageId": "0x1234567890abcdef...",
  "transactionDigest": "...",
  ...
}
```

### Step 4: Update Configuration

Update `src/lib/seal/client.ts`:

```typescript
export const SEAL_CONFIG = {
    PACKAGE_ID: "0x1234567890abcdef...", // Your deployed package ID
    MODULE: "simple_recipient",
    KEY_SERVERS: [
        { objectId: "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", weight: 1 },
        { objectId: "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8", weight: 1 },
    ],
};
```

Also update `src/app/page.tsx`:

```typescript
const SEAL_PACKAGE_ID = "0x1234567890abcdef..."; // Your deployed package ID
const SEAL_MODULE = "simple_recipient";
```

### Step 5: Verify Deployment

Visit Sui Explorer and search for your package ID:
- Testnet: https://suiexplorer.com/?network=testnet

You should see your published package with the `simple_recipient` module.

## Troubleshooting

### "Insufficient gas" error
- Get more testnet SUI: `sui client faucet`
- Increase gas budget: `--gas-budget 200000000`

### "Package not found" after deployment
- Wait a few seconds for the transaction to finalize
- Check the transaction digest on Sui Explorer

### Build errors
- Ensure you're using the correct Sui framework version
- Check that `Move.toml` has the correct dependencies

## Next Steps

After deployment:
1. Update the package IDs in your code
2. Test encryption/decryption
3. Verify that only the recipient can decrypt files

