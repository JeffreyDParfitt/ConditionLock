import { db } from './db';
import type { Packet, ChecklistItem, PhotoItem, CommunicationLog, SignatureItem, PacketType, VerificationResult, ActivityLog } from '../types';

export const APP_VERSION = '1.1.0';

export const storage = {
  // Packets
  async getPackets() {
    return await db.packets.orderBy('updatedAt').reverse().toArray();
  },

  async getPacket(id: string) {
    return await db.packets.get(id);
  },

  async createPacket(packet: Omit<Packet, 'id' | 'createdAt' | 'updatedAt' | 'exportCount'>) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newPacket: Packet = {
      ...packet,
      id,
      createdAt: now,
      updatedAt: now,
      exportCount: 0,
      details: {
        ...packet.details,
        appVersion: APP_VERSION,
        templateVersion: '1.0',
        manifestVersion: '1.0',
      },
    };
    await db.packets.add(newPacket);
    await db.activityLog.add({
      id: crypto.randomUUID(),
      packetId: id,
      activityType: 'packet_created',
      description: `Packet created: "${packet.title}"`,
      timestamp: now,
    });
    return id;
  },

  async updatePacket(id: string, changes: Partial<Packet>) {
    await db.packets.update(id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
  },

  async deletePacket(id: string) {
    await db.transaction('rw', db.packets, db.photos, db.activityLog, async () => {
      await db.packets.delete(id);
      await db.photos.where('packetId').equals(id).delete();
      await db.activityLog.where('packetId').equals(id).delete();
    });
  },

  // Photos
  async addPhoto(photo: Omit<PhotoItem, 'id' | 'createdAt' | 'thumbnailData'> & { thumbnailData?: string }) {
    const id = crypto.randomUUID();
    let thumbnailData = photo.thumbnailData ?? '';
    if (!thumbnailData && photo.originalBlob) {
      const { generateThumbnail } = await import('../utils/photo');
      thumbnailData = await generateThumbnail(photo.originalBlob);
    }
    const newPhoto: PhotoItem = {
      ...photo,
      thumbnailData,
      id,
      createdAt: new Date().toISOString()
    };
    await db.photos.add(newPhoto);
    return id;
  },

  async getPhotosByPacket(packetId: string) {
    return await db.photos.where('packetId').equals(packetId).toArray();
  },

  async updatePhoto(id: string, changes: Partial<Pick<PhotoItem, 'caption' | 'category' | 'phase' | 'checklistItemId'>>) {
    await db.photos.update(id, changes);
  },

  async deletePhoto(id: string) {
    await db.photos.delete(id);
  },

  // Settings — pure read, never writes (safe inside liveQuery)
  async getSettings() {
    const settings = await db.settings.get(1);
    if (!settings) {
      return {
        id: 1 as const,
        userName: '',
        userEmail: '',
        defaultPdfTitle: 'Condition Report',
        showDisclaimer: true,
        watermarkExports: false
      };
    }
    return settings;
  },

  async ensureSettings() {
    const existing = await db.settings.get(1);
    if (!existing) {
      await db.settings.add({
        id: 1,
        userName: '',
        userEmail: '',
        defaultPdfTitle: 'Condition Report',
        showDisclaimer: true,
        watermarkExports: false
      });
    }
  },

  async updateSettings(changes: Partial<Omit<import('../types').AppSettings, 'id'>>) {
    await db.settings.update(1, changes);
  },

  // Verification Results
  async getVerificationResults() {
    return await db.verificationResults.orderBy('verifiedAt').reverse().toArray();
  },

  async getVerificationResult(id: string) {
    return await db.verificationResults.get(id);
  },

  async saveVerificationResult(result: Omit<VerificationResult, 'id'>) {
    const id = crypto.randomUUID();
    await db.verificationResults.add({ ...result, id });
    return id;
  },

  async deleteVerificationResult(id: string) {
    await db.verificationResults.delete(id);
  },

  // Activity Log
  async logActivity(entry: Omit<ActivityLog, 'id'>) {
    const id = crypto.randomUUID();
    await db.activityLog.add({ ...entry, id });
    return id;
  },

  async getActivityLog(packetId: string) {
    return await db.activityLog
      .where('packetId')
      .equals(packetId)
      .reverse()
      .sortBy('timestamp');
  },

  async deleteActivityLog(packetId: string) {
    await db.activityLog.where('packetId').equals(packetId).delete();
  },

  // Storage estimate
  async getStorageEstimate(): Promise<{ packetCount: number; photoCount: number; estimatedBytes: number }> {
    const packetCount = await db.packets.count();
    const photos = await db.photos.toArray();
    const photoCount = photos.length;
    const estimatedBytes = photos.reduce((sum, p) => sum + (p.fileSize || 0), 0);
    return { packetCount, photoCount, estimatedBytes };
  },
};
