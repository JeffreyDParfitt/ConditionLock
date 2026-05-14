import Dexie, { type Table } from 'dexie';
import type { Packet, PhotoItem, AppSettings, VerificationResult, ActivityLog } from '../types';

export class ProofPacketDB extends Dexie {
  packets!: Table<Packet, string>;
  photos!: Table<PhotoItem, string>;
  settings!: Table<AppSettings, number>;
  verificationResults!: Table<VerificationResult, string>;
  activityLog!: Table<ActivityLog, string>;

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
    this.version(3).stores({
      packets: 'id, createdAt, updatedAt, type',
      photos: 'id, packetId, phase, createdAt',
      settings: 'id',
      verificationResults: 'id, packetId, verifiedAt, resultStatus',
      activityLog: 'id, packetId, timestamp, activityType'
    });
  }
}

export const db = new ProofPacketDB();
