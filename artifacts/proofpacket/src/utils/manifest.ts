import JSZip from 'jszip';
import { sha256Blob, sha256String, archiveFileName, safeName } from './crypto';
import type { Packet, PhotoItem } from '../types';

export interface ManifestPhotoEntry {
  id: string;
  fileName: string;
  archiveFileName: string;
  mimeType: string;
  fileSize: number;
  sha256: string;
  caption: string;
  category: string;
  phase: string;
  dateTaken: string;
  checklistItemLabel?: string;
  notes?: string;
}

export interface VerificationManifest {
  manifestVersion: '1.0';
  appName: 'ProofPacket';
  generatedAt: string;
  packetId: string;
  packetTitle: string;
  packetType: string;
  packetRef: string;
  location: string;
  startDate: string;
  endDate: string;
  phase: string;
  exportedBy: string;
  totalPhotos: number;
  photos: ManifestPhotoEntry[];
  manifestHash?: string;
}

export async function buildManifest(
  packet: Packet,
  photos: PhotoItem[],
  exportedBy: string
): Promise<{ manifest: VerificationManifest; entries: ManifestPhotoEntry[] }> {
  const entries: ManifestPhotoEntry[] = await Promise.all(
    photos.map(async (p) => {
      const hash = p.originalBlob instanceof Blob ? await sha256Blob(p.originalBlob) : '';
      const ext = p.mimeType?.split('/')[1] || 'jpg';
      const aName = `${safeName(packet.title)}_${safeName(p.category || 'photo')}_${safeName(p.phase)}_${p.id.slice(0, 8)}.${ext}`;
      return {
        id: p.id,
        fileName: p.fileName || aName,
        archiveFileName: aName,
        mimeType: p.mimeType || 'image/jpeg',
        fileSize: p.fileSize || 0,
        sha256: hash,
        caption: p.caption || '',
        category: p.category || '',
        phase: p.phase || '',
        dateTaken: p.dateTaken || p.createdAt || '',
        notes: '',
      };
    })
  );

  const manifest: VerificationManifest = {
    manifestVersion: '1.0',
    appName: 'ProofPacket',
    generatedAt: new Date().toISOString(),
    packetId: packet.id,
    packetTitle: packet.title,
    packetType: packet.type,
    packetRef: packet.referenceNumber || '',
    location: packet.location || '',
    startDate: packet.startDate || '',
    endDate: packet.endDate || '',
    phase: packet.phase || '',
    exportedBy,
    totalPhotos: photos.length,
    photos: entries,
  };

  // Self-hash the manifest (without manifestHash field)
  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestHash = await sha256String(manifestJson);
  manifest.manifestHash = manifestHash;

  return { manifest, entries };
}

export async function exportVerifiedPacket(
  packet: Packet,
  photos: PhotoItem[],
  exportedBy: string,
  pdfBlob?: Blob
): Promise<void> {
  const { manifest, entries } = await buildManifest(packet, photos, exportedBy);
  const manifestJson = JSON.stringify(manifest, null, 2);
  const title = packet.title;
  const d = new Date().toISOString().split('T')[0];

  // Download manifest JSON
  downloadBlob(
    new Blob([manifestJson], { type: 'application/json' }),
    `ProofPacket_${safeName(title)}_${d}_Manifest.json`
  );

  // Download summary TXT
  const summary = buildSummaryText(manifest);
  downloadBlob(
    new Blob([summary], { type: 'text/plain' }),
    `ProofPacket_${safeName(title)}_${d}_Summary.txt`
  );

  // Download PDF if provided
  if (pdfBlob) {
    downloadBlob(pdfBlob, `ProofPacket_${safeName(title)}_${d}_Report.pdf`);
  }
}

export async function exportFullArchive(
  packet: Packet,
  photos: PhotoItem[],
  exportedBy: string,
  pdfBlob?: Blob
): Promise<void> {
  const zip = new JSZip();
  const { manifest, entries } = await buildManifest(packet, photos, exportedBy);
  const d = new Date().toISOString().split('T')[0];

  // packet-data.json
  const packetJson = JSON.stringify({ ...packet, _exportNote: 'ProofPacket Archive v1' }, null, 2);
  const packetHash = await sha256String(packetJson);
  zip.file('packet-data.json', packetJson);

  // verification-manifest.json
  const manifestJson = JSON.stringify(manifest, null, 2);
  zip.file('verification-manifest.json', manifestJson);

  // verification-summary.txt
  zip.file('verification-summary.txt', buildSummaryText(manifest));

  // PDF
  let pdfHash = '';
  if (pdfBlob) {
    pdfHash = await sha256Blob(pdfBlob);
    zip.file(`ProofPacket_${safeName(packet.title)}_${d}_Report.pdf`, pdfBlob);
  }

  // Photos
  const photosFolder = zip.folder('photos/originals')!;
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const entry = entries[i];
    if (photo.originalBlob instanceof Blob) {
      photosFolder.file(entry.archiveFileName, photo.originalBlob);
    }
  }

  // Signatures
  if (packet.signatures?.length) {
    const sigFolder = zip.folder('signatures')!;
    for (const sig of packet.signatures) {
      if (sig.signatureData?.startsWith('data:')) {
        const base64 = sig.signatureData.split(',')[1];
        sigFolder.file(`signature_${safeName(sig.signerName)}.png`, base64, { base64: true });
      }
    }
  }

  // checksums.txt
  const checksums = [
    `packet-data.json  ${packetHash}`,
    `verification-manifest.json  ${manifest.manifestHash || ''}`,
    pdfHash ? `ProofPacket_Report.pdf  ${pdfHash}` : null,
    ...entries.map(e => `photos/originals/${e.archiveFileName}  ${e.sha256}`),
  ].filter(Boolean).join('\n');
  zip.file('checksums.txt', checksums);

  // README.txt
  zip.file('README.txt', buildReadme(packet, photos.length));

  // DISCLAIMERS.txt
  zip.file('DISCLAIMERS.txt', DISCLAIMERS);

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  downloadBlob(zipBlob, archiveFileName(packet.title, 'Archive', 'zip'));
}

export async function exportPhotosZip(packet: Packet, photos: PhotoItem[]): Promise<void> {
  const zip = new JSZip();
  const photosFolder = zip.folder('photos')!;
  const metadata: any[] = [];

  for (const photo of photos) {
    if (!(photo.originalBlob instanceof Blob)) continue;
    const ext = photo.mimeType?.split('/')[1] || 'jpg';
    const name = `${safeName(packet.title)}_${safeName(photo.category || 'photo')}_${photo.id.slice(0, 8)}.${ext}`;
    const hash = await sha256Blob(photo.originalBlob);
    photosFolder.file(name, photo.originalBlob);
    metadata.push({ id: photo.id, archiveFileName: name, sha256: hash, caption: photo.caption, category: photo.category, phase: photo.phase, dateTaken: photo.dateTaken });
  }

  zip.file('photo-metadata.json', JSON.stringify(metadata, null, 2));
  zip.file('photo-hashes.txt', metadata.map(m => `${m.archiveFileName}  ${m.sha256}`).join('\n'));

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  downloadBlob(zipBlob, archiveFileName(packet.title, 'Photos', 'zip'));
}

export async function importArchive(file: File): Promise<{
  packet: Packet;
  photos: { entry: ManifestPhotoEntry; blob: Blob | null }[];
  manifest: VerificationManifest | null;
}> {
  const zip = await JSZip.loadAsync(file);

  // Read packet data
  const packetFile = zip.file('packet-data.json');
  if (!packetFile) throw new Error('Archive is missing packet-data.json');
  const packetJson = await packetFile.async('string');
  const packet: Packet = JSON.parse(packetJson);

  // Read manifest
  let manifest: VerificationManifest | null = null;
  const manifestFile = zip.file('verification-manifest.json');
  if (manifestFile) {
    manifest = JSON.parse(await manifestFile.async('string'));
  }

  // Read photos
  const photos: { entry: ManifestPhotoEntry; blob: Blob | null }[] = [];
  if (manifest) {
    for (const entry of manifest.photos) {
      const photoFile = zip.file(`photos/originals/${entry.archiveFileName}`);
      let blob: Blob | null = null;
      if (photoFile) {
        const arrayBuffer = await photoFile.async('arraybuffer');
        blob = new Blob([arrayBuffer], { type: entry.mimeType });
      }
      photos.push({ entry, blob });
    }
  }

  return { packet, photos, manifest };
}

function buildSummaryText(manifest: VerificationManifest): string {
  const lines = [
    'ProofPacket Verification Summary',
    '=================================',
    `Packet Title:    ${manifest.packetTitle}`,
    `Packet Type:     ${manifest.packetType}`,
    `Packet ID:       ${manifest.packetId}`,
    `Location:        ${manifest.location}`,
    `Start Date:      ${manifest.startDate}`,
    `End Date:        ${manifest.endDate}`,
    `Phase:           ${manifest.phase}`,
    `Generated At:    ${manifest.generatedAt}`,
    `Exported By:     ${manifest.exportedBy}`,
    `Manifest Hash:   ${manifest.manifestHash || 'n/a'}`,
    `Total Photos:    ${manifest.totalPhotos}`,
    '',
    'Photos:',
    ...manifest.photos.map((p, i) =>
      `  [${i + 1}] ${p.archiveFileName}\n       SHA-256: ${p.sha256}\n       Caption: ${p.caption || 'none'}\n       Category: ${p.category}  Phase: ${p.phase}`
    ),
    '',
    HASH_DISCLAIMER,
  ];
  return lines.join('\n');
}

function buildReadme(packet: Packet, photoCount: number): string {
  return `ProofPacket Archive
===================
Packet: ${packet.title}
Type:   ${packet.type}
ID:     ${packet.id}
Date:   ${new Date().toISOString()}

Contents:
- packet-data.json          Full packet data (checklist, logs, signatures, notes)
- verification-manifest.json  Photo hash manifest for integrity verification
- verification-summary.txt  Human-readable summary
- checksums.txt             SHA-256 hashes for all archive files
- photos/originals/         ${photoCount} original-quality photo file(s)
- signatures/               Signature images (if any)
- README.txt                This file
- DISCLAIMERS.txt           Legal disclaimers

Restoring:
Open ProofPacket in your browser and use Import / Restore Archive to restore this packet
and original-quality photos from this archive file.

Use this archive if you want to move a packet off your phone, save it to a computer,
email it to yourself, or store it in iCloud Drive, Google Drive, Dropbox, USB, or an
external drive. You can import this archive back into ProofPacket later.
`;
}

const HASH_DISCLAIMER = `DISCLAIMER: Hash verification confirms whether the files being checked match the files
recorded in this ProofPacket manifest. It does not prove who took the photos, where they
were taken, whether the scene was staged, or whether the packet has legal evidentiary value.`;

const DISCLAIMERS = `ProofPacket Disclaimers
=======================

ARCHIVE DISCLAIMER:
ProofPacket archives are local user-controlled files. If you delete both the local packet
and all exported archives, ProofPacket cannot recover the data.

VERIFICATION DISCLAIMER:
${HASH_DISCLAIMER}

EXPORT DISCLAIMER:
Verified Packet export helps receivers check whether files match the exported manifest.
It does not create legal certification or replace professional advice.

STORAGE WARNING:
Original-quality photos can take up significant storage. Export a Full Packet Archive
before deleting local copies.
`;

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
