"use client";

import { useState } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { FileText } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { FileList } from "./FileList";

interface FileRecord {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    blobId: string;
    uploadedAt: string;
}

export default function SecureFileVault() {
    const account = useCurrentAccount();
    const [files, setFiles] = useState<FileRecord[]>([]);

    const handleUploadComplete = (metadata: {
        blobId: string;
        name: string;
        mimeType: string;
        size: number;
    }) => {
        // Add the new file to the list
        const newFile: FileRecord = {
            id: Math.random().toString(36).substring(7),
            filename: metadata.name,
            mimeType: metadata.mimeType,
            size: metadata.size,
            blobId: metadata.blobId,
            uploadedAt: new Date().toISOString(),
        };
        setFiles(prev => [newFile, ...prev]);
    };

    if (!account) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="glass-strong rounded-2xl p-8 md:p-12 text-center animate-slide-up">
                    <div className="mb-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                            Connect Your Wallet
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Please connect your Sui Wallet to start uploading and downloading files securely on Walrus.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <ConnectButton className="btn-gradient px-8 py-3 rounded-xl font-semibold text-white shadow-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Wallet Info & Upload Section */}
            <div className="glass-strong rounded-2xl p-6 md:p-10 shadow-2xl animate-slide-up">
                {/* Wallet Info */}
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">File Vault</h2>
                        <p className="text-sm text-gray-400">
                            Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                        </p>
                    </div>
                    <ConnectButton className="btn-gradient px-6 py-2 rounded-lg font-semibold text-white text-sm" />
                </div>

                {/* Upload Section */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Upload Files to Walrus</h3>
                    <FileUploader onUploadComplete={handleUploadComplete} />
                </div>
            </div>

            {/* File List Section */}
            <div className="glass-strong rounded-2xl p-6 md:p-10 shadow-2xl animate-slide-up">
                <h3 className="text-lg font-semibold text-white mb-6">Your Files</h3>
                <FileList files={files} />
            </div>
        </div>
    );
}
