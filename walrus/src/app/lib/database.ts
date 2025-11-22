import Database from 'better-sqlite3';
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
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'walrus-files.db');
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
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
    
    // Migrate existing table to add recipientAddress column if it doesn't exist
    try {
      const tableInfo = this.db.prepare("PRAGMA table_info(files)").all() as Array<{ name: string }>;
      const hasRecipientAddress = tableInfo.some(col => col.name === 'recipientAddress');
      
      if (!hasRecipientAddress) {
        this.db.exec(`ALTER TABLE files ADD COLUMN recipientAddress TEXT`);
        // Set default for existing records (use walletAddress as fallback)
        this.db.exec(`UPDATE files SET recipientAddress = walletAddress WHERE recipientAddress IS NULL`);
      }
    } catch (e) {
      // Migration failed, but table might already be correct
      console.warn('Migration warning:', e);
    }
  }

  saveFile(record: Omit<FileRecord, 'id'>) {
    const stmt = this.db.prepare(`
      INSERT INTO files (walletAddress, blobId, fileName, fileType, fileSize, recipientAddress, uploadedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(record.walletAddress, record.blobId, record.fileName, record.fileType, record.fileSize, record.recipientAddress, record.uploadedAt);
  }

  getFilesByWallet(walletAddress: string): FileRecord[] {
    const stmt = this.db.prepare('SELECT * FROM files WHERE walletAddress = ? ORDER BY uploadedAt DESC');
    return stmt.all(walletAddress) as FileRecord[];
  }

  getFilesByRecipient(recipientAddress: string): FileRecord[] {
    const stmt = this.db.prepare('SELECT * FROM files WHERE recipientAddress = ? ORDER BY uploadedAt DESC');
    return stmt.all(recipientAddress) as FileRecord[];
  }

  getFileByBlobId(blobId: string): FileRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM files WHERE blobId = ?');
    return stmt.get(blobId) as FileRecord | undefined;
  }

  deleteFile(blobId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM files WHERE blobId = ?');
    const result = stmt.run(blobId);
    return result.changes > 0;
  }

  deleteAllFilesByWallet(walletAddress: string): number {
    const stmt = this.db.prepare('DELETE FROM files WHERE walletAddress = ?');
    const result = stmt.run(walletAddress);
    return result.changes;
  }
}

export const fileDb = new FileDatabase();