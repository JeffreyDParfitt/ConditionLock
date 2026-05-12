export type PacketType = 'car_rental' | 'hotel' | 'airbnb' | 'apartment_home' | 'business_commercial_lease' | 'business_changeover_as_is_sale' | 'property_sale_home_sale' | 'vehicle_sale_as_is_transfer' | 'equipment_sale_as_is_transfer' | 'general_item_sale_as_is_transfer' | 'moving_storage' | 'equipment_rental' | 'accident_claim' | 'custom';

export type ChecklistStatus = 'not_checked' | 'good' | 'damaged' | 'dirty' | 'missing' | 'not_working' | 'works' | 'not_applicable' | 'unknown' | 'not_safe_to_check' | 'included' | 'excluded' | 'present' | 'not_present';

export type Phase = 'before' | 'after' | 'both' | 'pickup' | 'return' | 'sale' | 'transfer' | 'handoff' | 'general';

export interface Packet {
  id: string;
  type: PacketType;
  title: string;
  location: string;
  companyOrPerson: string;
  referenceNumber: string;
  startDate: string;
  endDate: string;
  phase: Phase;
  notes: string;
  checklistItems: ChecklistItem[];
  communicationLogs: CommunicationLog[];
  signatures: SignatureItem[];
  createdAt: string;
  updatedAt: string;
  details: Record<string, string | boolean | undefined>;
  exportCount: number;
}

export interface ChecklistItem {
  id: string;
  packetId: string;
  section: string;
  label: string;
  description: string;
  phase: Phase;
  status: ChecklistStatus;
  notes: string;
  photoIds: string[];
  addedDuringInspection: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoItem {
  id: string;
  packetId: string;
  checklistItemId?: string;
  imageData: string;
  caption: string;
  category: string;
  phase: Phase;
  dateTaken: string;
  createdAt: string;
}

export interface CommunicationLog {
  id: string;
  packetId: string;
  date: string;
  personContacted: string;
  method: 'app_message' | 'email' | 'text' | 'phone' | 'in_person' | 'front_desk' | 'portal' | 'letter' | 'other';
  subject: string;
  summary: string;
  followUpNeeded: boolean;
  photoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SignatureItem {
  id: string;
  packetId: string;
  signerName: string;
  signerRole: string;
  signatureData: string;
  signedAt: string;
}

export interface AppSettings {
  id: 1;
  userName: string;
  userEmail: string;
  defaultPdfTitle: string;
  showDisclaimer: boolean;
  watermarkExports: boolean;
}
