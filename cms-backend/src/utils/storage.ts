import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Safely load sharp. Returns the sharp module or null if unavailable.
 * This prevents the entire app from crashing if sharp's native binary
 * is missing or broken (common on Windows/CI without proper install).
 */
let sharpModule: typeof import('sharp') | null = null;
let sharpChecked = false;

async function getSharp(): Promise<typeof import('sharp') | null> {
  if (sharpChecked) return sharpModule;
  sharpChecked = true;
  try {
    // Dynamic import so the module-level load doesn't crash the app
    sharpModule = (await import('sharp')).default as unknown as typeof import('sharp');
    console.log('✅ sharp loaded successfully');
  } catch (e) {
    console.warn('⚠️ sharp is not available. Image dimension reading and WebP conversion will be skipped.', (e as Error).message);
    sharpModule = null;
  }
  return sharpModule;
}

/** Generate a safe upload file name */
export function buildUploadFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext).replace(/\s+/g, '-');
  const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, '');
  return `${uuidv4()}-${safeBase}${ext}`;
}

export function getFileType(mimeType: string): 'IMAGE' | 'PDF' | undefined {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType === 'application/pdf') return 'PDF';
  return undefined;
}

/**
 * Safely read image dimensions using sharp.
 * Returns { width: undefined, height: undefined } if sharp is unavailable
 * or if the image can't be read — never throws.
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number | undefined; height: number | undefined }> {
  try {
    const sharp = await getSharp();
    if (!sharp) {
      return { width: undefined, height: undefined };
    }
    // sharp default export is the function itself
    const sharpFn = typeof sharp === 'function' ? sharp : (sharp as any).default;
    if (typeof sharpFn !== 'function') {
      console.warn('⚠️ sharp module loaded but is not callable');
      return { width: undefined, height: undefined };
    }
    const metadata = await sharpFn(buffer).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch (e) {
    console.warn('⚠️ Failed to read image dimensions:', (e as Error).message);
    return { width: undefined, height: undefined };
  }
}

export async function saveBufferToUpload(
  buffer: Buffer,
  fileName: string,
  fileType: 'IMAGE' | 'PDF'
): Promise<string> {
  const uploadDir =
    fileType === 'IMAGE'
      ? path.resolve(process.cwd(), 'public', 'uploads', 'images')
      : path.resolve(process.cwd(), 'public', 'uploads', 'pdfs');
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);
  return fileType === 'IMAGE' ? `/uploads/images/${fileName}` : `/uploads/pdfs/${fileName}`;
}

/**
 * Convert an image buffer to WebP format using sharp.
 * Falls back to saving the original buffer as-is if sharp is unavailable.
 */
export async function convertImageBufferToWebp(
  buffer: Buffer,
  webpFileName: string
): Promise<string> {
  const webpDir = path.resolve(process.cwd(), 'public', 'uploads', 'webp');
  await fs.mkdir(webpDir, { recursive: true });
  const webpPath = path.join(webpDir, webpFileName);

  try {
    const sharp = await getSharp();
    if (sharp) {
      const sharpFn = typeof sharp === 'function' ? sharp : (sharp as any).default;
      if (typeof sharpFn === 'function') {
        const webpBuffer = await sharpFn(buffer).webp({ quality: 80 }).toBuffer();
        await fs.writeFile(webpPath, webpBuffer);
        return `/uploads/webp/${webpFileName}`;
      }
    }
  } catch (e) {
    console.warn('⚠️ WebP conversion failed, saving original buffer:', (e as Error).message);
  }

  // Fallback: write original buffer as-is (not actually WebP but avoids crash)
  await fs.writeFile(webpPath, buffer);
  return `/uploads/webp/${webpFileName}`;
}

export async function deleteMediaFiles(
  fileName: string,
  fileType: 'IMAGE' | 'PDF',
  webpUrl?: string
): Promise<void> {
  const baseDir = fileType === 'IMAGE' ? 'images' : 'pdfs';
  const filePath = path.resolve(process.cwd(), 'public', 'uploads', baseDir, fileName);
  try { await fs.unlink(filePath); } catch (e) {}
  if (fileType === 'IMAGE' && webpUrl) {
    const webpFileName = path.basename(webpUrl);
    const webpPath = path.resolve(process.cwd(), 'public', 'uploads', 'webp', webpFileName);
    try { await fs.unlink(webpPath); } catch (e) {}
  }
}
