import { createClient, Client } from '@libsql/client';
import path from 'path';

export interface FileRecord {
  id?: number;
  walletAddress: string;
  blobId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  recipientAddress: string;
  uploadedAt: string;
}

class FileDatabase {
  private client: Client;

  constructor() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_DATABASE_TOKEN;

    if (!url || !authToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_DATABASE_TOKEN must be defined in environment variables');
    }

    this.client = createClient({
      url,
      authToken,
    });

    this.init();
  }

  private async init() {
    try {
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          walletAddress TEXT NOT NULL,
          blobId TEXT NOT NULL UNIQUE,
          fileName TEXT NOT NULL,
          fileType TEXT NOT NULL,
          fileSize INTEGER NOT NULL,
          recipientAddress TEXT NOT NULL,
          uploadedAt TEXT NOT NULL
        )
      `);

      // Check if recipientAddress column exists
      const result = await this.client.execute("PRAGMA table_info(files)");
      const columns = result.rows;
      const hasRecipientAddress = columns.some(col => col.name === 'recipientAddress');

      if (!hasRecipientAddress) {
        await this.client.execute(`ALTER TABLE files ADD COLUMN recipientAddress TEXT`);
        await this.client.execute(`UPDATE files SET recipientAddress = walletAddress WHERE recipientAddress IS NULL`);
      }
    } catch (e) {
      console.error('Database initialization failed:', e);
    }
  }

  async saveFile(record: Omit<FileRecord, 'id'>) {
    await this.client.execute({
      sql: `
        INSERT INTO files (walletAddress, blobId, fileName, fileType, fileSize, recipientAddress, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        record.walletAddress,
        record.blobId,
        record.fileName,
        record.fileType,
        record.fileSize,
        record.recipientAddress,
        record.uploadedAt
      ]
    });
  }

  async getFilesByWallet(walletAddress: string): Promise<FileRecord[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM files WHERE walletAddress = ? ORDER BY uploadedAt DESC',
      args: [walletAddress]
    });
    return result.rows as unknown as FileRecord[];
  }

  async getFilesByRecipient(recipientAddress: string): Promise<FileRecord[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM files WHERE recipientAddress = ? ORDER BY uploadedAt DESC',
      args: [recipientAddress]
    });
    return result.rows as unknown as FileRecord[];
  }

  async getFileByBlobId(blobId: string): Promise<FileRecord | undefined> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM files WHERE blobId = ?',
      args: [blobId]
    });
    return result.rows[0] as unknown as FileRecord | undefined;
  }

  async deleteFile(blobId: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM files WHERE blobId = ?',
      args: [blobId]
    });
    return result.rowsAffected > 0;
  }

  async deleteAllFilesByWallet(walletAddress: string): Promise<number> {
    const result = await this.client.execute({
      sql: 'DELETE FROM files WHERE walletAddress = ?',
      args: [walletAddress]
    });
    return result.rowsAffected;
  }
}

export const fileDb = new FileDatabase();