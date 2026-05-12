import { db } from './db';
import type { Packet, ChecklistItem, PhotoItem, CommunicationLog, SignatureItem, PacketType } from '../types';

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
      exportCount: 0
    };
    await db.packets.add(newPacket);
    return id;
  },

  async updatePacket(id: string, changes: Partial<Packet>) {
    await db.packets.update(id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
  },

  async deletePacket(id: string) {
    await db.transaction('rw', db.packets, db.photos, async () => {
      await db.packets.delete(id);
      const photos = await db.photos.where('packetId').equals(id).toArray();
      const photoIds = photos.map(p => p.id);
      if (photoIds.length > 0) {
        await db.photos.bulkDelete(photoIds);
      }
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

  // Call once at startup to create the settings row if missing
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
  }
};
