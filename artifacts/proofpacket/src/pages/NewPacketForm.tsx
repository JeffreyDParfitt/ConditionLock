import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { templates } from "@/templates";
import { storage } from "@/storage/actions";
import type { PacketType, Phase } from "@/types";
import { isRentalVehicleType } from "@/hooks/useTier";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import PropertyLayoutSetup from "@/components/PropertyLayoutSetup";
import type { GeneratedSection } from "@/utils/propertyChecklist";
import BedSetup from "@/components/BedSetup";
import type { BedSection, BedLayoutConfig } from "@/utils/bedChecklist";
import { generateRentalCarSections } from "@/utils/vehicleChecklist";
import { generateMovingTruckSections, resolveMovingVehicleType } from "@/utils/movingTruckChecklist";

// ─── Company / platform lists ────────────────────────────────────────────────

const RENTAL_CAR_COMPANIES = [
  'Avis', 'Budget', 'Enterprise', 'Hertz', 'National', 'Alamo',
  'Sixt', 'Thrifty', 'Dollar', 'Fox',
];
const CAR_SHARING_PLATFORMS = ['Turo', 'Getaround', 'Zipcar'];
const MOVING_TRUCK_COMPANIES = [
  'U-Haul', 'Penske', 'Budget Truck Rental', 'Enterprise Truck Rental',
  'Ryder', 'Home Depot Truck Rental', "Lowe's Truck Rental",
];
const OTHER_OPTIONS = ['Local / Independent', 'Other'];

const RENTAL_CAR_OPTIONS = [...RENTAL_CAR_COMPANIES, ...CAR_SHARING_PLATFORMS, ...OTHER_OPTIONS];
const MOVING_TRUCK_OPTIONS = [...MOVING_TRUCK_COMPANIES, ...OTHER_OPTIONS];
const ALL_COMPANY_OPTIONS = [
  ...RENTAL_CAR_COMPANIES,
  ...CAR_SHARING_PLATFORMS,
  ...MOVING_TRUCK_COMPANIES,
  ...OTHER_OPTIONS,
];

const VEHICLE_TYPE_BODY_STYLES = [
  'Sedan',
  'Coupe',
  'Hatchback',
  'Wagon',
  'SUV / Crossover',
  'Pickup Truck — 2-door / regular cab',
  'Pickup Truck — extended cab',
  'Pickup Truck — crew cab',
  'Minivan',
  'Passenger Van',
  'Cargo Van',
  'Box Truck',
  'Moving Truck',
  'Flatbed Truck',
  'Trailer',
  'Tow Dolly / Car Carrier',
  'RV / Motorhome',
  'Motorcycle',
  'Boat',
  'Other',
];

const MOVING_TRUCK_BODY_STYLES = [
  'Cargo Van',
  'Box Truck',
  'Moving Truck',
  'Flatbed Truck',
  'Trailer',
  'Tow Dolly / Car Carrier',
  'Other',
];

const TRAILER_BODY_STYLES = ['Trailer', 'Tow Dolly / Car Carrier', 'Other'];

const FUEL_LEVELS = ['Full', '7/8', '3/4', '5/8', '1/2', '3/8', '1/4', '1/8', 'Empty / Reserve'];

const YES_NO = ['Yes', 'No'];

// ─── Form schema ─────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().optional(),
  companyOrPerson: z.string().optional(),
  referenceNumber: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),

  // Rental vehicle specific
  rentalCompany: z.string().optional(),
  customCompanyName: z.string().optional(),
  rentalAgreementNumber: z.string().optional(),
  returnLocation: z.string().optional(),
  vehicleYear: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleType: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  unitNumber: z.string().optional(),
  startingOdometer: z.string().optional(),
  fuelLevelPickup: z.string().optional(),
  evBatteryPickup: z.string().optional(),
  accessories: z.string().optional(),

  // Fuel / receipt
  fuelStation: z.string().optional(),
  fuelAmountPaid: z.string().optional(),
  fuelReceiptDate: z.string().optional(),
  evChargingCableIncluded: z.string().optional(),

  // Military / government travel
  travelContext: z.string().optional(),
  travelOrderNumber: z.string().optional(),
  dtsVoucherNumber: z.string().optional(),
  dutyStation: z.string().optional(),
  officialTravelNotes: z.string().optional(),
  isPCS: z.string().optional(),
  isPersonallyProcuredMove: z.string().optional(),
  moveOrigin: z.string().optional(),
  moveDestination: z.string().optional(),

  // Company vehicle specific
  department: z.string().optional(),
  driverName: z.string().optional(),
  driverId: z.string().optional(),
  supervisorName: z.string().optional(),
  endingOdometer: z.string().optional(),
  fuelLevelReturn: z.string().optional(),
  evBatteryReturn: z.string().optional(),
  keysIssued: z.string().optional(),
  fuelCardIssued: z.string().optional(),
  transponderIssued: z.string().optional(),

  // Vehicle type / body style (unified canonical field)
  vehicleTypeBodyStyle: z.string().optional(),
  vehicleTypeBodyStyleOther: z.string().optional(),
  // Legacy fields — preserved for backward compat
  vehicleBodyStyle: z.string().optional(),
  vehicleBodyStyleOther: z.string().optional(),
  doorConfiguration: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function companyOptionsForType(type: PacketType): string[] {
  if (type === 'moving_truck_van') return MOVING_TRUCK_OPTIONS;
  if (type === 'car_rental') return RENTAL_CAR_OPTIONS;
  return ALL_COMPANY_OPTIONS;
}

function NativeSelect({
  value, onChange, options, placeholder, className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Use context options ──────────────────────────────────────────────────────

const USE_CONTEXT_OPTIONS = [
  'Personal',
  'Business travel',
  'Military TDY / TAD',
  'PCS move',
  'Government travel',
  'Contractor travel',
  'Company-paid rental',
  'Employee use',
  'Other',
];

const MILITARY_GOVT_CONTEXTS = ['Military TDY / TAD', 'PCS move', 'Government travel'];

// ─── Vehicle type / body style helpers ────────────────────────────────────────

function getDoorSuggestion(bodyStyle: string): string {
  switch (bodyStyle) {
    case 'Sedan': return '4 doors — driver, passenger, rear driver, rear passenger';
    case 'Coupe': return '2 doors — driver and passenger';
    case 'Hatchback': return '4 doors + rear hatch (5th door)';
    case 'Wagon': return '4 doors + rear hatch/liftgate';
    case 'SUV / Crossover': return '4 doors + rear hatch/liftgate';
    case 'Pickup Truck — 2-door / regular cab': return '2 doors — driver and passenger + cargo bed + tailgate';
    case 'Pickup Truck — extended cab': return '2 main doors + 2 smaller rear doors + cargo bed + tailgate';
    case 'Pickup Truck — crew cab': return '4 doors — full-size front and rear + cargo bed + tailgate';
    case 'Minivan': return '2 front doors + 2 sliding side doors + rear liftgate';
    case 'Passenger Van': return '2 front cab doors + side sliding door + rear hatch';
    case 'Cargo Van': return '2 front cab doors + sliding side door + rear cargo doors';
    case 'Box Truck': return 'Cab doors + rear roll-up cargo door';
    case 'Moving Truck': return 'Cab doors + rear roll-up cargo door';
    case 'Flatbed Truck': return 'Cab doors only — open flatbed';
    case 'Trailer': return 'Rear cargo doors or open — no cab';
    case 'Tow Dolly / Car Carrier': return 'No cab — check straps, ramps, and wheel trays';
    case 'RV / Motorhome': return 'Main entry door + driver/passenger cab doors';
    case 'Motorcycle': return 'No doors applicable';
    case 'Boat': return 'No doors — check hatches, hull, storage, and compartments';
    default: return '';
  }
}

function getBodyStyleDefaults(bodyStyle: string) {
  const hasRearHatch = ['Hatchback', 'Wagon', 'SUV / Crossover', 'Minivan', 'Passenger Van', 'RV / Motorhome'].includes(bodyStyle);
  const hasSlidingDoor = ['Minivan', 'Cargo Van', 'Passenger Van'].includes(bodyStyle);
  const hasCargoDoor = ['Cargo Van', 'Box Truck', 'Moving Truck', 'Trailer'].includes(bodyStyle);
  const hasRamp = ['Moving Truck', 'Box Truck', 'Trailer', 'Tow Dolly / Car Carrier'].includes(bodyStyle);
  const hasLiftgate = ['Box Truck', 'Moving Truck'].includes(bodyStyle);
  const hasTailgate = ['Pickup Truck — 2-door / regular cab', 'Pickup Truck — extended cab', 'Pickup Truck — crew cab', 'Flatbed Truck'].includes(bodyStyle);
  const hasTrailerHitch = ['Pickup Truck — 2-door / regular cab', 'Pickup Truck — extended cab', 'Pickup Truck — crew cab', 'Flatbed Truck', 'Tow Dolly / Car Carrier'].includes(bodyStyle);
  const hasTowEquipment = ['Tow Dolly / Car Carrier', 'Trailer'].includes(bodyStyle);
  const hasCargoBed = ['Pickup Truck — 2-door / regular cab', 'Pickup Truck — extended cab', 'Pickup Truck — crew cab', 'Flatbed Truck'].includes(bodyStyle);
  const hasStorageCompartments = ['RV / Motorhome', 'Boat'].includes(bodyStyle);
  return { hasRearHatch, hasSlidingDoor, hasCargoDoor, hasRamp, hasLiftgate, hasTailgate, hasTrailerHitch, hasTowEquipment, hasCargoBed, hasStorageCompartments };
}

// Packet types where bed setup applies
const BED_SETUP_TYPES: PacketType[] = ['hotel', 'airbnb'];

// Packet types where the body style section applies
const VEHICLE_BODY_STYLE_TYPES: PacketType[] = [
  'car_rental', 'moving_truck_van', 'trailer_tow_equipment', 'custom_rental_vehicle',
  'company_vehicle_handoff', 'vehicle_sale_as_is_transfer', 'accident_claim',
];

// Packet types where property room setup applies
const PROPERTY_LAYOUT_TYPES: PacketType[] = [
  'hotel', 'airbnb', 'apartment_home', 'property_sale_home_sale',
  'business_commercial_lease', 'business_changeover_as_is_sale',
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step, step2Label }: { step: number; step2Label: string }) {
  const labels = ['Setup', step2Label, 'Review'];
  return (
    <div className="flex items-center justify-center gap-1.5 pb-1">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={n} className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1.5 ${active ? 'text-foreground' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shrink-0 ${active ? 'border-primary bg-primary text-primary-foreground' : done ? 'border-muted-foreground bg-muted-foreground text-background' : 'border-muted-foreground/30'}`}>
                {n}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-foreground' : 'text-muted-foreground/60'}`}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section preview (step 3) ─────────────────────────────────────────────────

function SectionPreview({ sections }: { sections: GeneratedSection[] }) {
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  if (sections.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-6">
        No sections generated. Go back and fill in the details.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Generated Checklist</p>
        <span className="text-xs text-muted-foreground">{sections.length} sections · {totalItems} items</span>
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto rounded-md border border-border pr-1">
        {sections.map((section, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 odd:bg-muted/30">
            <span className="text-sm">{section.name}</span>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">{section.items.length}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewPacketForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const type = (params.type as PacketType) || "custom";
  const template = templates[type];
  const isRental = isRentalVehicleType(type);
  const isCompanyVehicle = type === 'company_vehicle_handoff';
  const isVehicle = isRental || isCompanyVehicle;
  const isMovingVehicle = type === 'moving_truck_van' || type === 'trailer_tow_equipment';

  // Show use-context selector for rental vehicles and relevant stay/rental non-vehicle types
  const showUseContext = isRental || ['hotel', 'airbnb', 'apartment_home', 'moving_storage', 'equipment_rental'].includes(type);

  const companyOptions = companyOptionsForType(type);

  // ── Wizard step state ──────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const step2Label =
    isMovingVehicle ? 'Equipment' :
    (isRental && !isMovingVehicle) ? 'Vehicle' :
    isCompanyVehicle ? 'Vehicle' :
    PROPERTY_LAYOUT_TYPES.includes(type) ? 'Rooms' :
    'Details';

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: `${template?.name || "Custom"} Packet — ${new Intl.DateTimeFormat().format(new Date())}`,
      location: "",
      companyOrPerson: "",
      referenceNumber: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      notes: "",
      rentalCompany: "",
      customCompanyName: "",
      rentalAgreementNumber: "",
      returnLocation: "",
      vehicleYear: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleType: "",
      licensePlate: "",
      vin: "",
      unitNumber: "",
      startingOdometer: "",
      fuelLevelPickup: "",
      evBatteryPickup: "",
      accessories: "",
      department: "",
      driverName: "",
      driverId: "",
      supervisorName: "",
      endingOdometer: "",
      fuelLevelReturn: "",
      evBatteryReturn: "",
      keysIssued: "",
      fuelCardIssued: "",
      transponderIssued: "",
      fuelStation: "",
      fuelAmountPaid: "",
      fuelReceiptDate: "",
      evChargingCableIncluded: "",
      travelContext: "",
      travelOrderNumber: "",
      dtsVoucherNumber: "",
      dutyStation: "",
      officialTravelNotes: "",
      isPCS: "",
      isPersonallyProcuredMove: "",
      moveOrigin: "",
      moveDestination: "",
      vehicleTypeBodyStyle: "",
      vehicleTypeBodyStyleOther: "",
      vehicleBodyStyle: "",
      vehicleBodyStyleOther: "",
      doorConfiguration: "",
    },
  });

  const rentalCompany = useWatch({ control: form.control, name: 'rentalCompany' });
  const showCustomCompany = rentalCompany === 'Other';

  const watchedVehicleTypeBodyStyle = useWatch({ control: form.control, name: 'vehicleTypeBodyStyle' });

  const isVehicleBodyStyleApplicable = VEHICLE_BODY_STYLE_TYPES.includes(type);
  const isPropertyType = PROPERTY_LAYOUT_TYPES.includes(type);

  // ── Vehicle feature flags (auto-populated from body style) ────────────────
  const [hasRearHatch, setHasRearHatch] = useState(false);
  const [hasSlidingDoor, setHasSlidingDoor] = useState(false);
  const [hasCargoDoor, setHasCargoDoor] = useState(false);
  const [hasRamp, setHasRamp] = useState(false);
  const [hasLiftgate, setHasLiftgate] = useState(false);
  const [hasTailgate, setHasTailgate] = useState(false);
  const [hasTrailerHitch, setHasTrailerHitch] = useState(false);
  const [hasTowEquipment, setHasTowEquipment] = useState(false);
  const [hasCargoBed, setHasCargoBed] = useState(false);
  const [hasStorageCompartments, setHasStorageCompartments] = useState(false);
  // Pickup-specific
  const [hasBedLiner, setHasBedLiner] = useState(false);
  // Moving truck equipment
  const [hasDolly, setHasDolly] = useState(false);
  const [hasFurniturePads, setHasFurniturePads] = useState(false);
  const [hasStraps, setHasStraps] = useState(false);
  const [hasLock, setHasLock] = useState(false);

  // ── Property layout sections and details ──────────────────────────────────
  const [propertyRoomSections, setPropertyRoomSections] = useState<GeneratedSection[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<Record<string, string | boolean>>({});

  const handlePropertySectionsChange = useCallback((sections: GeneratedSection[]) => {
    setPropertyRoomSections(sections);
  }, []);

  const handlePropertyDetailsChange = useCallback((details: Record<string, string | boolean>) => {
    setPropertyDetails(details);
  }, []);

  // ── Bed setup sections and config ─────────────────────────────────────────
  const isBedSetupType = BED_SETUP_TYPES.includes(type);
  const [bedSections, setBedSections] = useState<BedSection[]>([]);
  const [bedLayoutConfig, setBedLayoutConfig] = useState<BedLayoutConfig | null>(null);

  const handleBedSectionsChange = useCallback((sections: BedSection[]) => {
    setBedSections(sections);
  }, []);

  const handleBedConfigChange = useCallback((config: BedLayoutConfig) => {
    setBedLayoutConfig(config);
  }, []);

  const availableRoomsForBeds = propertyRoomSections.map(s => s.name);

  // ── Auto-populate feature flags when body style changes ───────────────────
  useEffect(() => {
    if (watchedVehicleTypeBodyStyle) {
      const suggestion = getDoorSuggestion(watchedVehicleTypeBodyStyle);
      if (suggestion) form.setValue('doorConfiguration', suggestion);
      const defaults = getBodyStyleDefaults(watchedVehicleTypeBodyStyle);
      setHasRearHatch(defaults.hasRearHatch);
      setHasSlidingDoor(defaults.hasSlidingDoor);
      setHasCargoDoor(defaults.hasCargoDoor);
      setHasRamp(defaults.hasRamp);
      setHasLiftgate(defaults.hasLiftgate);
      setHasTailgate(defaults.hasTailgate);
      setHasTrailerHitch(defaults.hasTrailerHitch);
      setHasTowEquipment(defaults.hasTowEquipment);
      setHasCargoBed(defaults.hasCargoBed);
      setHasStorageCompartments(defaults.hasStorageCompartments);
    }
  }, [watchedVehicleTypeBodyStyle, form]);

  // ── Preview sections (step 3) ─────────────────────────────────────────────
  const previewSections = useMemo<GeneratedSection[]>(() => {
    const vtbs = watchedVehicleTypeBodyStyle || '';

    if ((isRental || isCompanyVehicle) && !isMovingVehicle && vtbs && vtbs !== 'Other') {
      return generateRentalCarSections(vtbs, { hasTrailerHitch, hasBedLiner });
    }

    if (isMovingVehicle) {
      const vtype = resolveMovingVehicleType(vtbs);
      return generateMovingTruckSections(vtype, { hasRamp, hasLiftgate, hasDolly, hasFurniturePads, hasStraps, hasLock });
    }

    if (isPropertyType) {
      const combined: GeneratedSection[] = [...propertyRoomSections];
      if (isBedSetupType) {
        for (const bs of bedSections) combined.push({ name: bs.name, items: bs.items });
      }
      if (combined.length > 0) return combined;
    }

    return (template?.sections || []).map(s => ({ name: s.name, items: s.items }));
  }, [
    isRental, isCompanyVehicle, isMovingVehicle, isPropertyType, isBedSetupType,
    watchedVehicleTypeBodyStyle,
    hasTrailerHitch, hasBedLiner,
    hasRamp, hasLiftgate, hasDolly, hasFurniturePads, hasStraps, hasLock,
    propertyRoomSections, bedSections, template,
  ]);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function onSubmit(values: FormValues) {
    const vtbs = values.vehicleTypeBodyStyle || '';

    // --- Build checklist items ---
    let checklistItems: Array<{
      id: string; packetId: string; section: string; label: string;
      description: string; phase: string; status: string; notes: string;
      photoIds: string[]; addedDuringInspection: boolean;
      createdAt: string; updatedAt: string;
    }> = [];

    function fromSection(section: { name: string; items: Array<{ label: string; description: string; phase: string; status: string }> }) {
      return section.items.map(item => ({
        id: crypto.randomUUID(),
        packetId: "",
        section: section.name,
        label: item.label,
        description: item.description,
        phase: item.phase as Phase,
        status: item.status,
        notes: "",
        photoIds: [],
        addedDuringInspection: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    if ((isRental || isCompanyVehicle) && !isMovingVehicle && vtbs && vtbs !== 'Other') {
      // Use body-style-specific generator for rental car / company vehicle
      const genSections = generateRentalCarSections(vtbs, { hasTrailerHitch, hasBedLiner });
      checklistItems = genSections.flatMap(fromSection);
    } else if (isMovingVehicle) {
      // Use moving truck/trailer generator
      const vtype = resolveMovingVehicleType(vtbs);
      const genSections = generateMovingTruckSections(vtype, { hasRamp, hasLiftgate, hasDolly, hasFurniturePads, hasStraps, hasLock });
      checklistItems = genSections.flatMap(fromSection);
    } else {
      // Fall back to static template
      const templateItems = template?.sections.flatMap(section =>
        section.items.map(item => ({
          id: crypto.randomUUID(),
          packetId: "",
          section: section.name,
          label: item.label,
          description: item.description,
          phase: item.phase,
          status: item.status,
          notes: "",
          photoIds: [],
          addedDuringInspection: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      ) || [];

      const roomItems = propertyRoomSections.flatMap(section =>
        section.items.map(item => ({
          id: crypto.randomUUID(),
          packetId: "",
          section: section.name,
          label: item.label,
          description: item.description,
          phase: item.phase,
          status: item.status,
          notes: "",
          photoIds: [],
          addedDuringInspection: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      );

      const bedChecklistItems = bedSections.flatMap(section =>
        section.items.map(item => ({
          id: crypto.randomUUID(),
          packetId: "",
          section: section.name,
          label: item.label,
          description: item.description,
          phase: item.phase,
          status: item.status,
          notes: "",
          photoIds: [],
          addedDuringInspection: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      );

      checklistItems = [...templateItems, ...roomItems, ...bedChecklistItems];
    }

    // --- Build details ---
    const details: Record<string, string | boolean | undefined> = {};

    if (isRental) {
      const resolvedCompany = showCustomCompany
        ? (values.customCompanyName || 'Other')
        : (values.rentalCompany || '');
      if (resolvedCompany) details.rentalCompany = resolvedCompany;
      if (showCustomCompany && values.customCompanyName) details.customCompanyName = values.customCompanyName;
      if (values.rentalAgreementNumber) details.rentalAgreementNumber = values.rentalAgreementNumber;
      if (values.returnLocation) details.returnLocation = values.returnLocation;
      if (values.vehicleYear) details.vehicleYear = values.vehicleYear;
      if (values.vehicleMake) details.vehicleMake = values.vehicleMake;
      if (values.vehicleModel) details.vehicleModel = values.vehicleModel;
      if (values.vehicleTypeBodyStyle) details.vehicleTypeBodyStyle = values.vehicleTypeBodyStyle;
      if (values.vehicleTypeBodyStyleOther) details.vehicleTypeBodyStyleOther = values.vehicleTypeBodyStyleOther;
      if (values.licensePlate) details.licensePlate = values.licensePlate;
      if (values.vin) details.vin = values.vin;
      if (values.unitNumber) details.unitNumber = values.unitNumber;
      if (values.startingOdometer) details.startingOdometer = values.startingOdometer;
      if (values.fuelLevelPickup) details.fuelLevelPickup = values.fuelLevelPickup;
      if (values.evBatteryPickup) details.evBatteryPickup = values.evBatteryPickup;
      if (values.accessories) details.accessories = values.accessories;
      if (values.fuelStation) details.fuelStation = values.fuelStation;
      if (values.fuelAmountPaid) details.fuelAmountPaid = values.fuelAmountPaid;
      if (values.fuelReceiptDate) details.fuelReceiptDate = values.fuelReceiptDate;
      if (values.evChargingCableIncluded) details.evChargingCableIncluded = values.evChargingCableIncluded;
      if (values.travelContext) details.travelContext = values.travelContext;
      if (values.travelOrderNumber) details.travelOrderNumber = values.travelOrderNumber;
      if (values.dtsVoucherNumber) details.dtsVoucherNumber = values.dtsVoucherNumber;
      if (values.dutyStation) details.dutyStation = values.dutyStation;
      if (values.officialTravelNotes) details.officialTravelNotes = values.officialTravelNotes;
      if (values.isPCS) details.isPCS = values.isPCS;
      if (values.isPersonallyProcuredMove) details.isPersonallyProcuredMove = values.isPersonallyProcuredMove;
      if (values.moveOrigin) details.moveOrigin = values.moveOrigin;
      if (values.moveDestination) details.moveDestination = values.moveDestination;
      // Moving truck equipment flags
      if (isMovingVehicle) {
        details.hasDolly = hasDolly;
        details.hasFurniturePads = hasFurniturePads;
        details.hasStraps = hasStraps;
        details.hasLock = hasLock;
      }
    }

    if (isCompanyVehicle) {
      if (values.department) details.department = values.department;
      if (values.unitNumber) details.unitNumber = values.unitNumber;
      if (values.vehicleYear) details.vehicleYear = values.vehicleYear;
      if (values.vehicleMake) details.vehicleMake = values.vehicleMake;
      if (values.vehicleModel) details.vehicleModel = values.vehicleModel;
      if (values.vehicleTypeBodyStyle) details.vehicleTypeBodyStyle = values.vehicleTypeBodyStyle;
      if (values.vehicleTypeBodyStyleOther) details.vehicleTypeBodyStyleOther = values.vehicleTypeBodyStyleOther;
      if (values.licensePlate) details.licensePlate = values.licensePlate;
      if (values.vin) details.vin = values.vin;
      if (values.driverName) details.driverName = values.driverName;
      if (values.driverId) details.driverId = values.driverId;
      if (values.supervisorName) details.supervisorName = values.supervisorName;
      if (values.returnLocation) details.returnLocation = values.returnLocation;
      if (values.startingOdometer) details.startingOdometer = values.startingOdometer;
      if (values.endingOdometer) details.endingOdometer = values.endingOdometer;
      if (values.fuelLevelPickup) details.fuelLevelPickup = values.fuelLevelPickup;
      if (values.fuelLevelReturn) details.fuelLevelReturn = values.fuelLevelReturn;
      if (values.evBatteryPickup) details.evBatteryPickup = values.evBatteryPickup;
      if (values.evBatteryReturn) details.evBatteryReturn = values.evBatteryReturn;
      if (values.keysIssued) details.keysIssued = values.keysIssued;
      if (values.fuelCardIssued) details.fuelCardIssued = values.fuelCardIssued;
      if (values.transponderIssued) details.transponderIssued = values.transponderIssued;
      if (values.accessories) details.accessories = values.accessories;
      if (values.fuelStation) details.fuelStation = values.fuelStation;
      if (values.fuelAmountPaid) details.fuelAmountPaid = values.fuelAmountPaid;
      if (values.travelContext) details.travelContext = values.travelContext;
      if (values.travelOrderNumber) details.travelOrderNumber = values.travelOrderNumber;
      if (values.dtsVoucherNumber) details.dtsVoucherNumber = values.dtsVoucherNumber;
      if (values.dutyStation) details.dutyStation = values.dutyStation;
      if (values.officialTravelNotes) details.officialTravelNotes = values.officialTravelNotes;
      if (values.isPCS) details.isPCS = values.isPCS;
      if (values.isPersonallyProcuredMove) details.isPersonallyProcuredMove = values.isPersonallyProcuredMove;
      if (values.moveOrigin) details.moveOrigin = values.moveOrigin;
      if (values.moveDestination) details.moveDestination = values.moveDestination;
    }

    const resolvedVtbs = values.vehicleTypeBodyStyle || values.vehicleBodyStyle || '';
    if (isVehicleBodyStyleApplicable && resolvedVtbs) {
      details.vehicleTypeBodyStyle = resolvedVtbs;
      const resolvedOther = values.vehicleTypeBodyStyleOther || values.vehicleBodyStyleOther || '';
      if (resolvedVtbs === 'Other' && resolvedOther) details.vehicleTypeBodyStyleOther = resolvedOther;
      if (values.doorConfiguration) details.doorConfiguration = values.doorConfiguration;
      details.hasRearHatch = hasRearHatch;
      details.hasSlidingDoor = hasSlidingDoor;
      details.hasCargoDoor = hasCargoDoor;
      details.hasRamp = hasRamp;
      details.hasLiftgate = hasLiftgate;
      details.hasTailgate = hasTailgate;
      details.hasTrailerHitch = hasTrailerHitch;
      details.hasTowEquipment = hasTowEquipment;
      details.hasCargoBed = hasCargoBed;
      details.hasStorageCompartments = hasStorageCompartments;
      details.hasBedLiner = hasBedLiner;
    }

    if (isPropertyType) {
      for (const [k, v] of Object.entries(propertyDetails)) {
        details[k] = v;
      }
    }

    if (isBedSetupType && bedLayoutConfig) {
      details.bedConfigsJson = JSON.stringify(bedLayoutConfig);
      if (bedLayoutConfig.rollawayRequested) details.bedRollawayRequested = true;
      if (bedLayoutConfig.rollawayProvided) details.bedRollawayProvided = true;
      if (bedLayoutConfig.cribRequested) details.bedCribRequested = true;
      if (bedLayoutConfig.cribProvided) details.bedCribProvided = true;
      if (bedLayoutConfig.sofaBedPresent) details.bedSofaBedPresent = true;
      if (bedLayoutConfig.extraBeddingProvided) details.bedExtraBeddingProvided = true;
      if (bedLayoutConfig.numberOfPillows) details.bedNumberOfPillows = bedLayoutConfig.numberOfPillows;
      if (bedLayoutConfig.numberOfBlankets) details.bedNumberOfBlankets = bedLayoutConfig.numberOfBlankets;
      if (bedLayoutConfig.numberOfLinenSets) details.bedNumberOfLinenSets = bedLayoutConfig.numberOfLinenSets;
      if (bedLayoutConfig.notes) details.bedNotes = bedLayoutConfig.notes;
      const bedTypes = bedLayoutConfig.beds.map(b => b.bedType).filter(Boolean);
      if (bedTypes.length > 0) details.bedTypes = bedTypes.join(', ');
      details.bedCount = String(bedLayoutConfig.beds.length);
    }

    const companyForPacket = isCompanyVehicle
      ? (values.companyOrPerson || '')
      : isRental
        ? (showCustomCompany ? (values.customCompanyName || 'Other') : (values.rentalCompany || values.companyOrPerson || ''))
        : (values.companyOrPerson || '');

    const id = await storage.createPacket({
      type,
      title: values.title,
      location: values.location || "",
      companyOrPerson: companyForPacket,
      referenceNumber: values.referenceNumber || "",
      startDate: values.startDate || "",
      endDate: values.endDate || "",
      phase: "before",
      notes: values.notes || "",
      checklistItems,
      communicationLogs: [],
      signatures: [],
      details,
    });

    await storage.updatePacket(id, {
      checklistItems: checklistItems.map(item => ({ ...item, packetId: id }))
    });

    setLocation(`/packets/${id}`);
  }

  if (!template) return <div>Template not found</div>;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-5">
      <header className="flex items-center gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full"
            onClick={() => setStep((step - 1) as 1 | 2 | 3)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        ) : (
          <Link href="/packets/new">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
        )}
        <div className="flex-1 space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight">New {template.name}</h1>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
      </header>

      {type === 'accident_claim' && step === 1 && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-sm flex gap-2">
          <span className="text-destructive font-bold">⚠️</span>
          <span className="text-destructive">Only document the scene if it is safe to do so. Do not block traffic or place yourself in danger.</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          <StepIndicator step={step} step2Label={step2Label} />

          {/* ═══════════════════════════════════════════════════════════════
              STEP 1 — SETUP: Who, where, when
          ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <>
              {/* ── RENTAL VEHICLE STEP 1 ── */}
              {isRental && (
                <>
                  <SectionDivider label="Company / Platform" />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rental Company / Platform</label>
                    <NativeSelect
                      value={rentalCompany || ''}
                      onChange={v => form.setValue('rentalCompany', v)}
                      options={isMovingVehicle ? MOVING_TRUCK_OPTIONS : companyOptions}
                      placeholder="Select company or platform…"
                    />
                    {showCustomCompany && (
                      <FormField
                        control={form.control}
                        name="customCompanyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="Enter company or platform name" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                    <Card className="bg-muted/30 border-muted">
                      <CardContent className="flex gap-2 p-3">
                        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Company names are provided only to help organize your record. ConditionLock is not affiliated with or endorsed by any rental company, car-sharing platform, hotel, property manager, insurer, government agency, military branch, moving company, fleet operator, or other listed company.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <SectionDivider label="Reservation Details" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="referenceNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reservation #</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. RES-123456" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="rentalAgreementNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agreement # <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. RA-789" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isMovingVehicle ? 'Pickup Location' : 'Pickup Location'}</FormLabel>
                      <FormControl><Input {...field} placeholder={isMovingVehicle ? 'e.g. U-Haul, 780 Main St' : 'e.g. SFO Airport, 780 McDonnell Rd'} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="returnLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isMovingVehicle ? 'Drop-off Location' : 'Return Location'} <span className="text-muted-foreground font-normal text-xs">(if different)</span></FormLabel>
                      <FormControl><Input {...field} placeholder={isMovingVehicle ? 'e.g. U-Haul, 456 Oak Ave' : 'e.g. LAX Airport'} /></FormControl>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isMovingVehicle ? 'Pickup Date' : 'Pickup Date'}</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isMovingVehicle ? 'Return Date' : 'Return Date'}</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </>
              )}

              {/* ── COMPANY VEHICLE STEP 1 ── */}
              {isCompanyVehicle && (
                <>
                  <SectionDivider label="Company & Driver" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="companyOrPerson" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Acme Corp" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Field Ops" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="driverName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver / Employee Name</FormLabel>
                        <FormControl><Input {...field} placeholder="Full name" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="driverId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. EMP-1042" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="supervisorName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor / Manager <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                      <FormControl><Input {...field} placeholder="Approving supervisor name" /></FormControl>
                    </FormItem>
                  )} />

                  <SectionDivider label="Checkout" />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Checkout Location</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Main depot, 123 Warehouse Blvd" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="returnLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Location <span className="text-muted-foreground font-normal text-xs">(if different)</span></FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Satellite yard, 456 Industrial Dr" /></FormControl>
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Checkout Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Date <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </>
              )}

              {/* ── NON-VEHICLE STEP 1 ── */}
              {!isVehicle && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location / Address</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. 123 Main St, Apt 4B" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="companyOrPerson" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company or Person</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. ABC Landlord LLC, John Doe" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="referenceNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference / Reservation #</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                </>
              )}

              <Button
                type="button"
                size="lg"
                className="w-full mt-2 h-14 text-base"
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2 — DETAILS: Vehicle / rooms / equipment
          ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <>
              {/* ── RENTAL CAR (non-moving) STEP 2 ── */}
              {isRental && !isMovingVehicle && (
                <>
                  <SectionDivider label="Vehicle Details" />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="vehicleYear" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Year <span className="text-muted-foreground">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="2024" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleMake" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Make <span className="text-muted-foreground">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="Toyota" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleModel" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Model <span className="text-muted-foreground">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="Camry" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Vehicle type / body style <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
                    <NativeSelect
                      value={form.watch('vehicleTypeBodyStyle') || ''}
                      onChange={v => form.setValue('vehicleTypeBodyStyle', v)}
                      options={VEHICLE_TYPE_BODY_STYLES}
                      placeholder="Select type / body style…"
                    />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Choose a body style to generate a tailored section-by-section checklist for this vehicle.</p>
                  </div>

                  {form.watch('vehicleTypeBodyStyle') === 'Other' && (
                    <FormField control={form.control} name="vehicleTypeBodyStyleOther" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom vehicle type / body style</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Golf cart, Cab-over truck, 3-wheel cycle" /></FormControl>
                      </FormItem>
                    )} />
                  )}

                  {watchedVehicleTypeBodyStyle && watchedVehicleTypeBodyStyle !== 'Other' && (
                    <>
                      <FormField control={form.control} name="doorConfiguration" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Door / access configuration <span className="text-muted-foreground font-normal text-xs">(auto-suggested — edit to match)</span></FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. 4 doors + rear hatch" /></FormControl>
                        </FormItem>
                      )} />

                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Features / access present</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Rear hatch / liftgate</Label>
                            <Switch checked={hasRearHatch} onCheckedChange={setHasRearHatch} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Sliding door</Label>
                            <Switch checked={hasSlidingDoor} onCheckedChange={setHasSlidingDoor} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Cargo door</Label>
                            <Switch checked={hasCargoDoor} onCheckedChange={setHasCargoDoor} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Ramp</Label>
                            <Switch checked={hasRamp} onCheckedChange={setHasRamp} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Liftgate</Label>
                            <Switch checked={hasLiftgate} onCheckedChange={setHasLiftgate} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Tailgate</Label>
                            <Switch checked={hasTailgate} onCheckedChange={setHasTailgate} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Cargo bed</Label>
                            <Switch checked={hasCargoBed} onCheckedChange={setHasCargoBed} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Bed liner</Label>
                            <Switch checked={hasBedLiner} onCheckedChange={setHasBedLiner} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Trailer hitch</Label>
                            <Switch checked={hasTrailerHitch} onCheckedChange={setHasTrailerHitch} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Storage compartments</Label>
                            <Switch checked={hasStorageCompartments} onCheckedChange={setHasStorageCompartments} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="licensePlate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 7ABC123" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="unitNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit # <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. UH-4421" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="vin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                      <FormControl><Input {...field} placeholder="17-character VIN" /></FormControl>
                    </FormItem>
                  )} />

                  <SectionDivider label="Odometer & Fuel" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startingOdometer" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Odometer at Pickup <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 34,521 mi" /></FormControl>
                      </FormItem>
                    )} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuel at Pickup <span className="text-muted-foreground font-normal text-xs">(opt.)</span></label>
                      <NativeSelect
                        value={form.watch('fuelLevelPickup') || ''}
                        onChange={v => form.setValue('fuelLevelPickup', v)}
                        options={FUEL_LEVELS}
                        placeholder="Select level…"
                      />
                    </div>
                  </div>
                  <FormField control={form.control} name="evBatteryPickup" render={({ field }) => (
                    <FormItem>
                      <FormLabel>EV Battery at Pickup <span className="text-muted-foreground font-normal text-xs">(electric only)</span></FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. 82%" /></FormControl>
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="fuelStation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel / Charge Station <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Shell on Main St" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="fuelAmountPaid" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Paid <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. $48.20" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="accessories" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accessories / Equipment <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                      <FormControl>
                        <Textarea {...field} className="resize-none" rows={2} placeholder="e.g. EZ Pass transponder, GPS unit, booster seat" />
                      </FormControl>
                    </FormItem>
                  )} />
                </>
              )}

              {/* ── MOVING TRUCK / TRAILER STEP 2 ── */}
              {isMovingVehicle && (
                <>
                  <SectionDivider label="Vehicle / Equipment Type" />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Vehicle or equipment type</label>
                    <NativeSelect
                      value={form.watch('vehicleTypeBodyStyle') || ''}
                      onChange={v => form.setValue('vehicleTypeBodyStyle', v)}
                      options={type === 'trailer_tow_equipment' ? TRAILER_BODY_STYLES : MOVING_TRUCK_BODY_STYLES}
                      placeholder="Select type…"
                    />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Choose the type to generate a tailored checklist for this vehicle or equipment.</p>
                  </div>

                  {form.watch('vehicleTypeBodyStyle') === 'Other' && (
                    <FormField control={form.control} name="vehicleTypeBodyStyleOther" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe the vehicle or equipment</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 10-foot box truck, enclosed car hauler" /></FormControl>
                      </FormItem>
                    )} />
                  )}

                  <SectionDivider label="Equipment Included" />
                  <p className="text-[11px] text-muted-foreground -mt-2">Toggle on all equipment rented with this vehicle. Each will get its own checklist section.</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-normal">Loading ramp</Label>
                      <Switch checked={hasRamp} onCheckedChange={setHasRamp} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-normal">Liftgate</Label>
                      <Switch checked={hasLiftgate} onCheckedChange={setHasLiftgate} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-normal">Dolly / hand truck</Label>
                      <Switch checked={hasDolly} onCheckedChange={setHasDolly} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-normal">Moving blankets / pads</Label>
                      <Switch checked={hasFurniturePads} onCheckedChange={setHasFurniturePads} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-normal">Tie-down straps</Label>
                      <Switch checked={hasStraps} onCheckedChange={setHasStraps} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-normal">Truck lock / padlock</Label>
                      <Switch checked={hasLock} onCheckedChange={setHasLock} />
                    </div>
                  </div>

                  <SectionDivider label="Vehicle Specs" />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="vehicleYear" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Year <span className="text-muted-foreground">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="2023" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleMake" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Make <span className="text-muted-foreground">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="Ford" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleModel" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Model <span className="text-muted-foreground">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="Transit" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="licensePlate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 7ABC123" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="unitNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Truck # <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. UH-4421" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <SectionDivider label="Odometer & Fuel" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startingOdometer" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Odometer at Pickup <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 34,521 mi" /></FormControl>
                      </FormItem>
                    )} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuel at Pickup <span className="text-muted-foreground font-normal text-xs">(opt.)</span></label>
                      <NativeSelect
                        value={form.watch('fuelLevelPickup') || ''}
                        onChange={v => form.setValue('fuelLevelPickup', v)}
                        options={FUEL_LEVELS}
                        placeholder="Select level…"
                      />
                    </div>
                  </div>

                  <FormField control={form.control} name="accessories" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Equipment / Notes <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                      <FormControl>
                        <Textarea {...field} className="resize-none" rows={2} placeholder="e.g. Moving blankets (12), furniture pads, appliance dolly" />
                      </FormControl>
                    </FormItem>
                  )} />
                </>
              )}

              {/* ── COMPANY VEHICLE STEP 2 ── */}
              {isCompanyVehicle && (
                <>
                  <SectionDivider label="Vehicle" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="unitNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle / Unit ID</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. VAN-07, UNIT-42" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="licensePlate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 7ABC123" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="vehicleYear" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Year</FormLabel>
                        <FormControl><Input {...field} placeholder="2023" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleMake" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Make</FormLabel>
                        <FormControl><Input {...field} placeholder="Ford" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleModel" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Model</FormLabel>
                        <FormControl><Input {...field} placeholder="Transit" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Vehicle type / body style <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
                    <NativeSelect
                      value={form.watch('vehicleTypeBodyStyle') || ''}
                      onChange={v => form.setValue('vehicleTypeBodyStyle', v)}
                      options={VEHICLE_TYPE_BODY_STYLES}
                      placeholder="Select type / body style…"
                    />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Choose a body style to generate a tailored section-by-section checklist for this vehicle.</p>
                  </div>

                  {form.watch('vehicleTypeBodyStyle') === 'Other' && (
                    <FormField control={form.control} name="vehicleTypeBodyStyleOther" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom vehicle type</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Golf cart, Cab-over truck" /></FormControl>
                      </FormItem>
                    )} />
                  )}

                  {watchedVehicleTypeBodyStyle && watchedVehicleTypeBodyStyle !== 'Other' && (
                    <>
                      <FormField control={form.control} name="doorConfiguration" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Door / access configuration <span className="text-muted-foreground font-normal text-xs">(auto-suggested)</span></FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. 4 doors + rear hatch" /></FormControl>
                        </FormItem>
                      )} />

                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Features / access present</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Rear hatch / liftgate</Label>
                            <Switch checked={hasRearHatch} onCheckedChange={setHasRearHatch} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Sliding door</Label>
                            <Switch checked={hasSlidingDoor} onCheckedChange={setHasSlidingDoor} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Cargo door</Label>
                            <Switch checked={hasCargoDoor} onCheckedChange={setHasCargoDoor} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Ramp</Label>
                            <Switch checked={hasRamp} onCheckedChange={setHasRamp} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Liftgate</Label>
                            <Switch checked={hasLiftgate} onCheckedChange={setHasLiftgate} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Tailgate</Label>
                            <Switch checked={hasTailgate} onCheckedChange={setHasTailgate} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Cargo bed</Label>
                            <Switch checked={hasCargoBed} onCheckedChange={setHasCargoBed} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Bed liner</Label>
                            <Switch checked={hasBedLiner} onCheckedChange={setHasBedLiner} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Trailer hitch</Label>
                            <Switch checked={hasTrailerHitch} onCheckedChange={setHasTrailerHitch} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">Storage compartments</Label>
                            <Switch checked={hasStorageCompartments} onCheckedChange={setHasStorageCompartments} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <FormField control={form.control} name="vin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                      <FormControl><Input {...field} placeholder="17-character VIN" /></FormControl>
                    </FormItem>
                  )} />

                  <SectionDivider label="Odometer & Fuel" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startingOdometer" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Odometer at Checkout</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 48,210 mi" /></FormControl>
                      </FormItem>
                    )} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuel at Checkout</label>
                      <NativeSelect
                        value={form.watch('fuelLevelPickup') || ''}
                        onChange={v => form.setValue('fuelLevelPickup', v)}
                        options={FUEL_LEVELS}
                        placeholder="Select level…"
                      />
                    </div>
                  </div>
                  <FormField control={form.control} name="evBatteryPickup" render={({ field }) => (
                    <FormItem>
                      <FormLabel>EV Battery at Checkout <span className="text-muted-foreground font-normal text-xs">(electric only)</span></FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. 91%" /></FormControl>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="endingOdometer" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Odometer at Return <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 48,974 mi" /></FormControl>
                      </FormItem>
                    )} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuel at Return <span className="text-muted-foreground font-normal text-xs">(opt.)</span></label>
                      <NativeSelect
                        value={form.watch('fuelLevelReturn') || ''}
                        onChange={v => form.setValue('fuelLevelReturn', v)}
                        options={FUEL_LEVELS}
                        placeholder="Select level…"
                      />
                    </div>
                  </div>
                  <FormField control={form.control} name="evBatteryReturn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>EV Battery at Return <span className="text-muted-foreground font-normal text-xs">(electric only)</span></FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. 24%" /></FormControl>
                    </FormItem>
                  )} />

                  <SectionDivider label="Equipment Issued" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Keys / Fob</label>
                      <NativeSelect
                        value={form.watch('keysIssued') || ''}
                        onChange={v => form.setValue('keysIssued', v)}
                        options={YES_NO}
                        placeholder="—"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuel Card</label>
                      <NativeSelect
                        value={form.watch('fuelCardIssued') || ''}
                        onChange={v => form.setValue('fuelCardIssued', v)}
                        options={YES_NO}
                        placeholder="—"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Transponder</label>
                      <NativeSelect
                        value={form.watch('transponderIssued') || ''}
                        onChange={v => form.setValue('transponderIssued', v)}
                        options={YES_NO}
                        placeholder="—"
                      />
                    </div>
                  </div>
                  <FormField control={form.control} name="accessories" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Equipment <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                      <FormControl>
                        <Textarea {...field} className="resize-none" rows={2} placeholder="e.g. Safety vest, first aid kit, cones (4), hand truck" />
                      </FormControl>
                    </FormItem>
                  )} />
                </>
              )}

              {/* ── PROPERTY ROOM / BED SETUP (non-vehicle) ── */}
              {!isVehicle && isPropertyType && (
                <>
                  <SectionDivider label="Rooms & Areas" />
                  <PropertyLayoutSetup
                    packetType={type}
                    onSectionsChange={handlePropertySectionsChange}
                    onDetailsChange={handlePropertyDetailsChange}
                  />
                  {isBedSetupType && (
                    <>
                      <SectionDivider label="Beds & Sleeping Arrangements" />
                      <BedSetup
                        packetType={type}
                        availableRooms={availableRoomsForBeds}
                        onSectionsChange={handleBedSectionsChange}
                        onConfigChange={handleBedConfigChange}
                      />
                    </>
                  )}
                </>
              )}

              {/* ── VEHICLE BODY STYLE (vehicle sale / accident — not in main vehicle block) ── */}
              {isVehicleBodyStyleApplicable && !isVehicle && (
                <>
                  <SectionDivider label="Vehicle Type / Body Style (Optional)" />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Vehicle type / body style</label>
                    <NativeSelect
                      value={form.watch('vehicleTypeBodyStyle') || ''}
                      onChange={v => form.setValue('vehicleTypeBodyStyle', v)}
                      options={VEHICLE_TYPE_BODY_STYLES}
                      placeholder="Select type / body style…"
                    />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Choose the option that best describes the vehicle so ConditionLock can tailor doors, cargo areas, ramps, and required photos.</p>
                  </div>
                  {form.watch('vehicleTypeBodyStyle') === 'Other' && (
                    <FormField control={form.control} name="vehicleTypeBodyStyleOther" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom vehicle type / body style</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Golf cart, Cab-over truck, 3-wheel cycle" /></FormControl>
                      </FormItem>
                    )} />
                  )}
                  {watchedVehicleTypeBodyStyle && watchedVehicleTypeBodyStyle !== 'Other' && (
                    <>
                      <FormField control={form.control} name="doorConfiguration" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Door / access configuration <span className="text-muted-foreground font-normal text-xs">(auto-suggested)</span></FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. 4 doors + rear hatch" /></FormControl>
                        </FormItem>
                      )} />
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Features / access present</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          {([
                            ['Rear hatch / liftgate', hasRearHatch, setHasRearHatch],
                            ['Sliding door', hasSlidingDoor, setHasSlidingDoor],
                            ['Cargo door', hasCargoDoor, setHasCargoDoor],
                            ['Ramp', hasRamp, setHasRamp],
                            ['Liftgate', hasLiftgate, setHasLiftgate],
                            ['Tailgate', hasTailgate, setHasTailgate],
                            ['Cargo bed', hasCargoBed, setHasCargoBed],
                            ['Trailer hitch', hasTrailerHitch, setHasTrailerHitch],
                            ['Tow equipment', hasTowEquipment, setHasTowEquipment],
                            ['Storage compartments', hasStorageCompartments, setHasStorageCompartments],
                          ] as [string, boolean, (v: boolean) => void][]).map(([lbl, val, setter]) => (
                            <div key={lbl} className="flex items-center justify-between gap-2">
                              <Label className="text-sm font-normal">{lbl}</Label>
                              <Switch checked={val} onCheckedChange={setter} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── USE CONTEXT (rental vehicles + other applicable types) ── */}
              {showUseContext && (
                <>
                  <SectionDivider label="Use Context (Optional)" />
                  <Card className="bg-muted/30 border-muted">
                    <CardContent className="p-3 space-y-1.5">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Personal vs. business context helps tailor templates and export language. It does not automatically change your plan.
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        ConditionLock does not connect to DTS, government travel systems, or employer systems.
                      </p>
                    </CardContent>
                  </Card>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Use context</label>
                    <NativeSelect
                      value={form.watch('travelContext') || ''}
                      onChange={v => form.setValue('travelContext', v)}
                      options={USE_CONTEXT_OPTIONS}
                      placeholder="Select context… (optional)"
                    />
                  </div>
                  {form.watch('travelContext') && !['Personal', ''].includes(form.watch('travelContext') || '') && (
                    <>
                      <FormField control={form.control} name="travelOrderNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Order / Authorization # <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. 12345678 or TA-2024-001" /></FormControl>
                        </FormItem>
                      )} />
                      {MILITARY_GOVT_CONTEXTS.includes(form.watch('travelContext') || '') && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="dtsVoucherNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel>DTS / Voucher Ref <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                                <FormControl><Input {...field} placeholder="e.g. DTS-2024-001" /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="dutyStation" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duty Station / Destination <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                                <FormControl><Input {...field} placeholder="e.g. Fort Bragg, NC" /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                          {form.watch('travelContext') === 'PCS move' && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="moveOrigin" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Origin</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. Camp Pendleton, CA" /></FormControl>
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="moveDestination" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. Fort Hood, TX" /></FormControl>
                                  </FormItem>
                                )} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Personally Procured Move (PPM)?</label>
                                <NativeSelect
                                  value={form.watch('isPersonallyProcuredMove') || ''}
                                  onChange={v => form.setValue('isPersonallyProcuredMove', v)}
                                  options={['Yes — I arranged and paid for my own move', 'No — Government arranged']}
                                  placeholder="Select…"
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}
                      <FormField control={form.control} name="officialTravelNotes" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel / Context Notes <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                          <FormControl>
                            <Textarea {...field} className="resize-none" rows={2} placeholder="e.g. Business trip purpose, cost center, weight ticket on file…" />
                          </FormControl>
                        </FormItem>
                      )} />
                    </>
                  )}
                </>
              )}

              <Button
                type="button"
                size="lg"
                className="w-full mt-2 h-14 text-base"
                onClick={() => setStep(3)}
              >
                Preview Checklist <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 3 — REVIEW: Preview sections + title + notes + create
          ═══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <>
              <SectionPreview sections={previewSections} />

              <SectionDivider label="Packet" />

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Packet Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>General Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="resize-none"
                      rows={3}
                      placeholder={
                        isCompanyVehicle
                          ? "Any additional notes about this vehicle assignment or condition…"
                          : isRental
                            ? "Any additional notes about this rental or situation…"
                            : "Additional notes…"
                      }
                    />
                  </FormControl>
                </FormItem>
              )} />

              <Button type="submit" size="lg" className="w-full mt-4 h-14 text-base">
                Create Packet
              </Button>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
