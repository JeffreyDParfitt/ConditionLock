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
import { ChevronLeft, Info } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewPacketForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const type = (params.type as PacketType) || "custom";
  const template = templates[type];
  const isRental = isRentalVehicleType(type);
  const isCompanyVehicle = type === 'company_vehicle_handoff';
  const isVehicle = isRental || isCompanyVehicle;

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
    },
  });

  const rentalCompany = useWatch({ control: form.control, name: 'rentalCompany' });
  const showCustomCompany = rentalCompany === 'Other';

  async function onSubmit(values: FormValues) {
    const checklistItems = template?.sections.flatMap(section =>
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
                      Company names are provided only to help organize your packet. ProofPacket is not affiliated with or endorsed by these companies.
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
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              MILITARY / GOVERNMENT TRAVEL (optional, vehicle packets only)
          ───────────────────────────────────────────────────────────────── */}
          {isVehicle && (
            <>
              <SectionDivider label="Travel Context (Optional)" />
              <Card className="bg-muted/30 border-muted">
                <CardContent className="p-3">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Fill in travel context if this packet is for military, government, or company travel. Leave blank for personal rentals. ProofPacket does not connect to DTS, government travel systems, or employer systems.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium">Travel Context</label>
                <NativeSelect
                  value={form.watch('travelContext') || ''}
                  onChange={v => form.setValue('travelContext', v)}
                  options={[
                    'Personal',
                    'Business',
                    'Military TDY / TAD',
                    'PCS Move',
                    'Government Travel',
                    'Contractor Travel',
                    'Company Vehicle',
                    'Other',
                  ]}
                  placeholder="Select travel context… (optional)"
                />
              </div>

              {form.watch('travelContext') && !['Personal', ''].includes(form.watch('travelContext') || '') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="travelOrderNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travel Order / Auth # <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 12345678" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dtsVoucherNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>DTS / Voucher Ref <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. DTS-2024-001" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="dutyStation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duty Station / Destination <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Fort Bragg, NC" /></FormControl>
                    </FormItem>
                  )} />

                  {form.watch('travelContext') === 'PCS Move' && (
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

                  <FormField control={form.control} name="officialTravelNotes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official Travel Notes <span className="text-muted-foreground font-normal text-xs">(opt.)</span></FormLabel>
                      <FormControl>
                        <Textarea {...field} className="resize-none" rows={2} placeholder="e.g. Weight ticket on file, receipts attached, leave dates..." />
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
