import { useState, useEffect, useCallback } from 'react';
import type { PacketType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Plus, Trash2, Info } from 'lucide-react';
import {
  type BathroomConfig,
  type PropertyLayout,
  type GeneratedSection,
  generatePropertySections,
  defaultBathroomConfig,
} from '@/utils/propertyChecklist';

interface PropertyLayoutSetupProps {
  packetType: PacketType;
  onSectionsChange: (sections: GeneratedSection[]) => void;
  onDetailsChange: (details: Record<string, string | boolean>) => void;
}

function CountRow({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm flex-1">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          –
        </Button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-normal flex-1 cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const BATHROOM_TYPES = [
  { value: 'full', label: 'Full bath' },
  { value: 'half', label: 'Half bath' },
  { value: 'ensuite', label: 'En-suite / Primary' },
  { value: 'shared', label: 'Shared' },
  { value: 'public', label: 'Public / Customer' },
  { value: 'employee', label: 'Employee' },
  { value: 'accessible', label: 'Accessible / ADA' },
  { value: 'other', label: 'Other' },
];

function BathroomCard({
  config,
  index,
  onChange,
  onRemove,
}: {
  config: BathroomConfig;
  index: number;
  onChange: (cfg: BathroomConfig) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const update = (patch: Partial<BathroomConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left gap-2"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{config.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5 capitalize">
            {BATHROOM_TYPES.find(t => t.value === config.bathroomType)?.label || config.bathroomType}
            {config.location ? ` · near ${config.location}` : ''}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="p-1 text-muted-foreground hover:text-destructive"
            onClick={e => { e.stopPropagation(); onRemove(); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 space-y-3 border-t">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Label / Name</label>
              <Input
                value={config.label}
                onChange={e => update({ label: e.target.value })}
                placeholder={`Bathroom ${index}`}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Type</label>
              <select
                value={config.bathroomType}
                onChange={e => update({ bathroomType: e.target.value as BathroomConfig['bathroomType'] })}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                {BATHROOM_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Location / Near which room <span className="text-muted-foreground">(optional)</span></label>
            <Input
              value={config.location}
              onChange={e => update({ location: e.target.value })}
              placeholder="e.g. Master bedroom, Main hallway"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Features present</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <ToggleRow label="Tub" checked={config.hasTub} onChange={v => update({ hasTub: v })} />
              <ToggleRow label="Shower" checked={config.hasShower} onChange={v => update({ hasShower: v })} />
              <ToggleRow label="Toilet" checked={config.hasToilet} onChange={v => update({ hasToilet: v })} />
              <ToggleRow label="Sink / Vanity" checked={config.hasSink} onChange={v => update({ hasSink: v })} />
              <ToggleRow label="Mirror" checked={config.hasMirror} onChange={v => update({ hasMirror: v })} />
              <ToggleRow label="Fan / Vent" checked={config.hasFan} onChange={v => update({ hasFan: v })} />
              <ToggleRow label="Cabinet" checked={config.hasCabinet} onChange={v => update({ hasCabinet: v })} />
              <ToggleRow label="Towel rack" checked={config.hasTowelRack} onChange={v => update({ hasTowelRack: v })} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Flooring type <span className="text-muted-foreground">(optional)</span></label>
            <Input
              value={config.flooring}
              onChange={e => update({ flooring: e.target.value })}
              placeholder="e.g. Tile, Vinyl, Marble"
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const HOTEL_TYPE = 'hotel';
const AIRBNB_TYPE = 'airbnb';
const BUSINESS_TYPES = ['business_commercial_lease', 'business_changeover_as_is_sale'];

function defaultLayout(): PropertyLayout {
  return {
    bedroomsCount: 0,
    bathroomsCount: 0,
    halfBathroomsCount: 0,
    livingRoomsCount: 0,
    diningRoomsCount: 0,
    kitchensCount: 0,
    laundryRoomsCount: 0,
    garageCount: 0,
    closetsCount: 0,
    storageRoomsCount: 0,
    hallwaysCount: 0,
    hasBasement: false,
    hasAttic: false,
    balconyCount: 0,
    hasYardExterior: false,
    hasPool: false,
    hasOwnerCloset: false,
    officesCount: 0,
    conferenceRoomsCount: 0,
    hasLobby: false,
    hasWarehouse: false,
    hasRetailFloor: false,
    hasCommercialKitchen: false,
    hasLoadingDock: false,
    hasParkingExterior: false,
    hasKitchenette: false,
    hasLivingArea: false,
    hasConnectingRoomDoor: false,
    hasMiniFridge: false,
    hasSafe: false,
    hasCloset: false,
    bathroomConfigs: [],
  };
}

export default function PropertyLayoutSetup({
  packetType,
  onSectionsChange,
  onDetailsChange,
}: PropertyLayoutSetupProps) {
  const isHotel = packetType === HOTEL_TYPE;
  const isAirbnb = packetType === AIRBNB_TYPE;
  const isBusiness = BUSINESS_TYPES.includes(packetType);
  const isResidential = !isHotel && !isBusiness;

  const [layout, setLayout] = useState<PropertyLayout>(defaultLayout);
  const [bathroomConfigs, setBathroomConfigs] = useState<BathroomConfig[]>([]);

  const updateLayout = useCallback((patch: Partial<PropertyLayout>) => {
    setLayout(prev => ({ ...prev, ...patch }));
  }, []);

  // Sync bathroom count with bathroomConfigs array length
  useEffect(() => {
    setBathroomConfigs(prev => {
      const count = layout.bathroomsCount;
      if (prev.length < count) {
        const additions = Array.from({ length: count - prev.length }, (_, i) =>
          defaultBathroomConfig(prev.length + i + 1)
        );
        return [...prev, ...additions];
      }
      return prev.slice(0, count);
    });
  }, [layout.bathroomsCount]);

  // Notify parent whenever layout or bathroom configs change
  useEffect(() => {
    const sections = generatePropertySections(layout, bathroomConfigs);
    onSectionsChange(sections);

    const details: Record<string, string | boolean> = {
      propertyBedroomsCount: String(layout.bedroomsCount),
      propertyBathroomsCount: String(layout.bathroomsCount),
      propertyHalfBathroomsCount: String(layout.halfBathroomsCount),
      propertyLivingRoomsCount: String(layout.livingRoomsCount),
      propertyDiningRoomsCount: String(layout.diningRoomsCount),
      propertyKitchensCount: String(layout.kitchensCount),
      propertyLaundryRoomsCount: String(layout.laundryRoomsCount),
      propertyGarageCount: String(layout.garageCount),
      propertyStorageRoomsCount: String(layout.storageRoomsCount),
      propertyBalconyCount: String(layout.balconyCount),
      propertyHasBasement: layout.hasBasement,
      propertyHasAttic: layout.hasAttic,
      propertyHasYardExterior: layout.hasYardExterior,
      propertyHasPool: layout.hasPool,
      propertyOfficesCount: String(layout.officesCount),
      propertyConferenceRoomsCount: String(layout.conferenceRoomsCount),
      propertyHasLobby: layout.hasLobby,
      propertyHasWarehouse: layout.hasWarehouse,
      propertyHasRetailFloor: layout.hasRetailFloor,
      propertyHasCommercialKitchen: layout.hasCommercialKitchen,
      propertyHasLoadingDock: layout.hasLoadingDock,
      propertyBathroomConfigsJson: JSON.stringify(bathroomConfigs),
    };
    onDetailsChange(details);
  }, [layout, bathroomConfigs, onSectionsChange, onDetailsChange]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
          ConditionLock uses your room counts to build a more accurate checklist. Something missing? Add a custom item anytime during the inspection.
        </p>
      </div>

      {/* Hotel-specific counts */}
      {isHotel && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm">Room Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4 px-4">
            <CountRow label="Bathrooms" value={layout.bathroomsCount} onChange={v => updateLayout({ bathroomsCount: v })} />
            <ToggleRow label="Kitchenette" checked={layout.hasKitchenette} onChange={v => updateLayout({ hasKitchenette: v })} />
            <ToggleRow label="Living / Sitting area" checked={layout.hasLivingArea} onChange={v => updateLayout({ hasLivingArea: v })} />
            <ToggleRow label="Balcony" checked={layout.balconyCount > 0} onChange={v => updateLayout({ balconyCount: v ? 1 : 0 })} />
            <ToggleRow label="Connecting room door" checked={layout.hasConnectingRoomDoor} onChange={v => updateLayout({ hasConnectingRoomDoor: v })} />
            <ToggleRow label="Mini fridge" checked={layout.hasMiniFridge} onChange={v => updateLayout({ hasMiniFridge: v })} />
            <ToggleRow label="Safe" checked={layout.hasSafe} onChange={v => updateLayout({ hasSafe: v })} />
            <ToggleRow label="Closet / Wardrobe" checked={layout.hasCloset} onChange={v => updateLayout({ hasCloset: v })} />
          </CardContent>
        </Card>
      )}

      {/* Residential / Airbnb counts */}
      {isResidential && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm">Rooms & Areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4 px-4">
            <CountRow label="Bedrooms" value={layout.bedroomsCount} onChange={v => updateLayout({ bedroomsCount: v })} />
            <CountRow label="Full bathrooms" value={layout.bathroomsCount} onChange={v => updateLayout({ bathroomsCount: v })} />
            <CountRow label="Half bathrooms" value={layout.halfBathroomsCount} onChange={v => updateLayout({ halfBathroomsCount: v })} />
            <CountRow label="Living rooms" value={layout.livingRoomsCount} onChange={v => updateLayout({ livingRoomsCount: v })} />
            <CountRow label="Dining rooms" value={layout.diningRoomsCount} onChange={v => updateLayout({ diningRoomsCount: v })} />
            <CountRow label="Kitchens" value={layout.kitchensCount} onChange={v => updateLayout({ kitchensCount: v })} />
            <CountRow label="Laundry rooms / areas" value={layout.laundryRoomsCount} onChange={v => updateLayout({ laundryRoomsCount: v })} />
            <CountRow label="Garages / parking" value={layout.garageCount} onChange={v => updateLayout({ garageCount: v })} />
            <CountRow label="Balcony / Patio / Deck" value={layout.balconyCount} onChange={v => updateLayout({ balconyCount: v })} />
            <CountRow label="Storage rooms / closets" value={layout.storageRoomsCount} onChange={v => updateLayout({ storageRoomsCount: v })} />
            <ToggleRow label="Basement" checked={layout.hasBasement} onChange={v => updateLayout({ hasBasement: v })} />
            <ToggleRow label="Attic" checked={layout.hasAttic} onChange={v => updateLayout({ hasAttic: v })} />
            <ToggleRow label="Yard / Exterior area" checked={layout.hasYardExterior} onChange={v => updateLayout({ hasYardExterior: v })} />
            {isAirbnb && (
              <>
                <ToggleRow label="Pool / Hot tub" checked={layout.hasPool} onChange={v => updateLayout({ hasPool: v })} />
                <ToggleRow label="Owner / locked closet" checked={layout.hasOwnerCloset} onChange={v => updateLayout({ hasOwnerCloset: v })} />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business-specific counts */}
      {isBusiness && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm">Space Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4 px-4">
            <CountRow label="Offices" value={layout.officesCount} onChange={v => updateLayout({ officesCount: v })} />
            <CountRow label="Conference rooms" value={layout.conferenceRoomsCount} onChange={v => updateLayout({ conferenceRoomsCount: v })} />
            <CountRow label="Bathrooms" value={layout.bathroomsCount} onChange={v => updateLayout({ bathroomsCount: v })} />
            <CountRow label="Kitchens / Break rooms" value={layout.kitchensCount} onChange={v => updateLayout({ kitchensCount: v })} />
            <CountRow label="Storage rooms" value={layout.storageRoomsCount} onChange={v => updateLayout({ storageRoomsCount: v })} />
            <ToggleRow label="Reception / Lobby" checked={layout.hasLobby} onChange={v => updateLayout({ hasLobby: v })} />
            <ToggleRow label="Warehouse area" checked={layout.hasWarehouse} onChange={v => updateLayout({ hasWarehouse: v })} />
            <ToggleRow label="Retail floor" checked={layout.hasRetailFloor} onChange={v => updateLayout({ hasRetailFloor: v })} />
            <ToggleRow label="Commercial kitchen" checked={layout.hasCommercialKitchen} onChange={v => updateLayout({ hasCommercialKitchen: v })} />
            <ToggleRow label="Loading dock" checked={layout.hasLoadingDock} onChange={v => updateLayout({ hasLoadingDock: v })} />
            <ToggleRow label="Parking / Exterior" checked={layout.hasParkingExterior} onChange={v => updateLayout({ hasParkingExterior: v })} />
          </CardContent>
        </Card>
      )}

      {/* Bathroom sub-menu */}
      {bathroomConfigs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Bathroom details
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(tap to configure each bathroom)</span>
          </p>
          {bathroomConfigs.map((cfg, i) => (
            <BathroomCard
              key={cfg.id}
              config={cfg}
              index={i + 1}
              onChange={updated => {
                setBathroomConfigs(prev => prev.map(c => c.id === updated.id ? updated : c));
              }}
              onRemove={() => {
                setBathroomConfigs(prev => prev.filter(c => c.id !== cfg.id));
                updateLayout({ bathroomsCount: Math.max(0, layout.bathroomsCount - 1) });
              }}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs"
            onClick={() => {
              const newCfg = defaultBathroomConfig(bathroomConfigs.length + 1);
              setBathroomConfigs(prev => [...prev, newCfg]);
              updateLayout({ bathroomsCount: layout.bathroomsCount + 1 });
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Bathroom
          </Button>
        </div>
      )}

      {/* Room summary preview */}
      {(layout.bedroomsCount + layout.bathroomsCount + layout.halfBathroomsCount + layout.livingRoomsCount + layout.diningRoomsCount + layout.kitchensCount + layout.laundryRoomsCount + layout.garageCount + layout.officesCount + layout.conferenceRoomsCount + layout.storageRoomsCount > 0 || layout.hasBasement || layout.hasAttic) && (
        <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <p className="text-[11px] font-semibold text-green-700 dark:text-green-400 mb-1">
            Checklist will include sections for:
          </p>
          <p className="text-[11px] text-green-700/80 dark:text-green-400/80 leading-relaxed">
            {[
              layout.bedroomsCount > 0 && `${layout.bedroomsCount} bedroom${layout.bedroomsCount > 1 ? 's' : ''}`,
              layout.bathroomsCount > 0 && `${layout.bathroomsCount} full bathroom${layout.bathroomsCount > 1 ? 's' : ''}`,
              layout.halfBathroomsCount > 0 && `${layout.halfBathroomsCount} half bath${layout.halfBathroomsCount > 1 ? 's' : ''}`,
              layout.livingRoomsCount > 0 && `${layout.livingRoomsCount} living room${layout.livingRoomsCount > 1 ? 's' : ''}`,
              layout.diningRoomsCount > 0 && `${layout.diningRoomsCount} dining room${layout.diningRoomsCount > 1 ? 's' : ''}`,
              layout.kitchensCount > 0 && `${layout.kitchensCount} kitchen${layout.kitchensCount > 1 ? 's' : ''}`,
              layout.laundryRoomsCount > 0 && `${layout.laundryRoomsCount} laundry area${layout.laundryRoomsCount > 1 ? 's' : ''}`,
              layout.garageCount > 0 && `${layout.garageCount} garage${layout.garageCount > 1 ? 's' : ''}`,
              layout.balconyCount > 0 && `${layout.balconyCount} balcony/patio`,
              layout.hasBasement && 'basement',
              layout.hasAttic && 'attic',
              layout.officesCount > 0 && `${layout.officesCount} office${layout.officesCount > 1 ? 's' : ''}`,
              layout.conferenceRoomsCount > 0 && `${layout.conferenceRoomsCount} conference room${layout.conferenceRoomsCount > 1 ? 's' : ''}`,
              layout.storageRoomsCount > 0 && `${layout.storageRoomsCount} storage room${layout.storageRoomsCount > 1 ? 's' : ''}`,
              layout.hasLobby && 'lobby/reception',
              layout.hasWarehouse && 'warehouse',
              layout.hasRetailFloor && 'retail floor',
            ].filter(Boolean).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
