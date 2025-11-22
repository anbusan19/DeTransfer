# Simple Recipient Access Policy for Seal

This Move module provides a simple access policy for Seal encryption that allows only the intended recipient to decrypt files.

## Module Overview

The `simple_recipient` module implements a `seal_approve` function that:
- Takes a recipient address (as bytes) and transaction context
- Verifies that the transaction sender matches the recipient address
- Aborts if they don't match (denying access)

## Deployment Instructions

### Prerequisites

1. Install Sui CLI: https://docs.sui.io/build/install
2. Set up a Sui wallet with testnet SUI tokens
3. Configure your Sui client for testnet

### Deploy to Testnet

1. Navigate to the Move package directory:
   ```bash
   cd move/seal_access_policy
   ```

2. Build the package:
   ```bash
   sui move build
   ```

3. Publish the package to testnet:
   ```bash
   sui client publish --gas-budget 100000000 --json
   ```

4. Extract the package ID from the output:
   ```bash
   sui client publish --gas-budget 100000000 --json | jq -r '.objectChanges[] | select(.type == "published") | .packageId'
   ```

5. Update the package ID in `src/lib/seal/client.ts`:
   ```typescript
   PACKAGE_ID: "YOUR_PACKAGE_ID_HERE",
   MODULE: "simple_recipient",
   ```

### Verify Deployment

After deployment, you can verify the package on Sui Explorer:
- Testnet: https://suiexplorer.com/?network=testnet
- Search for your package ID

## Usage

Once deployed, update your Seal configuration:

```typescript
export const SEAL_CONFIG = {
    PACKAGE_ID: "YOUR_DEPLOYED_PACKAGE_ID",
    MODULE: "simple_recipient",
    KEY_SERVERS: [
        { objectId: "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", weight: 1 },
        { objectId: "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8", weight: 1 },
    ],
};
```

## How It Works

1. **Encryption**: When you encrypt a file, you specify the recipient address as the `id` parameter
2. **Decryption**: When decrypting, Seal key servers call `seal_approve` with:
   - The recipient address (as bytes) - the `id` parameter
   - The transaction context (which includes the sender)
3. **Access Check**: The function verifies the sender matches the recipient ID
4. **Result**: If they match, decryption proceeds; if not, access is denied

## Security Notes

- This is a simple access policy suitable for recipient-only access
- The function is side-effect free (doesn't modify on-chain state)
- Seal key servers evaluate this using `dry_run_transaction_block`
- Only the exact recipient address can decrypt


