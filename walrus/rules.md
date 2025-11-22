# Rules for Using Walrus SDK and API

## General Principles
- **Strictly follow the official documentation** for the Walrus SDK and Web API. All implementations must align with the latest guidelines from the following sources:
  - [Walrus SDK Documentation](https://sdk.mystenlabs.com/walrus)
  - [Walrus Web API Usage](https://docs.wal.app/usage/web-api.html)
  - [Walrus General Docs](https://docs.wal.app/)
- Keep the codebase up‑to‑date with any breaking changes announced in the docs.
- Do not rely on undocumented behavior or internal implementation details.

## SDK Usage Rules
- Use the `@mysten/walrus` package exactly as described in the SDK docs.
- Initialise the SDK with a valid Sui wallet and network configuration.
- All transaction signing must be performed via the `useSignAndExecuteTransaction` hook from `@mysten/dapp-kit`.
- Follow the prescribed request/response shapes for `signAndExecuteTransaction`.
- Handle errors according to the SDK error handling guidelines (e.g., check for `options` misuse, WAL token balance errors, etc.).

## Web API Rules
- Interact with the Web API endpoints **only** as documented in the Web API usage guide.
- Use the correct HTTP methods, headers, and request bodies for each endpoint.
- Validate responses against the schema provided in the docs before processing.
- Respect rate limits and authentication requirements.

## Token & Balance Rules
- Ensure the wallet holds sufficient WAL tokens before attempting uploads.
- Use the token balance display component as shown in the docs.
- If the balance is insufficient, direct users to the testnet faucet link provided in the documentation.

## Upload & Download Rules
- For uploads, use `storeBlob` or `writeBlob` as recommended; avoid deprecated methods.
- Verify that the returned `blobId` is stored and used correctly for subsequent downloads.
- When downloading, preserve the original `Content-Type` and file extension as described.

## Testing & Verification
- Write automated tests that mirror the example usage in the docs.
- Manually verify the upload‑download round‑trip with real WAL tokens on testnet.
- Keep test coverage up to date with any changes in the documentation.

## Documentation Updates
- Whenever you add or modify functionality, update the corresponding section in the project's README to reflect the latest docs.
- Add comments linking back to the relevant documentation URLs for future reference.
