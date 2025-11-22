"use client";

import React, { useState, useEffect } from "react";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSignPersonalMessage } from "@mysten/dapp-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, normalizeSuiAddress } from "@mysten/sui/utils";

import { SealClient, SessionKey } from "@mysten/seal";
import { UploadCloud, CheckCircle, Loader2, AlertCircle, FileText, Download, Lock, Unlock, Trash2, Share2, Copy, Search } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* SDK INITIALIZATION                                                         */
/* -------------------------------------------------------------------------- */
const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

// Seal Configuration – using simple_recipient access policy for recipient-only decryption
const SEAL_PACKAGE_ID = "0xd1d471dd362206f61194c711d9dfcd1f8fd2d3e44df102efc15fa07332996247";
const SEAL_MODULE = "simple_recipient";

const sealClient = new SealClient({
  suiClient: client,
  serverConfigs: [
    { objectId: "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", weight: 1 },
    { objectId: "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8", weight: 1 },
  ],
});

export default function Home() {
  // --- Hooks ---
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [status, setStatus] = useState("Idle");
  const [blobId, setBlobId] = useState("");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<"uploads" | "shared">("uploads");
  const [shareBlobId, setShareBlobId] = useState("");
  const [accessBlobId, setAccessBlobId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Reset helper
  const reset = () => {
    setFile(null);
    setBlobId("");
    setStatus("Idle");
    setCurrentStep(0);
    setError("");
    setShowHistory(false);
    setRecipientAddress("");
    setUploadProgress(0);
    setRemainingTime(0);
  };

  // Load user files from backend (files uploaded by user)
  const loadUserFiles = async () => {
    if (!account) return;
    try {
      const response = await fetch(`/api/files?wallet=${account.address}`);
      const data = await response.json();
      setUserFiles(data.files || []);
    } catch (e) {
      console.error("Failed to load files", e);
    }
  };

  // Load shared files (files shared with user as recipient)
  const loadSharedFiles = async () => {
    if (!account) return;
    try {
      const normalizedAddress = normalizeSuiAddress(account.address);
      const response = await fetch(`/api/files?recipient=${normalizedAddress}`);
      const data = await response.json();
      setSharedFiles(data.files || []);
    } catch (e) {
      console.error("Failed to load shared files", e);
    }
  };

  useEffect(() => {
    if (account && showHistory) {
      if (historyTab === "uploads") {
        loadUserFiles();
      } else {
        loadSharedFiles();
      }
    }
  }, [account, showHistory, historyTab]);

  // ----- Delete Handlers -----
  const handleDeleteFile = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      const res = await fetch(`/api/files?blobId=${id}`, { method: "DELETE" });
      if (res.ok) await loadUserFiles();
      else setError("Failed to delete file");
    } catch (e) {
      console.error(e);
      setError("Failed to delete file");
    }
  };

  const handleClearAllFiles = async () => {
    if (!account) return;
    if (!confirm("Clear all files for this wallet?")) return;
    try {
      const res = await fetch(`/api/files?wallet=${account.address}&deleteAll=true`, { method: "DELETE" });
      if (res.ok) await loadUserFiles();
      else setError("Failed to clear files");
    } catch (e) {
      console.error(e);
      setError("Failed to clear files");
    }
  };

  // ----- Upload / Encryption Flow -----
  const onStep1_EncryptAndUpload = async () => {
    if (!file || !account) return;
    if (!recipientAddress) { setError("Please enter a recipient wallet address."); return; }
    try {
      setStatus("Encrypting file...");
      setError("");

      // Encrypt file data
      const buffer = new Uint8Array(await file.arrayBuffer());
      // Normalize recipient address to ensure consistent format
      const normalizedRecipient = normalizeSuiAddress(recipientAddress);
      const { encryptedObject } = await sealClient.encrypt({
        packageId: SEAL_PACKAGE_ID,
        id: normalizedRecipient,
        threshold: 1,
        data: buffer,
      });

      setStatus("Uploading to Walrus...");

      // Create encrypted file for upload
      const encryptedFile = new File([encryptedObject], file.name, {
        type: file.type || "application/octet-stream"
      });

      // Upload directly to Walrus HTTP API
      const { uploadToWalrus } = await import('../lib/walrus/client');
      const newBlobId = await uploadToWalrus(encryptedFile, (progress, timeRemaining) => {
        setUploadProgress(progress);
        setRemainingTime(timeRemaining);
        if (progress === 100) {
          setStatus("Finalizing storage on Walrus network...");
        } else {
          setStatus(`Uploading: ${progress}% - ${timeRemaining}s remaining`);
        }
      });

      setBlobId(newBlobId);

      // Save to database
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account.address,
          blobId: newBlobId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          recipientAddress: normalizeSuiAddress(recipientAddress),
        }),
      });

      setCurrentStep(1);
      setStatus("Success! Encrypted file stored on Walrus.");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Upload failed.");
    }
  };

  // ----- Download Handler -----
  const handleDownload = async () => {
    if (!blobId) return;
    try {
      setIsDownloading(true);
      setStatus("Fetching file from Walrus...");

      // Download using HTTP API
      const { downloadFromWalrus } = await import('../lib/walrus/client');
      const encryptedBlob = await downloadFromWalrus(blobId);
      const encryptedBytes = new Uint8Array(await encryptedBlob.arrayBuffer());

      // Decrypt the file (assuming it's encrypted)
      if (!account) throw new Error("Please connect your wallet to decrypt this file.");

      setStatus("Creating session key...");
      // Normalize address for session key creation
      const normalizedAccountAddress = normalizeSuiAddress(account.address);
      const sessionKey = await SessionKey.create({
        address: normalizedAccountAddress,
        packageId: SEAL_PACKAGE_ID,
        ttlMin: 5,
        suiClient: client,
      });

      // ✅ CRITICAL: Sign the session key's personal message
      setStatus("Please sign the personal message in your wallet...");
      const { signature } = await signPersonalMessage({
        message: sessionKey.getPersonalMessage(),
      });
      sessionKey.setPersonalMessageSignature(signature);

      setStatus("Decrypting file...");

      // Get recipient address - fetch from database if not in state
      let decryptRecipientAddress = recipientAddress;
      if (!decryptRecipientAddress && blobId) {
        try {
          const fileResponse = await fetch(`/api/files?blobId=${blobId}`);
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            if (fileData.file?.recipientAddress) {
              decryptRecipientAddress = fileData.file.recipientAddress;
            }
          }
        } catch (e) {
          console.warn("Could not fetch recipient address from database", e);
        }
      }

      // Fallback to current account address if still not found
      decryptRecipientAddress = decryptRecipientAddress || account.address;
      if (!decryptRecipientAddress) {
        throw new Error("Recipient address is required for decryption. Please ensure the file was encrypted for your wallet address.");
      }

      // Normalize addresses for comparison
      const normalizedAccount = normalizeSuiAddress(account.address);
      const normalizedRecipient = normalizeSuiAddress(decryptRecipientAddress);

      // ✅ CRITICAL: Verify that the current user is the recipient
      // The bottled_message access policy only allows the recipient to decrypt
      if (normalizedAccount !== normalizedRecipient) {
        throw new Error(`Access denied: This file was encrypted for address ${normalizedRecipient}, but you are connected with ${normalizedAccount}. Only the recipient can decrypt this file.`);
      }

      const tx = new Transaction();
      // Set the sender to the recipient address (must match account.address)
      tx.setSender(normalizedAccount);
      tx.moveCall({
        target: `${SEAL_PACKAGE_ID}::${SEAL_MODULE}::seal_approve`,
        arguments: [tx.pure.vector("u8", fromHex(normalizedRecipient))],
      });

      // @ts-ignore
      const txBytes = await tx.build({ client, onlyTransactionKind: true });
      // @ts-ignore
      const decryptedBytes = await sealClient.decrypt({ data: encryptedBytes, sessionKey, txBytes });

      const decryptedArray = new Uint8Array(decryptedBytes);
      const blob = new Blob([decryptedArray], { type: file?.type || "application/octet-stream" });
      let downloadName = file?.name || `walrus_file_${blobId.slice(0, 6)}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("Download complete.");
    } catch (e: any) {
      console.error(e);
      setError("Download failed: " + (e.message || e.toString()));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">Walrus Uploader</h1>
            <p className="text-xs text-slate-500 mt-1">Testnet Storage + Seal Encryption</p>
          </div>
          <div className="flex items-center gap-3">
            {account && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                {showHistory ? 'Upload' : 'History'}
              </button>
            )}
            <ConnectButton />
          </div>
        </div>

        {/* Main Content */}
        {!account ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <div className="mx-auto w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
              <FileText className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Wallet Not Connected</p>
            <p className="text-xs text-slate-400 mt-2 px-8">
              Please connect your Sui Wallet (Testnet) to start uploading files.
            </p>
          </div>
        ) : showHistory ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
              <button
                onClick={() => {
                  setHistoryTab("uploads");
                  loadUserFiles();
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyTab === "uploads"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                My Uploads ({userFiles.length})
              </button>
              <button
                onClick={() => {
                  setHistoryTab("shared");
                  loadSharedFiles();
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyTab === "shared"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                Shared with Me ({sharedFiles.length})
              </button>
            </div>

            {/* Access Shared File by BlobId */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-blue-900">Access Shared File</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accessBlobId}
                  onChange={(e) => setAccessBlobId(e.target.value)}
                  placeholder="Enter blob ID (0x...)"
                  className="flex-1 text-sm border border-blue-200 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={async () => {
                    if (!accessBlobId) return;
                    try {
                      const response = await fetch(`/api/files?blobId=${accessBlobId}`);
                      if (response.ok) {
                        const data = await response.json();
                        const fileRecord = data.file;
                        if (fileRecord) {
                          setBlobId(fileRecord.blobId);
                          setFile({ name: fileRecord.fileName, type: fileRecord.fileType } as File);
                          setRecipientAddress(fileRecord.recipientAddress);
                          setAccessBlobId("");
                          await handleDownload();
                        } else {
                          setError("File not found");
                        }
                      } else {
                        setError("File not found");
                      }
                    } catch (e) {
                      setError("Failed to access file");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Access
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">Enter a blob ID to access a file shared with you</p>
            </div>

            {/* Files List */}
            {historyTab === "uploads" ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">My Uploads</h2>
                  {userFiles.length > 0 && (
                    <button
                      onClick={handleClearAllFiles}
                      className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All
                    </button>
                  )}
                </div>
                {userFiles.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No files uploaded yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {userFiles.map((fileRecord) => (
                      <div key={fileRecord.blobId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{fileRecord.fileName}</p>
                          <p className="text-xs text-slate-500">
                            To: {fileRecord.recipientAddress.slice(0, 8)}...{fileRecord.recipientAddress.slice(-6)} • {new Date(fileRecord.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShareBlobId(fileRecord.blobId);
                              navigator.clipboard.writeText(fileRecord.blobId);
                              setTimeout(() => setShareBlobId(""), 2000);
                            }}
                            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                            title="Copy blob ID to share"
                          >
                            {shareBlobId === fileRecord.blobId ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setBlobId(fileRecord.blobId);
                              setFile({ name: fileRecord.fileName, type: fileRecord.fileType } as File);
                              setRecipientAddress(fileRecord.recipientAddress || account?.address || "");
                              handleDownload();
                            }}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteFile(fileRecord.blobId)}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Shared with Me</h2>
                </div>
                {sharedFiles.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No files shared with you yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sharedFiles.map((fileRecord) => (
                      <div key={fileRecord.blobId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{fileRecord.fileName}</p>
                          <p className="text-xs text-slate-500">
                            From: {fileRecord.walletAddress.slice(0, 8)}...{fileRecord.walletAddress.slice(-6)} • {new Date(fileRecord.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setBlobId(fileRecord.blobId);
                              setFile({ name: fileRecord.fileName, type: fileRecord.fileType } as File);
                              setRecipientAddress(fileRecord.recipientAddress);
                              handleDownload();
                            }}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Select File</label>
              <input
                type="file"
                disabled={currentStep > 0}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg p-2"
              />
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Recipient Wallet Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  disabled={currentStep > 0}
                  placeholder="0x..."
                  className="block w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setRecipientAddress(account?.address || "")}
                  className="px-3 py-2 text-xs bg-slate-100 rounded-lg hover:bg-slate-200 whitespace-nowrap"
                  disabled={currentStep > 0}
                >
                  Use My Address
                </button>
              </div>
              <p className="text-xs text-slate-500">Only this address will be able to decrypt the file.</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            {file && !blobId && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={onStep1_EncryptAndUpload}
                  disabled={currentStep !== 0}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${currentStep > 0
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-blue-600 bg-blue-50 text-blue-700 hover:shadow-md"}`}
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <UploadCloud className="w-5 h-5" />
                    Encrypt & Upload to Walrus
                  </span>
                  {status.includes("Uploading") && <Loader2 className="animate-spin w-5 h-5" />}
                  {currentStep > 0 && <CheckCircle className="w-5 h-5" />}
                </button>

                {/* Progress Bar */}
                {status.includes("Uploading") && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{uploadProgress}% Uploaded</span>
                      <span>{remainingTime > 0 ? `~${remainingTime}s remaining` : 'Calculating...'}</span>
                    </div>
                  </div>
                )}

                {/* Finalizing Status */}
                {status.includes("Finalizing") && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing on Walrus network... this may take a moment.</span>
                  </div>
                )}
              </div>
            )}

            {/* Success View */}
            {blobId && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900">Upload Successful!</h3>
                  <p className="text-sm text-emerald-700">Your encrypted file has been permanently stored.</p>
                </div>
                <div className="bg-white p-3 rounded border border-emerald-200">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-slate-700">Blob ID (Share this with recipient):</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(blobId);
                        setShareBlobId(blobId);
                        setTimeout(() => setShareBlobId(""), 2000);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100"
                      title="Copy blob ID"
                    >
                      {shareBlobId === blobId ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-500 break-all select-all">{blobId}</p>
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Decrypt & Download
                  </button>
                  <button
                    onClick={reset}
                    className="text-sm font-medium text-emerald-700 bg-emerald-100 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    New Upload
                  </button>
                </div>
              </div>
            )}

            {/* Footer Status */}
            <div className="text-center border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Status</span>
              <p className="text-sm font-mono text-slate-600 mt-1">{status}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}