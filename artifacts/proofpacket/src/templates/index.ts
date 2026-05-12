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
    name: 'Car Rental',
    description: 'Document vehicle condition before driving off and upon return.',
    category: 'Personal / Travel',
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
          { label: 'Existing Scratches/Dents', description: 'Document any pre-existing damage closely', phase: 'pickup', status: 'not_checked' },
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
          { label: 'Trunk', description: 'Empty and clean', phase: 'both', status: 'not_checked' },
          { label: 'Floor mats', description: 'Present and condition', phase: 'both', status: 'not_checked' },
          { label: 'Rental agreement', description: 'Photo of the paperwork', phase: 'pickup', status: 'not_checked' },
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
    description: 'Document condition for private private party auto sales.',
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
          { label: 'Sides', description: 'Driver and passenger side', phase: 'sale', status: 'not_checked' },
          { label: 'Tires/Wheels', description: 'Tire tread and wheel condition', phase: 'sale', status: 'not_checked' },
          { label: 'Existing Body Damage', description: 'Dents, scratches, rust', phase: 'sale', status: 'not_checked' },
          { label: 'Glass', description: 'Windshield chips or cracks', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Interior Condition',
        items: [
          { label: 'Seats', description: 'Tears, stains, wear', phase: 'sale', status: 'not_checked' },
          { label: 'Controls', description: 'Radio, AC, windows working status', phase: 'sale', status: 'not_checked' },
          { label: 'Trunk', description: 'Spare tire, jack present?', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Documents / Handoff',
        items: [
          { label: 'Title', description: 'Signed over properly', phase: 'sale', status: 'not_checked' },
          { label: 'Bill of Sale', description: 'Completed and signed', phase: 'sale', status: 'not_checked' },
          { label: 'Keys', description: 'All keys and fobs handed over', phase: 'sale', status: 'not_checked' }
        ]
      }
    ]
  },
  equipment_sale_as_is_transfer: {
    type: 'equipment_sale_as_is_transfer',
    name: 'Equipment Sale / As-Is Transfer',
    description: 'Document heavy machinery or specialized equipment sales.',
    category: 'Business',
    sections: [
      {
        name: 'Item Overview',
        items: [
          { label: 'Serial / Data Plate', description: 'Clear photo of manufacturer plate', phase: 'sale', status: 'not_checked' },
          { label: 'Hour Meter / Usage', description: 'Usage reading if applicable', phase: 'sale', status: 'not_checked' },
          { label: 'Overall Unit', description: 'Wide shots from all sides', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Condition',
        items: [
          { label: 'Wear & Tear', description: 'Document physical condition', phase: 'sale', status: 'not_checked' },
          { label: 'Damage', description: 'Specific photos of broken/bent parts', phase: 'sale', status: 'not_checked' },
          { label: 'Leaks', description: 'Hydraulic or fluid leaks', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Test It',
        items: [
          { label: 'Power / Start', description: 'Unit turns on/starts', phase: 'sale', status: 'not_checked' },
          { label: 'Basic Function', description: 'Primary mechanism works', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Included Items',
        items: [
          { label: 'Attachments', description: 'Buckets, blades, accessories', phase: 'sale', status: 'not_checked' },
          { label: 'Manuals / Logs', description: 'Maintenance records included', phase: 'sale', status: 'not_checked' },
          { label: 'Keys', description: 'Keys handed over', phase: 'sale', status: 'not_checked' }
        ]
      }
    ]
  },
  general_item_sale_as_is_transfer: {
    type: 'general_item_sale_as_is_transfer',
    name: 'General Item Sale / As-Is Transfer',
    description: 'Document condition for electronics, furniture, or high-value goods.',
    category: 'Other',
    sections: [
      {
        name: 'Item Overview',
        items: [
          { label: 'Overall Item', description: 'Clear wide photos', phase: 'sale', status: 'not_checked' },
          { label: 'Serial Number', description: 'Model and serial if applicable', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Condition',
        items: [
          { label: 'Cosmetic Wear', description: 'Scratches, dents, marks', phase: 'sale', status: 'not_checked' },
          { label: 'Functionality', description: 'Does it turn on/work as described?', phase: 'sale', status: 'not_checked' }
        ]
      },
      {
        name: 'Included / Handoff',
        items: [
          { label: 'Accessories', description: 'Cables, remotes, cases included', phase: 'sale', status: 'not_checked' },
          { label: 'Payment / Exchange', description: 'Item handed over as-is', phase: 'sale', status: 'not_checked' }
        ]
      }
    ]
  },
  moving_storage: {
    type: 'moving_storage',
    name: 'Moving / Storage',
    description: 'Document items before movers pack them or entering storage.',
    category: 'Business',
    sections: [
      {
        name: 'Truck / Unit Details',
        items: [
          { label: 'Truck / Unit Number', description: 'Photo identifying the container/truck', phase: 'both', status: 'not_checked' },
          { label: 'Lock / Seal', description: 'Photo of secured lock or seal intact', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Truck Condition (If Renting)',
        items: [
          { label: 'Odometer & Fuel', description: 'Starting/ending numbers', phase: 'both', status: 'not_checked' },
          { label: 'Exterior Damage', description: 'Scrapes, roof clearance hits', phase: 'pickup', status: 'not_checked' },
          { label: 'Cargo Area', description: 'Clean and swept out', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'High Value Items',
        items: [
          { label: 'Electronics', description: 'TVs, computers condition before packing', phase: 'before', status: 'not_checked' },
          { label: 'Furniture', description: 'Couches, tables showing no rips/scratches', phase: 'before', status: 'not_checked' },
          { label: 'Fragile Items', description: 'Glassware, art packed properly', phase: 'before', status: 'not_checked' }
        ]
      },
      {
        name: 'Loading / Unloading',
        items: [
          { label: 'Packed Container', description: 'Photo showing how it was loaded', phase: 'before', status: 'not_checked' },
          { label: 'Unloading Condition', description: 'Photo of items as doors open', phase: 'after', status: 'not_checked' },
          { label: 'Damage Found', description: 'Document broken items immediately', phase: 'after', status: 'not_checked' }
        ]
      }
    ]
  },
  equipment_rental: {
    type: 'equipment_rental',
    name: 'Equipment Rental',
    description: 'Tools, AV gear, or machinery rentals.',
    category: 'Business',
    sections: [
      {
        name: 'Item Overview',
        items: [
          { label: 'Serial / Barcode', description: 'Identifying tag on item', phase: 'both', status: 'not_checked' },
          { label: 'Overall Condition', description: 'General view of item', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Accessories / Cases',
        items: [
          { label: 'Cables / Chargers', description: 'All included cords', phase: 'both', status: 'not_checked' },
          { label: 'Attachments', description: 'Blades, bits, lenses', phase: 'both', status: 'not_checked' },
          { label: 'Case', description: 'Condition of transport case', phase: 'both', status: 'not_checked' }
        ]
      },
      {
        name: 'Condition / Test',
        items: [
          { label: 'Visible Damage', description: 'Scratches, dents before use', phase: 'pickup', status: 'not_checked' },
          { label: 'Power On', description: 'Unit starts and idles', phase: 'both', status: 'not_checked' },
          { label: 'Cleanliness', description: 'Returned clean as required', phase: 'return', status: 'not_checked' }
        ]
      }
    ]
  },
  accident_claim: {
    type: 'accident_claim',
    name: 'Accident / Insurance Claim',
    description: 'Document an incident scene for insurance purposes.',
    category: 'Claims',
    sections: [
      {
        name: 'Scene Safety',
        items: [
          { label: 'Moved to Safety', description: 'Vehicles moved if possible', phase: 'general', status: 'not_checked' },
          { label: 'Police Called', description: 'Law enforcement notified', phase: 'general', status: 'not_checked' }
        ]
      },
      {
        name: 'Vehicles / Damage',
        items: [
          { label: 'Your Vehicle Damage', description: 'Close and wide shots', phase: 'general', status: 'not_checked' },
          { label: 'Other Vehicle Damage', description: 'Close and wide shots', phase: 'general', status: 'not_checked' },
          { label: 'License Plates', description: 'Clear photo of other vehicle plate', phase: 'general', status: 'not_checked' },
          { label: 'Vehicle Positions', description: 'Wide shot showing how they rest', phase: 'general', status: 'not_checked' }
        ]
      },
      {
        name: 'Environment',
        items: [
          { label: 'Intersection / Road', description: 'Show traffic signs/signals', phase: 'general', status: 'not_checked' },
          { label: 'Weather / Lighting', description: 'Wet roads, glare, dark', phase: 'general', status: 'not_checked' },
          { label: 'Skid Marks / Debris', description: 'Evidence on the road', phase: 'general', status: 'not_checked' }
        ]
      },
      {
        name: 'Information Exchange',
        items: [
          { label: 'Other Driver License', description: 'Photo of ID', phase: 'general', status: 'not_checked' },
          { label: 'Insurance Card', description: 'Photo of insurance info', phase: 'general', status: 'not_checked' },
          { label: 'Police Report / Officer', description: 'Card or report number', phase: 'general', status: 'not_checked' }
        ]
      }
    ]
  },
  custom: {
    type: 'custom',
    name: 'Custom',
    description: 'A blank slate for your own specific documentation needs.',
    category: 'Other',
    sections: [
      {
        name: 'General Notes',
        items: [
          { label: 'Primary Item', description: 'Main subject of documentation', phase: 'general', status: 'not_checked' }
        ]
      },
      {
        name: 'Required Photos',
        items: [
          { label: 'Overview Wide', description: 'General wide shot', phase: 'general', status: 'not_checked' },
          { label: 'Details', description: 'Close up specifics', phase: 'general', status: 'not_checked' }
        ]
      }
    ]
  }
};
