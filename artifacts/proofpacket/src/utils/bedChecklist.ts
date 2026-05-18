import type { Phase, ChecklistStatus } from '../types';

export interface BedChecklistItem {
  label: string;
  description: string;
  phase: Phase;
  status: ChecklistStatus;
}

export interface BedSection {
  name: string;
  items: BedChecklistItem[];
}

// ─── Condition statuses for quick multi-select ────────────────────────────────

export const BED_CONDITION_STATUSES = [
  'Clean',
  'Dirty',
  'Damaged',
  'Stained',
  'Odor',
  'Missing bedding',
  'Needs follow-up',
] as const;

export type BedConditionStatus = (typeof BED_CONDITION_STATUSES)[number];

// ─── Bed types ────────────────────────────────────────────────────────────────

export const BED_TYPES_HOTEL = [
  'King',
  'Queen',
  'Full / Double',
  'Twin',
  'Bunk bed',
  'Sofa bed',
  'Murphy bed',
  'Rollaway',
  'Crib',
  'Other',
] as const;

export const BED_TYPES_AIRBNB = [
  'King',
  'Queen',
  'Full / Double',
  'Twin',
  'Bunk bed',
  'Sofa bed',
  'Murphy bed',
  'Rollaway',
  'Air mattress',
  'Futon',
  'Crib',
  'Other',
] as const;

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface BedConfig {
  id: string;
  label: string;
  bedType: string;
  assignedRoom: string;
  conditionStatuses: string[];
  mattressCondition: string;
  beddingCondition: string;
  pillowsCondition: string;
  blanketCondition: string;
  bedframeCondition: string;
  notes: string;
}

export interface RollawayConfig {
  id: string;
  label: string;
  conditionStatuses: string[];
  notes: string;
}

export interface CribConfig {
  id: string;
  label: string;
  conditionStatuses: string[];
  notes: string;
}

export interface SofaBedConfig {
  id: string;
  label: string;
  conditionStatuses: string[];
  notes: string;
}

export interface BedLayoutConfig {
  beds: BedConfig[];
  rollaways: RollawayConfig[];
  cribs: CribConfig[];
  sofaBeds: SofaBedConfig[];
  rollawayRequested: boolean;
  rollawayProvided: boolean;
  cribRequested: boolean;
  cribProvided: boolean;
  sofaBedPresent: boolean;
  sofaBedUsed: boolean;
  extraBeddingProvided: boolean;
  airMattressPresent: boolean;
  numberOfPillows: string;
  numberOfBlankets: string;
  numberOfLinenSets: string;
  notes: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function item(label: string, description: string, phase: Phase = 'both'): BedChecklistItem {
  return { label, description, phase, status: 'not_checked' };
}

// ─── Per-bed checklist ────────────────────────────────────────────────────────

function bedItems(bedType: string): BedChecklistItem[] {
  const isBunk = bedType === 'Bunk bed';
  const isMurphy = bedType === 'Murphy bed';
  const baseItems: BedChecklistItem[] = [
    item('Wide photo of bed', 'Full view of the bed as found', 'before'),
    item('Mattress / sheets photo', 'Close-up of mattress and sheet condition'),
    item('Pillows photo', 'Condition and count of pillows'),
    item('Blanket / comforter photo', 'Condition of blanket or comforter'),
    item('Headboard / bedframe photo', 'Condition of headboard and frame'),
    item('Under and around bed', 'Check for items or damage under and around the bed', 'before'),
    item('Stains, damage, or odor', 'Document any stains, damage, or odors present', 'before'),
    item('Missing bedding check', 'Confirm sheets, pillows, and blanket are all present', 'before'),
    item('Cleanliness check', 'Overall cleanliness of all bedding'),
  ];
  if (isBunk) {
    baseItems.push(item('Upper bunk safety rail', 'Confirm safety rail is present and secure', 'before'));
    baseItems.push(item('Ladder condition', 'Ladder attached and stable', 'before'));
  }
  if (isMurphy) {
    baseItems.push(item('Wall mount condition', 'Check wall anchors and hardware', 'before'));
    baseItems.push(item('Fold mechanism', 'Opens and closes smoothly without binding'));
  }
  return baseItems;
}

function rollawayItems(): BedChecklistItem[] {
  return [
    item('Rollaway bed delivered', 'Confirm rollaway was brought to room', 'before'),
    item('Frame condition', 'Frame structure — no bending, cracks, or damage'),
    item('Mattress condition', 'Mattress — no stains, damage, or odors'),
    item('Sheets / linen included', 'Clean sheets and pillowcase present'),
    item('Pillow included', 'At least one pillow provided'),
    item('Blanket included', 'Blanket or comforter provided'),
    item('Wheels / legs condition', 'Wheels roll freely, legs lock securely'),
    item('Stains, damage, or odor', 'Document any issues with frame, mattress, or bedding', 'before'),
    item('Photo of rollaway setup', 'Overall photo of rollaway as delivered', 'before'),
  ];
}

function cribItems(): BedChecklistItem[] {
  return [
    item('Crib delivered', 'Confirm crib was brought to / already in room', 'before'),
    item('Frame condition', 'Frame, slats, and hardware intact — no missing parts'),
    item('Mattress condition', 'Crib mattress — firm, no damage or stains'),
    item('Sheets included', 'Clean fitted sheet present'),
    item('Cleanliness', 'Interior of crib is clean and free of debris', 'before'),
    item('Stains, damage, or odor', 'Document any issues present', 'before'),
    item('Photo of crib', 'Overall photo of crib as set up', 'before'),
    item('Drop-side check', 'Confirm no unsafe drop-side rail if applicable', 'before'),
  ];
}

function sofaBedItems(): BedChecklistItem[] {
  return [
    item('Sofa exterior condition', 'Overall condition of sofa cushions and fabric'),
    item('Pull-out mechanism', 'Opens and closes smoothly, no binding or squeaking'),
    item('Mattress condition', 'Pull-out mattress — no stains, damage, or odors'),
    item('Sheets / linen', 'Clean sheets provided or brought own'),
    item('Photo of sofa closed', 'Sofa in closed/normal position', 'before'),
    item('Photo of sofa opened', 'Sofa fully open with mattress visible', 'before'),
    item('Stains, damage, or odor', 'Document any issues with sofa or mattress', 'before'),
    item('Support bar / springs', 'Check for broken support bar or protruding springs', 'before'),
  ];
}

// ─── Export: generate all bed sections ────────────────────────────────────────

export function generateBedSections(config: BedLayoutConfig): BedSection[] {
  const sections: BedSection[] = [];

  // Main beds
  for (const bed of config.beds) {
    const label = bed.label || `Bed ${config.beds.indexOf(bed) + 1}`;
    sections.push({ name: label, items: bedItems(bed.bedType) });
  }

  // Rollaways
  for (const rw of config.rollaways) {
    sections.push({ name: rw.label || 'Rollaway Bed', items: rollawayItems() });
  }

  // Cribs
  for (const crib of config.cribs) {
    sections.push({ name: crib.label || 'Crib', items: cribItems() });
  }

  // Sofa beds (standalone, not already counted in beds)
  for (const sb of config.sofaBeds) {
    sections.push({ name: sb.label || 'Sofa Bed', items: sofaBedItems() });
  }

  return sections;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultBedConfig(index: number, packetType?: string): BedConfig {
  const isAirbnb = packetType === 'airbnb';
  return {
    id: `bed-${index}-${Date.now()}`,
    label: `Bed ${index}`,
    bedType: index === 1 ? (isAirbnb ? 'Queen' : 'King') : 'Queen',
    assignedRoom: '',
    conditionStatuses: [],
    mattressCondition: '',
    beddingCondition: '',
    pillowsCondition: '',
    blanketCondition: '',
    bedframeCondition: '',
    notes: '',
  };
}

export function defaultRollawayConfig(index: number): RollawayConfig {
  return {
    id: `rollaway-${index}-${Date.now()}`,
    label: index > 1 ? `Rollaway Bed ${index}` : 'Rollaway Bed',
    conditionStatuses: [],
    notes: '',
  };
}

export function defaultCribConfig(index: number): CribConfig {
  return {
    id: `crib-${index}-${Date.now()}`,
    label: index > 1 ? `Crib ${index}` : 'Crib',
    conditionStatuses: [],
    notes: '',
  };
}

export function defaultSofaBedConfig(index: number): SofaBedConfig {
  return {
    id: `sofabed-${index}-${Date.now()}`,
    label: index > 1 ? `Sofa Bed ${index}` : 'Sofa Bed',
    conditionStatuses: [],
    notes: '',
  };
}

export function defaultBedLayoutConfig(): BedLayoutConfig {
  return {
    beds: [],
    rollaways: [],
    cribs: [],
    sofaBeds: [],
    rollawayRequested: false,
    rollawayProvided: false,
    cribRequested: false,
    cribProvided: false,
    sofaBedPresent: false,
    sofaBedUsed: false,
    extraBeddingProvided: false,
    airMattressPresent: false,
    numberOfPillows: '',
    numberOfBlankets: '',
    numberOfLinenSets: '',
    notes: '',
  };
}
