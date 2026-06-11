import type { GeneratedSection, TemplateItem } from './propertyChecklist';

function item(label: string, description: string, phase: 'pickup' | 'return' | 'both' = 'both'): TemplateItem {
  return { label, description, phase, status: 'not_checked' };
}

// ─── Section item generators ───────────────────────────────────────────────────

function cabFrontExteriorItems(): TemplateItem[] {
  return [
    item('Wide shot — front', 'Full front view of vehicle, centered', 'pickup'),
    item('Front bumper', 'Bumper condition — scratches, cracks, dents'),
    item('Hood', 'Hood exterior — scratches, dents, paint condition'),
    item('Windshield', 'Full windshield — chips, cracks, delamination'),
    item('Windshield wipers', 'Both wiper blades — condition and operation'),
    item('Headlights', 'Both headlights — lens, housing, and function'),
    item('Front license plate', 'Present, legible, and secured'),
  ];
}

function cabSidesItems(): TemplateItem[] {
  return [
    item('Wide shot — driver side', 'Full driver side view', 'pickup'),
    item('Wide shot — passenger side', 'Full passenger side view', 'pickup'),
    item('Driver side panel / mirror', 'Panel and side mirror condition'),
    item('Passenger side panel / mirror', 'Panel and side mirror condition'),
    item('Running boards / steps', 'Step condition and mounting'),
    item('Taillights & marker lights', 'All lights — lenses and function'),
    item('Rear license plate', 'Present, legible, and secured'),
  ];
}

function cabDoorItems(label: string): TemplateItem[] {
  return [
    item(`${label} — exterior panel`, 'Panel condition — dents, scratches, paint chips'),
    item(`${label} — glass & window seal`, 'Glass condition and weatherstrip'),
    item(`${label} — exterior handle`, 'Handle and lock operation'),
    item(`${label} — hinge & latch`, 'Opens, closes, and latches securely'),
    item(`${label} — interior panel`, 'Door card condition'),
  ];
}

function cabInteriorItems(): TemplateItem[] {
  return [
    item('Wide shot — cab interior', 'Overall cab view', 'pickup'),
    item('Driver seat', 'Seat condition — tears, stains, adjustment'),
    item('Passenger seat', 'Seat condition if present'),
    item('Seat belts', 'All seat belts and buckle latches'),
    item('Dashboard — wide shot', 'Dashboard and controls overview', 'pickup'),
    item('Odometer reading', 'Photograph odometer at pickup', 'pickup'),
    item('Fuel gauge', 'Photograph fuel gauge level at pickup', 'pickup'),
    item('Warning lights', 'Any check engine or amber warning lights on dash'),
    item('Steering wheel', 'Condition — cracks, wear'),
    item('Mirrors — interior', 'Rearview or monitor mirror condition'),
    item('Climate controls', 'Fan, heat, and AC operation'),
    item('Cab floor / mat', 'Cab floor condition'),
    item('Key / fob', 'Present — ignition and door function'),
  ];
}

function cargoBoxExteriorItems(): TemplateItem[] {
  return [
    item('Wide shot — cargo box driver side', 'Full cargo box view — driver side', 'pickup'),
    item('Wide shot — cargo box passenger side', 'Full cargo box view — passenger side', 'pickup'),
    item('Wide shot — rear', 'Full rear view with cargo door visible', 'pickup'),
    item('Cargo box — driver side panel', 'Panel condition — dents, holes, damage'),
    item('Cargo box — passenger side panel', 'Panel condition — dents, holes, damage'),
    item('Cargo box — roof', 'Box roof condition — dents, damage'),
    item('Cargo box — rear corners', 'Corner post condition'),
    item('Roll-up cargo door — exterior', 'Door surface and lath condition'),
    item('Roll-up cargo door — latch & lock', 'Latch bar and lock cylinder operation'),
  ];
}

function cargoBoxInteriorItems(): TemplateItem[] {
  return [
    item('Wide shot — cargo interior', 'Full cargo area view from rear door', 'pickup'),
    item('Cargo floor', 'Floor condition — damage, debris, protective coating'),
    item('Cargo walls — driver side', 'Wall condition — dents, holes, damage'),
    item('Cargo walls — passenger side', 'Wall condition — dents, holes'),
    item('Cargo ceiling', 'Ceiling condition — dents, holes'),
    item('Bulkhead / cab wall', 'Front wall condition'),
    item('E-track / tie-down rails', 'Floor and wall tie-down points present and secure'),
    item('Cab-to-cargo pass-through', 'Pass-through door or panel condition if present'),
  ];
}

function cargoVanRearItems(): TemplateItem[] {
  return [
    item('Wide shot — rear', 'Full rear view', 'pickup'),
    item('Rear bumper', 'Rear bumper condition'),
    item('Sliding side door — exterior', 'Panel condition — dents, scratches, paint'),
    item('Sliding side door — operation', 'Opens and closes on track smoothly'),
    item('Rear cargo doors — panels', 'Both door panel condition'),
    item('Rear cargo door latches', 'Both T-bar latches operate correctly'),
    item('Rear cargo door seals', 'Rubber seals intact — no tears or gaps'),
  ];
}

function cargoVanInteriorItems(): TemplateItem[] {
  return [
    item('Wide shot — cargo area', 'Full cargo area view from rear', 'pickup'),
    item('Cargo floor', 'Floor condition — damage, debris, matting'),
    item('Cargo walls — driver side', 'Wall panel or bare metal condition'),
    item('Cargo walls — passenger side', 'Wall panel condition'),
    item('Cargo ceiling', 'Ceiling condition'),
    item('Tie-down hooks / rails', 'Hooks or rails present'),
    item('Bulkhead / cab divider', 'Partition condition and pass-through if present'),
  ];
}

function rampItems(): TemplateItem[] {
  return [
    item('Ramp — wide shot', 'Full ramp extended view', 'pickup'),
    item('Ramp surface', 'Surface condition — damage, grip strips intact'),
    item('Ramp operation', 'Deploys and retracts smoothly without binding'),
    item('Ramp hooks / attachment', 'Hooks seat properly in floor or frame anchors'),
  ];
}

function liftgateItems(): TemplateItem[] {
  return [
    item('Liftgate — wide shot', 'Platform and mechanism view', 'pickup'),
    item('Liftgate platform', 'Platform surface condition — damage, anti-skid surface'),
    item('Liftgate operation', 'Raises and lowers smoothly'),
    item('Liftgate controls', 'Up / down controls function correctly'),
    item('Liftgate safety lip / edge', 'Safety lip present and secure'),
  ];
}

function trailerExteriorItems(): TemplateItem[] {
  return [
    item('Wide shot — front (tongue end)', 'Full view of trailer front / tongue', 'pickup'),
    item('Wide shot — rear', 'Full rear view', 'pickup'),
    item('Wide shot — driver side', 'Full driver side view', 'pickup'),
    item('Wide shot — passenger side', 'Full passenger side view', 'pickup'),
    item('Trailer body — driver side panels', 'Panel condition — dents, holes, damage'),
    item('Trailer body — passenger side panels', 'Panel condition — dents, holes'),
    item('Rear doors or gate', 'Rear door or swinging gate — condition and latch'),
    item('Roof / top panel', 'Roof condition — dents, holes, seams'),
  ];
}

function trailerHitchSafetyItems(): TemplateItem[] {
  return [
    item('Tongue / A-frame', 'Tongue and coupler condition', 'pickup'),
    item('Coupler latch', 'Coupler opens, closes, and locks securely', 'pickup'),
    item('Ball size marking', 'Coupler ball-size rating visible (e.g. 1-7/8", 2", 2-5/16")', 'pickup'),
    item('Safety chains — driver side', 'Chain condition, hooks, and connection', 'pickup'),
    item('Safety chains — passenger side', 'Chain condition, hooks, and connection', 'pickup'),
    item('Electrical / brake connector', 'Plug condition and all pins intact', 'pickup'),
  ];
}

function trailerLightsItems(): TemplateItem[] {
  return [
    item('Running lights', 'All side marker and clearance lights function'),
    item('Brake lights', 'Both brake lights function'),
    item('Turn signals', 'Left and right turn signals function'),
    item('License plate light', 'Plate illuminated when running lights on'),
  ];
}

function trailerTiresItems(isTowDolly: boolean): TemplateItem[] {
  return [
    item('Trailer tires — driver side', 'Tread depth, sidewall, and pressure'),
    item('Trailer tires — passenger side', 'Tread depth, sidewall, and pressure'),
    ...(isTowDolly ? [] : [item('Spare tire', 'Spare present and condition')]),
  ];
}

function towDollyRampItems(): TemplateItem[] {
  return [
    item('Wide shot — ramps in loading position', 'Both ramps deployed view', 'pickup'),
    item('Ramps — driver side', 'Ramp surface, hinge, and notch condition'),
    item('Ramps — passenger side', 'Ramp surface, hinge, and notch condition'),
    item('Wheel trays', 'Tray cradle condition — no bends or cracks'),
    item('Wheel nets / strap anchors', 'Both strap anchor points intact and undamaged'),
    item('Wheel straps', 'Both straps present — no fraying, cuts, or damaged hooks'),
    item('Under-vehicle safety cables', 'Under-axle safety cables or chains present'),
  ];
}

function cabWheelsTiresItems(): TemplateItem[] {
  return [
    item('Front driver tire & wheel', 'Tread depth, sidewall, and rim condition'),
    item('Front passenger tire & wheel', 'Tread depth, sidewall, and rim condition'),
    item('Rear driver tire(s) & wheel(s)', 'Tread, sidewall, and dual-rear condition if applicable'),
    item('Rear passenger tire(s) & wheel(s)', 'Tread, sidewall, and dual-rear condition'),
  ];
}

function equipmentItems(opts: MovingTruckOptions): TemplateItem[] {
  const items: TemplateItem[] = [];
  if (opts.hasDolly) {
    items.push(item('Furniture dolly', 'Dolly condition — platform, wheels, and strap hooks'));
    items.push(item('Appliance dolly / hand truck', 'Condition — frame, wheels, and strap'));
  }
  if (opts.hasFurniturePads) {
    items.push(item('Moving blankets / furniture pads', 'Count and condition — no tears, burns, or heavy soiling'));
  }
  if (opts.hasStraps) {
    items.push(item('Tie-down straps', 'Count and condition — no fraying, cuts, or damaged ratchets'));
  }
  if (opts.hasLock) {
    items.push(item('Truck lock / padlock', 'Lock present and keys included'));
  }
  return items;
}

function odometerFuelItems(): TemplateItem[] {
  return [
    item('Starting odometer', 'Record and photograph odometer at pickup — matches agreement', 'pickup'),
    item('Starting fuel level', 'Photograph fuel gauge at pickup', 'pickup'),
    item('Return odometer', 'Record and photograph odometer at return', 'return'),
    item('Return fuel level', 'Photograph fuel gauge at return', 'return'),
  ];
}

function returnProofItems(): TemplateItem[] {
  return [
    item('Vehicle at return location', 'Vehicle or equipment at return lot with signage visible', 'return'),
    item('Return lot or drop-off marker', 'Photo of row number, lot sign, or drop-off point', 'return'),
    item('Key drop or agent hand-off', 'Key drop receipt, desk receipt, or agent confirmation', 'return'),
    item('Return receipt / confirmation email', 'Receipt or email confirmation with timestamp', 'return'),
  ];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface MovingTruckOptions {
  hasRamp?: boolean;
  hasLiftgate?: boolean;
  hasDolly?: boolean;
  hasFurniturePads?: boolean;
  hasStraps?: boolean;
  hasLock?: boolean;
}

export function generateMovingTruckSections(
  vehicleType: string,
  options: MovingTruckOptions = {},
): GeneratedSection[] {
  const sections: GeneratedSection[] = [];

  const isCargoVan = vehicleType === 'Cargo Van';
  const isBoxTruck = vehicleType === 'Box Truck';
  const isMovingTruck = vehicleType === 'Moving Truck' || vehicleType === 'Box Truck';
  const isFlatbed = vehicleType === 'Flatbed Truck';
  const isTrailer = vehicleType === 'Trailer';
  const isTowDolly = vehicleType === 'Tow Dolly / Car Carrier' || vehicleType === 'Tow Dolly';
  const hasCab = !isTrailer && !isTowDolly;

  // ── Cargo Van ────────────────────────────────────────────────────────────
  if (isCargoVan) {
    sections.push({ name: 'Front Exterior', items: cabFrontExteriorItems() });
    sections.push({ name: 'Sides & Rear', items: cargoVanRearItems() });
    sections.push({ name: 'Driver Door', items: cabDoorItems('Driver door') });
    sections.push({ name: 'Passenger Door', items: cabDoorItems('Passenger door') });
    sections.push({ name: 'Cargo Area', items: cargoVanInteriorItems() });
    sections.push({ name: 'Wheels & Tires', items: cabWheelsTiresItems() });
    sections.push({ name: 'Cab Interior', items: cabInteriorItems() });
    if (options.hasDolly || options.hasFurniturePads || options.hasStraps || options.hasLock) {
      sections.push({ name: 'Rented Equipment', items: equipmentItems(options) });
    }
    sections.push({ name: 'Odometer & Fuel', items: odometerFuelItems() });
    sections.push({ name: 'Return Proof', items: returnProofItems() });
    return sections;
  }

  // ── Box Truck / Moving Truck ─────────────────────────────────────────────
  if (isMovingTruck) {
    sections.push({ name: 'Front Exterior', items: cabFrontExteriorItems() });
    sections.push({ name: 'Driver Side & Passenger Side', items: cabSidesItems() });
    sections.push({ name: 'Driver Door', items: cabDoorItems('Driver door') });
    sections.push({ name: 'Passenger Door', items: cabDoorItems('Passenger door') });
    sections.push({ name: 'Cargo Box — Exterior', items: cargoBoxExteriorItems() });
    sections.push({ name: 'Cargo Box — Interior', items: cargoBoxInteriorItems() });
    if (options.hasRamp) {
      sections.push({ name: 'Ramp', items: rampItems() });
    }
    if (options.hasLiftgate) {
      sections.push({ name: 'Liftgate', items: liftgateItems() });
    }
    sections.push({ name: 'Wheels & Tires', items: cabWheelsTiresItems() });
    sections.push({ name: 'Cab Interior', items: cabInteriorItems() });
    if (options.hasDolly || options.hasFurniturePads || options.hasStraps || options.hasLock) {
      sections.push({ name: 'Rented Equipment', items: equipmentItems(options) });
    }
    sections.push({ name: 'Odometer & Fuel', items: odometerFuelItems() });
    sections.push({ name: 'Return Proof', items: returnProofItems() });
    return sections;
  }

  // ── Flatbed Truck ────────────────────────────────────────────────────────
  if (isFlatbed) {
    sections.push({ name: 'Front Exterior', items: cabFrontExteriorItems() });
    sections.push({ name: 'Driver Side & Passenger Side', items: cabSidesItems() });
    sections.push({ name: 'Cab Doors', items: [
      ...cabDoorItems('Driver door'),
      ...cabDoorItems('Passenger door'),
    ]});
    sections.push({ name: 'Flatbed Platform', items: [
      item('Wide shot — flatbed (driver side)', 'Full flatbed view — driver side', 'pickup'),
      item('Wide shot — flatbed (passenger side)', 'Full flatbed view — passenger side', 'pickup'),
      item('Flatbed floor / decking', 'Deck condition — damage, cracks, missing planks'),
      item('Driver side stake pockets', 'Pocket condition along driver side rail'),
      item('Passenger side stake pockets', 'Pocket condition along passenger side rail'),
      item('Rear stake pockets / bumper', 'Rear end condition'),
      item('Tie-down rings / D-rings', 'Rings present and undamaged'),
      item('Tarp / straps', 'Tarp and strap condition if included'),
    ]});
    sections.push({ name: 'Wheels & Tires', items: cabWheelsTiresItems() });
    sections.push({ name: 'Cab Interior', items: cabInteriorItems() });
    sections.push({ name: 'Odometer & Fuel', items: odometerFuelItems() });
    sections.push({ name: 'Return Proof', items: returnProofItems() });
    return sections;
  }

  // ── Trailer ──────────────────────────────────────────────────────────────
  if (isTrailer) {
    sections.push({ name: 'Hitch & Safety', items: trailerHitchSafetyItems() });
    sections.push({ name: 'Lights', items: trailerLightsItems() });
    sections.push({ name: 'Trailer Exterior', items: trailerExteriorItems() });
    sections.push({ name: 'Trailer Tires', items: trailerTiresItems(false) });
    sections.push({ name: 'Trailer Interior', items: [
      item('Wide shot — trailer interior', 'Full interior view', 'pickup'),
      item('Trailer floor', 'Floor condition — damage, debris'),
      item('Trailer walls', 'Wall condition — damage, holes'),
      item('Tie-down rings / E-track', 'Tie-down points present and secure'),
    ]});
    if (options.hasRamp) {
      sections.push({ name: 'Ramp', items: rampItems() });
    }
    if (options.hasDolly || options.hasFurniturePads || options.hasStraps || options.hasLock) {
      sections.push({ name: 'Rented Equipment', items: equipmentItems(options) });
    }
    sections.push({ name: 'Return Proof', items: returnProofItems() });
    return sections;
  }

  // ── Tow Dolly / Car Carrier ──────────────────────────────────────────────
  if (isTowDolly) {
    sections.push({ name: 'Hitch & Safety', items: trailerHitchSafetyItems() });
    sections.push({ name: 'Lights', items: trailerLightsItems() });
    sections.push({ name: 'Ramps, Wheel Trays & Straps', items: towDollyRampItems() });
    sections.push({ name: 'Tires', items: trailerTiresItems(true) });
    sections.push({ name: 'Return Proof', items: returnProofItems() });
    return sections;
  }

  // ── Fallback (generic moving vehicle) ────────────────────────────────────
  if (hasCab) {
    sections.push({ name: 'Front Exterior', items: cabFrontExteriorItems() });
    sections.push({ name: 'Driver Side & Passenger Side', items: cabSidesItems() });
    sections.push({ name: 'Cab Doors', items: [
      ...cabDoorItems('Driver door'),
      ...cabDoorItems('Passenger door'),
    ]});
    sections.push({ name: 'Wheels & Tires', items: cabWheelsTiresItems() });
    sections.push({ name: 'Cab Interior', items: cabInteriorItems() });
    if (options.hasDolly || options.hasFurniturePads || options.hasStraps || options.hasLock) {
      sections.push({ name: 'Rented Equipment', items: equipmentItems(options) });
    }
    sections.push({ name: 'Odometer & Fuel', items: odometerFuelItems() });
    sections.push({ name: 'Return Proof', items: returnProofItems() });
  }

  return sections;
}

// ─── Helper: resolve vehicle type for the generator from body style ───────────

export function resolveMovingVehicleType(vehicleTypeBodyStyle: string): string {
  if (vehicleTypeBodyStyle === 'Cargo Van') return 'Cargo Van';
  if (vehicleTypeBodyStyle === 'Box Truck') return 'Box Truck';
  if (vehicleTypeBodyStyle === 'Moving Truck') return 'Moving Truck';
  if (vehicleTypeBodyStyle === 'Flatbed Truck') return 'Flatbed Truck';
  if (vehicleTypeBodyStyle === 'Trailer') return 'Trailer';
  if (vehicleTypeBodyStyle === 'Tow Dolly / Car Carrier') return 'Tow Dolly / Car Carrier';
  return 'Moving Truck';
}
