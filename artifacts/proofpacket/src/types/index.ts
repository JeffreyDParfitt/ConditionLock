export type PacketType =
  | 'car_rental'
  | 'moving_truck_van'
  | 'trailer_tow_equipment'
  | 'custom_rental_vehicle'
  | 'company_vehicle_handoff'
  | 'hotel'
  | 'airbnb'
  | 'apartment_home'
  | 'business_commercial_lease'
  | 'business_changeover_as_is_sale'
  | 'property_sale_home_sale'
  | 'vehicle_sale_as_is_transfer'
  | 'equipment_sale_as_is_transfer'
  | 'general_item_sale_as_is_transfer'
  | 'moving_storage'
  | 'equipment_rental'
  | 'accident_claim'
  | 'custom';

export type ChecklistStatus =
  | 'not_checked' | 'good' | 'works' | 'damaged' | 'dirty' | 'stained' | 'odor'
  | 'missing' | 'not_working' | 'unknown' | 'not_safe_to_check' | 'not_applicable'
  | 'included' | 'excluded' | 'present' | 'not_present' | 'returned' | 'not_returned'
  | 'reported' | 'not_reported' | 'needs_follow_up' | 'resolved' | 'unresolved';

export type ConditionSeverity = 'mild' | 'moderate' | 'severe';

export interface ConditionEvidence {
  id: string;
  status: string;
  displayLabel: string;
  severity?: ConditionSeverity;
  note: string;
  photoIds: string[];
  timestamp: string;
  updatedAt: string;
}

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
  statuses?: string[];
  notes: string;
  photoIds: string[];
  conditionEvidence?: ConditionEvidence[];
  addedDuringInspection: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoItem {
  id: string;
  packetId: string;
  checklistItemId?: string;
  originalBlob: Blob;
  thumbnailData: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  caption: string;
  category: string;
  phase: Phase;
  dateTaken: string;
  createdAt: string;
  appCaptured?: boolean;
  source?: 'in_app_camera' | 'imported_document' | 'legacy_import' | 'unknown';
  verificationEligible?: boolean;
  capturedAt?: string;
  importedAt?: string;
  sha256Hash?: string;
  hashCreatedAt?: string;
  conditionEvidenceId?: string;
  photoRole?: 'wide' | 'closeup' | 'supporting' | 'general';
  linkedItemLabel?: string;
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

export interface ActivityLog {
  id: string;
  packetId: string;
  activityType:
    | 'packet_created' | 'packet_edited' | 'photo_added' | 'photo_deleted'
    | 'checklist_updated' | 'damage_noted' | 'comm_log_added' | 'signature_added'
    | 'export_pdf' | 'export_verified' | 'export_archive' | 'export_photos_zip'
    | 'verification_run' | 'dispute_summary_generated' | 'travel_summary_generated'
    | 'archive_imported' | 'custom';
  description: string;
  relatedItemId?: string;
  timestamp: string;
}

export type VerificationStatus = 'passed' | 'warning' | 'failed';

export interface VerificationPhotoResult {
  id: string;
  fileName: string;
  archiveFileName: string;
  caption: string;
  category: string;
  phase: string;
  expectedHash: string;
  calculatedHash: string;
  status: 'verified' | 'missing' | 'mismatch' | 'extra';
  source?: string;
  appCaptured?: boolean;
  verificationEligible?: boolean;
}

export interface VerificationResult {
  id: string;
  packetId: string;
  packetTitle: string;
  packetType: string;
  manifestHash: string;
  verifiedAt: string;
  totalExpected: number;
  totalUploaded: number;
  verifiedCount: number;
  missingCount: number;
  mismatchCount: number;
  extraCount: number;
  resultStatus: VerificationStatus;
  photoResults: VerificationPhotoResult[];
  notes: string;
}
