import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

/**
 * Storage service abstraction. Local-disk implementation for development;
 * swap for an S3 implementation in production without touching call sites.
 */
export interface StorageService {
  save(file: File, opts?: { folder?: string }): Promise<StoredFile>;
  /** Persists raw bytes (e.g. a generated PDF) without upload validation. */
  saveBytes(
    bytes: Uint8Array,
    opts: { folder?: string; fileName: string; ext?: string; contentType?: string },
  ): Promise<StoredFile>;
}

export type StoredFile = {
  url: string; // served via /api/files/... route
  key: string; // storage key (relative path)
  fileName: string;
  size: number;
  contentType: string;
};

const MAX_BYTES = 8 * 1024 * 1024; // 8MB pre-compression cap
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const ALLOWED_TYPES = [...IMAGE_TYPES, "application/pdf"];

function storageRoot() {
  const dir = process.env.STORAGE_DIR || "./storage/uploads";
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
}

class LocalStorageService implements StorageService {
  async save(file: File, opts?: { folder?: string }): Promise<StoredFile> {
    if (!file || file.size === 0) {
      throw new Error("No file provided.");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("File is too large. Maximum size is 8MB.");
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Unsupported file type. Upload a JPG, PNG, WEBP, or PDF.");
    }

    const folder = (opts?.folder || "misc").replace(/[^a-z0-9/_-]/gi, "");
    const buffer = Buffer.from(await file.arrayBuffer());

    let outBuffer = buffer;
    let ext = extFromType(file.type);
    let contentType = file.type;

    // Compress images on upload (low-bandwidth requirement). PDFs pass through.
    if (IMAGE_TYPES.includes(file.type)) {
      outBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
      ext = "webp";
      contentType = "image/webp";
    }

    const key = path.join(folder, `${randomUUID()}.${ext}`);
    const absPath = path.join(storageRoot(), key);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, outBuffer);

    return {
      url: `/api/files/${key.split(path.sep).join("/")}`,
      key,
      fileName: file.name,
      size: outBuffer.length,
      contentType,
    };
  }

  async saveBytes(
    bytes: Uint8Array,
    opts: { folder?: string; fileName: string; ext?: string; contentType?: string },
  ): Promise<StoredFile> {
    const folder = (opts.folder || "generated").replace(/[^a-z0-9/_-]/gi, "");
    const ext = opts.ext || "pdf";
    const key = path.join(folder, `${randomUUID()}.${ext}`);
    const absPath = path.join(storageRoot(), key);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, bytes);
    return {
      url: `/api/files/${key.split(path.sep).join("/")}`,
      key,
      fileName: opts.fileName,
      size: bytes.length,
      contentType: opts.contentType || "application/pdf",
    };
  }
}

function extFromType(type: string): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

export const storage: StorageService = new LocalStorageService();
export { storageRoot };
