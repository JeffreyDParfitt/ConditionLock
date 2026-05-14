import Dexie, { type Table } from 'dexie';
import type { Packet, PhotoItem, AppSettings, VerificationResult } from '../types';

export class ProofPacketDB extends Dexie {
  packets!: Table<Packet, string>;
  photos!: Table<PhotoItem, string>;
  settings!: Table<AppSettings, number>;
  verificationResults!: Table<VerificationResult, string>;

  constructor() {
    super('ProofPacketDB');
    this.version(1).stores({
      packets: 'id, createdAt, updatedAt, type',
      photos: 'id, packetId, phase, createdAt',
      settings: 'id'
    });
    this.version(2).stores({
      packets: 'id, createdAt, updatedAt, type',
      photos: 'id, packetId, phase, createdAt',
      settings: 'id',
      verificationResults: 'id, packetId, verifiedAt, resultStatus'
    });
  }
}

export const db = new ProofPacketDB();
