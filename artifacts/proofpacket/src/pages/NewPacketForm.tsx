import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { templates } from "@/templates";
import { storage } from "@/storage/actions";
import type { PacketType } from "@/types";
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
import { ChevronLeft, Info } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import PropertyLayoutSetup from "@/components/PropertyLayoutSetup";
import type { GeneratedSection } from "@/utils/propertyChecklist";
import BedSetup from "@/components/BedSetup";
import type { BedSection, BedLayoutConfig } from "@/utils/bedChecklist";

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

const VEHICLE_TYPES = [
  'Car', 'SUV', 'Pickup Truck', 'Cargo Van', 'Box Truck', 'Moving Truck',
  'Trailer', 'Tow Dolly', 'RV / Motorhome', 'Motorcycle', 'Boat', 'Other',
];

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

  // Vehicle body style
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

// ─── Vehicle body style constants ─────────────────────────────────────────────

const VEHICLE_BODY_STYLES = [
  'Sedan',
  'Coupe',
  'Hatchback',
  'Wagon / Estate',
  'SUV / Crossover',
  'Pickup Truck — Regular Cab',
  'Pickup Truck — Extended Cab',
  'Pickup Truck — Crew Cab',
  'Minivan',
  'Cargo Van',
  'Passenger Van',
  'Box Truck',
  'Moving Truck',
  'Semi-Trailer / Trailer',
  'Flatbed Trailer',
  'Enclosed Trailer',
  'Open Trailer / Utility',
  'RV / Motorhome',
  'Motorcycle',
  'Boat',
  'Other',
];

function getDoorSuggestion(bodyStyle: string): string {
  switch (bodyStyle) {
    case 'Sedan': return '4 doors — driver, passenger, rear driver, rear passenger';
    case 'Coupe': return '2 doors — driver and passenger';
    case 'Hatchback': return '4 doors + rear hatch (5th door)';
    case 'Wagon / Estate': return '4 doors + rear hatch/liftgate';
    case 'SUV / Crossover': return '4 doors + rear hatch/liftgate';
    case 'Pickup Truck — Regular Cab': return '2 doors — driver and passenger';
    case 'Pickup Truck — Extended Cab': return '2 main doors + 2 suicide rear doors';
    case 'Pickup Truck — Crew Cab': return '4 doors — full-size front and rear';
    case 'Minivan': return '2 front doors + 2 sliding side doors + rear liftgate';
    case 'Cargo Van': return '2 front cab doors + sliding side door (L or R/both) + rear cargo doors';
    case 'Passenger Van': return '2 front cab doors + side sliding door + rear hatch';
    case 'Box Truck': return 'Cab doors + rear roll-up cargo door';
    case 'Moving Truck': return 'Cab doors + rear roll-up cargo door';
    case 'Semi-Trailer / Trailer': return 'Rear swing cargo doors (no cab)';
    case 'Flatbed Trailer': return 'No doors — open flatbed';
    case 'Enclosed Trailer': return 'Rear door(s) + optional side door';
    case 'Open Trailer / Utility': return 'No doors — open utility frame';
    case 'RV / Motorhome': return 'Main entry door + driver/passenger cab doors';
    case 'Motorcycle': return 'No doors applicable';
    case 'Boat': return 'No doors — check hatches, storage, and compartments';
    default: return '';
  }
}

function getBodyStyleDefaults(bodyStyle: string) {
  const hasRearHatch = ['Hatchback', 'Wagon / Estate', 'SUV / Crossover', 'Minivan', 'Passenger Van'].includes(bodyStyle);
  const hasSlidingDoor = ['Minivan', 'Cargo Van', 'Passenger Van'].includes(bodyStyle);
  const hasCargoDoor = ['Cargo Van', 'Box Truck', 'Moving Truck', 'Semi-Trailer / Trailer', 'Enclosed Trailer'].includes(bodyStyle);
  const hasRamp = ['Moving Truck', 'Box Truck', 'Enclosed Trailer', 'Open Trailer / Utility'].includes(bodyStyle);
  const hasLiftgate = ['Box Truck', 'Moving Truck'].includes(bodyStyle);
  return { hasRearHatch, hasSlidingDoor, hasCargoDoor, hasRamp, hasLiftgate };
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewPacketForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const type = (params.type as PacketType) || "custom";
  const template = templates[type];
  const isRental = isRentalVehicleType(type);
  const isCompanyVehicle = type === 'company_vehicle_handoff';
  const isVehicle = isRental || isCompanyVehicle;

  // Show use-context selector for rental vehicles and relevant stay/rental non-vehicle types
  const showUseContext = isRental || ['hotel', 'airbnb', 'apartment_home', 'moving_storage', 'equipment_rental'].includes(type);

  const companyOptions = companyOptionsForType(type);

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
      vehicleBodyStyle: "",
      vehicleBodyStyleOther: "",
      doorConfiguration: "",
    },
  });

  const rentalCompany = useWatch({ control: form.control, name: 'rentalCompany' });
  const showCustomCompany = rentalCompany === 'Other';

  const watchedBodyStyle = useWatch({ control: form.control, name: 'vehicleBodyStyle' });

  const isVehicleBodyStyleApplicable = VEHICLE_BODY_STYLE_TYPES.includes(type);
  const isPropertyType = PROPERTY_LAYOUT_TYPES.includes(type);

  // Boolean feature flags for vehicle body style (auto-populated, user-adjustable)
  const [hasRearHatch, setHasRearHatch] = useState(false);
  const [hasSlidingDoor, setHasSlidingDoor] = useState(false);
  const [hasCargoDoor, setHasCargoDoor] = useState(false);
  const [hasRamp, setHasRamp] = useState(false);
  const [hasLiftgate, setHasLiftgate] = useState(false);

  // Property layout sections and details (emitted from PropertyLayoutSetup)
  const [propertyRoomSections, setPropertyRoomSections] = useState<GeneratedSection[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<Record<string, string | boolean>>({});

  const handlePropertySectionsChange = useCallback((sections: GeneratedSection[]) => {
    setPropertyRoomSections(sections);
  }, []);

  const handlePropertyDetailsChange = useCallback((details: Record<string, string | boolean>) => {
    setPropertyDetails(details);
  }, []);

  // Bed setup sections and config (emitted from BedSetup)
  const isBedSetupType = BED_SETUP_TYPES.includes(type);
  const [bedSections, setBedSections] = useState<BedSection[]>([]);
  const [bedLayoutConfig, setBedLayoutConfig] = useState<BedLayoutConfig | null>(null);

  const handleBedSectionsChange = useCallback((sections: BedSection[]) => {
    setBedSections(sections);
  }, []);

  const handleBedConfigChange = useCallback((config: BedLayoutConfig) => {
    setBedLayoutConfig(config);
  }, []);

  // Available rooms for bed assignment (Airbnb: pull from property room sections)
  const availableRoomsForBeds = propertyRoomSections.map(s => s.name);

  // Auto-populate door config and feature flags when body style changes
  useEffect(() => {
    if (watchedBodyStyle) {
      const suggestion = getDoorSuggestion(watchedBodyStyle);
      if (suggestion) form.setValue('doorConfiguration', suggestion);
      const defaults = getBodyStyleDefaults(watchedBodyStyle);
      setHasRearHatch(defaults.hasRearHatch);
      setHasSlidingDoor(defaults.hasSlidingDoor);
      setHasCargoDoor(defaults.hasCargoDoor);
      setHasRamp(defaults.hasRamp);
      setHasLiftgate(defaults.hasLiftgate);
    }
  }, [watchedBodyStyle, form]);

  async function onSubmit(values: FormValues) {
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

    // Append per-room checklist items from property layout setup
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

    // Bed sections from BedSetup
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

    const checklistItems = [...templateItems, ...roomItems, ...bedChecklistItems];

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
      if (values.vehicleType) details.vehicleType = values.vehicleType;
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
    }

    if (isCompanyVehicle) {
      if (values.department) details.department = values.department;
      if (values.unitNumber) details.unitNumber = values.unitNumber;
      if (values.vehicleYear) details.vehicleYear = values.vehicleYear;
      if (values.vehicleMake) details.vehicleMake = values.vehicleMake;
      if (values.vehicleModel) details.vehicleModel = values.vehicleModel;
      if (values.vehicleType) details.vehicleType = values.vehicleType;
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

    // Vehicle body style details
    if (isVehicleBodyStyleApplicable && values.vehicleBodyStyle) {
      details.vehicleBodyStyle = values.vehicleBodyStyle;
      if (values.vehicleBodyStyle === 'Other' && values.vehicleBodyStyleOther) {
        details.vehicleBodyStyleOther = values.vehicleBodyStyleOther;
      }
      if (values.doorConfiguration) details.doorConfiguration = values.doorConfiguration;
      details.hasRearHatch = hasRearHatch;
      details.hasSlidingDoor = hasSlidingDoor;
      details.hasCargoDoor = hasCargoDoor;
      details.hasRamp = hasRamp;
      details.hasLiftgate = hasLiftgate;
    }

    // Property layout details (from PropertyLayoutSetup)
    if (isPropertyType) {
      for (const [k, v] of Object.entries(propertyDetails)) {
        details[k] = v;
      }
    }

    // Bed layout details (from BedSetup)
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

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/packets/new">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight">New {template.name}</h1>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
      </header>

      {type === 'accident_claim' && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-sm flex gap-2">
          <span className="text-destructive font-bold">⚠️</span>
          <span className="text-destructive">Only document the scene if it is safe to do so. Do not block traffic or place yourself in danger.</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* ─────────────────────────────────────────────────────────────────
              RENTAL VEHICLE FIELDS
          ───────────────────────────────────────────────────────────────── */}
          {isRental && (
            <>
              <SectionDivider label="Company / Platform" />

              <div className="space-y-2">
                <label className="text-sm font-medium">Rental Company / Platform</label>
                <NativeSelect
                  value={rentalCompany || ''}
                  onChange={v => form.setValue('rentalCompany', v)}
                  options={companyOptions}
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
                  <FormLabel>Pickup Location</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. SFO Airport, 780 McDonnell Rd" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="returnLocation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Location <span className="text-muted-foreground font-normal text-xs">(if different)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. LAX Airport" /></FormControl>
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

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

              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
                <NativeSelect
                  value={form.watch('vehicleType') || ''}
                  onChange={v => form.setValue('vehicleType', v)}
                  options={VEHICLE_TYPES}
                  placeholder="Select vehicle type…"
                />
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
                    <FormLabel>Unit / Truck # <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
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
                  <FormLabel>EV Battery at Pickup <span className="text-muted-foreground font-normal text-xs">(electric vehicles only)</span></FormLabel>
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
                    <Textarea {...field} className="resize-none" rows={2} placeholder="e.g. Moving blankets (12), hand truck, dolly" />
                  </FormControl>
                </FormItem>
              )} />
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              COMPANY VEHICLE FIELDS
          ───────────────────────────────────────────────────────────────── */}
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
                    <FormLabel>Department / Team <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Field Operations" /></FormControl>
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
                  <FormLabel>Supervisor / Manager Name <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="Name of approving supervisor" /></FormControl>
                </FormItem>
              )} />

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

              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
                <NativeSelect
                  value={form.watch('vehicleType') || ''}
                  onChange={v => form.setValue('vehicleType', v)}
                  options={VEHICLE_TYPES}
                  placeholder="Select vehicle type…"
                />
              </div>

              <FormField control={form.control} name="vin" render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="17-character VIN" /></FormControl>
                </FormItem>
              )} />

              <SectionDivider label="Checkout" />

              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Checkout Location</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Main depot, 123 Warehouse Blvd" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Checkout Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                </FormItem>
              )} />

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
                  <FormLabel>EV Battery at Checkout <span className="text-muted-foreground font-normal text-xs">(electric vehicles only)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. 91%" /></FormControl>
                </FormItem>
              )} />

              <SectionDivider label="Return / Check-In" />

              <FormField control={form.control} name="returnLocation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Location <span className="text-muted-foreground font-normal text-xs">(if different)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Satellite yard, 456 Industrial Dr" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Date <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
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
                  <FormLabel>EV Battery at Return <span className="text-muted-foreground font-normal text-xs">(electric vehicles only)</span></FormLabel>
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
                  <FormLabel>Additional Equipment / Accessories <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" rows={2} placeholder="e.g. Safety vest, first aid kit, cones (4), hand truck" />
                  </FormControl>
                </FormItem>
              )} />
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              NON-VEHICLE GENERIC FIELDS
          ───────────────────────────────────────────────────────────────── */}
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

              {/* Property room / area setup */}
              {isPropertyType && (
                <>
                  <SectionDivider label="Rooms & Areas" />
                  <PropertyLayoutSetup
                    packetType={type}
                    onSectionsChange={handlePropertySectionsChange}
                    onDetailsChange={handlePropertyDetailsChange}
                  />
                </>
              )}

              {/* Bed and sleeping arrangement setup */}
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

          {/* ─────────────────────────────────────────────────────────────────
              VEHICLE BODY STYLE & CONFIGURATION
          ───────────────────────────────────────────────────────────────── */}
          {isVehicleBodyStyleApplicable && (
            <>
              <SectionDivider label="Body Style & Configuration (Optional)" />

              <div className="space-y-2">
                <label className="text-sm font-medium">Body Style</label>
                <NativeSelect
                  value={form.watch('vehicleBodyStyle') || ''}
                  onChange={v => form.setValue('vehicleBodyStyle', v)}
                  options={VEHICLE_BODY_STYLES}
                  placeholder="Select body style…"
                />
              </div>

              {form.watch('vehicleBodyStyle') === 'Other' && (
                <FormField control={form.control} name="vehicleBodyStyleOther" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe body style</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Cab-over truck, Golf cart" /></FormControl>
                  </FormItem>
                )} />
              )}

              {form.watch('vehicleBodyStyle') && (
                <FormField control={form.control} name="doorConfiguration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Door configuration</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 4 doors + rear hatch" />
                    </FormControl>
                    <p className="text-[11px] text-muted-foreground">Auto-suggested — edit to match the actual vehicle</p>
                  </FormItem>
                )} />
              )}

              {form.watch('vehicleBodyStyle') && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Special access / features present</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-normal">Rear hatch</Label>
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
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              USE CONTEXT (optional — rental vehicles, stays, and other relevant types)
          ───────────────────────────────────────────────────────────────── */}
          {showUseContext && (
            <>
              <SectionDivider label="Use Context (Optional)" />
              <Card className="bg-muted/30 border-muted">
                <CardContent className="p-3 space-y-1.5">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Rental vehicle packets can be used for personal trips, business travel, government travel, contractor travel, company-paid rentals, or military travel.
                  </p>
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
                              options={[
                                'Yes — I arranged and paid for my own move',
                                'No — Government arranged',
                              ]}
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
                        <Textarea {...field} className="resize-none" rows={2} placeholder="e.g. Business trip purpose, cost center, weight ticket on file, receipts attached…" />
                      </FormControl>
                    </FormItem>
                  )} />
                </>
              )}
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              SHARED BOTTOM FIELDS
          ───────────────────────────────────────────────────────────────── */}
          {isVehicle && <SectionDivider label="Packet" />}

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
                <Textarea {...field} className="resize-none" rows={3}
                  placeholder={isCompanyVehicle
                    ? "Any additional notes about this vehicle assignment or condition…"
                    : isRental
                      ? "Any additional notes about this rental or situation…"
                      : "Additional notes…"}
                />
              </FormControl>
            </FormItem>
          )} />

          <Button type="submit" size="lg" className="w-full mt-4 h-14 text-base">
            Create Packet
          </Button>
        </form>
      </Form>
    </div>
  );
}
