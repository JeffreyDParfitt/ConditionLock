export function isCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.crypto?.subtle;
}

export async function sha256Blob(blob: Blob): Promise<string> {
  if (!isCryptoAvailable()) throw new Error('Web Crypto API not available in this browser.');
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
  return bufferToHex(hashBuffer);
}

export async function sha256String(str: string): Promise<string> {
  if (!isCryptoAvailable()) throw new Error('Web Crypto API not available in this browser.');
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function safeName(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').slice(0, 40);
}

export function archiveFileName(packetTitle: string, suffix: string, ext: string): string {
  const d = new Date().toISOString().split('T')[0];
  return `ProofPacket_${safeName(packetTitle)}_${d}_${suffix}.${ext}`;
}
