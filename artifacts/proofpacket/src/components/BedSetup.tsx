import { useState, useEffect, useCallback } from 'react';
import type { PacketType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Plus, Trash2, Info, Bed } from 'lucide-react';
import {
  type BedConfig,
  type RollawayConfig,
  type CribConfig,
  type SofaBedConfig,
  type BedLayoutConfig,
  type BedSection,
  BED_CONDITION_STATUSES,
  BED_TYPES_HOTEL,
  BED_TYPES_AIRBNB,
  generateBedSections,
  defaultBedConfig,
  defaultRollawayConfig,
  defaultCribConfig,
  defaultSofaBedConfig,
  defaultBedLayoutConfig,
} from '@/utils/bedChecklist';

interface BedSetupProps {
  packetType: PacketType;
  availableRooms: string[];
  onSectionsChange: (sections: BedSection[]) => void;
  onConfigChange: (config: BedLayoutConfig) => void;
}

// ─── Status chips ─────────────────────────────────────────────────────────────

function StatusChips({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (status: string) => {
    if (selected.includes(status)) {
      onChange(selected.filter(s => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  const chipColors: Record<string, string> = {
    'Clean': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300',
    'Dirty': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300',
    'Damaged': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300',
    'Stained': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300',
    'Odor': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300',
    'Missing bedding': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300',
    'Needs follow-up': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300',
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {BED_CONDITION_STATUSES.map(status => {
        const active = selected.includes(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => toggle(status)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all
              ${active
                ? (chipColors[status] || 'bg-primary/10 text-primary border-primary/30')
                : 'bg-background border-border text-muted-foreground hover:border-foreground/30'
              }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-normal flex-1 cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Count row ────────────────────────────────────────────────────────────────

function CountRow({ label, value, onChange, min = 0, max = 20 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm flex-1">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <Button type="button" variant="outline" size="icon" className="w-8 h-8"
          onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>–</Button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
        <Button type="button" variant="outline" size="icon" className="w-8 h-8"
          onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</Button>
      </div>
    </div>
  );
}

// ─── Bed card ─────────────────────────────────────────────────────────────────

function BedCard({
  config,
  index,
  bedTypes,
  availableRooms,
  showRoomAssignment,
  onChange,
  onRemove,
}: {
  config: BedConfig;
  index: number;
  bedTypes: readonly string[];
  availableRooms: string[];
  showRoomAssignment: boolean;
  onChange: (cfg: BedConfig) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const update = (patch: Partial<BedConfig>) => onChange({ ...config, ...patch });

  const conditionSummary = config.conditionStatuses.length > 0
    ? config.conditionStatuses.join(', ')
    : 'Tap to document condition';

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left gap-2"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Bed className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold leading-tight truncate">{config.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {config.bedType || 'No type set'}{config.assignedRoom ? ` · ${config.assignedRoom}` : ''}
              {config.conditionStatuses.length > 0 && (
                <span className="ml-1 text-orange-600 dark:text-orange-400">· {conditionSummary}</span>
              )}
            </div>
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
                placeholder={`Bed ${index}`}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Bed type</label>
              <select
                value={config.bedType}
                onChange={e => update({ bedType: e.target.value })}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="">Select…</option>
                {bedTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {showRoomAssignment && (
            <div className="space-y-1">
              <label className="text-xs font-medium">Assigned room / area</label>
              {availableRooms.length > 0 ? (
                <select
                  value={config.assignedRoom}
                  onChange={e => update({ assignedRoom: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  <option value="">Not assigned</option>
                  {availableRooms.map(r => <option key={r} value={r}>{r}</option>)}
                  <option value="Other">Other / Custom</option>
                </select>
              ) : (
                <Input
                  value={config.assignedRoom}
                  onChange={e => update({ assignedRoom: e.target.value })}
                  placeholder="e.g. Bedroom 1, Living Room, Sofa area"
                  className="h-8 text-sm"
                />
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Initial condition <span className="font-normal text-muted-foreground">(select all that apply)</span></label>
            <StatusChips
              selected={config.conditionStatuses}
              onChange={v => update({ conditionStatuses: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Mattress condition</label>
              <Input value={config.mattressCondition} onChange={e => update({ mattressCondition: e.target.value })}
                placeholder="e.g. Good, Stained" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Bedding / sheets</label>
              <Input value={config.beddingCondition} onChange={e => update({ beddingCondition: e.target.value })}
                placeholder="e.g. Clean, Missing" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Pillows</label>
              <Input value={config.pillowsCondition} onChange={e => update({ pillowsCondition: e.target.value })}
                placeholder="e.g. 2, clean" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Blanket / comforter</label>
              <Input value={config.blanketCondition} onChange={e => update({ blanketCondition: e.target.value })}
                placeholder="e.g. Good, Stained" className="h-8 text-sm" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Bedframe / headboard condition</label>
            <Input value={config.bedframeCondition} onChange={e => update({ bedframeCondition: e.target.value })}
              placeholder="e.g. Good, Damaged corner" className="h-8 text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Notes</label>
            <Textarea value={config.notes} onChange={e => update({ notes: e.target.value })}
              className="resize-none text-sm" rows={2}
              placeholder="Any additional notes about this bed…" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Simple accessory card (rollaway, crib, sofa bed) ────────────────────────

function AccessoryCard({
  label,
  config,
  onChange,
  onRemove,
}: {
  label: string;
  config: RollawayConfig | CribConfig | SofaBedConfig;
  onChange: (cfg: typeof config) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const update = (patch: Partial<typeof config>) => onChange({ ...config, ...patch } as typeof config);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left gap-2"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{config.label}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" className="p-1 text-muted-foreground hover:text-destructive"
            onClick={e => { e.stopPropagation(); onRemove(); }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <div className="p-3 space-y-3 border-t">
          <div className="space-y-1">
            <label className="text-xs font-medium">Label</label>
            <Input value={config.label} onChange={e => update({ label: e.target.value })}
              className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Condition <span className="font-normal text-muted-foreground">(select all that apply)</span></label>
            <StatusChips
              selected={config.conditionStatuses}
              onChange={v => update({ conditionStatuses: v })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Notes</label>
            <Textarea value={config.notes} onChange={e => update({ notes: e.target.value })}
              className="resize-none text-sm" rows={2} placeholder="Any additional notes…" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BedSetup({
  packetType,
  availableRooms,
  onSectionsChange,
  onConfigChange,
}: BedSetupProps) {
  const isHotel = packetType === 'hotel';
  const isAirbnb = packetType === 'airbnb';
  const bedTypes = isAirbnb ? BED_TYPES_AIRBNB : BED_TYPES_HOTEL;
  const showRoomAssignment = isAirbnb;

  const [config, setConfig] = useState<BedLayoutConfig>(defaultBedLayoutConfig);

  const updateConfig = useCallback((patch: Partial<BedLayoutConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  // Sync bed count with beds array
  const [bedCount, setBedCount] = useState(0);
  useEffect(() => {
    setConfig(prev => {
      const count = bedCount;
      if (prev.beds.length < count) {
        const additions = Array.from({ length: count - prev.beds.length }, (_, i) =>
          defaultBedConfig(prev.beds.length + i + 1, packetType)
        );
        return { ...prev, beds: [...prev.beds, ...additions] };
      }
      return { ...prev, beds: prev.beds.slice(0, count) };
    });
  }, [bedCount, packetType]);

  // Emit sections + config to parent whenever state changes
  useEffect(() => {
    const sections = generateBedSections(config);
    onSectionsChange(sections);
    onConfigChange(config);
  }, [config, onSectionsChange, onConfigChange]);

  const totalSections = config.beds.length + config.rollaways.length + config.cribs.length + config.sofaBeds.length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
          Beds and sleeping arrangements help document missing, dirty, damaged, stained, or incorrect bedding before checkout. Add a custom bed, rollaway, crib, sofa bed, air mattress, or bedding issue anytime during the inspection.
        </p>
      </div>

      {/* ── Bed count ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm">Sleeping Arrangements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 px-4">
          <CountRow
            label="Number of beds"
            value={bedCount}
            onChange={v => setBedCount(v)}
          />

          {isHotel && (
            <>
              <ToggleRow label="Rollaway bed requested" checked={config.rollawayRequested}
                onChange={v => {
                  updateConfig({ rollawayRequested: v });
                  if (v && config.rollaways.length === 0) {
                    updateConfig({ rollaways: [defaultRollawayConfig(1)] });
                  }
                }} />
              <ToggleRow label="Rollaway bed provided" checked={config.rollawayProvided}
                onChange={v => {
                  updateConfig({ rollawayProvided: v });
                  if (v && config.rollaways.length === 0) {
                    updateConfig({ rollaways: [defaultRollawayConfig(1)] });
                  }
                }} />
              <ToggleRow label="Crib requested" checked={config.cribRequested}
                onChange={v => {
                  updateConfig({ cribRequested: v });
                  if (v && config.cribs.length === 0) {
                    updateConfig({ cribs: [defaultCribConfig(1)] });
                  }
                }} />
              <ToggleRow label="Crib provided" checked={config.cribProvided}
                onChange={v => {
                  updateConfig({ cribProvided: v });
                  if (v && config.cribs.length === 0) {
                    updateConfig({ cribs: [defaultCribConfig(1)] });
                  }
                }} />
            </>
          )}

          {isAirbnb && (
            <>
              <ToggleRow label="Rollaway bed(s) present" checked={config.rollaways.length > 0}
                onChange={v => updateConfig({ rollaways: v ? [defaultRollawayConfig(1)] : [] })} />
              <ToggleRow label="Crib / pack-n-play present" checked={config.cribs.length > 0}
                onChange={v => updateConfig({ cribs: v ? [defaultCribConfig(1)] : [] })} />
              <ToggleRow label="Air mattress present" checked={config.airMattressPresent}
                onChange={v => updateConfig({ airMattressPresent: v })} />
            </>
          )}

          <ToggleRow label="Sofa bed present" checked={config.sofaBedPresent}
            onChange={v => {
              updateConfig({ sofaBedPresent: v });
              if (v && config.sofaBeds.length === 0) {
                updateConfig({ sofaBeds: [defaultSofaBedConfig(1)] });
              } else if (!v) {
                updateConfig({ sofaBeds: [], sofaBedUsed: false });
              }
            }} />

          {config.sofaBedPresent && (
            <ToggleRow label="Sofa bed used / opened" checked={config.sofaBedUsed}
              onChange={v => updateConfig({ sofaBedUsed: v })} />
          )}

          <ToggleRow label="Extra bedding provided" checked={config.extraBeddingProvided}
            onChange={v => updateConfig({ extraBeddingProvided: v })} />
        </CardContent>
      </Card>

      {/* ── Bedding inventory ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm">Bedding Inventory <span className="font-normal text-muted-foreground text-xs">(optional)</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 px-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Pillows</label>
              <Input value={config.numberOfPillows}
                onChange={e => updateConfig({ numberOfPillows: e.target.value })}
                placeholder="e.g. 4" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Blankets</label>
              <Input value={config.numberOfBlankets}
                onChange={e => updateConfig({ numberOfBlankets: e.target.value })}
                placeholder="e.g. 2" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Linen sets</label>
              <Input value={config.numberOfLinenSets}
                onChange={e => updateConfig({ numberOfLinenSets: e.target.value })}
                placeholder="e.g. 2" className="h-8 text-sm" />
            </div>
          </div>
          {isAirbnb && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Compare against the listing to confirm expected beds match what's present, bedding is clean, and no items are missing.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Per-bed config cards ──────────────────────────────────── */}
      {config.beds.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Bed details
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(tap to configure each bed)</span>
          </p>
          {config.beds.map((bed, i) => (
            <BedCard
              key={bed.id}
              config={bed}
              index={i + 1}
              bedTypes={bedTypes}
              availableRooms={availableRooms}
              showRoomAssignment={showRoomAssignment}
              onChange={updated => {
                setConfig(prev => ({
                  ...prev,
                  beds: prev.beds.map(b => b.id === updated.id ? updated : b),
                }));
              }}
              onRemove={() => {
                setConfig(prev => ({ ...prev, beds: prev.beds.filter(b => b.id !== bed.id) }));
                setBedCount(c => Math.max(0, c - 1));
              }}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs"
            onClick={() => {
              const newBed = defaultBedConfig(config.beds.length + 1, packetType);
              setConfig(prev => ({ ...prev, beds: [...prev.beds, newBed] }));
              setBedCount(c => c + 1);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Bed
          </Button>
        </div>
      )}

      {/* ── Rollaway cards ────────────────────────────────────────── */}
      {config.rollaways.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Rollaway bed details</p>
          {config.rollaways.map(rw => (
            <AccessoryCard
              key={rw.id}
              label="Rollaway bed"
              config={rw}
              onChange={updated => {
                setConfig(prev => ({ ...prev, rollaways: prev.rollaways.map(r => r.id === updated.id ? (updated as RollawayConfig) : r) }));
              }}
              onRemove={() => {
                setConfig(prev => ({ ...prev, rollaways: prev.rollaways.filter(r => r.id !== rw.id) }));
              }}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-9 text-xs"
            onClick={() => {
              setConfig(prev => ({ ...prev, rollaways: [...prev.rollaways, defaultRollawayConfig(prev.rollaways.length + 1)] }));
            }}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Rollaway
          </Button>
        </div>
      )}

      {/* ── Crib cards ────────────────────────────────────────────── */}
      {config.cribs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Crib details</p>
          {config.cribs.map(crib => (
            <AccessoryCard
              key={crib.id}
              label="Crib"
              config={crib}
              onChange={updated => {
                setConfig(prev => ({ ...prev, cribs: prev.cribs.map(c => c.id === updated.id ? (updated as CribConfig) : c) }));
              }}
              onRemove={() => {
                setConfig(prev => ({ ...prev, cribs: prev.cribs.filter(c => c.id !== crib.id) }));
              }}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-9 text-xs"
            onClick={() => {
              setConfig(prev => ({ ...prev, cribs: [...prev.cribs, defaultCribConfig(prev.cribs.length + 1)] }));
            }}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Crib
          </Button>
        </div>
      )}

      {/* ── Sofa bed cards ────────────────────────────────────────── */}
      {config.sofaBeds.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Sofa bed details</p>
          {config.sofaBeds.map(sb => (
            <AccessoryCard
              key={sb.id}
              label="Sofa bed"
              config={sb}
              onChange={updated => {
                setConfig(prev => ({ ...prev, sofaBeds: prev.sofaBeds.map(s => s.id === updated.id ? (updated as SofaBedConfig) : s) }));
              }}
              onRemove={() => {
                setConfig(prev => ({
                  ...prev,
                  sofaBeds: prev.sofaBeds.filter(s => s.id !== sb.id),
                  sofaBedPresent: prev.sofaBeds.length <= 1 ? false : prev.sofaBedPresent,
                }));
              }}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-9 text-xs"
            onClick={() => {
              setConfig(prev => ({ ...prev, sofaBeds: [...prev.sofaBeds, defaultSofaBedConfig(prev.sofaBeds.length + 1)] }));
            }}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Sofa Bed
          </Button>
        </div>
      )}

      {/* ── Overall notes ─────────────────────────────────────────── */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Sleeping arrangement notes <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
        <Textarea
          value={config.notes}
          onChange={e => updateConfig({ notes: e.target.value })}
          className="resize-none text-sm"
          rows={2}
          placeholder="e.g. Rollaway not yet delivered, extra blanket requested at front desk…"
        />
      </div>

      {/* ── Preview ───────────────────────────────────────────────── */}
      {totalSections > 0 && (
        <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <p className="text-[11px] font-semibold text-green-700 dark:text-green-400 mb-1">
            Checklist will include sections for:
          </p>
          <p className="text-[11px] text-green-700/80 dark:text-green-400/80 leading-relaxed">
            {[
              config.beds.length > 0 && `${config.beds.length} bed${config.beds.length > 1 ? 's' : ''}`,
              config.rollaways.length > 0 && `${config.rollaways.length} rollaway`,
              config.cribs.length > 0 && `${config.cribs.length} crib`,
              config.sofaBeds.length > 0 && `${config.sofaBeds.length} sofa bed`,
            ].filter(Boolean).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
