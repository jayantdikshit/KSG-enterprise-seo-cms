import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

/** Stub WebP conversion – simply returns a placeholder URL (no actual conversion) */
export async function convertImageBufferToWebp(
  buffer: Buffer,
  webpFileName: string
): Promise<string> {
  // In environments without sharp, we skip conversion and use the original image URL.
  // Optionally, you could store the original image under a .webp name for consistency.
  const webpDir = path.resolve(process.cwd(), 'public', 'uploads', 'webp');
  await fs.mkdir(webpDir, { recursive: true });
  const webpPath = path.join(webpDir, webpFileName);
  // Write the original buffer as‑is (will be a non‑WebP image but avoids crash).
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
