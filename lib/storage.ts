import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Storage service abstraction. Selected at module load: Cloudflare R2 when
 * R2_BUCKET is configured, otherwise local disk for development. Call sites
 * use the `storage` singleton and never depend on the concrete backend.
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
  url: string; // permanent public R2 URL, or /api/files/... for local disk
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

/** Build a `folder/uuid.ext` key, sanitising the folder segment. */
function buildKey(folder: string | undefined, fallback: string, ext: string) {
  const clean = (folder || fallback).replace(/[^a-z0-9/_-]/gi, "");
  return `${clean}/${randomUUID()}.${ext}`;
}

/**
 * Validate an uploaded file and compress images to WebP (low-bandwidth
 * requirement). PDFs pass through unchanged. Shared by both backends.
 */
async function processUpload(
  file: File,
): Promise<{ buffer: Buffer; ext: string; contentType: string }> {
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large. Maximum size is 8MB.");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type. Upload a JPG, PNG, WEBP, or PDF.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (IMAGE_TYPES.includes(file.type)) {
    const outBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    return { buffer: outBuffer, ext: "webp", contentType: "image/webp" };
  }

  return { buffer, ext: extFromType(file.type), contentType: file.type };
}

class LocalStorageService implements StorageService {
  async save(file: File, opts?: { folder?: string }): Promise<StoredFile> {
    const { buffer, ext, contentType } = await processUpload(file);
    const key = buildKey(opts?.folder, "misc", ext);
    await this.write(key, buffer);
    return {
      url: `/api/files/${key}`,
      key,
      fileName: file.name,
      size: buffer.length,
      contentType,
    };
  }

  async saveBytes(
    bytes: Uint8Array,
    opts: { folder?: string; fileName: string; ext?: string; contentType?: string },
  ): Promise<StoredFile> {
    const key = buildKey(opts.folder, "generated", opts.ext || "pdf");
    await this.write(key, bytes);
    return {
      url: `/api/files/${key}`,
      key,
      fileName: opts.fileName,
      size: bytes.length,
      contentType: opts.contentType || "application/pdf",
    };
  }

  private async write(key: string, data: Uint8Array) {
    const absPath = path.join(storageRoot(), key);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, data);
  }
}

class R2StorageService implements StorageService {
  private clientInstance: S3Client | null = null;
  private readonly bucket = requireEnv("R2_BUCKET");
  private readonly publicBase = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");

  private get client(): S3Client {
    if (!this.clientInstance) {
      const accountId = requireEnv("R2_ACCOUNT_ID");
      this.clientInstance = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
          secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
        },
      });
    }
    return this.clientInstance;
  }

  async save(file: File, opts?: { folder?: string }): Promise<StoredFile> {
    const { buffer, ext, contentType } = await processUpload(file);
    const key = buildKey(opts?.folder, "misc", ext);
    await this.put(key, buffer, contentType);
    return { url: this.publicUrl(key), key, fileName: file.name, size: buffer.length, contentType };
  }

  async saveBytes(
    bytes: Uint8Array,
    opts: { folder?: string; fileName: string; ext?: string; contentType?: string },
  ): Promise<StoredFile> {
    const key = buildKey(opts.folder, "generated", opts.ext || "pdf");
    const contentType = opts.contentType || "application/pdf";
    await this.put(key, bytes, contentType);
    return { url: this.publicUrl(key), key, fileName: opts.fileName, size: bytes.length, contentType };
  }

  private async put(key: string, body: Uint8Array, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        // Set so the CDN serves images/PDFs inline rather than as a download.
        ContentType: contentType,
      }),
    );
  }

  private publicUrl(key: string) {
    return `${this.publicBase}/${key}`;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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

export const storage: StorageService = process.env.R2_BUCKET
  ? new R2StorageService()
  : new LocalStorageService();
export { storageRoot };
