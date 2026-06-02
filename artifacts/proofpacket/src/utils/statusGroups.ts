// Status group types, options, and issue documentation helpers for ConditionLock

export type StatusGroupKey =
  | 'generalCondition'
  | 'vehicleExterior'
  | 'vehicleGlass'
  | 'vehicleTiresWheels'
  | 'vehicleInterior'
  | 'vehicleControlsMechanical'
  | 'fuelBatteryOdometer'
  | 'movingTruckCargo'
  | 'doorLockHinge'
  | 'bathroomFixture'
  | 'toiletSpecific'
  | 'kitchenAppliance'
  | 'furnitureUpholstery'
  | 'bedBedding'
  | 'roomSurface'
  | 'exteriorYardPatio'
  | 'equipmentAccessory'
  | 'documentReceipt'
  | 'claimInsuranceIncident'
  | 'communicationLog'
  | 'signatureAcknowledgment'
  | 'businessCommercialSpace';

export const STATUS_GROUPS: Record<StatusGroupKey, string[]> = {
  generalCondition: [
    'good', 'damaged', 'dirty', 'missing', 'not_working',
    'not_checked', 'not_applicable', 'unknown', 'needs_follow_up', 'custom_note',
  ],
  vehicleExterior: [
    'good', 'scratch', 'dent', 'chip', 'crack', 'scuff', 'paint_damage',
    'rust', 'loose', 'missing', 'dirty', 'stained',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  vehicleGlass: [
    'good', 'chip', 'crack', 'scratched', 'shattered', 'fogged',
    'loose', 'missing', 'dirty',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  vehicleTiresWheels: [
    'good', 'worn', 'low_tread', 'flat', 'low_pressure', 'sidewall_damage',
    'rim_scratched', 'rim_bent', 'hubcap_missing', 'spare_missing', 'dirty',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  vehicleInterior: [
    'good', 'dirty', 'stained', 'torn', 'cracked', 'scratched',
    'odor', 'sticky', 'missing_part', 'not_working',
    'not_checked', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  vehicleControlsMechanical: [
    'works', 'not_working', 'intermittent', 'damaged', 'loose', 'missing',
    'warning_light', 'unusual_noise',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  fuelBatteryOdometer: [
    'documented', 'photo_captured', 'matches_agreement', 'does_not_match',
    'full', 'partial', 'low', 'empty', 'missing_receipt', 'receipt_attached',
    'not_checked', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  movingTruckCargo: [
    'good', 'dirty', 'damaged', 'scratched', 'dented', 'cracked',
    'stained', 'odor', 'wet', 'debris', 'missing', 'not_working',
    'hard_to_open', 'latch_issue',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  doorLockHinge: [
    'works', 'not_working', 'loose', 'broken', 'hard_to_open', 'hard_to_close',
    'lock_issue', 'latch_issue', 'hinge_issue', 'squeaks', 'sticks',
    'missing_hardware', 'damaged', 'dirty',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  bathroomFixture: [
    'good', 'dirty', 'stained', 'cracked', 'chipped', 'leaking', 'clogged',
    'slow_drain', 'low_water_pressure', 'no_hot_water', 'mold_mildew',
    'odor', 'loose', 'missing', 'not_working',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  toiletSpecific: [
    'clean', 'dirty', 'stained', 'cracked', 'loose_seat', 'broken_seat',
    'leaking', 'running_water', 'does_not_flush', 'tank_issue', 'bowl_issue', 'odor',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  kitchenAppliance: [
    'works', 'not_working', 'dirty', 'stained', 'odor', 'damaged', 'cracked',
    'missing_part', 'leaking', 'rust', 'mold_mildew', 'not_cooling', 'not_heating',
    'unusual_noise',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  furnitureUpholstery: [
    'good', 'dirty', 'stained', 'torn', 'scratched', 'dented', 'broken', 'loose',
    'missing_part', 'odor', 'sagging', 'unstable',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  bedBedding: [
    'clean', 'dirty', 'stained', 'torn', 'odor', 'damaged',
    'missing_linens', 'missing_pillow', 'missing_blanket',
    'bedframe_damaged', 'mattress_damaged', 'sagging',
    'not_provided', 'provided', 'requested', 'not_requested',
    'not_checked', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  roomSurface: [
    'good', 'dirty', 'stained', 'scratched', 'dented', 'cracked',
    'chipped_paint', 'hole', 'water_damage', 'mold_mildew', 'odor', 'loose', 'missing',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  exteriorYardPatio: [
    'good', 'dirty', 'damaged', 'cracked', 'loose', 'rust', 'unsafe',
    'debris', 'water_damage', 'missing_item', 'not_working',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  equipmentAccessory: [
    'present', 'not_present', 'included', 'excluded', 'returned', 'not_returned',
    'missing', 'damaged', 'dirty', 'not_working', 'expired', 'wrong_item',
    'quantity_mismatch',
    'not_checked', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
  documentReceipt: [
    'attached', 'missing', 'unreadable', 'incomplete', 'incorrect', 'expired',
    'unsigned', 'signed', 'pending', 'reviewed', 'not_reviewed',
    'not_applicable', 'needs_follow_up', 'custom_issue',
  ],
  claimInsuranceIncident: [
    'received', 'sent', 'pending', 'disputed', 'resolved', 'unresolved',
    'attached', 'missing', 'needs_follow_up', 'reported', 'not_reported', 'custom_issue',
  ],
  communicationLog: [
    'sent', 'received', 'no_response', 'acknowledged', 'denied', 'pending',
    'escalated', 'reported', 'not_reported', 'screenshot_attached',
    'needs_follow_up', 'custom_note',
  ],
  signatureAcknowledgment: [
    'signed', 'refused_to_sign', 'unavailable', 'not_required',
    'pending', 'acknowledged', 'disputed', 'witness_present', 'notes_attached',
    'not_applicable',
  ],
  businessCommercialSpace: [
    'good', 'dirty', 'damaged', 'missing_item', 'not_working', 'unsafe',
    'access_issue', 'lock_issue', 'utility_issue', 'water_damage', 'electrical_issue',
    'not_checked', 'not_safe_to_check', 'not_applicable',
    'reported', 'needs_follow_up', 'custom_issue',
  ],
};

// ------------------------------------------------------------------
// Classification sets
// ------------------------------------------------------------------

/** Statuses that trigger a required wide + close-up damage photo pair */
export const DAMAGE_TRIGGERING_STATUSES = new Set<string>([
  // Core legacy
  'damaged', 'dirty', 'stained', 'odor', 'missing', 'not_working', 'not_present',
  'not_returned', 'unresolved', 'excluded',
  // Vehicle exterior
  'scratch', 'dent', 'chip', 'crack', 'scuff', 'paint_damage', 'rust', 'loose',
  // Vehicle glass
  'scratched', 'shattered', 'fogged',
  // Tires
  'worn', 'low_tread', 'flat', 'low_pressure', 'sidewall_damage',
  'rim_scratched', 'rim_bent', 'hubcap_missing', 'spare_missing',
  // Interior
  'torn', 'sticky', 'missing_part', 'cracked',
  // Controls
  'intermittent', 'warning_light', 'unusual_noise',
  // Moving truck
  'dented', 'wet', 'debris', 'hard_to_open', 'latch_issue',
  // Door/lock
  'broken', 'hard_to_close', 'lock_issue', 'hinge_issue', 'squeaks', 'sticks', 'missing_hardware',
  // Bathroom
  'chipped', 'leaking', 'clogged', 'slow_drain', 'low_water_pressure', 'no_hot_water', 'mold_mildew',
  // Toilet
  'loose_seat', 'broken_seat', 'running_water', 'does_not_flush', 'tank_issue', 'bowl_issue',
  // Kitchen
  'not_cooling', 'not_heating',
  // Furniture
  'sagging', 'unstable',
  // Bed
  'missing_linens', 'missing_pillow', 'missing_blanket', 'bedframe_damaged', 'mattress_damaged',
  // Room surface
  'chipped_paint', 'hole', 'water_damage',
  // Exterior/yard
  'unsafe', 'missing_item',
  // Equipment
  'expired', 'wrong_item', 'quantity_mismatch',
  // Documents
  'unreadable', 'incomplete', 'incorrect', 'unsigned',
  // Claims
  'disputed',
  // Fuel/battery
  'does_not_match', 'missing_receipt',
  // Business
  'access_issue', 'utility_issue', 'electrical_issue',
  // General issue flags
  'not_reported', 'needs_follow_up', 'custom_issue', 'custom_note',
]);

/** Statuses that display with green (positive) chip color */
export const ALL_POSITIVE_STATUS_KEYS = new Set<string>([
  'good', 'works', 'clean', 'attached', 'signed', 'reviewed', 'documented',
  'full', 'provided', 'returned', 'included', 'present', 'resolved',
  'acknowledged', 'matches_agreement', 'photo_captured', 'receipt_attached',
  'witness_present', 'notes_attached', 'screenshot_attached',
]);

/** Statuses that display with amber (warning/pending) chip color */
export const ALL_AMBER_STATUS_KEYS = new Set<string>([
  'reported', 'needs_follow_up', 'pending', 'escalated', 'partial', 'low',
  'requested', 'not_provided', 'not_requested', 'does_not_match', 'missing_receipt',
  'sent', 'received', 'no_response', 'denied', 'disputed',
  'unavailable', 'not_required', 'not_reviewed', 'unknown', 'intermittent',
]);

/** Statuses that display with red (issue) chip color — superset of DAMAGE_TRIGGERING_STATUSES */
export const ALL_ISSUE_STATUS_KEYS: Set<string> = DAMAGE_TRIGGERING_STATUSES;

// ------------------------------------------------------------------
// Group mapping
// ------------------------------------------------------------------

export function getStatusGroupForItem(label: string, section: string, packetType?: string): StatusGroupKey {
  const l = label.toLowerCase();
  const s = section.toLowerCase();
  const pt = (packetType || '').toLowerCase();

  // Documents and receipts (check early — very specific)
  if (/\b(receipt|rental agreement|lease form|bill of sale|invoice|insurance doc|permit\b|tax form|w-9|coi\b|statement)\b/.test(l) && !/signature/.test(l)) return 'documentReceipt';

  // Signatures / acknowledgment
  if (/\b(signature|signed\b|acknowledge|sign here)\b/.test(l) || s.includes('signature')) return 'signatureAcknowledgment';

  // Communication logs
  if (/\b(communication|phone call|text message|app message|front desk contact|supervisor report|counter report)\b/.test(l) || s.includes('communication log') || s.includes('comm log')) return 'communicationLog';

  // Claims / insurance / incidents
  if (/\b(claim|insurance|incident\b|repair estimate|damage notice|damage report)\b/.test(l)) return 'claimInsuranceIncident';

  // Tires / wheels (before exterior — tires overlap with vehicle exterior)
  if (/\b(tire|tyre|wheel\b|rim\b|hubcap|tread|spare tire|spare wheel|lug nut|low profile)\b/.test(l)) return 'vehicleTiresWheels';
  if (s.includes('tire') || s.includes('wheel')) return 'vehicleTiresWheels';

  // Glass / windshield (before exterior)
  if (/\b(windshield|rear window|side window|back glass|rear glass)\b/.test(l)) return 'vehicleGlass';
  if (/\bglass\b/.test(l) && !/eyeglass|hour.?glass|looking.?glass/.test(l)) return 'vehicleGlass';

  // Fuel / battery / odometer
  if (/\b(odometer|fuel gauge|fuel level|fuel tank|ev battery|battery level|battery charge|battery range|charging cable|fuel receipt|charge receipt|starting mileage|ending mileage|miles at|mileage at)\b/.test(l)) return 'fuelBatteryOdometer';

  // Vehicle controls / mechanical / electrical
  if (/\b(headlight|tail light|brake light|turn signal|dome light|wiper|horn\b|air conditioning|a\/c vent|hvac|backup camera|parking sensor|warning light|abs\b|airbag|engine\b|transmission|cruise control|hazard light|defroster|radio\b|usb port|bluetooth|speedometer|mirror control|power window|power lock|infotainment)\b/.test(l)) return 'vehicleControlsMechanical';

  // Moving truck / cargo
  const isCargoVehicle = /moving_truck|cargo_van|trailer/.test(pt);
  if (isCargoVehicle || s.includes('cargo') || s.includes('loading')) {
    if (/\b(cargo|ramp|liftgate|lift gate|cargo door|cargo box|cargo wall|cargo floor|cargo ceiling|loading\b|dolly|moving pad|moving blanket|tie.?down|strap\b|furniture pad)\b/.test(l)) return 'movingTruckCargo';
  }
  if (/\b(cargo box|cargo door|cargo floor|cargo wall|cargo ceiling|loading ramp|moving pad|tie.?down)\b/.test(l)) return 'movingTruckCargo';

  // Vehicle exterior
  if (/\b(bumper|fender|hood\b|roof panel|body panel|door exterior|mirror\b|grille|spoiler|trunk exterior|quarter panel|side skirt|running board|rocker\b|undercarriage|mud flap|liftgate\b|rear hatch|tailgate\b|antenna)\b/.test(l)) return 'vehicleExterior';

  // Vehicle interior
  if (/\b(seat\b|headliner|carpet\b|dashboard|dash\b|center console|glove box|sun visor|steering wheel|armrest|floor mat|cup holder|rearview|trunk interior|interior door panel)\b/.test(l)) return 'vehicleInterior';

  // Section-level vehicle overrides
  if (s.includes('exterior') && /car_rental|moving_truck|cargo_van|trailer|company_vehicle|vehicle_sale|accident/.test(pt)) return 'vehicleExterior';
  if (s.includes('interior') && /car_rental|moving_truck|cargo_van|trailer|company_vehicle|vehicle_sale|accident/.test(pt)) return 'vehicleInterior';

  // Toilet specific (before bathroom)
  if (/\b(toilet\b|bowl\b|flush|toilet seat|toilet lid|toilet tank)\b/.test(l)) return 'toiletSpecific';
  if (s.includes('toilet')) return 'toiletSpecific';

  // Bathroom fixtures
  if (/\b(sink\b|faucet|shower\b|bathtub|tub\b|drain\b|showerhead|towel bar|towel rack|soap dish|bath mat)\b/.test(l)) return 'bathroomFixture';
  if (/\b(bathroom|lavatory)\b/.test(l)) return 'bathroomFixture';
  if (s.includes('bathroom') || s.includes('bath ') || s.includes('lavatory')) return 'bathroomFixture';

  // Kitchen appliances
  if (/\b(fridge|refrigerator|freezer\b|oven\b|stove\b|microwave|dishwasher|garbage disposal|hood vent|range hood|cooktop|toaster|coffee maker|ice maker|kitchen appliance)\b/.test(l)) return 'kitchenAppliance';
  if (s.includes('kitchen') || s.includes('appliance')) return 'kitchenAppliance';

  // Beds / bedding
  if (/\b(bed\b|pillow|blanket|linen\b|sheet\b|mattress|rollaway|crib\b|sofa bed|pull.?out bed|comforter|duvet|bedframe|bed frame|bedding)\b/.test(l)) return 'bedBedding';
  if (s.includes('bedding') || s.includes('sleep')) return 'bedBedding';

  // Furniture / upholstery
  if (/\b(couch|sofa\b|chair\b|cushion|ottoman|coffee table|desk\b|dresser|nightstand|bookshelf|wardrobe|armchair|recliner|loveseat|dining table)\b/.test(l)) return 'furnitureUpholstery';
  if (s.includes('furniture') || s.includes('living room') || s.includes('dining')) return 'furnitureUpholstery';

  // Doors / locks / hinges
  if (/\b(door\b|hinge\b|deadbolt|cabinet|drawer\b|closet door|entry door)\b/.test(l)) return 'doorLockHinge';
  if (s.includes('door') || s.includes('lock') || s.includes('cabinet')) return 'doorLockHinge';

  // Room surfaces
  if (/\b(floor\b|hardwood floor|carpet floor|tile floor|wall\b|ceiling\b|baseboard|window sill|trim\b|grout|drywall|plaster|paint\b)\b/.test(l)) return 'roomSurface';
  if (s.includes('surface') || s.includes('flooring') || s.includes('ceiling')) return 'roomSurface';

  // Exterior / patio / yard
  if (/\b(patio\b|balcony|deck\b|yard\b|lawn|garden|pool\b|hot tub|fence\b|gate\b|driveway|sidewalk|landscaping|pergola|parking spot)\b/.test(l)) return 'exteriorYardPatio';
  if (s.includes('patio') || s.includes('balcony') || s.includes('yard') || s.includes('outdoor')) return 'exteriorYardPatio';

  // Equipment / accessories
  if (/\b(key\b|key fob|fob\b|fuel card|access card|transponder|dolly\b|moving pad\b|garage opener|parking pass|e.?z.?pass|i.?pass|remote\b|badge\b)\b/.test(l)) return 'equipmentAccessory';
  if (s.includes('equipment') || s.includes('accessor') || s.includes('supplies') || s.includes('keys')) return 'equipmentAccessory';

  // Business / commercial
  if (/\b(office\b|conference room|warehouse|retail floor|loading dock|mechanical room|electrical panel|server room)\b/.test(l)) return 'businessCommercialSpace';
  if (/business_changeover|commercial_lease|business_lease/.test(pt)) return 'businessCommercialSpace';

  return 'generalCondition';
}

export function getStatusOptionsForItem(label: string, section: string, packetType?: string): string[] {
  const groupKey = getStatusGroupForItem(label, section, packetType);
  return STATUS_GROUPS[groupKey];
}

export function hasDamageTriggeringStatus(statuses: string[]): boolean {
  return statuses.some(s => DAMAGE_TRIGGERING_STATUSES.has(s));
}

// ------------------------------------------------------------------
// Issue documentation status (per item)
// ------------------------------------------------------------------

export type IssueDocLevel =
  | 'fully_documented'
  | 'partially_documented'
  | 'missing_photos'
  | 'needs_followup'
  | 'no_issue';

function getEffectiveStatusesLocal(item: any): string[] {
  if (item.statuses && item.statuses.length > 0) return item.statuses;
  if (item.status && item.status !== 'not_checked') return [item.status];
  return ['not_checked'];
}

export function getIssueDocStatus(item: any, itemPhotos: any[]): IssueDocLevel {
  const statuses = getEffectiveStatusesLocal(item);
  const hasDamage = statuses.some(s => DAMAGE_TRIGGERING_STATUSES.has(s));
  if (!hasDamage) return 'no_issue';

  const wideShot = itemPhotos.some((p: any) => p.photoRole === 'wide');
  const closeup = itemPhotos.some((p: any) => p.photoRole === 'closeup');
  const hasNotes = !!(item.notes?.trim() || (item.conditionEvidence || []).some((ev: any) => ev.note?.trim()));
  const hasAnyPhoto = itemPhotos.length > 0 || (item.conditionEvidence || []).some((ev: any) => (ev.photoIds || []).length > 0);
  const isFollowupStatus = statuses.some(s => ['needs_follow_up', 'reported', 'unresolved', 'disputed'].includes(s));

  if (wideShot && closeup && (hasNotes || !isFollowupStatus)) return 'fully_documented';
  if (wideShot || closeup || hasAnyPhoto || hasNotes) return 'partially_documented';
  if (isFollowupStatus) return 'needs_followup';
  return 'missing_photos';
}

// ------------------------------------------------------------------
// Issue documentation score (packet-level)
// ------------------------------------------------------------------

export interface IssueDocScore {
  total: number;
  fullyDocumented: number;
  partiallyDocumented: number;
  missingPhotos: number;
  needsFollowup: number;
  scorePercent: number;
  category: 'Strong' | 'Good' | 'Partial' | 'Weak' | 'None';
  label: string;
}

export function getIssueDocScore(items: any[], photos: any[]): IssueDocScore {
  const issueItems = items.filter(item =>
    getEffectiveStatusesLocal(item).some(s => DAMAGE_TRIGGERING_STATUSES.has(s))
  );

  if (issueItems.length === 0) {
    return {
      total: 0, fullyDocumented: 0, partiallyDocumented: 0,
      missingPhotos: 0, needsFollowup: 0, scorePercent: 100,
      category: 'None', label: 'No issues found',
    };
  }

  let fullyDocumented = 0, partiallyDocumented = 0, missingPhotos = 0, needsFollowup = 0;

  for (const item of issueItems) {
    const itemPhotos = photos.filter((p: any) => p.checklistItemId === item.id);
    const status = getIssueDocStatus(item, itemPhotos);
    if (status === 'fully_documented') fullyDocumented++;
    else if (status === 'partially_documented') partiallyDocumented++;
    else if (status === 'needs_followup') needsFollowup++;
    else missingPhotos++;
  }

  const scorePercent = Math.round((fullyDocumented / issueItems.length) * 100);
  const category: IssueDocScore['category'] =
    scorePercent >= 85 ? 'Strong' :
    scorePercent >= 65 ? 'Good' :
    scorePercent >= 35 ? 'Partial' : 'Weak';
  const label = `${fullyDocumented} of ${issueItems.length} issue${issueItems.length !== 1 ? 's' : ''} fully documented`;

  return { total: issueItems.length, fullyDocumented, partiallyDocumented, missingPhotos, needsFollowup, scorePercent, category, label };
}
