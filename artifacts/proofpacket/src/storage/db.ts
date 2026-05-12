import Dexie, { type Table } from 'dexie';
import type { Packet, PhotoItem, AppSettings } from '../types';

export class ProofPacketDB extends Dexie {
  packets!: Table<Packet, string>;
  photos!: Table<PhotoItem, string>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('ProofPacketDB');
    this.version(1).stores({
      packets: 'id, createdAt, updatedAt, type',
      photos: 'id, packetId, phase, createdAt',
      settings: 'id'
    });
  }
}

export const db = new ProofPacketDB();
