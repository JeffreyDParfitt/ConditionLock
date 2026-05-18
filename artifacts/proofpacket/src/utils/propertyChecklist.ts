import type { Phase, ChecklistStatus } from '../types';

export interface TemplateItem {
  label: string;
  description: string;
  phase: Phase;
  status: ChecklistStatus;
}

export interface GeneratedSection {
  name: string;
  items: TemplateItem[];
}

export interface BathroomConfig {
  id: string;
  label: string;
  bathroomType: 'full' | 'half' | 'ensuite' | 'shared' | 'public' | 'employee' | 'accessible' | 'other';
  location: string;
  hasTub: boolean;
  hasShower: boolean;
  hasToilet: boolean;
  hasSink: boolean;
  hasMirror: boolean;
  hasFan: boolean;
  hasCabinet: boolean;
  hasTowelRack: boolean;
  flooring: string;
  notes: string;
}

export interface PropertyLayout {
  bedroomsCount: number;
  bathroomsCount: number;
  halfBathroomsCount: number;
  livingRoomsCount: number;
  diningRoomsCount: number;
  kitchensCount: number;
  laundryRoomsCount: number;
  garageCount: number;
  closetsCount: number;
  storageRoomsCount: number;
  hallwaysCount: number;
  hasBasement: boolean;
  hasAttic: boolean;
  balconyCount: number;
  hasYardExterior: boolean;
  hasPool: boolean;
  hasOwnerCloset: boolean;
  officesCount: number;
  conferenceRoomsCount: number;
  hasLobby: boolean;
  hasWarehouse: boolean;
  hasRetailFloor: boolean;
  hasCommercialKitchen: boolean;
  hasLoadingDock: boolean;
  hasParkingExterior: boolean;
  hasKitchenette: boolean;
  hasLivingArea: boolean;
  hasConnectingRoomDoor: boolean;
  hasMiniFridge: boolean;
  hasSafe: boolean;
  hasCloset: boolean;
  bathroomConfigs: BathroomConfig[];
}

function item(label: string, description: string, phase: Phase = 'both'): TemplateItem {
  return { label, description, phase, status: 'not_checked' };
}

function bedroomItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of the room'),
    item('Floor', 'Condition — stains, scratches, carpet wear'),
    item('Walls', 'Condition — holes, scuffs, paint, marks'),
    item('Ceiling', 'Check for water stains, cracks, or damage'),
    item('Door', 'Door condition, hardware, and lock'),
    item('Windows', 'Glass, locks, screens, and blinds or curtains'),
    item('Closet', 'Inside closet — rod, shelf, and condition', 'before'),
    item('Lights', 'Ceiling light or fixtures working'),
    item('Outlets', 'Power outlets functional'),
    item('Baseboard / Trim', 'Check behind door and under windows'),
    item('Under bed / furniture', 'Check under furniture for stains or pests', 'before'),
    item('Odors', 'Note any smoke, pet, or mold odors', 'before'),
  ];
}

function livingRoomItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of the room'),
    item('Floor', 'Condition — stains, damage, carpet wear'),
    item('Walls', 'Condition — holes, scuffs, marks'),
    item('Ceiling', 'Water stains or damage'),
    item('Doors / Entry', 'Door and hardware condition'),
    item('Windows', 'Glass, locks, screens, blinds, or curtains'),
    item('Lights', 'Fixtures working'),
    item('Outlets', 'Power outlets functional'),
    item('Couch / Furniture', 'Flip cushions — check for stains or damage'),
    item('Under furniture', 'Check under couches or chairs', 'before'),
  ];
}

function diningRoomItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of dining room'),
    item('Floor', 'Condition — stains, damage'),
    item('Walls', 'Condition — holes, scuffs'),
    item('Ceiling', 'Water stains or damage'),
    item('Light fixture', 'Chandelier or fixture working'),
    item('Windows', 'Condition and locks'),
  ];
}

function kitchenItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of kitchen'),
    item('Cabinets & Drawers', 'Open and inspect — clean inside, hardware intact'),
    item('Countertops', 'Condition — chips, cracks, stains'),
    item('Sink & Faucet', 'No leaks, drains properly'),
    item('Under-sink', 'Check for water damage or active leaks', 'before'),
    item('Refrigerator', 'Clean, shelves intact, cools correctly'),
    item('Oven / Stove', 'Clean inside and out, burners work'),
    item('Microwave', 'Clean, functions correctly'),
    item('Dishwasher', 'Clean, runs correctly'),
    item('Garbage Disposal', 'Works, no odors'),
    item('Floor', 'Condition — stains, damage, tiles'),
    item('Lights', 'Overhead and under-cabinet lights working'),
  ];
}

function halfBathItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of half bath'),
    item('Floor', 'Condition — stains, tiles, grout'),
    item('Walls', 'Condition'),
    item('Toilet exterior', 'Bowl, tank, and base condition'),
    item('Inside toilet bowl', 'Staining or damage'),
    item('Sink / Vanity', 'Basin, faucet, and counter condition'),
    item('Mirror', 'Condition — chips or cracks'),
    item('Lights', 'Fixtures working'),
    item('Outlet / GFCI', 'Functional'),
    item('Water damage / mold', 'Check corners and under sink', 'before'),
  ];
}

function bathroomItems(config: BathroomConfig): TemplateItem[] {
  const items: TemplateItem[] = [
    item('Wide shot', 'Overall view of bathroom'),
    item('Floor', 'Condition — stains, tiles, grout'),
    item('Walls', 'Condition — tiles, grout, mold, damage'),
    item('Ceiling', 'Check for water stains or mold'),
  ];
  if (config.hasToilet) {
    items.push(item('Toilet exterior', 'Bowl, tank, and base condition'));
    items.push(item('Inside toilet bowl', 'Staining or damage'));
    items.push(item('Inside toilet tank', 'Check if accessible — float, fill valve'));
  }
  if (config.hasSink) {
    items.push(item('Sink / Vanity', 'Basin, faucet, and counter condition'));
    items.push(item('Under sink', 'Check for leaks or water damage', 'before'));
  }
  if (config.hasMirror) {
    items.push(item('Mirror', 'Condition — chips, cracks, backing'));
  }
  if (config.hasTub) {
    items.push(item('Tub', 'Condition — enamel, caulk, and grout'));
  }
  if (config.hasShower) {
    items.push(item('Shower', 'Condition — walls, grout, caulk lines'));
    items.push(item('Shower head', 'Condition and flow'));
  }
  if (config.hasTub || config.hasShower) {
    items.push(item('Drain', 'Check for debris, hair, slow drain', 'before'));
  }
  if (config.hasCabinet) {
    items.push(item('Cabinets / Medicine cabinet', 'Open and inspect — clean inside'));
  }
  items.push(item('Locks / Hinges', 'Door locks and hinges function'));
  if (config.hasFan) {
    items.push(item('Fan / Vent', 'Exhaust fan working'));
  }
  items.push(item('Lights', 'Fixtures working'));
  items.push(item('Outlet / GFCI', 'Present and functional'));
  if (config.hasTowelRack) {
    items.push(item('Towel rack / Hooks', 'Secured to wall, no damage'));
  }
  items.push(item('Water damage / mold', 'Check corners, caulk lines, and ceiling', 'before'));
  if (config.flooring) {
    items.push(item(`Flooring (${config.flooring})`, 'Condition of floor surface'));
  }
  return items;
}

function laundryItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of laundry area'),
    item('Washer', 'Clean, runs correctly, no odors or residue'),
    item('Dryer', 'Clean, heats correctly, lint trap empty'),
    item('Floor', 'Condition — stains, water damage'),
    item('Walls', 'Condition'),
    item('Dryer vent', 'Vent connection visible and intact', 'before'),
    item('Water connections', 'Hoses in good condition, no leaks', 'before'),
  ];
}

function garageItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of garage'),
    item('Floor', 'Condition — stains, oil, cracks'),
    item('Walls', 'Condition'),
    item('Ceiling', 'Condition'),
    item('Garage door', 'Opens and closes properly, no binding'),
    item('Garage door opener', 'Remote and keypad function'),
    item('Side / Entry door', 'Condition and lock function', 'before'),
    item('Lighting', 'Lights working'),
    item('Outlets', 'Power available'),
  ];
}

function basementItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of basement'),
    item('Floor', 'Condition — cracks, stains, moisture'),
    item('Walls', 'Check for cracks, seepage, or efflorescence', 'before'),
    item('Ceiling / Joists', 'Exposed joists or ceiling condition'),
    item('Lights', 'Fixtures working'),
    item('Outlets', 'Power functional'),
    item('Sump pump', 'Present and working if equipped', 'before'),
    item('Water heater', 'Age, condition, no rust or leaks', 'before'),
    item('HVAC / Furnace', 'Condition and filter status', 'before'),
    item('Moisture / mold', 'Check corners and behind any stored items', 'before'),
  ];
}

function atticItems(): TemplateItem[] {
  return [
    item('Wide shot', 'Overall view of accessible attic space'),
    item('Roof decking', 'Check for dark spots, daylight, or rot', 'before'),
    item('Insulation', 'Present and appears intact', 'before'),
    item('Ventilation', 'Soffit or ridge vents visible', 'before'),
    item('Moisture / mold', 'Check decking and rafters', 'before'),
  ];
}

function balconyPatioItems(label: string): TemplateItem[] {
  return [
    item('Wide shot', `Overall view of ${label}`),
    item('Floor / Decking', 'Condition — cracks, splinters, stains'),
    item('Railing', 'Secure, no damage or wobble'),
    item('Door to exterior', 'Condition and lock'),
    item('Ceiling / Overhead', 'Condition if applicable'),
    item('Drain', 'Clear and functional'),
  ];
}

function officeItems(label: string): TemplateItem[] {
  return [
    item('Wide shot', `Overall view of ${label}`),
    item('Floor', 'Condition'),
    item('Walls', 'Condition — holes, cable routes, patches'),
    item('Ceiling', 'Condition — tiles, lights, vents'),
    item('Doors', 'Door and lock condition'),
    item('Windows', 'Condition and locks'),
    item('Lights', 'Fixtures working'),
    item('Outlets / Data ports', 'Power and data connectivity'),
  ];
}

function conferenceRoomItems(label: string): TemplateItem[] {
  return [
    item('Wide shot', `Overall view of ${label}`),
    item('Floor', 'Condition'),
    item('Walls', 'Condition — marks, holes, AV mounts'),
    item('Ceiling', 'Condition — tiles, lights, projector mount'),
    item('Doors', 'Door and lock condition'),
    item('Windows', 'Condition and blinds or shades'),
    item('Display / projector', 'Screen condition if present'),
    item('Lights', 'Fixtures and dimmer working'),
    item('Outlets / Data ports', 'Power and connectivity'),
  ];
}

function storageRoomItems(label: string): TemplateItem[] {
  return [
    item('Wide shot', `Overall view of ${label}`),
    item('Floor', 'Condition'),
    item('Walls', 'Condition'),
    item('Ceiling', 'Condition'),
    item('Shelving', 'Secure and intact if present'),
    item('Door / Lock', 'Door and lock condition'),
    item('Lights', 'Lighting functional'),
  ];
}

export function generatePropertySections(
  layout: PropertyLayout,
  bathroomConfigs: BathroomConfig[]
): GeneratedSection[] {
  const sections: GeneratedSection[] = [];

  for (let i = 1; i <= layout.bedroomsCount; i++) {
    sections.push({ name: `Bedroom ${i}`, items: bedroomItems() });
  }

  const actualBathroomConfigs = bathroomConfigs.slice(0, layout.bathroomsCount);
  for (let i = 1; i <= layout.bathroomsCount; i++) {
    const cfg = actualBathroomConfigs[i - 1];
    const label = cfg?.label || `Bathroom ${i}`;
    if (cfg) {
      sections.push({ name: label, items: bathroomItems(cfg) });
    } else {
      const defaultCfg: BathroomConfig = {
        id: `bath-${i}`,
        label,
        bathroomType: 'full',
        location: '',
        hasTub: true,
        hasShower: true,
        hasToilet: true,
        hasSink: true,
        hasMirror: true,
        hasFan: true,
        hasCabinet: true,
        hasTowelRack: true,
        flooring: '',
        notes: '',
      };
      sections.push({ name: label, items: bathroomItems(defaultCfg) });
    }
  }

  for (let i = 1; i <= layout.halfBathroomsCount; i++) {
    sections.push({ name: `Half Bath ${i}`, items: halfBathItems() });
  }

  for (let i = 1; i <= layout.livingRoomsCount; i++) {
    const label = layout.livingRoomsCount > 1 ? `Living Room ${i}` : 'Living Room';
    sections.push({ name: label, items: livingRoomItems() });
  }

  for (let i = 1; i <= layout.diningRoomsCount; i++) {
    const label = layout.diningRoomsCount > 1 ? `Dining Room ${i}` : 'Dining Room';
    sections.push({ name: label, items: diningRoomItems() });
  }

  for (let i = 1; i <= layout.kitchensCount; i++) {
    const label = layout.kitchensCount > 1 ? `Kitchen ${i}` : 'Kitchen';
    sections.push({ name: label, items: kitchenItems() });
  }

  for (let i = 1; i <= layout.laundryRoomsCount; i++) {
    const label = layout.laundryRoomsCount > 1 ? `Laundry Room ${i}` : 'Laundry Room';
    sections.push({ name: label, items: laundryItems() });
  }

  for (let i = 1; i <= layout.garageCount; i++) {
    const label = layout.garageCount > 1 ? `Garage ${i}` : 'Garage';
    sections.push({ name: label, items: garageItems() });
  }

  for (let i = 1; i <= layout.balconyCount; i++) {
    const label = layout.balconyCount > 1 ? `Balcony / Patio ${i}` : 'Balcony / Patio';
    sections.push({ name: label, items: balconyPatioItems(label.toLowerCase()) });
  }

  if (layout.hasBasement) {
    sections.push({ name: 'Basement', items: basementItems() });
  }

  if (layout.hasAttic) {
    sections.push({ name: 'Attic', items: atticItems() });
  }

  for (let i = 1; i <= layout.officesCount; i++) {
    const label = layout.officesCount > 1 ? `Office ${i}` : 'Office';
    sections.push({ name: label, items: officeItems(label) });
  }

  for (let i = 1; i <= layout.conferenceRoomsCount; i++) {
    const label = layout.conferenceRoomsCount > 1 ? `Conference Room ${i}` : 'Conference Room';
    sections.push({ name: label, items: conferenceRoomItems(label) });
  }

  for (let i = 1; i <= layout.storageRoomsCount; i++) {
    const label = layout.storageRoomsCount > 1 ? `Storage Room ${i}` : 'Storage Room';
    sections.push({ name: label, items: storageRoomItems(label) });
  }

  return sections;
}

export function defaultBathroomConfig(index: number): BathroomConfig {
  return {
    id: `bath-${index}-${Date.now()}`,
    label: `Bathroom ${index}`,
    bathroomType: 'full',
    location: '',
    hasTub: false,
    hasShower: true,
    hasToilet: true,
    hasSink: true,
    hasMirror: true,
    hasFan: true,
    hasCabinet: false,
    hasTowelRack: true,
    flooring: '',
    notes: '',
  };
}
