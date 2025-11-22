# DeTransfer - Decentralized Secure File Transfer

DeTransfer is a secure, decentralized file transfer application built on the Sui blockchain. It combines the power of **Walrus** for decentralized storage and **Seal** for end-to-end encryption, ensuring that your files are safe, permanent, and accessible only to the intended recipients.

## 🚀 Features

-   **Decentralized Storage**: Files are stored on [Walrus](https://www.walrus.xyz/), a decentralized storage network, ensuring high availability and censorship resistance.
-   **End-to-End Encryption**: All files are encrypted client-side using the [Seal SDK](https://github.com/MystenLabs/seal) before leaving your browser.
-   **Access Control**: Uses on-chain access policies. Only the specified recipient wallet address can decrypt and access the file.
-   **Metadata Management**: File metadata (names, sizes, blob IDs) is efficiently stored in a **Turso** database for quick retrieval and history tracking.
-   **Wallet Integration**: Seamless integration with Sui Wallet for authentication and transaction signing.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15, React 19, Tailwind CSS
-   **Blockchain**: Sui (Testnet)
-   **Storage**: Walrus
-   **Encryption**: @mysten/seal
-   **Database**: Turso (@libsql/client)
-   **Wallet Adapter**: @mysten/dapp-kit

## ⚙️ How It Works

### Upload Flow
1.  **Connect Wallet**: User connects their Sui Wallet.
2.  **Select File**: User selects a file and enters the recipient's wallet address.
3.  **Encrypt**: The file is encrypted locally using a session key derived from the wallet.
4.  **Upload**: The encrypted blob is uploaded to the Walrus network.
5.  **Save Metadata**: The file details (Blob ID, recipient, etc.) are saved to the Turso database.

### Download Flow
1.  **Access**: User views their "Shared with Me" list or enters a Blob ID.
2.  **Fetch**: The encrypted blob is downloaded from Walrus.
3.  **Decrypt**: The user signs a personal message to prove ownership of the recipient wallet. The Seal SDK verifies this and decrypts the file locally.
4.  **Download**: The decrypted file is saved to the user's device.

## 📦 Getting Started

### Prerequisites
-   Node.js (v18 or later)
-   Sui Wallet extension installed in your browser

### Environment Variables
Create a `.env` file in the root directory with your Turso credentials:

```env
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_DATABASE_TOKEN=your-auth-token
```

### Installation

```bash
npm install
# or
yarn install
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Documentation

For more detailed technical documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md).
