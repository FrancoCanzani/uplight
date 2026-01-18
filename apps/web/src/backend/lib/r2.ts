export async function uploadLogo(
  r2: R2Bucket,
  key: string,
  file: ArrayBuffer,
  contentType: string,
): Promise<void> {
  await r2.put(key, file, {
    httpMetadata: {
      contentType,
    },
  });
}

export async function deleteLogo(r2: R2Bucket, key: string): Promise<void> {
  await r2.delete(key);
}

export async function getLogo(
  r2: R2Bucket,
  key: string,
): Promise<R2ObjectBody | null> {
  return await r2.get(key);
}

export function validateLogoFile(
  file: File,
): { valid: boolean; error?: string } {
  const maxSize = 2 * 1024 * 1024;
  const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml"];

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 2MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only PNG, JPG, and SVG files are allowed" };
  }

  return { valid: true };
}

export function generateLogoKey(
  teamId: number,
  pageId: number,
  extension: string,
): string {
  const timestamp = Date.now();
  return `${teamId}/${pageId}/${timestamp}.${extension}`;
}

export function getFileExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
  };
  return extensions[contentType] || "bin";
}
