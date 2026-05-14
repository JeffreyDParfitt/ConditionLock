import type { PacketType, Phase, ChecklistStatus } from '../types';

export interface TemplateItem {
  label: string;
  description: string;
  phase: Phase;
  status: ChecklistStatus;
}

export interface TemplateSection {
  name: string;
  items: TemplateItem[];
}

export interface PacketTemplate {
  type: PacketType;
  name: string;
  description: string;
  category: string;
  sections: TemplateSection[];
}

export const templates: Record<PacketType, PacketTemplate> = {
  car_rental: {
    type: 'car_rental',
    name: 'Rental Car',
    description: 'Document vehicle condition at pickup and return. Works with any rental company or car-sharing platform.',
    category: 'Rental Vehicle',
    sections: [
      {
        name: 'Required Exterior Photos',
        items: [
          { label: 'Front of vehicle', description: 'Wide shot showing front bumper and hood', phase: 'both', status: 'not_checked' },
          { label: 'Rear of vehicle', description: 'Wide shot showing rear bumper and trunk', phase: 'both', status: 'not_checked' },
          { label: 'Driver side', description: 'Wide shot of full driver side', phase: 'both', status: 'not_checked' },
          { label: 'Passenger side', description: 'Wide shot of full passenger side', phase: 'both', status: 'not_checked' },
          { label: 'Roof', description: 'Check for hail or top clearance damage', phase: 'both', status: 'not_checked' },
          { label: 'Wheels & Tires', description: 'Check all 4 wheels for curb rash and tire condition', phase: 'both', status: 'not_checked' },
          { label: 'Windshield & Glass', description: 'Check for chips, cracks, or pits', phase: 'both', status: 'not_checked' },
          { label: 'Mirrors', description: 'Side mirrors intact and secure', phase: 'both', status: 'not_checked' },
          { label: 'Bumpers', description: 'Check lower trim and corners for scrapes', phase: 'both', status: 'not_checked' },
          { label: 'License Plate', description: 'Clear photo of license plate', phase: 'both', status: 'not_checked' },
          { label: 'Existing Scratches / Dents', description: 'Document any pre-existing damage closely', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Required Interior Photos',
        items: [
          { label: 'Driver seat', description: 'Condition of upholstery', phase: 'both', status: 'not_checked' },
          { label: 'Passenger seat', description: 'Condition of upholstery', phase: 'both', status: 'not_checked' },
          { label: 'Back seats', description: 'Condition of upholstery', phase: 'both', status: 'not_checked' },
          { label: 'Dashboard', description: 'General condition', phase: 'both', status: 'not_checked' },
          { label: 'Odometer', description: 'Clear photo showing current mileage', phase: 'both', status: 'not_checked' },
          { label: 'Fuel level', description: 'Clear photo showing fuel gauge', phase: 'both', status: 'not_checked' },
          { label: 'Trunk / Cargo area', description: 'Empty and clean', phase: 'both', status: 'not_checked' },
          { label: 'Floor mats', description: 'Present and condition', phase: 'both', status: 'not_checked' },
          { label: 'Rental agreement / contract', description: 'Photo of the paperwork', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Headlights', description: 'High and low beams working', phase: 'pickup', status: 'not_checked' },
          { label: 'Turn signals', description: 'Left and right working', phase: 'pickup', status: 'not_checked' },
          { label: 'Brake lights', description: 'Working correctly', phase: 'pickup', status: 'not_checked' },
          { label: 'Wipers & Fluid', description: 'Wipers function, fluid sprays', phase: 'pickup', status: 'not_checked' },
          { label: 'Horn', description: 'Functions normally', phase: 'pickup', status: 'not_checked' },
          { label: 'AC / Heat', description: 'Blows cold and hot', phase: 'pickup', status: 'not_checked' },
          { label: 'Windows', description: 'All windows roll up and down', phase: 'pickup', status: 'not_checked' },
          { label: 'Locks', description: 'Doors lock and unlock properly', phase: 'pickup', status: 'not_checked' },
          { label: 'Seatbelts', description: 'Latch and retract properly', phase: 'pickup', status: 'not_checked' },
          { label: 'Warning Lights', description: 'No unexpected dash lights on', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Return Documentation',
        items: [
          { label: 'Return lane / location photo', description: 'Photo of the return area, lot row, or parking spot', phase: 'return', status: 'not_checked' },
          { label: 'Key drop photo', description: 'Photo of key drop box or slot if after-hours return', phase: 'return', status: 'not_checked' },
          { label: 'Return receipt', description: 'Photo of printed or digital return receipt', phase: 'return', status: 'not_checked' },
          { label: 'Return confirmation email/app screenshot', description: 'Screenshot of emailed or in-app return confirmation if available', phase: 'return', status: 'not_checked' },
          { label: 'Final odometer', description: 'Clear photo of odometer at return', phase: 'return', status: 'not_checked' },
          { label: 'Final fuel gauge', description: 'Clear photo of fuel gauge at return', phase: 'return', status: 'not_checked' },
          { label: 'Final EV battery level', description: 'Photo of battery display at return if electric vehicle', phase: 'return', status: 'not_checked' },
          { label: 'Fuel receipt', description: 'Photo of fuel receipt if refueled before return', phase: 'return', status: 'not_checked' },
          { label: 'Charging receipt', description: 'Photo of EV charging receipt if applicable', phase: 'return', status: 'not_checked' },
          { label: 'Timestamped return summary', description: 'Screenshot showing timestamp of return time', phase: 'return', status: 'not_checked' },
        ]
      }
    ]
  },

  moving_truck_van: {
    type: 'moving_truck_van',
    name: 'Moving Truck / Van',
    description: 'Document truck or cargo van condition at pickup and return. Works with U-Haul, Penske, Budget Truck, Enterprise, Ryder, and others.',
    category: 'Rental Vehicle',
    sections: [
      {
        name: 'Required Exterior Photos',
        items: [
          { label: 'Front of vehicle', description: 'Wide shot of cab front', phase: 'both', status: 'not_checked' },
          { label: 'Rear of vehicle', description: 'Wide shot of cargo box rear and door', phase: 'both', status: 'not_checked' },
          { label: 'Driver side', description: 'Full driver side including cab and cargo box', phase: 'both', status: 'not_checked' },
          { label: 'Passenger side', description: 'Full passenger side including cab and cargo box', phase: 'both', status: 'not_checked' },
          { label: 'Roof of cab', description: 'Check for damage or clearance marks', phase: 'both', status: 'not_checked' },
          { label: 'Top of cargo box', description: 'Check for overhead clearance damage', phase: 'both', status: 'not_checked' },
          { label: 'Wheels & Tires', description: 'All tires including duals if applicable', phase: 'both', status: 'not_checked' },
          { label: 'Windshield & Glass', description: 'Chips, cracks, or pits', phase: 'both', status: 'not_checked' },
          { label: 'License plate / unit number', description: 'Clear photo of plate and truck number', phase: 'both', status: 'not_checked' },
          { label: 'Existing damage', description: 'Document any pre-existing dents, scrapes, or damage', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Cargo Box & Loading Area',
        items: [
          { label: 'Cargo box interior — floor', description: 'Check for damage, stains, debris', phase: 'both', status: 'not_checked' },
          { label: 'Cargo box interior — walls', description: 'Check for dents or damage', phase: 'both', status: 'not_checked' },
          { label: 'Cargo box interior — ceiling', description: 'Check for damage', phase: 'both', status: 'not_checked' },
          { label: 'Tie-down rings / tracks', description: 'Present and intact', phase: 'both', status: 'not_checked' },
          { label: 'Loading ramp / lift gate', description: 'Condition and operation', phase: 'both', status: 'not_checked' },
          { label: 'Cargo door & latch', description: 'Rolls up, latches, and locks', phase: 'both', status: 'not_checked' },
          { label: 'Fuel level', description: 'Photo of fuel gauge', phase: 'both', status: 'not_checked' },
          { label: 'Odometer', description: 'Clear photo of mileage', phase: 'both', status: 'not_checked' },
        ]
      },
      {
        name: 'Cab Interior',
        items: [
          { label: 'Driver seat', description: 'Condition of cab seating', phase: 'both', status: 'not_checked' },
          { label: 'Dashboard', description: 'General condition, no warning lights', phase: 'both', status: 'not_checked' },
          { label: 'Rental agreement / contract', description: 'Photo of paperwork', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Headlights', description: 'High and low beams working', phase: 'pickup', status: 'not_checked' },
          { label: 'Brake lights & turn signals', description: 'All working', phase: 'pickup', status: 'not_checked' },
          { label: 'Horn', description: 'Functions normally', phase: 'pickup', status: 'not_checked' },
          { label: 'Wipers & Fluid', description: 'Wipers function, fluid sprays', phase: 'pickup', status: 'not_checked' },
          { label: 'AC / Heat', description: 'Cab climate control works', phase: 'pickup', status: 'not_checked' },
          { label: 'Cargo door operation', description: 'Rolls up and down smoothly', phase: 'pickup', status: 'not_checked' },
          { label: 'Ramp deploy / retract', description: 'Ramp or lift gate operates correctly', phase: 'pickup', status: 'not_checked' },
          { label: 'Warning lights', description: 'No unexpected dash lights on', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Return Documentation',
        items: [
          { label: 'Return location photo', description: 'Photo of truck in return area or designated spot', phase: 'return', status: 'not_checked' },
          { label: 'Key drop photo', description: 'Photo of key drop if returning after hours', phase: 'return', status: 'not_checked' },
          { label: 'Return receipt', description: 'Photo of printed or digital return receipt', phase: 'return', status: 'not_checked' },
          { label: 'Return confirmation email/app screenshot', description: 'Screenshot of emailed or in-app return confirmation if available', phase: 'return', status: 'not_checked' },
          { label: 'Final odometer', description: 'Clear photo of odometer at return', phase: 'return', status: 'not_checked' },
          { label: 'Final fuel gauge', description: 'Clear photo of fuel gauge at return', phase: 'return', status: 'not_checked' },
          { label: 'Fuel receipt', description: 'Photo of fuel receipt if refueled before return', phase: 'return', status: 'not_checked' },
          { label: 'Equipment accounted for', description: 'All rented equipment (dolly, blankets, etc.) loaded and returned', phase: 'return', status: 'not_checked' },
          { label: 'Weight ticket', description: 'Photo of weight ticket if required for PPM/reimbursement', phase: 'return', status: 'not_checked' },
          { label: 'Timestamped return summary', description: 'Screenshot or photo showing timestamp of return', phase: 'return', status: 'not_checked' },
        ]
      }
    ]
  },

  trailer_tow_equipment: {
    type: 'trailer_tow_equipment',
    name: 'Trailer / Tow Equipment',
    description: 'Document trailer or tow equipment condition at pickup and return.',
    category: 'Rental Vehicle',
    sections: [
      {
        name: 'Required Exterior Photos',
        items: [
          { label: 'Front / Coupler end', description: 'Hitch coupler and safety chain mounts', phase: 'both', status: 'not_checked' },
          { label: 'Rear of trailer', description: 'Rear gate, lights, and bumper', phase: 'both', status: 'not_checked' },
          { label: 'Driver side', description: 'Full driver side', phase: 'both', status: 'not_checked' },
          { label: 'Passenger side', description: 'Full passenger side', phase: 'both', status: 'not_checked' },
          { label: 'Wheels & Tires', description: 'Condition of all wheels and tires', phase: 'both', status: 'not_checked' },
          { label: 'License plate', description: 'Clear photo of trailer plate', phase: 'both', status: 'not_checked' },
          { label: 'Unit / trailer number', description: 'Photo of trailer ID sticker or number', phase: 'both', status: 'not_checked' },
          { label: 'Existing damage', description: 'Close-up of any pre-existing dents or scrapes', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Trailer Bed / Interior',
        items: [
          { label: 'Trailer floor / bed', description: 'Condition of floor surface', phase: 'both', status: 'not_checked' },
          { label: 'Side walls / rails', description: 'Condition of walls or stake pockets', phase: 'both', status: 'not_checked' },
          { label: 'Rear gate / ramp', description: 'Gate or ramp condition and operation', phase: 'both', status: 'not_checked' },
          { label: 'Tie-down rings / D-rings', description: 'Present and intact', phase: 'both', status: 'not_checked' },
        ]
      },
      {
        name: 'Hitch & Safety Equipment',
        items: [
          { label: 'Coupler / hitch ball socket', description: 'No cracks, latches securely', phase: 'both', status: 'not_checked' },
          { label: 'Safety chains', description: 'Both chains present and attached', phase: 'both', status: 'not_checked' },
          { label: 'Breakaway cable', description: 'Present and connected if applicable', phase: 'pickup', status: 'not_checked' },
          { label: 'Jack / tongue stand', description: 'Retracts and stows correctly', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Running lights', description: 'Side marker lights illuminated', phase: 'pickup', status: 'not_checked' },
          { label: 'Brake lights', description: 'Activate when tow vehicle brakes', phase: 'pickup', status: 'not_checked' },
          { label: 'Turn signals', description: 'Left and right working', phase: 'pickup', status: 'not_checked' },
          { label: 'Electric brakes', description: 'Trailer brakes engage if equipped', phase: 'pickup', status: 'not_checked' },
        ]
      }
    ]
  },

  custom_rental_vehicle: {
    type: 'custom_rental_vehicle',
    name: 'Custom Rental Vehicle',
    description: 'General rental vehicle condition packet for RVs, motorcycles, boats, or any rental not covered by other templates.',
    category: 'Rental Vehicle',
    sections: [
      {
        name: 'Required Exterior Photos',
        items: [
          { label: 'Front', description: 'Wide shot of front', phase: 'both', status: 'not_checked' },
          { label: 'Rear', description: 'Wide shot of rear', phase: 'both', status: 'not_checked' },
          { label: 'Left side', description: 'Full left side', phase: 'both', status: 'not_checked' },
          { label: 'Right side', description: 'Full right side', phase: 'both', status: 'not_checked' },
          { label: 'Top / Roof', description: 'Top surface condition', phase: 'both', status: 'not_checked' },
          { label: 'Identification number / plate', description: 'License plate, hull ID, VIN, or unit number', phase: 'both', status: 'not_checked' },
          { label: 'Existing damage', description: 'Close-ups of pre-existing damage', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Interior / Cargo',
        items: [
          { label: 'Main interior / cabin', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'Controls / instrument panel', description: 'General condition, no warning indicators', phase: 'both', status: 'not_checked' },
          { label: 'Fuel / charge level', description: 'Photo of gauge or display', phase: 'both', status: 'not_checked' },
          { label: 'Odometer / hour meter', description: 'Clear photo of mileage or hours', phase: 'both', status: 'not_checked' },
          { label: 'Rental agreement / contract', description: 'Photo of paperwork', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Lights', description: 'Running lights, brake lights, signals', phase: 'pickup', status: 'not_checked' },
          { label: 'Engine / motor start', description: 'Starts and runs normally', phase: 'pickup', status: 'not_checked' },
          { label: 'Warning indicators', description: 'No unexpected warnings', phase: 'pickup', status: 'not_checked' },
        ]
      }
    ]
  },

  company_vehicle_handoff: {
    type: 'company_vehicle_handoff',
    name: 'Company Vehicle Handoff',
    description: 'Document company vehicle condition at checkout, return, or transfer between drivers. Works for fleet cars, vans, trucks, delivery vehicles, service vehicles, and any employer-assigned vehicle.',
    category: 'Business',
    sections: [
      {
        name: 'Required Exterior Photos',
        items: [
          { label: 'Front exterior', description: 'Wide shot of front', phase: 'both', status: 'not_checked' },
          { label: 'Rear exterior', description: 'Wide shot of rear', phase: 'both', status: 'not_checked' },
          { label: 'Driver side', description: 'Full driver side', phase: 'both', status: 'not_checked' },
          { label: 'Passenger side', description: 'Full passenger side', phase: 'both', status: 'not_checked' },
          { label: 'Roof', description: 'Check for damage if visible and safe', phase: 'both', status: 'not_checked' },
          { label: 'Hood', description: 'Condition of hood surface', phase: 'both', status: 'not_checked' },
          { label: 'Trunk / hatch / cargo area exterior', description: 'Exterior of cargo or trunk area', phase: 'both', status: 'not_checked' },
          { label: 'Front bumper', description: 'Close-up of front bumper condition', phase: 'both', status: 'not_checked' },
          { label: 'Rear bumper', description: 'Close-up of rear bumper condition', phase: 'both', status: 'not_checked' },
          { label: 'Wheels / rims', description: 'All wheels for curb rash or damage', phase: 'both', status: 'not_checked' },
          { label: 'Tires', description: 'Tread depth and condition', phase: 'both', status: 'not_checked' },
          { label: 'Windshield', description: 'Full windshield for chips or cracks', phase: 'both', status: 'not_checked' },
          { label: 'Side windows', description: 'All side windows', phase: 'both', status: 'not_checked' },
          { label: 'Rear window', description: 'Rear glass condition', phase: 'both', status: 'not_checked' },
          { label: 'Mirrors', description: 'Both side mirrors', phase: 'both', status: 'not_checked' },
          { label: 'License plate', description: 'Clear photo of plate', phase: 'both', status: 'not_checked' },
          { label: 'Company decals / branding', description: 'Condition of any decals, logos, or wraps if present', phase: 'both', status: 'not_checked' },
          { label: 'Existing scratches / dents', description: 'Close-ups of all pre-existing damage at checkout', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Required Interior Photos',
        items: [
          { label: 'Driver seat', description: 'Upholstery condition', phase: 'both', status: 'not_checked' },
          { label: 'Passenger seat', description: 'Upholstery condition', phase: 'both', status: 'not_checked' },
          { label: 'Back seats', description: 'Rear seat condition', phase: 'both', status: 'not_checked' },
          { label: 'Dashboard', description: 'General dashboard condition', phase: 'both', status: 'not_checked' },
          { label: 'Odometer', description: 'Clear photo of current mileage', phase: 'both', status: 'not_checked' },
          { label: 'Fuel gauge / EV battery display', description: 'Photo of fuel or charge level', phase: 'both', status: 'not_checked' },
          { label: 'Warning lights', description: 'Note any active warning or check lights', phase: 'both', status: 'not_checked' },
          { label: 'Center console', description: 'Condition of console', phase: 'both', status: 'not_checked' },
          { label: 'Glove box', description: 'Open and check — registration/insurance present', phase: 'pickup', status: 'not_checked' },
          { label: 'Trunk / cargo area', description: 'Interior cargo space condition', phase: 'both', status: 'not_checked' },
          { label: 'Floor mats', description: 'Present and condition', phase: 'both', status: 'not_checked' },
          { label: 'Headliner', description: 'Ceiling fabric condition', phase: 'both', status: 'not_checked' },
          { label: 'Infotainment screen', description: 'Screen condition, no cracks', phase: 'both', status: 'not_checked' },
          { label: 'Cab cleanliness', description: 'Overall interior cleanliness', phase: 'both', status: 'not_checked' },
          { label: 'Personal items removed', description: 'No personal belongings left behind', phase: 'return', status: 'not_checked' },
        ]
      },
      {
        name: 'Work Equipment / Accessories',
        items: [
          { label: 'Keys / key fob', description: 'Issued and accounted for', phase: 'both', status: 'not_checked' },
          { label: 'Spare key', description: 'Spare key present if issued', phase: 'both', status: 'not_checked' },
          { label: 'Fuel card', description: 'Fuel card issued and returned', phase: 'both', status: 'not_checked' },
          { label: 'Toll transponder', description: 'Transponder present if issued', phase: 'both', status: 'not_checked' },
          { label: 'Parking pass', description: 'Present if issued', phase: 'both', status: 'not_checked' },
          { label: 'Company phone / tablet mount', description: 'Mount present and undamaged', phase: 'both', status: 'not_checked' },
          { label: 'Charger / cables', description: 'Vehicle or device charger cables present', phase: 'both', status: 'not_checked' },
          { label: 'Dashcam', description: 'Present and powered if equipped', phase: 'both', status: 'not_checked' },
          { label: 'GPS / telematics device', description: 'Device visible and undamaged if equipped', phase: 'both', status: 'not_checked' },
          { label: 'Safety vest / PPE', description: 'Safety gear present if issued', phase: 'both', status: 'not_checked' },
          { label: 'Traffic cones', description: 'Count and condition', phase: 'both', status: 'not_checked' },
          { label: 'First aid kit', description: 'Present and stocked if issued', phase: 'both', status: 'not_checked' },
          { label: 'Fire extinguisher', description: 'Present and in date if issued', phase: 'both', status: 'not_checked' },
          { label: 'Tools', description: 'All issued tools accounted for', phase: 'both', status: 'not_checked' },
          { label: 'Ladder / ladder rack', description: 'Present and secured', phase: 'both', status: 'not_checked' },
          { label: 'Cargo straps / tie-downs', description: 'Count and condition', phase: 'both', status: 'not_checked' },
          { label: 'Delivery bags / totes', description: 'Count and condition if applicable', phase: 'both', status: 'not_checked' },
          { label: 'Paperwork / documents', description: 'Vehicle registration and insurance card present', phase: 'both', status: 'not_checked' },
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Headlights', description: 'Low beams working', phase: 'pickup', status: 'not_checked' },
          { label: 'High beams', description: 'High beams working', phase: 'pickup', status: 'not_checked' },
          { label: 'Turn signals', description: 'Left and right working', phase: 'pickup', status: 'not_checked' },
          { label: 'Brake lights', description: 'All brake lights illuminated', phase: 'pickup', status: 'not_checked' },
          { label: 'Hazard lights', description: 'Four-way flashers working', phase: 'pickup', status: 'not_checked' },
          { label: 'Reverse lights', description: 'Illuminate when in reverse if safely checkable', phase: 'pickup', status: 'not_checked' },
          { label: 'Wipers', description: 'All speeds working, blades in good condition', phase: 'pickup', status: 'not_checked' },
          { label: 'Horn', description: 'Functions normally', phase: 'pickup', status: 'not_checked' },
          { label: 'AC / Heat', description: 'Climate control functional', phase: 'pickup', status: 'not_checked' },
          { label: 'Windows', description: 'All windows roll up and down', phase: 'pickup', status: 'not_checked' },
          { label: 'Door locks', description: 'All doors lock and unlock', phase: 'pickup', status: 'not_checked' },
          { label: 'Seatbelts', description: 'Latch and retract properly', phase: 'pickup', status: 'not_checked' },
          { label: 'Warning lights', description: 'No unexpected dash warnings', phase: 'pickup', status: 'not_checked' },
          { label: 'Backup camera', description: 'Displays when reversing if equipped', phase: 'pickup', status: 'not_checked' },
          { label: 'Liftgate', description: 'Operates correctly if equipped', phase: 'pickup', status: 'not_checked' },
          { label: 'Cargo door', description: 'Rolls up, latches, locks if van/truck', phase: 'pickup', status: 'not_checked' },
          { label: 'Loading ramp', description: 'Deploys and retracts if equipped', phase: 'pickup', status: 'not_checked' },
          { label: 'EV charging cable', description: 'Cable present and undamaged if electric vehicle', phase: 'pickup', status: 'not_checked' },
        ]
      },
      {
        name: 'Damage Documentation',
        items: [
          { label: 'All pre-existing damage documented', description: 'All scratches, dents, chips, and wear noted at checkout', phase: 'pickup', status: 'not_checked' },
          { label: 'Damage photos taken', description: 'Close-up photos of each damage area', phase: 'pickup', status: 'not_checked' },
          { label: 'Damage reported to supervisor', description: 'Pre-existing damage confirmed with manager before checkout', phase: 'pickup', status: 'not_checked' },
          { label: 'New damage at return documented', description: 'Any new damage since checkout is photographed and noted', phase: 'return', status: 'not_checked' },
          { label: 'New damage reported', description: 'New damage reported to supervisor / fleet manager', phase: 'return', status: 'not_checked' },
        ]
      },
      {
        name: 'Return / Check-In Condition',
        items: [
          { label: 'Same overall condition as checkout', description: 'No new undocumented damage', phase: 'return', status: 'not_checked' },
          { label: 'Fuel / battery level documented', description: 'Photo taken of gauge at return', phase: 'return', status: 'not_checked' },
          { label: 'Ending odometer documented', description: 'Photo taken of mileage at return', phase: 'return', status: 'not_checked' },
          { label: 'Keys / fob returned', description: 'All keys accounted for', phase: 'return', status: 'not_checked' },
          { label: 'Fuel card returned', description: 'Fuel card returned if issued', phase: 'return', status: 'not_checked' },
          { label: 'Toll transponder returned', description: 'Transponder returned if issued', phase: 'return', status: 'not_checked' },
          { label: 'Equipment / accessories returned', description: 'All issued items returned and accounted for', phase: 'return', status: 'not_checked' },
          { label: 'Cargo area emptied', description: 'No items left in cargo area', phase: 'return', status: 'not_checked' },
          { label: 'Personal items removed', description: 'Driver has removed all personal belongings', phase: 'return', status: 'not_checked' },
          { label: 'Cab cleanliness acceptable', description: 'Interior left in acceptable condition', phase: 'return', status: 'not_checked' },
          { label: 'Supervisor / fleet manager notified', description: 'Return confirmed with responsible party', phase: 'return', status: 'not_checked' },
        ]
      },
      {
        name: 'Driver Transfer',
        items: [
          { label: 'Outgoing driver condition documented', description: 'Vehicle condition documented by outgoing driver', phase: 'transfer', status: 'not_checked' },
          { label: 'Incoming driver condition documented', description: 'Incoming driver confirms or notes differences', phase: 'transfer', status: 'not_checked' },
          { label: 'Odometer at transfer documented', description: 'Clear photo of mileage at handoff', phase: 'transfer', status: 'not_checked' },
          { label: 'Fuel / battery at transfer documented', description: 'Gauge photo taken at handoff', phase: 'transfer', status: 'not_checked' },
          { label: 'Keys / accessories handed over', description: 'All items transferred to incoming driver', phase: 'transfer', status: 'not_checked' },
          { label: 'Outgoing driver signature captured', description: 'Outgoing driver signed the handoff report', phase: 'transfer', status: 'not_checked' },
          { label: 'Incoming driver signature captured', description: 'Incoming driver signed the handoff report', phase: 'transfer', status: 'not_checked' },
        ]
      }
    ]
  },

  hotel: {
    type: 'hotel',
    name: 'Hotel Stay',
    description: 'Document room condition upon arrival and departure.',
    category: 'Personal / Travel',
    sections: [
      {
        name: 'Required Photos',
        items: [
          { label: 'Room Door / Number', description: 'Outside of room showing number', phase: 'before', status: 'not_checked' },
          { label: 'Bed', description: 'Overall condition of bed', phase: 'both', status: 'not_checked' },
          { label: 'Bathroom', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'Closet', description: 'Inside closet', phase: 'both', status: 'not_checked' },
          { label: 'Desk / Furniture', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'TV / Remote', description: 'Present and condition', phase: 'both', status: 'not_checked' },
          { label: 'Checkout Condition', description: 'Overall room state when leaving', phase: 'after', status: 'not_checked' }
        ]
      },
      {
        name: 'Open & Inspect',
        items: [
          { label: 'Closet', description: 'Check hangers, robes, iron', phase: 'before', status: 'not_checked' },
          { label: 'Drawers', description: 'Check all dresser drawers', phase: 'before', status: 'not_checked' },
          { label: 'Nightstand drawers', description: 'Check inside', phase: 'before', status: 'not_checked' },
          { label: 'Minibar', description: 'Check contents and seals if applicable', phase: 'before', status: 'not_checked' },
          { label: 'Safe', description: 'Open and empty', phase: 'before', status: 'not_checked' },
          { label: 'Windows', description: 'Check locks and glass', phase: 'before', status: 'not_checked' },
          { label: 'Bathroom Vanity', description: 'Check under sink', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Flip / Lift / Look Under',
        items: [
          { label: 'Bed linens', description: 'Check for stains or pests', phase: 'before', status: 'not_checked' },
          { label: 'Mattress corners', description: 'Lift sheets to check mattress', phase: 'before', status: 'not_checked' },
          { label: 'Under bed', description: 'Check for left items', phase: 'before', status: 'not_checked' },
          { label: 'Curtains', description: 'Check behind curtains', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Bathroom Deep Check',
        items: [
          { label: 'Toilet flush', description: 'Flushes correctly', phase: 'before', status: 'not_checked' },
          { label: 'Sink hot/cold', description: 'Water runs, drains properly', phase: 'before', status: 'not_checked' },
          { label: 'Shower', description: 'Runs, drains properly', phase: 'before', status: 'not_checked' },
          { label: 'Towels', description: 'Adequate supply, clean', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Lights', description: 'All switches work', phase: 'before', status: 'not_checked' },
          { label: 'Outlets', description: 'Power available', phase: 'before', status: 'not_checked' },
          { label: 'AC / Heat', description: 'Thermostat works', phase: 'before', status: 'not_checked' },
          { label: 'TV / Remote', description: 'Turns on, channels work', phase: 'before', status: 'not_checked' },
          { label: 'Wi-Fi', description: 'Connects properly', phase: 'before', status: 'not_checked' },
          { label: 'Locks', description: 'Deadbolt and latch work', phase: 'before', status: 'not_checked' }
        ]
      }
    ]
  },

  airbnb: {
    type: 'airbnb',
    name: 'Airbnb / Short-Term Rental',
    description: 'Protect against false damage claims and extra cleaning fees.',
    category: 'Personal / Travel',
    sections: [
      {
        name: 'Required Photos',
        items: [
          { label: 'Entry / Front Door', description: 'Condition of entrance', phase: 'both', status: 'not_checked' },
          { label: 'Living Room', description: 'Wide shot of main area', phase: 'both', status: 'not_checked' },
          { label: 'Kitchen', description: 'Wide shot of kitchen', phase: 'both', status: 'not_checked' },
          { label: 'Bathroom(s)', description: 'Wide shot of each bathroom', phase: 'both', status: 'not_checked' },
          { label: 'Bedroom(s)', description: 'Wide shot of each bedroom', phase: 'both', status: 'not_checked' },
          { label: 'Appliances', description: 'Condition of major appliances', phase: 'both', status: 'not_checked' },
          { label: 'Checkout Condition', description: 'Show you left it clean', phase: 'after', status: 'not_checked' },
          { label: 'Existing Damage', description: 'Document ANY pre-existing issues immediately', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Open & Inspect',
        items: [
          { label: 'Cabinets & Drawers', description: 'Check inside for cleanliness/items', phase: 'before', status: 'not_checked' },
          { label: 'Closets', description: 'Check hangers, extra linens', phase: 'before', status: 'not_checked' },
          { label: 'Refrigerator / Freezer', description: 'Clean, no left-over food', phase: 'before', status: 'not_checked' },
          { label: 'Oven / Microwave', description: 'Clean inside', phase: 'before', status: 'not_checked' },
          { label: 'Dishwasher', description: 'Empty and clean', phase: 'before', status: 'not_checked' },
          { label: 'Washer / Dryer', description: 'Empty', phase: 'before', status: 'not_checked' },
          { label: 'Windows / Doors', description: 'Check all locks', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Flip / Lift / Look Under',
        items: [
          { label: 'Couch cushions', description: 'Check for stains/damage', phase: 'before', status: 'not_checked' },
          { label: 'Mattress corners', description: 'Check for stains/pests', phase: 'before', status: 'not_checked' },
          { label: 'Rugs / Mats', description: 'Check under for hidden stains', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Bathroom Deep Check',
        items: [
          { label: 'Toilets', description: 'Flush properly, no leaks', phase: 'before', status: 'not_checked' },
          { label: 'Under-sink', description: 'Check for leaks/water damage', phase: 'before', status: 'not_checked' },
          { label: 'Shower / Tub', description: 'Drains properly, condition of grout', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Lights & Outlets', description: 'All working', phase: 'before', status: 'not_checked' },
          { label: 'Faucets & Hot Water', description: 'Working properly', phase: 'before', status: 'not_checked' },
          { label: 'AC / Heat', description: 'Thermostat functions', phase: 'before', status: 'not_checked' },
          { label: 'Appliances', description: 'Turn on briefly to test', phase: 'before', status: 'not_checked' },
          { label: 'Wi-Fi', description: 'Connects properly', phase: 'before', status: 'not_checked' },
          { label: 'TV / Remotes', description: 'Working', phase: 'before', status: 'not_checked' },
          { label: 'Smoke / CO Detectors', description: 'Present and untampered', phase: 'before', status: 'not_checked' }
        ]
      }
    ]
  },

  apartment_home: {
    type: 'apartment_home',
    name: 'Apartment / Home Rental',
    description: 'Thorough move-in/move-out condition report.',
    category: 'Housing',
    sections: [
      {
        name: 'Required Photos',
        items: [
          { label: 'Exterior / Entry', description: 'Front door, porch, mailbox', phase: 'both', status: 'not_checked' },
          { label: 'Each Room Wide Shot', description: 'Overall view of every room', phase: 'both', status: 'not_checked' },
          { label: 'Walls & Baseboards', description: 'Show paint condition, scuffs', phase: 'both', status: 'not_checked' },
          { label: 'Floors & Carpets', description: 'Show flooring condition, stains', phase: 'both', status: 'not_checked' },
          { label: 'Windows & Blinds', description: 'Show condition of coverings', phase: 'both', status: 'not_checked' },
          { label: 'Existing Damage', description: 'Close-ups of ANY pre-existing damage', phase: 'before', status: 'not_checked' },
          { label: 'Keys', description: 'Photo of all keys provided/returned', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Rooms',
        items: [
          { label: 'Living Room', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'Kitchen', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'Bedroom(s)', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'Bathroom(s)', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'Hallways / Stairs', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'Laundry Area', description: 'Overall condition', phase: 'both', status: 'not_checked' },
          { label: 'Exterior / Patio', description: 'Overall condition', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Kitchen Deep Check',
        items: [
          { label: 'Cabinets & Drawers', description: 'Open easily, clean inside', phase: 'both', status: 'not_checked' },
          { label: 'Refrigerator', description: 'Clean, shelves intact, cold', phase: 'both', status: 'not_checked' },
          { label: 'Oven & Stove', description: 'Clean, burners work', phase: 'both', status: 'not_checked' },
          { label: 'Dishwasher', description: 'Clean, intact', phase: 'both', status: 'not_checked' },
          { label: 'Sink & Disposal', description: 'No leaks, disposal works', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Bathroom Deep Check',
        items: [
          { label: 'Toilet', description: 'Flushes, no base leaks', phase: 'both', status: 'not_checked' },
          { label: 'Shower / Tub', description: 'Clean, drains, grout intact', phase: 'both', status: 'not_checked' },
          { label: 'Sink & Vanity', description: 'No leaks under sink', phase: 'both', status: 'not_checked' },
          { label: 'Ventilation', description: 'Exhaust fan works', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Test It / Systems',
        items: [
          { label: 'Lights & Outlets', description: 'Check every room', phase: 'before', status: 'not_checked' },
          { label: 'HVAC', description: 'AC and Heat turn on', phase: 'before', status: 'not_checked' },
          { label: 'Smoke / CO Detectors', description: 'Present and working', phase: 'before', status: 'not_checked' },
          { label: 'Doors & Locks', description: 'All latch and lock securely', phase: 'before', status: 'not_checked' },
          { label: 'Windows', description: 'Open, close, lock, screens intact', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Hidden / Easy-to-Miss',
        items: [
          { label: 'Under Sinks', description: 'Check for old water damage', phase: 'before', status: 'not_checked' },
          { label: 'Ceilings', description: 'Check for water stains', phase: 'before', status: 'not_checked' },
          { label: 'Baseboards', description: 'Check behind doors/furniture', phase: 'before', status: 'not_checked' },
          { label: 'Odors', description: 'Note any smoke or pet odors', phase: 'before', status: 'not_checked' },
          { label: 'Pest Evidence', description: 'Check cabinets and corners', phase: 'before', status: 'not_checked' }
        ]
      }
    ]
  },

  business_commercial_lease: {
    type: 'business_commercial_lease',
    name: 'Business / Commercial Lease',
    description: 'Document commercial space condition for lease start/end.',
    category: 'Business',
    sections: [
      {
        name: 'Entry / Exterior',
        items: [
          { label: 'Storefront / Facade', description: 'Overall exterior condition', phase: 'both', status: 'not_checked' },
          { label: 'Signage Areas', description: 'Condition of sign mounts/fascia', phase: 'both', status: 'not_checked' },
          { label: 'Doors & Locks', description: 'Entry doors function and secure', phase: 'both', status: 'not_checked' },
          { label: 'Windows / Glass', description: 'Condition of display windows', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Interior Structure',
        items: [
          { label: 'Walls', description: 'Paint, drywall condition, holes', phase: 'both', status: 'not_checked' },
          { label: 'Flooring', description: 'Carpet, tile, concrete condition', phase: 'both', status: 'not_checked' },
          { label: 'Ceilings', description: 'Drop ceiling tiles, leaks/stains', phase: 'both', status: 'not_checked' },
          { label: 'Doors / Frames', description: 'Interior doors and hardware', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Systems (Test It)',
        items: [
          { label: 'Electrical Panels', description: 'Accessible, labeled, condition', phase: 'both', status: 'not_checked' },
          { label: 'Lighting', description: 'Fixtures work, missing bulbs', phase: 'both', status: 'not_checked' },
          { label: 'HVAC Units / Vents', description: 'Functioning, visible condition', phase: 'both', status: 'not_checked' },
          { label: 'Plumbing', description: 'Visible pipes, water heater if app.', phase: 'both', status: 'not_checked' },
          { label: 'Fire / Life Safety', description: 'Sprinklers, alarms, exits clear', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Restrooms',
        items: [
          { label: 'Fixtures', description: 'Toilets, urinals, sinks', phase: 'both', status: 'not_checked' },
          { label: 'Partitions', description: 'Stalls and doors intact', phase: 'both', status: 'not_checked' },
          { label: 'Accessories', description: 'Dispensers, mirrors', phase: 'both', status: 'not_checked' },
          { label: 'Ventilation', description: 'Exhaust fans working', phase: 'both', status: 'not_checked' }
        ]
      }
    ]
  },

  business_changeover_as_is_sale: {
    type: 'business_changeover_as_is_sale',
    name: 'Business Changeover / As-Is Sale',
    description: 'Asset transfer and condition documentation for business sales.',
    category: 'Business',
    sections: [
      {
        name: 'Business Overview',
        items: [
          { label: 'General Interior', description: 'Wide shots of main operation areas', phase: 'handoff', status: 'not_checked' },
          { label: 'General Exterior', description: 'Exterior condition at handoff', phase: 'handoff', status: 'not_checked' }
        ]
      },
      {
        name: 'Included Assets (FF&E)',
        items: [
          { label: 'Major Equipment', description: 'Document condition and serials', phase: 'handoff', status: 'not_checked' },
          { label: 'Furniture', description: 'Condition of included furniture', phase: 'handoff', status: 'not_checked' },
          { label: 'Fixtures', description: 'Built-in items included in sale', phase: 'handoff', status: 'not_checked' },
          { label: 'Point of Sale / Tech', description: 'Registers, computers, networks', phase: 'handoff', status: 'not_checked' },
          { label: 'Inventory', description: 'General photo of included stock', phase: 'handoff', status: 'not_checked' }
        ]
      },
      {
        name: 'Excluded Assets',
        items: [
          { label: 'Removed Items', description: 'Verify items not in sale are removed', phase: 'handoff', status: 'not_checked' },
          { label: 'Damage from Removal', description: 'Document any damage from taking items', phase: 'handoff', status: 'not_checked' }
        ]
      },
      {
        name: 'Operations Test',
        items: [
          { label: 'Equipment Power-on', description: 'Key equipment powers on', phase: 'handoff', status: 'not_checked' },
          { label: 'Locks & Security', description: 'Alarm codes, key handoff', phase: 'handoff', status: 'not_checked' },
          { label: 'Systems', description: 'HVAC, plumbing, electrical status', phase: 'handoff', status: 'not_checked' }
        ]
      }
    ]
  },

  property_sale_home_sale: {
    type: 'property_sale_home_sale',
    name: 'Property Sale / Home Sale',
    description: 'Final walkthrough documentation before closing.',
    category: 'Housing',
    sections: [
      {
        name: 'Required Photos',
        items: [
          { label: 'Exterior Front', description: 'Overall front of house', phase: 'handoff', status: 'not_checked' },
          { label: 'Exterior Rear', description: 'Overall back of house/yard', phase: 'handoff', status: 'not_checked' },
          { label: 'Each Room', description: 'Wide shot showing it is empty/clean', phase: 'handoff', status: 'not_checked' },
          { label: 'Keys/Remotes', description: 'Photo of handed over keys/openers', phase: 'handoff', status: 'not_checked' }
        ]
      },
      {
        name: 'Agreed Condition',
        items: [
          { label: 'Property Empty', description: 'All seller personal items removed', phase: 'handoff', status: 'not_checked' },
          { label: 'Broom Swept', description: 'Property is clean as agreed', phase: 'handoff', status: 'not_checked' },
          { label: 'Trash Removed', description: 'No debris left behind', phase: 'handoff', status: 'not_checked' },
          { label: 'Repairs Completed', description: 'Check agreed upon repairs', phase: 'handoff', status: 'not_checked' }
        ]
      },
      {
        name: 'Fixtures / Included Items',
        items: [
          { label: 'Appliances', description: 'Agreed appliances are present/working', phase: 'handoff', status: 'not_checked' },
          { label: 'Light Fixtures', description: 'Agreed fixtures remain', phase: 'handoff', status: 'not_checked' },
          { label: 'Window Coverings', description: 'Blinds/curtains remain if agreed', phase: 'handoff', status: 'not_checked' },
          { label: 'Smart Home Devices', description: 'Thermostats, doorbells remain', phase: 'handoff', status: 'not_checked' },
          { label: 'Outdoor/Landscape', description: 'Plants/sheds remain as agreed', phase: 'handoff', status: 'not_checked' }
        ]
      },
      {
        name: 'Systems Check',
        items: [
          { label: 'HVAC', description: 'Running and functioning', phase: 'handoff', status: 'not_checked' },
          { label: 'Plumbing', description: 'No active new leaks', phase: 'handoff', status: 'not_checked' },
          { label: 'Electrical', description: 'Power is on and working', phase: 'handoff', status: 'not_checked' }
        ]
      }
    ]
  },

  vehicle_sale_as_is_transfer: {
    type: 'vehicle_sale_as_is_transfer',
    name: 'Vehicle Sale / As-Is Transfer',
    description: 'Document condition for private party auto sales.',
    category: 'Vehicle',
    sections: [
      {
        name: 'Vehicle Overview',
        items: [
          { label: 'VIN Tag', description: 'Photo of VIN on dash or door jam', phase: 'sale', status: 'not_checked' },
          { label: 'Odometer', description: 'Photo of exact mileage at sale', phase: 'sale', status: 'not_checked' },
          { label: 'Dashboard', description: 'Show any active warning lights', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Exterior Condition',
        items: [
          { label: 'Front & Rear', description: 'Wide shots', phase: 'sale', status: 'not_checked' },
          { label: 'Both Sides', description: 'Driver and passenger side', phase: 'sale', status: 'not_checked' },
          { label: 'Roof', description: 'Top condition', phase: 'sale', status: 'not_checked' },
          { label: 'Wheels & Tires', description: 'All four', phase: 'sale', status: 'not_checked' },
          { label: 'Known Damage', description: 'Close-ups of all existing damage', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Interior Condition',
        items: [
          { label: 'Front Seats', description: 'Condition of upholstery', phase: 'sale', status: 'not_checked' },
          { label: 'Rear Seats', description: 'Condition of upholstery', phase: 'sale', status: 'not_checked' },
          { label: 'Trunk', description: 'Condition, spare tire present', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'As-Is Acknowledgment',
        items: [
          { label: 'Bill of Sale', description: 'Photo of signed bill of sale', phase: 'sale', status: 'not_checked' },
          { label: 'Keys Handed Over', description: 'All keys exchanged', phase: 'sale', status: 'not_checked' }
        ]
      }
    ]
  },

  equipment_sale_as_is_transfer: {
    type: 'equipment_sale_as_is_transfer',
    name: 'Equipment Sale / As-Is Transfer',
    description: 'Document equipment condition for commercial as-is sales.',
    category: 'Business',
    sections: [
      {
        name: 'Equipment Overview',
        items: [
          { label: 'Serial / Model Number', description: 'Photo of serial number tag', phase: 'sale', status: 'not_checked' },
          { label: 'Overall Condition', description: 'Wide shot showing general state', phase: 'sale', status: 'not_checked' },
          { label: 'Known Damage / Wear', description: 'Close-ups of any damage', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Condition Check',
        items: [
          { label: 'Exterior / Housing', description: 'Condition of outer surfaces', phase: 'sale', status: 'not_checked' },
          { label: 'Moving Parts', description: 'Condition of belts, chains, rollers', phase: 'sale', status: 'not_checked' },
          { label: 'Electrical / Controls', description: 'Panel and control condition', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'As-Is Acknowledgment',
        items: [
          { label: 'Power-on Test', description: 'Equipment powers on as-is', phase: 'sale', status: 'not_checked' },
          { label: 'Bill of Sale', description: 'Photo of signed agreement', phase: 'sale', status: 'not_checked' }
        ]
      }
    ]
  },

  general_item_sale_as_is_transfer: {
    type: 'general_item_sale_as_is_transfer',
    name: 'General Item Sale / As-Is Transfer',
    description: 'Document condition for any item sold or transferred as-is.',
    category: 'Vehicle',
    sections: [
      {
        name: 'Item Overview',
        items: [
          { label: 'Item — Overall', description: 'Wide shot of item', phase: 'sale', status: 'not_checked' },
          { label: 'All Sides', description: 'Front, back, and sides', phase: 'sale', status: 'not_checked' },
          { label: 'Known Damage / Wear', description: 'Close-up of any issues', phase: 'sale', status: 'not_checked' },
          { label: 'Serial / ID Number', description: 'If applicable', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'As-Is Acknowledgment',
        items: [
          { label: 'Agreement / Receipt', description: 'Photo of sale agreement', phase: 'sale', status: 'not_checked' }
        ]
      }
    ]
  },

  moving_storage: {
    type: 'moving_storage',
    name: 'Moving / Storage',
    description: 'Document items and condition before moving or putting into storage.',
    category: 'Personal / Travel',
    sections: [
      {
        name: 'Inventory Overview',
        items: [
          { label: 'All Items Packed', description: 'Wide shot before loading', phase: 'before', status: 'not_checked' },
          { label: 'Loaded Truck / Unit', description: 'How items are loaded/packed', phase: 'before', status: 'not_checked' },
          { label: 'Delivered / Unloaded', description: 'Condition on arrival', phase: 'after', status: 'not_checked' }
        ]
      },
      {
        name: 'High-Value Items',
        items: [
          { label: 'Electronics', description: 'Condition before packing', phase: 'before', status: 'not_checked' },
          { label: 'Furniture', description: 'Condition before packing', phase: 'before', status: 'not_checked' },
          { label: 'Appliances', description: 'Condition before packing', phase: 'before', status: 'not_checked' },
          { label: 'Artwork / Fragile', description: 'Condition before packing', phase: 'before', status: 'not_checked' }
        ]
      }
    ]
  },

  equipment_rental: {
    type: 'equipment_rental',
    name: 'Equipment Rental',
    description: 'Document rental equipment condition at pickup and return.',
    category: 'Personal / Travel',
    sections: [
      {
        name: 'Required Photos',
        items: [
          { label: 'Equipment — Overall', description: 'Wide shot at pickup', phase: 'both', status: 'not_checked' },
          { label: 'All Sides', description: 'Front, back, left, right', phase: 'both', status: 'not_checked' },
          { label: 'Serial / Model Number', description: 'Photo of ID tag', phase: 'pickup', status: 'not_checked' },
          { label: 'Existing Damage', description: 'Close-up of pre-existing issues', phase: 'pickup', status: 'not_checked' },
          { label: 'Rental Agreement', description: 'Photo of paperwork', phase: 'pickup', status: 'not_checked' }
        ]
      },
      {
        name: 'Condition Check',
        items: [
          { label: 'Exterior / Housing', description: 'Overall surface condition', phase: 'both', status: 'not_checked' },
          { label: 'Controls / Display', description: 'Condition of controls', phase: 'both', status: 'not_checked' },
          { label: 'Accessories Included', description: 'Verify included attachments', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Powers On / Starts', description: 'Operates normally at pickup', phase: 'pickup', status: 'not_checked' },
          { label: 'Main Function', description: 'Primary function works correctly', phase: 'pickup', status: 'not_checked' }
        ]
      }
    ]
  },

  accident_claim: {
    type: 'accident_claim',
    name: 'Accident / Insurance Claim',
    description: 'Document an accident scene, vehicle damage, and involved parties.',
    category: 'Personal / Travel',
    sections: [
      {
        name: 'Scene Documentation',
        items: [
          { label: 'Wide Shot — Scene', description: 'Overall accident scene from safe distance', phase: 'general', status: 'not_checked' },
          { label: 'All Vehicles — Wide', description: 'Wide shots of all vehicles involved', phase: 'general', status: 'not_checked' },
          { label: 'Your Vehicle — Damage', description: 'Close-ups of damage to your vehicle', phase: 'general', status: 'not_checked' },
          { label: 'Other Vehicle(s) — Damage', description: 'Close-ups of other vehicle damage', phase: 'general', status: 'not_checked' },
          { label: 'License Plates', description: 'All plates clearly visible', phase: 'general', status: 'not_checked' },
          { label: 'Street / Location Signs', description: 'Intersection or address if visible', phase: 'general', status: 'not_checked' }
        ]
      },
      {
        name: 'Documentation',
        items: [
          { label: 'Other Driver License', description: 'If safe and legally permitted', phase: 'general', status: 'not_checked' },
          { label: 'Other Insurance Card', description: 'Policy info from other driver', phase: 'general', status: 'not_checked' },
          { label: 'Police Report Number', description: 'If officers respond', phase: 'general', status: 'not_checked' },
          { label: 'Witness Info', description: 'If any witnesses present', phase: 'general', status: 'not_checked' }
        ]
      }
    ]
  },

  custom: {
    type: 'custom',
    name: 'Custom Packet',
    description: 'Build a condition documentation packet from scratch.',
    category: 'Personal / Travel',
    sections: [
      {
        name: 'General Documentation',
        items: [
          { label: 'Overall Condition', description: 'Wide shot showing overall state', phase: 'both', status: 'not_checked' },
          { label: 'Existing Issues', description: 'Document any pre-existing damage', phase: 'before', status: 'not_checked' }
        ]
      }
    ]
  },
};
