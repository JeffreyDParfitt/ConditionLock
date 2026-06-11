import type { GeneratedSection, TemplateItem } from './propertyChecklist';

function item(label: string, description: string, phase: 'pickup' | 'return' | 'both' = 'both'): TemplateItem {
  return { label, description, phase, status: 'not_checked' };
}

// ─── Section item generators ───────────────────────────────────────────────────

function frontExteriorItems(): TemplateItem[] {
  return [
    item('Wide shot — front', 'Full front view of vehicle, centered', 'pickup'),
    item('Front bumper', 'Bumper condition — scratches, cracks, dents, lower lip'),
    item('Hood', 'Hood exterior — scratches, dents, paint condition'),
    item('Grille', 'Grille condition — cracks, missing pieces, mounting'),
    item('Headlights', 'Both headlights — lens, housing, and function'),
    item('Windshield', 'Full windshield — chips, cracks, delamination, pitting'),
    item('Windshield wipers', 'Both wiper blades — streaking, tears, or broken arm'),
    item('Front license plate', 'Present, legible, and secured'),
  ];
}

function rearExteriorItems(
  hasRearLiftgate: boolean,
  hasTailgate: boolean,
  hasTrunkLid: boolean,
): TemplateItem[] {
  const items: TemplateItem[] = [
    item('Wide shot — rear', 'Full rear view of vehicle, centered', 'pickup'),
    item('Rear bumper', 'Bumper condition — scratches, cracks, dents'),
    item('Taillights & brake lights', 'Both sides — lens condition and function'),
    item('Rear window', 'Rear glass — chips, cracks, defroster lines'),
    item('Rear license plate', 'Present, legible, and secured'),
    item('Rear license plate light', 'Illuminated when headlights on'),
  ];
  if (hasTrunkLid) {
    items.push(item('Trunk lid', 'Exterior panel condition and latch operation'));
    items.push(item('Trunk interior', 'Trunk floor, liner, spare tire, and tools present'));
  }
  if (hasRearLiftgate) {
    items.push(item('Rear hatch / liftgate', 'Exterior surface, hinge, latch, and strut operation'));
    items.push(item('Rear hatch glass', 'Rear hatch glass — chips or cracks'));
  }
  if (hasTailgate) {
    items.push(item('Tailgate — exterior', 'Panel condition — dents, scratches, damage'));
    items.push(item('Tailgate latch & handle', 'Handle and latch release operation'));
  }
  return items;
}

function driverSideItems(): TemplateItem[] {
  return [
    item('Wide shot — driver side', 'Full driver-side view, all panels visible', 'pickup'),
    item('Front driver fender', 'Panel condition — scratches, dents, paint'),
    item('Driver side rocker panel', 'Below doors — scratches, dents, mud accumulation'),
    item('Rear driver quarter panel', 'Rear body panel condition'),
    item('Driver side mirror', 'Mirror glass, housing, and mounting condition'),
  ];
}

function passengerSideItems(): TemplateItem[] {
  return [
    item('Wide shot — passenger side', 'Full passenger-side view, all panels visible', 'pickup'),
    item('Front passenger fender', 'Panel condition — scratches, dents, paint'),
    item('Passenger side rocker panel', 'Below doors — scratches, dents'),
    item('Rear passenger quarter panel', 'Rear body panel condition'),
    item('Passenger side mirror', 'Mirror glass, housing, and mounting condition'),
  ];
}

function doorItems(doorLabel: string): TemplateItem[] {
  return [
    item(`${doorLabel} — exterior panel`, 'Panel condition — dents, scratches, paint chips'),
    item(`${doorLabel} — glass & window seal`, 'Window glass condition and weatherstrip'),
    item(`${doorLabel} — exterior handle`, 'Handle and keyhole condition'),
    item(`${doorLabel} — hinge & latch`, 'Opens, closes, and latches securely'),
    item(`${doorLabel} — interior panel`, 'Door card condition — scratches, tears, moisture'),
    item(`${doorLabel} — interior handle & controls`, 'Window control and interior handle function'),
  ];
}

function slidingDoorItems(label: string): TemplateItem[] {
  return [
    item(`${label} — exterior panel`, 'Panel condition — dents, scratches, paint chips'),
    item(`${label} — glass & window seal`, 'Glass condition and rubber seal'),
    item(`${label} — exterior handle`, 'Handle and latch operation'),
    item(`${label} — track & roller`, 'Slides smoothly on track — no catching or binding'),
    item(`${label} — interior panel`, 'Door card condition'),
  ];
}

function tiresWheelsItems(): TemplateItem[] {
  return [
    item('Wide shot — all four wheels', 'Walk-around or diagonal shots showing all wheels', 'pickup'),
    item('Front driver tire & wheel', 'Tread depth, sidewall condition, rim — scratches or bends'),
    item('Front passenger tire & wheel', 'Tread depth, sidewall condition, rim condition'),
    item('Rear driver tire & wheel', 'Tread depth, sidewall condition, rim condition'),
    item('Rear passenger tire & wheel', 'Tread depth, sidewall condition, rim condition'),
    item('Spare tire / emergency kit', 'Spare present — full-size, compact, or flat kit'),
  ];
}

function seatsInteriorItems(seatRows: number, isVan: boolean): TemplateItem[] {
  const items: TemplateItem[] = [
    item('Wide shot — interior', 'Full interior view from door opening', 'pickup'),
    item('Driver seat', 'Fabric or leather — tears, stains, broken adjustment'),
    item('Driver seat belt', 'Belt webbing, buckle latch, and retraction'),
  ];
  if (seatRows >= 1) {
    items.push(item('Front passenger seat', 'Condition — tears, stains, broken springs'));
    items.push(item('Front passenger seat belt', 'Belt webbing and buckle function'));
  }
  if (seatRows >= 2) {
    if (isVan) {
      items.push(item('Middle row seats', 'All middle-row positions — condition and seat belts'));
    } else {
      items.push(item('Rear seat — driver side', 'Seat fabric or leather condition'));
      items.push(item('Rear seat — passenger side', 'Seat fabric or leather condition'));
      items.push(item('Rear seat belts', 'All rear seat belts present and functional'));
    }
  }
  if (seatRows >= 3) {
    items.push(item('Third-row seat', 'Condition — folds flat if applicable'));
    items.push(item('Third-row seat belts', 'All third-row belts present and functional'));
  }
  return items;
}

function dashboardItems(): TemplateItem[] {
  return [
    item('Dashboard — wide shot', 'Dashboard, steering column, and controls overview', 'pickup'),
    item('Odometer reading', 'Photograph odometer display clearly — record mileage', 'pickup'),
    item('Fuel gauge', 'Photograph fuel gauge level at pickup', 'pickup'),
    item('Warning lights', 'Note any check engine, battery, or amber dash lights'),
    item('Steering wheel', 'Condition — cracks, wear, embedded controls'),
    item('Horn', 'Functions correctly'),
    item('Infotainment / radio', 'Screen condition and basic function'),
    item('Climate controls', 'Fan, temperature, and AC controls work'),
    item('Headlight switch', 'Low beam, high beam, and fog light operation'),
    item('Turn signals', 'Left and right signals function correctly'),
    item('Hazard lights', 'Hazard button and indicator function'),
    item('Interior lights', 'Dome and reading lights operational'),
    item('Key / fob', 'Present — all doors, ignition, and remote functions work'),
  ];
}

function consoleFloorItems(hasRearMats: boolean): TemplateItem[] {
  const items: TemplateItem[] = [
    item('Center console', 'Console lid, cupholder, and compartment condition'),
    item('Glove box', 'Opens and closes — interior condition'),
    item('Driver floor mat', 'Condition — stains, wear, properly anchored'),
    item('Front passenger floor mat', 'Condition — stains, wear'),
    item('Driver carpet', 'Carpet or floor material under mat'),
    item('Front passenger carpet', 'Carpet or floor material under mat'),
  ];
  if (hasRearMats) {
    items.push(item('Rear floor mats', 'Both rear positions — stains, wear, missing'));
    items.push(item('Rear carpet', 'Carpet condition under rear mats'));
  }
  items.push(item('Headliner', 'Overhead headliner — stains, tears, sagging'));
  return items;
}

function cargoAreaItems(hasThirdRowFold: boolean): TemplateItem[] {
  return [
    item('Wide shot — cargo area', 'Full cargo area view', 'pickup'),
    item('Cargo floor', 'Floor mat or liner — stains, damage'),
    item('Cargo walls / side trim', 'Trim panels — cracks, missing clips, damage'),
    ...(hasThirdRowFold ? [item('Third-row fold mechanism', 'Seats fold and lock flat correctly')] : []),
    item('Cargo tie-down hooks', 'Hooks or loops present and secure'),
    item('Cargo cover / shade', 'Cover or shade condition if equipped'),
  ];
}

function truckBedItems(hasHitch: boolean, hasBedLiner: boolean): TemplateItem[] {
  return [
    item('Wide shot — truck bed', 'Full bed view from rear with tailgate open', 'pickup'),
    item('Truck bed — front wall (cab-side)', 'Cab-side wall condition — dents, damage'),
    item('Truck bed — driver side wall', 'Wall condition — dents, scratches'),
    item('Truck bed — passenger side wall', 'Wall condition — dents, scratches'),
    item('Truck bed — floor', 'Floor condition — dents, rust, holes, drain'),
    ...(hasBedLiner ? [item('Bed liner', 'Spray-on or drop-in liner — condition and coverage')] : []),
    item('Bed tie-down rings / stake pockets', 'Rings or pockets present and undamaged'),
    ...(hasHitch ? [
      item('Trailer hitch / receiver', 'Hitch ball, receiver tube, and mount condition'),
      item('Hitch pin / lock', 'Pin or locking pin present'),
    ] : []),
  ];
}

function preExistingDamageItems(): TemplateItem[] {
  return [
    item('Walk-around — all pre-existing damage', 'Photograph all pre-existing damage before leaving the lot', 'pickup'),
    item('Damage circled on rental agreement', 'Any damage noted or circled on the rental agreement', 'pickup'),
    item('Agent or staff acknowledgment', 'Staff acknowledged pre-existing damage — note agent name if possible', 'pickup'),
  ];
}

function returnProofItems(): TemplateItem[] {
  return [
    item('Vehicle at return location', 'Vehicle parked in return lane or lot with signage visible', 'return'),
    item('Return lot or bay number', 'Row number, bay, or drop-off point marker photo', 'return'),
    item('Key drop or agent hand-off', 'Key drop slot, key envelope drop, or agent confirmation photo', 'return'),
    item('Return receipt — printed or digital', 'Paper receipt, kiosk receipt, or counter receipt', 'return'),
    item('Return confirmation email or app screenshot', 'Emailed or in-app confirmation with timestamp', 'return'),
    item('Final odometer at return', 'Photograph odometer display at moment of return', 'return'),
    item('Final fuel gauge at return', 'Photograph fuel gauge level at return', 'return'),
  ];
}

function motorcycleItems(): TemplateItem[] {
  return [
    item('Wide shot — left side', 'Full left / rider side view', 'pickup'),
    item('Wide shot — right side', 'Full right side view', 'pickup'),
    item('Front — headlight & forks', 'Headlight, forks, and front fender condition'),
    item('Rear — taillight & rear fender', 'Taillight, exhaust, and rear fender condition'),
    item('Tank', 'Tank condition — dents, scratches, paint'),
    item('Seat', 'Seat condition — tears, cracks, stains'),
    item('Handlebars', 'Grips, levers, mirrors, and bar-end condition'),
    item('Front tire & rim', 'Tread, sidewall, and rim condition'),
    item('Rear tire & rim', 'Tread, sidewall, and rim condition'),
    item('Chain / belt / drive', 'Drive chain or belt condition and tension'),
    item('Instrument cluster', 'Speedometer and gauges — photograph odometer and fuel', 'pickup'),
    item('Exhaust / pipes', 'Pipe condition — scratches, dents, heat marks'),
  ];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface VehicleChecklistOptions {
  hasTrailerHitch?: boolean;
  hasBedLiner?: boolean;
}

export function generateRentalCarSections(
  bodyStyle: string,
  options: VehicleChecklistOptions = {},
): GeneratedSection[] {
  const sections: GeneratedSection[] = [];

  // ── Special cases ──────────────────────────────────────────────────────────
  if (bodyStyle === 'Motorcycle') {
    sections.push({ name: 'Motorcycle Condition', items: motorcycleItems() });
    sections.push({ name: 'Pre-Existing Damage', items: preExistingDamageItems() });
    sections.push({ name: 'Return Proof', items: returnProofItems() });
    return sections;
  }

  if (bodyStyle === 'RV / Motorhome') {
    sections.push({ name: 'RV Exterior — Wide Shots', items: [
      item('Wide shot — driver side', 'Full driver side view', 'pickup'),
      item('Wide shot — passenger side', 'Full passenger side view', 'pickup'),
      item('Wide shot — front', 'Front cab and entry area', 'pickup'),
      item('Wide shot — rear', 'Full rear view', 'pickup'),
      item('Roof', 'Sealant around AC unit, vents, and seams (safe access only)'),
      item('Awning', 'Awning fabric, arms, and motor or crank condition'),
    ]});
    sections.push({ name: 'RV Entry & Exterior Components', items: [
      item('Cab — driver door', 'Driver door exterior and interior condition'),
      item('Cab — passenger door', 'Passenger door exterior and interior condition'),
      item('Entry door', 'Main entry door — exterior, lock, steps, and panel'),
      item('Entry steps', 'Step mechanism and condition'),
      item('Storage compartments', 'All exterior bay doors open and close — interior condition'),
      item('Slideout(s)', 'Slideout panel exterior — condition and operation if present'),
    ]});
    sections.push({ name: 'Wheels & Tires', items: [
      item('Wide shot — all wheels', 'Walk-around covering all wheels', 'pickup'),
      item('Front driver tire & wheel', 'Tread, sidewall, and rim condition'),
      item('Front passenger tire & wheel', 'Tread, sidewall, and rim condition'),
      item('Rear driver tires & wheels', 'Tread, sidewall, and dual-rear condition'),
      item('Rear passenger tires & wheels', 'Tread, sidewall, and dual-rear condition'),
    ]});
    sections.push({ name: 'Cab Interior', items: dashboardItems() });
    sections.push({ name: 'Living & Sleeping Areas', items: [
      item('Living area — wide shot', 'Full living area view', 'pickup'),
      item('Sleeping area — wide shot', 'Bedroom or bunk area view', 'pickup'),
      item('Furniture & surfaces', 'Upholstered surfaces, tables, and cabinetry'),
      item('Flooring', 'Floor condition — stains, damage'),
    ]});
    sections.push({ name: 'Kitchen & Bath', items: [
      item('Kitchen / galley — wide shot', 'Counters, sink, stove, and refrigerator', 'pickup'),
      item('Stove / range', 'Burner or range condition and function'),
      item('Refrigerator', 'Interior — clean, cools correctly, seals intact'),
      item('Kitchen sink & faucet', 'Sink and faucet — no leaks'),
      item('Bathroom — wide shot', 'Toilet, shower, and sink condition', 'pickup'),
      item('Toilet', 'Toilet condition and flush function'),
      item('Shower / wet bath', 'Shower walls, floor, and drain condition'),
    ]});
    sections.push({ name: 'Systems', items: [
      item('Freshwater tank level', 'Level displayed or measured', 'pickup'),
      item('Water pump', 'Water pump function and connections', 'pickup'),
      item('Generator', 'Starts and runs without issue', 'pickup'),
      item('Propane tanks', 'Level and regulator condition', 'pickup'),
      item('Battery bank / house batteries', 'Charge level and terminal condition', 'pickup'),
    ]});
    sections.push({ name: 'Pre-Existing Damage', items: preExistingDamageItems() });
    sections.push({ name: 'Return Proof', items: returnProofItems() });
    return sections;
  }

  if (bodyStyle === 'Boat') {
    sections.push({ name: 'Hull & Exterior', items: [
      item('Wide shot — port side', 'Full port side view', 'pickup'),
      item('Wide shot — starboard side', 'Full starboard side view', 'pickup'),
      item('Bow — front', 'Bow condition and hardware', 'pickup'),
      item('Stern — rear', 'Stern, transom, and motor mount condition', 'pickup'),
      item('Hull above waterline', 'Hull exterior — scratches, gouges, osmotic blisters'),
      item('Deck', 'Deck surface — non-skid, cleats, and fittings'),
      item('Windshield / helm enclosure', 'Glass or plastic condition'),
    ]});
    sections.push({ name: 'Mechanical & Electrical', items: [
      item('Engine / outboard — wide shot', 'Engine exterior and mounting condition', 'pickup'),
      item('Engine hours / hour meter', 'Photograph hour meter at pickup', 'pickup'),
      item('Fuel gauge', 'Photograph fuel level at pickup', 'pickup'),
      item('Battery & bilge pump', 'Battery terminals and bilge pump condition'),
      item('Propeller', 'Blades — nicks, bends, damage'),
      item('Bilge', 'Condition — dry, no oil sheen or debris'),
      item('Fire extinguisher & safety gear', 'Present, mounted, within inspection date', 'pickup'),
      item('Life jackets / PFDs', 'Count and size — one per person minimum', 'pickup'),
    ]});
    sections.push({ name: 'Trailer (if included)', items: [
      item('Trailer — wide shot', 'Trailer condition', 'pickup'),
      item('Trailer hitch & coupler', 'Coupler latch, safety chains, and lights', 'pickup'),
      item('Trailer bunks / rollers', 'Bunk and roller condition', 'pickup'),
      item('Trailer tires', 'Tread and sidewall condition', 'pickup'),
      item('Winch & strap', 'Winch condition and strap or hook', 'pickup'),
    ]});
    sections.push({ name: 'Pre-Existing Damage', items: preExistingDamageItems() });
    sections.push({ name: 'Return Proof', items: returnProofItems() });
    return sections;
  }

  // ── Standard vehicle body styles ──────────────────────────────────────────
  const isSedan = bodyStyle === 'Sedan';
  const isCoupe = bodyStyle === 'Coupe';
  const isHatchback = bodyStyle === 'Hatchback';
  const isWagon = bodyStyle === 'Wagon';
  const isSUV = bodyStyle === 'SUV / Crossover';
  const isRegularCab = bodyStyle === 'Pickup Truck — 2-door / regular cab';
  const isExtendedCab = bodyStyle === 'Pickup Truck — extended cab';
  const isCrewCab = bodyStyle === 'Pickup Truck — crew cab';
  const isPickup = isRegularCab || isExtendedCab || isCrewCab;
  const isMinivan = bodyStyle === 'Minivan';
  const isPassengerVan = bodyStyle === 'Passenger Van';
  const isCargoVan = bodyStyle === 'Cargo Van';
  const isVan = isMinivan || isPassengerVan || isCargoVan;

  const hasRearLiftgate = isHatchback || isWagon || isSUV || isMinivan || isPassengerVan;
  const hasTailgate = isPickup;
  const hasTrunkLid = isSedan || isCoupe;

  sections.push({ name: 'Front Exterior', items: frontExteriorItems() });
  sections.push({ name: 'Rear Exterior', items: rearExteriorItems(hasRearLiftgate, hasTailgate, hasTrunkLid) });
  sections.push({ name: 'Driver Side', items: driverSideItems() });
  sections.push({ name: 'Passenger Side', items: passengerSideItems() });

  // Doors by body style
  if (isSedan || isSUV || isWagon || isHatchback || isCrewCab) {
    sections.push({ name: 'Front Driver Door', items: doorItems('Front driver door') });
    sections.push({ name: 'Rear Driver Door', items: doorItems('Rear driver door') });
    sections.push({ name: 'Front Passenger Door', items: doorItems('Front passenger door') });
    sections.push({ name: 'Rear Passenger Door', items: doorItems('Rear passenger door') });
  } else if (isCoupe || isRegularCab) {
    sections.push({ name: 'Driver Door', items: doorItems('Driver door') });
    sections.push({ name: 'Passenger Door', items: doorItems('Passenger door') });
  } else if (isExtendedCab) {
    sections.push({ name: 'Front Driver Door', items: doorItems('Front driver door') });
    sections.push({ name: 'Front Passenger Door', items: doorItems('Front passenger door') });
    sections.push({ name: 'Rear Driver Access Door', items: doorItems('Rear driver access door') });
    sections.push({ name: 'Rear Passenger Access Door', items: doorItems('Rear passenger access door') });
  } else if (isMinivan) {
    sections.push({ name: 'Front Driver Door', items: doorItems('Front driver door') });
    sections.push({ name: 'Front Passenger Door', items: doorItems('Front passenger door') });
    sections.push({ name: 'Sliding Door — Driver Side', items: slidingDoorItems('Sliding door — driver side') });
    sections.push({ name: 'Sliding Door — Passenger Side', items: slidingDoorItems('Sliding door — passenger side') });
  } else if (isPassengerVan) {
    sections.push({ name: 'Front Driver Door', items: doorItems('Front driver door') });
    sections.push({ name: 'Front Passenger Door', items: doorItems('Front passenger door') });
    sections.push({ name: 'Sliding Side Door', items: slidingDoorItems('Sliding side door') });
  } else if (isCargoVan) {
    sections.push({ name: 'Front Driver Door', items: doorItems('Front driver door') });
    sections.push({ name: 'Front Passenger Door', items: doorItems('Front passenger door') });
    sections.push({ name: 'Sliding Side Door', items: slidingDoorItems('Sliding side door') });
    sections.push({ name: 'Rear Cargo Doors', items: [
      item('Rear cargo doors — wide shot', 'Both cargo doors in closed position', 'pickup'),
      item('Rear cargo door — driver side panel', 'Panel condition — dents, scratches, paint'),
      item('Rear cargo door — passenger side panel', 'Panel condition — dents, scratches'),
      item('Rear cargo door latches', 'Both T-bar or lever latches open and close correctly'),
      item('Rear cargo door seals', 'Rubber seal condition around both doors'),
    ]});
  }

  // Pickup truck bed
  if (isPickup) {
    sections.push({ name: 'Truck Bed', items: truckBedItems(options.hasTrailerHitch ?? false, options.hasBedLiner ?? false) });
  }

  // Cargo area
  if (isHatchback || isWagon || isSUV) {
    sections.push({ name: 'Cargo Area', items: cargoAreaItems(isSUV) });
  } else if (isMinivan || isPassengerVan) {
    sections.push({ name: 'Rear / Cargo Area', items: cargoAreaItems(true) });
  } else if (isCargoVan) {
    sections.push({ name: 'Cargo Area', items: [
      item('Wide shot — cargo area', 'Full cargo area view from rear doors', 'pickup'),
      item('Cargo floor', 'Floor condition — damage, debris, rubber matting or metal'),
      item('Cargo walls — driver side', 'Wall panel condition — dents, holes, damage'),
      item('Cargo walls — passenger side', 'Wall panel condition'),
      item('Cargo ceiling', 'Ceiling condition — dents, holes'),
      item('Bulkhead / cab divider', 'Partition condition and pass-through'),
      item('Tie-down hooks / rails', 'Hooks, rails, or D-rings present and undamaged'),
    ]});
  }

  sections.push({ name: 'Wheels & Tires', items: tiresWheelsItems() });

  const seatRows =
    isCargoVan ? 1 :
    (isSedan || isCoupe || isHatchback || isWagon) ? 2 :
    isSUV ? 2 :
    isRegularCab ? 1 :
    (isExtendedCab || isCrewCab) ? 2 :
    isMinivan ? 3 :
    isPassengerVan ? 3 :
    2;

  sections.push({ name: 'Seats & Interior', items: seatsInteriorItems(seatRows, isVan) });
  sections.push({ name: 'Dashboard & Controls', items: dashboardItems() });

  if (!isCargoVan) {
    sections.push({ name: 'Console, Carpet & Floor Mats', items: consoleFloorItems(seatRows > 1) });
  }

  sections.push({ name: 'Pre-Existing Damage', items: preExistingDamageItems() });
  sections.push({ name: 'Return Proof', items: returnProofItems() });

  return sections;
}
