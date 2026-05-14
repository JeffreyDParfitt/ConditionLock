import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useDexieQuery } from "@/hooks/useLiveQuery";
import { db } from "@/storage/db";
import { storage } from "@/storage/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Camera, Download, FileText, CheckSquare, MessageSquare, PenTool, Image as ImageIcon, ChevronLeft, Plus, Trash2, Lock, Activity, Copy, Upload, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import SignaturePad from "signature_pad";
import { generatePDF } from "@/pdf/generator";
import { exportVerifiedPacket, exportFullArchive, exportPhotosZip } from "@/utils/manifest";
import { isCryptoAvailable } from "@/utils/crypto";
import type { ChecklistItem, ChecklistStatus, PhotoItem, SignatureItem, CommunicationLog } from "@/types";
import { useTier, isRentalVehicleType } from "@/hooks/useTier";
import { UpgradePrompt } from "@/components/UpgradePrompt";

// ------------------------------------------------------------------
// STATUS HELPERS — shared across components in this file
// ------------------------------------------------------------------
const POSITIVE_STATUSES = ['good', 'works', 'included', 'present', 'returned', 'resolved'];
const ISSUE_STATUSES = ['damaged', 'dirty', 'stained', 'odor', 'missing', 'not_working', 'not_present', 'not_returned', 'not_reported', 'unresolved'];
const EXCLUSIVE_STATUSES = ['not_checked', 'not_applicable'];
const EVIDENCE_STATUS_LIST = ['good', 'works', 'damaged', 'dirty', 'stained', 'odor', 'missing', 'not_working', 'not_present', 'not_returned', 'unresolved'];
const STATUS_LABELS: Record<string, string> = {
  good: 'Good Condition', works: 'Works / Functional', damaged: 'Damaged', dirty: 'Dirty',
  stained: 'Stained', odor: 'Odor', missing: 'Missing', not_working: 'Not Working',
  not_present: 'Not Present', not_returned: 'Not Returned', unresolved: 'Unresolved',
};
const NOTE_REQUIRED_STATUSES = ['odor', 'not_working', 'missing'];
const NOTE_HINTS_MAP: Record<string, string> = {
  odor: "Describe the odor — type, strength, where it's strongest…",
  not_working: "Describe what isn't working and how you tested it…",
  missing: "Describe what's missing and where it should be…",
  damaged: "Describe the damage — location, size, appearance…",
  stained: "Describe the stain — location, color, size…",
  dirty: "Describe the dirty area and extent…",
};

const ALL_STATUS_TAGS: string[] = [
  'good', 'works', 'included', 'present', 'returned', 'resolved',
  'damaged', 'dirty', 'stained', 'odor', 'missing', 'not_working',
  'not_present', 'not_returned', 'excluded', 'reported', 'not_reported', 'needs_follow_up', 'unresolved',
  'unknown', 'not_safe_to_check', 'not_applicable', 'not_checked',
];

function getEffectiveStatuses(item: any): string[] {
  if (item.statuses && item.statuses.length > 0) return item.statuses;
  if (item.status && item.status !== 'not_checked') return [item.status];
  return ['not_checked'];
}

function isItemChecked(item: any): boolean {
  const s = getEffectiveStatuses(item);
  return s.some(x => x !== 'not_checked') || !!(item.notes?.trim());
}

function hasIssueStatus(item: any): boolean {
  return getEffectiveStatuses(item).some(s => ISSUE_STATUSES.includes(s));
}

function getCardBorderColor(statuses: string[]): string {
  if (statuses.includes('not_applicable')) return 'bg-gray-400 dark:bg-gray-600';
  if (statuses.every(s => s === 'not_checked')) return 'bg-gray-200 dark:bg-gray-800';
  if (ISSUE_STATUSES.some(s => statuses.includes(s))) return 'bg-destructive';
  if (POSITIVE_STATUSES.some(s => statuses.includes(s))) return 'bg-green-500';
  return 'bg-amber-400';
}

function getChipStyle(tag: string, selected: boolean): string {
  const base = 'inline-flex items-center h-7 px-2.5 text-[11px] rounded-full border font-medium transition-colors cursor-pointer select-none';
  if (!selected) return `${base} border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-500 bg-transparent`;
  if (POSITIVE_STATUSES.includes(tag)) return `${base} bg-green-500 text-white border-green-500`;
  if (ISSUE_STATUSES.includes(tag)) return `${base} bg-destructive text-destructive-foreground border-destructive`;
  if (tag === 'reported' || tag === 'needs_follow_up') return `${base} bg-amber-500 text-white border-amber-500`;
  if (tag === 'not_applicable') return `${base} bg-gray-600 text-white border-gray-600`;
  if (tag === 'not_checked') return `${base} bg-gray-400 text-white border-gray-400`;
  return `${base} bg-slate-500 text-white border-slate-500`;
}

function toggleStatusTag(current: string[], tag: string): string[] {
  if (EXCLUSIVE_STATUSES.includes(tag)) return [tag];
  const withoutExclusive = current.filter(s => !EXCLUSIVE_STATUSES.includes(s));
  if (withoutExclusive.includes(tag)) {
    const next = withoutExclusive.filter(s => s !== tag);
    return next.length === 0 ? ['not_checked'] : next;
  }
  return [...withoutExclusive, tag];
}

function getPrimaryStatus(statuses: string[]): string {
  return statuses.find(s => ISSUE_STATUSES.includes(s))
    || statuses.find(s => !EXCLUSIVE_STATUSES.includes(s))
    || statuses[0]
    || 'not_checked';
}

function formatStatuses(statuses: string[]): string {
  return statuses.map(s =>
    s === 'needs_follow_up' ? 'needs follow-up' :
    s === 'not_safe_to_check' ? 'not safe to check' :
    s.replace(/_/g, ' ')
  ).join(', ');
}

// ------------------------------------------------------------------
export default function PacketDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const id = params.id as string;
  const packet = useDexieQuery(() => storage.getPacket(id), [id]);
  const photos = useDexieQuery(() => storage.getPhotosByPacket(id), [id]) || [];
  const settings = useDexieQuery(() => storage.getSettings());

  const [activeTab, setActiveTab] = useState("overview");

  if (!packet || !settings) return <div className="p-8 text-center flex flex-col items-center justify-center min-h-[100dvh]">Loading...</div>;

  const isVehicle = isRentalVehicleType(packet.type) || packet.type === 'company_vehicle_handoff';

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] bg-gray-50 dark:bg-gray-950 pb-20">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => setLocation('/packets')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="overflow-hidden">
            <h1 className="text-base font-semibold truncate leading-tight">{packet.title}</h1>
            <p className="text-[10px] font-medium text-primary uppercase tracking-wider">{packet.type.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-[53px] z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 overflow-x-auto hide-scrollbar">
          <TabsList className="w-full justify-start inline-flex h-10 bg-transparent p-0 border-none gap-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-full px-4 text-xs shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="checklist" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-full px-4 text-xs shrink-0">Checklist</TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-full px-4 text-xs shrink-0">Photos</TabsTrigger>
            <TabsTrigger value="comm" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-full px-4 text-xs shrink-0">Comm. Log</TabsTrigger>
            <TabsTrigger value="signatures" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-full px-4 text-xs shrink-0">Signatures</TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-full px-4 text-xs shrink-0">Export</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-full px-4 text-xs shrink-0">Activity</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <TabsContent value="overview" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Packet Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {packet.location && <div><span className="text-muted-foreground font-medium">Location:</span> {packet.location}</div>}
                {packet.companyOrPerson && <div><span className="text-muted-foreground font-medium">Company/Person:</span> {packet.companyOrPerson}</div>}
                {packet.referenceNumber && <div><span className="text-muted-foreground font-medium">Ref #:</span> {packet.referenceNumber}</div>}
                <div><span className="text-muted-foreground font-medium">Dates:</span> {packet.startDate} {packet.endDate ? `to ${packet.endDate}` : ''}</div>
                {packet.notes && <div><span className="text-muted-foreground font-medium block mb-1">Notes:</span><p className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">{packet.notes}</p></div>}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">{packet.checklistItems?.filter((i: any) => isItemChecked(i)).length || 0} / {packet.checklistItems?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Items Checked</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ImageIcon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">{photos.length}</div>
                  <div className="text-xs text-muted-foreground">Photos Taken</div>
                </CardContent>
              </Card>
            </div>

            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.filter((p: any) => p.appCaptured === true).length > 0 && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                    ✓ {photos.filter((p: any) => p.appCaptured === true).length} captured in ProofPacket
                  </span>
                )}
                {photos.filter((p: any) => p.sha256Hash).length > 0 && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                    ✓ SHA-256 hashes created
                  </span>
                )}
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  ✓ Original-quality stored
                </span>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  ✓ Included in verified export
                </span>
              </div>
            )}

            {isVehicle && (
              <div className="space-y-3">
                <VehicleDetailsCard packet={packet} />
                <PacketReadinessCard packet={packet} photos={photos} />
                <MileageCard packet={packet} />
              </div>
            )}

            {isVehicle && (
              <Button variant="outline" className="w-full" onClick={() => setActiveTab('export')}>
                <FileText className="w-4 h-4 mr-2" /> Create Dispute Summary
              </Button>
            )}

            <Button variant="destructive" className="w-full mt-4" onClick={async () => {
              if (confirm('Are you sure you want to delete this packet and all its photos? This cannot be undone.')) {
                await storage.deletePacket(packet.id);
                setLocation('/packets');
                toast({title: 'Packet deleted'});
              }
            }}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Packet
            </Button>
          </TabsContent>

          <TabsContent value="checklist" className="mt-0">
            <ChecklistTab packet={packet} photos={photos} />
          </TabsContent>

          <TabsContent value="photos" className="mt-0">
            <PhotosTab packet={packet} photos={photos} />
          </TabsContent>

          <TabsContent value="comm" className="mt-0">
            <CommLogTab packet={packet} />
          </TabsContent>

          <TabsContent value="signatures" className="mt-0">
            <SignaturesTab packet={packet} />
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            <ExportTab packet={packet} settings={settings} photos={photos} />
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <ActivityTab packetId={id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ------------------------------------------------------------------
// INLINE EVIDENCE CARD — rendered per-condition inside checklist items
// ------------------------------------------------------------------
function InlineEvidenceCard({ packetId, checklistItemId, evidence, photos, isIssue, onUpdate, onPhotoAdded, onPhotoDeleted }: {
  packetId: string; checklistItemId: string; evidence: any; photos: any[];
  isIssue: boolean; onUpdate: (c: any) => void; onPhotoAdded: (id: string) => void; onPhotoDeleted: (id: string) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [viewUrl, setViewUrl] = useState('');
  const [viewPhoto, setViewPhoto] = useState<any>(null);
  const [note, setNote] = useState(evidence.note || '');
  useEffect(() => { setNote(evidence.note || ''); }, [evidence.note]);

  const displayLabel = STATUS_LABELS[evidence.status as string] || String(evidence.status || '').replace(/_/g, ' ');
  const needsNote = NOTE_REQUIRED_STATUSES.includes(evidence.status as string);
  const missingPhoto = isIssue && photos.length === 0;
  const missingNote = needsNote && !String(evidence.note || '').trim();

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturing(true);
    try {
      const now = new Date().toISOString();
      const id = await storage.addPhoto({
        packetId, checklistItemId,
        conditionEvidenceId: evidence.id,
        originalBlob: file,
        mimeType: file.type || 'image/jpeg',
        fileName: `ev-${evidence.status}-${Date.now()}.jpg`,
        fileSize: file.size,
        caption: displayLabel,
        category: String(evidence.status),
        phase: 'general' as any,
        dateTaken: now,
        appCaptured: true,
        source: 'in_app_camera' as any,
        verificationEligible: true,
        capturedAt: now,
      });
      onPhotoAdded(id);
    } finally { setCapturing(false); e.target.value = ''; }
  };

  const openPhoto = (photo: any) => { setViewPhoto(photo); setViewUrl(URL.createObjectURL(photo.originalBlob)); };
  const closePhoto = () => { if (viewUrl) URL.revokeObjectURL(viewUrl); setViewPhoto(null); setViewUrl(''); };

  return (
    <div className={`rounded-lg border px-3 py-2.5 space-y-2 ${isIssue ? 'border-destructive/40 bg-destructive/5 dark:bg-destructive/10' : 'border-green-500/30 bg-green-50/50 dark:bg-green-950/10'}`}>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />

      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className={`text-[11px] font-semibold ${isIssue ? 'text-destructive' : 'text-green-700 dark:text-green-400'}`}>
          {displayLabel}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {isIssue && (
            <div className="flex gap-1">
              {(['mild', 'moderate', 'severe'] as const).map(sev => (
                <button key={sev} type="button"
                  className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium transition-colors ${evidence.severity === sev
                    ? sev === 'severe' ? 'bg-destructive text-white border-destructive'
                      : sev === 'moderate' ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-amber-200 text-amber-800 border-amber-200'
                    : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-gray-400'}`}
                  onClick={() => onUpdate({ severity: sev, updatedAt: new Date().toISOString() })}
                >{sev}</button>
              ))}
            </div>
          )}
          {evidence.timestamp && (
            <span className="text-[9px] text-muted-foreground">
              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(evidence.timestamp))}
            </span>
          )}
        </div>
      </div>

      {missingPhoto && (
        <p className="text-[10px] text-destructive bg-destructive/10 rounded px-2 py-1.5 border border-destructive/20 leading-relaxed">
          Photo needed — tap "Take Photo" to document this condition.
        </p>
      )}
      {missingNote && (
        <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded px-2 py-1.5 border border-amber-200 dark:border-amber-800 leading-relaxed">
          {evidence.status === 'odor' ? "Odors aren't visible in photos — a note is especially important here." : 'A note helps describe this condition.'}
        </p>
      )}

      {photos.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {photos.map((photo: any) => (
            <button key={photo.id} className="w-14 h-14 rounded overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0" onClick={() => openPhoto(photo)}>
              <img src={photo.thumbnailData} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}

      <Textarea
        className="text-xs min-h-[40px] resize-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        placeholder={NOTE_HINTS_MAP[String(evidence.status)] || 'Add a note for this condition…'}
        value={note}
        onChange={e => setNote(e.target.value)}
        onBlur={() => { if (note !== (evidence.note || '')) onUpdate({ note, updatedAt: new Date().toISOString() }); }}
        rows={2}
      />

      <Button size="sm" variant={isIssue ? 'destructive' : 'default'} className="w-full h-8 text-xs"
        onClick={() => cameraRef.current?.click()} disabled={capturing}>
        <Camera className="w-3 h-3 mr-1.5" />
        {capturing ? 'Saving…' : photos.length > 0 ? 'Add Another Photo' : 'Take Photo'}
      </Button>

      {viewPhoto && (
        <Dialog open onOpenChange={closePhoto}>
          <DialogContent className="sm:max-w-md w-[95vw] p-3 bg-black border-gray-800">
            <img src={viewUrl} className="w-full rounded max-h-[70dvh] object-contain" alt="" />
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="flex-1 text-white border-white/20 hover:bg-white/10" onClick={closePhoto}>Close</Button>
              <Button size="sm" variant="destructive" onClick={async () => {
                if (!confirm('Delete this photo? This cannot be undone.')) return;
                await storage.deletePhoto(viewPhoto.id);
                onPhotoDeleted(viewPhoto.id);
                closePhoto();
              }}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// CHECKLIST TAB
// ------------------------------------------------------------------
function ChecklistTab({ packet, photos }: { packet: any; photos: any[] }) {
  const items = packet.checklistItems || [];
  const sections = Array.from(new Set(items.map((i: any) => i.section)));

  const [filter, setFilter] = useState("all");
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newItemSection, setNewItemSection] = useState("Additional Items");
  const [newItemLabel, setNewItemLabel] = useState("");

  const [damageOpen, setDamageOpen] = useState(false);
  const [dLoc, setDLoc] = useState('');
  const [dType, setDType] = useState('scratch');
  const [dSeverity, setDSeverity] = useState('minor');
  const [dAtPickup, setDAtPickup] = useState('unknown');
  const [dReported, setDReported] = useState('unknown');
  const [dPerson, setDPerson] = useState('');
  const [dMethod, setDMethod] = useState('in_person');
  const [dDateTime, setDDateTime] = useState('');
  const [dNotes, setDNotes] = useState('');

  const syncEvidence = (item: any, newStatuses: string[]) => {
    const existing: any[] = item.conditionEvidence || [];
    const toEvidence = newStatuses.filter(s => EVIDENCE_STATUS_LIST.includes(s));
    const kept = existing.filter((ev: any) => toEvidence.includes(ev.status));
    const existingSet = new Set(kept.map((ev: any) => ev.status));
    const added = toEvidence.filter(s => !existingSet.has(s)).map(s => ({
      id: crypto.randomUUID(), status: s,
      displayLabel: STATUS_LABELS[s] || s.replace(/_/g, ' '),
      note: '', photoIds: [] as string[], timestamp: '', updatedAt: new Date().toISOString(),
    }));
    return [...kept, ...added];
  };

  const updateItemStatuses = async (item: any, newStatuses: string[]) => {
    const existing: any[] = item.conditionEvidence || [];
    const prevStatuses = getEffectiveStatuses(item);
    const removed = prevStatuses.filter(s => EVIDENCE_STATUS_LIST.includes(s) && !newStatuses.includes(s));
    for (const s of removed) {
      const ev = existing.find((e: any) => e.status === s);
      if (ev && (ev.photoIds || []).length > 0) {
        if (!confirm(`Removing "${STATUS_LABELS[s] || s}" will delete ${ev.photoIds.length} evidence photo(s). Continue?`)) return;
        for (const pid of ev.photoIds) await storage.deletePhoto(pid);
      }
    }
    const newConditionEvidence = syncEvidence(item, newStatuses);
    const primary = getPrimaryStatus(newStatuses) as ChecklistStatus;
    const newItems = items.map((i: any) =>
      i.id === item.id
        ? { ...i, statuses: newStatuses, status: primary, conditionEvidence: newConditionEvidence, updatedAt: new Date().toISOString() }
        : i
    );
    await storage.updatePacket(packet.id, { checklistItems: newItems });
  };

  const updateItemNotes = async (itemId: string, notes: string) => {
    const newItems = items.map((i: any) =>
      i.id === itemId ? { ...i, notes, updatedAt: new Date().toISOString() } : i
    );
    await storage.updatePacket(packet.id, { checklistItems: newItems });
  };

  const updateSingleEvidence = async (itemId: string, evidenceId: string, changes: any) => {
    const newItems = items.map((i: any) => {
      if (i.id !== itemId) return i;
      const evs = (i.conditionEvidence || []).map((ev: any) => ev.id === evidenceId ? { ...ev, ...changes } : ev);
      return { ...i, conditionEvidence: evs, updatedAt: new Date().toISOString() };
    });
    await storage.updatePacket(packet.id, { checklistItems: newItems });
  };

  const addPhotoToEvidence = async (itemId: string, evidenceId: string, photoId: string) => {
    const now = new Date().toISOString();
    const newItems = items.map((i: any) => {
      if (i.id !== itemId) return i;
      const evs = (i.conditionEvidence || []).map((ev: any) =>
        ev.id === evidenceId
          ? { ...ev, photoIds: [...(ev.photoIds || []), photoId], timestamp: ev.timestamp || now }
          : ev
      );
      return { ...i, conditionEvidence: evs, updatedAt: now };
    });
    await storage.updatePacket(packet.id, { checklistItems: newItems });
  };

  const removePhotoFromEvidence = async (itemId: string, evidenceId: string, photoId: string) => {
    const newItems = items.map((i: any) => {
      if (i.id !== itemId) return i;
      const evs = (i.conditionEvidence || []).map((ev: any) =>
        ev.id === evidenceId ? { ...ev, photoIds: (ev.photoIds || []).filter((pid: string) => pid !== photoId) } : ev
      );
      return { ...i, conditionEvidence: evs, updatedAt: new Date().toISOString() };
    });
    await storage.updatePacket(packet.id, { checklistItems: newItems });
  };

  const handleAddItem = async () => {
    if (!newItemLabel) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      packetId: packet.id,
      section: newItemSection,
      label: newItemLabel,
      description: "Added during inspection",
      phase: "both",
      status: "not_checked",
      statuses: ["not_checked"],
      notes: "",
      photoIds: [],
      addedDuringInspection: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await storage.updatePacket(packet.id, { checklistItems: [...items, newItem] });
    setNewItemLabel("");
    setNewItemOpen(false);
  };

  const handleAddDamage = async () => {
    if (!dLoc.trim()) return;
    const statuses: string[] = ['damaged'];
    if (dReported === 'yes') statuses.push('reported');
    else if (dReported === 'no') statuses.push('not_reported');
    const noteParts = [
      `Type: ${dType}`,
      `Severity: ${dSeverity}`,
      `At pickup: ${dAtPickup}`,
      dReported !== 'unknown' ? `Reported: ${dReported}` : null,
      dPerson ? `Notified: ${dPerson}${dMethod ? ' via ' + dMethod.replace('_', ' ') : ''}` : null,
      dDateTime ? `Time: ${dDateTime}` : null,
      dNotes || null,
    ].filter(Boolean).join(' | ');
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      packetId: packet.id,
      section: 'Damage Reports',
      label: dLoc,
      description: `${dType} — ${dSeverity} severity`,
      phase: 'both',
      status: 'damaged',
      statuses,
      notes: noteParts,
      photoIds: [],
      addedDuringInspection: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await storage.updatePacket(packet.id, { checklistItems: [...items, newItem] });
    setDLoc(''); setDType('scratch'); setDSeverity('minor');
    setDAtPickup('unknown'); setDReported('unknown');
    setDPerson(''); setDMethod('in_person'); setDDateTime(''); setDNotes('');
    setDamageOpen(false);
  };

  const filterItem = (item: any) => {
    if (filter === 'not_checked') return !isItemChecked(item);
    if (filter === 'issues') return hasIssueStatus(item);
    return true;
  };

  return (
    <div className="space-y-4 pb-20 relative">
      <Button variant="outline" className="w-full h-11 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => setDamageOpen(true)}>
        <AlertTriangle className="w-4 h-4 mr-2" /> Quick Damage Entry
      </Button>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="rounded-full">All</Button>
        <Button variant={filter === 'not_checked' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('not_checked')} className="rounded-full">Not Checked</Button>
        <Button variant={filter === 'issues' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('issues')} className="rounded-full">Issues</Button>
      </div>

      {sections.map((section: any) => {
        const sectionItems = items.filter((i: any) => i.section === section).filter(filterItem);
        if (sectionItems.length === 0) return null;

        const allInSection = items.filter((i: any) => i.section === section);
        const done = allInSection.filter(isItemChecked).length;
        const total = allInSection.length;

        return (
          <div key={section} className="space-y-3">
            <div className="flex items-center justify-between sticky top-[100px] bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur py-2 z-10 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-sm">{section}</h2>
              <span className="text-xs text-muted-foreground">{done}/{total}</span>
            </div>
            <div className="space-y-3">
              {sectionItems.map((item: any) => {
                const statuses = getEffectiveStatuses(item);
                const hasPos = statuses.some(s => POSITIVE_STATUSES.includes(s));
                const hasIss = hasIssueStatus(item);
                const showMixed = hasPos && hasIss;

                return (
                  <Card key={item.id} className="shadow-xs border-muted overflow-hidden">
                    <div className={`h-1 w-full ${getCardBorderColor(statuses)}`} />
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium leading-tight">{item.label}</h3>
                          {item.description && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.description}</p>}
                        </div>
                        {item.addedDuringInspection && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">ADDED</span>}
                      </div>

                      {/* Multi-select status chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_STATUS_TAGS.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            className={getChipStyle(tag, statuses.includes(tag))}
                            onClick={() => updateItemStatuses(item, toggleStatusTag(statuses, tag))}
                          >
                            {tag === 'needs_follow_up' ? 'needs follow-up'
                              : tag === 'not_safe_to_check' ? 'not safe to check'
                              : tag.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>

                      {/* Active statuses summary */}
                      {statuses.some(s => s !== 'not_checked') && (
                        <div className="text-[11px] text-muted-foreground">
                          <span className="font-medium">Status:</span>{' '}
                          {formatStatuses(statuses)}
                        </div>
                      )}

                      {/* Mixed-status warning */}
                      {showMixed && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded px-2 py-1.5">
                          This item has both positive and issue statuses selected. Add a note to clarify if needed.
                        </div>
                      )}

                      {/* Notes */}
                      <Input
                        placeholder="Add general notes…"
                        className="text-xs h-9 bg-gray-100 dark:bg-gray-900 border-none"
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                      />

                      {/* Per-condition evidence cards */}
                      {(item.conditionEvidence || []).length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Evidence by Condition</p>
                          {(item.conditionEvidence as any[]).map((ev: any) => {
                            const evPhotos = photos.filter((p: any) => p.conditionEvidenceId === ev.id);
                            return (
                              <InlineEvidenceCard
                                key={ev.id}
                                packetId={packet.id}
                                checklistItemId={item.id}
                                evidence={ev}
                                photos={evPhotos}
                                isIssue={ISSUE_STATUSES.includes(ev.status)}
                                onUpdate={(changes: any) => updateSingleEvidence(item.id, ev.id, changes)}
                                onPhotoAdded={(photoId: string) => addPhotoToEvidence(item.id, ev.id, photoId)}
                                onPhotoDeleted={(photoId: string) => removePhotoFromEvidence(item.id, ev.id, photoId)}
                              />
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Damage Report Dialog */}
      <Dialog open={damageOpen} onOpenChange={setDamageOpen}>
        <DialogContent className="sm:max-w-md w-[90vw] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Damage Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Location / description (required)</Label>
              <Input value={dLoc} onChange={e => setDLoc(e.target.value)} placeholder="e.g. Front bumper, passenger corner" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={dType} onValueChange={setDType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['scratch', 'dent', 'chip', 'crack', 'stain', 'tear', 'odor', 'missing piece', 'other'].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={dSeverity} onValueChange={setDSeverity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Present at pickup?</Label>
                <Select value={dAtPickup} onValueChange={setDAtPickup}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reported to company?</Label>
                <Select value={dReported} onValueChange={setDReported}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Not sure</SelectItem>
                    <SelectItem value="not_applicable">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {dReported === 'yes' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Person notified</Label>
                  <Input value={dPerson} onChange={e => setDPerson(e.target.value)} placeholder="Name or title (e.g. Counter agent)" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select value={dMethod} onValueChange={setDMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In person</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="app">App / portal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date / time</Label>
                    <Input value={dDateTime} onChange={e => setDDateTime(e.target.value)} placeholder="e.g. June 1, 10:30am" />
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={dNotes} onChange={e => setDNotes(e.target.value)} placeholder="Additional details about the damage…" rows={2} />
            </div>
            <p className="text-[11px] text-muted-foreground">A checklist item will be added to "Damage Reports". Add photos from the Photos tab.</p>
            <Button className="w-full" onClick={handleAddDamage} disabled={!dLoc.trim()}>Add Damage Report</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-[80px] right-4 h-14 w-14 rounded-full shadow-lg p-0">
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle>Add Custom Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Section</Label>
              <Input value={newItemSection} onChange={e => setNewItemSection(e.target.value)} placeholder="e.g. Additional Items" />
            </div>
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} placeholder="e.g. Custom TV Stand" />
            </div>
            <Button className="w-full" onClick={handleAddItem} disabled={!newItemLabel}>Add to Checklist</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------------------------------------------
// PHOTOS TAB
// ------------------------------------------------------------------
function PhotosTab({ packet, photos }: { packet: any, photos: any[] }) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [viewingPhoto, setViewingPhoto] = useState<any>(null);
  const [viewUrl, setViewUrl] = useState<string>('');
  const [editCaption, setEditCaption] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoUpgradeOpen, setPhotoUpgradeOpen] = useState(false);
  const { toast } = useToast();
  const { limits } = useTier();

  const PHOTO_CATEGORIES = [
    'wide shot', 'close-up', 'existing damage', 'receipt/agreement', 'bill of sale',
    'contract', 'title', 'lease', 'serial number', 'odometer', 'VIN', 'keys/access',
    'interior', 'exterior', 'open/inspect', 'lock/hinge', 'flip/lift/look under',
    'test result', 'appliance interior', 'cabinet/drawer interior', 'general'
  ];

  const evidencePhotos = photos.filter((p: any) => p.source !== 'imported_document');
  const importedDocs = photos.filter((p: any) => p.source === 'imported_document');

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (limits.maxPhotosPerPacket !== Infinity && photos.length >= limits.maxPhotosPerPacket) {
      setPhotoUpgradeOpen(true);
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const now = new Date().toISOString();
      await storage.addPhoto({
        packetId: packet.id,
        originalBlob: file,
        mimeType: file.type || 'image/jpeg',
        fileName: file.name || 'photo.jpg',
        fileSize: file.size,
        caption: '',
        category: 'general',
        phase: 'general',
        dateTaken: now,
        appCaptured: true,
        source: 'in_app_camera',
        verificationEligible: true,
        capturedAt: now,
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDocumentImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const now = new Date().toISOString();
      for (const file of files) {
        await storage.addPhoto({
          packetId: packet.id,
          originalBlob: file,
          mimeType: file.type || 'application/octet-stream',
          fileName: file.name || 'document',
          fileSize: file.size,
          caption: '',
          category: 'receipt/agreement',
          phase: 'general',
          dateTaken: now,
          appCaptured: false,
          source: 'imported_document',
          verificationEligible: false,
          importedAt: now,
        });
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openPhoto = (photo: any) => {
    setViewingPhoto(photo);
    setEditCaption(photo.caption || '');
    setEditCategory(photo.category || 'general');
    const url = URL.createObjectURL(photo.originalBlob);
    setViewUrl(url);
  };

  const closePhoto = () => {
    if (viewUrl) URL.revokeObjectURL(viewUrl);
    setViewingPhoto(null);
    setViewUrl('');
  };

  const savePhotoEdits = async () => {
    if (!viewingPhoto) return;
    await storage.updatePhoto(viewingPhoto.id, { caption: editCaption, category: editCategory });
    toast({ title: 'Photo updated' });
    closePhoto();
  };

  const deletePhoto = async (photo: any) => {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    await storage.deletePhoto(photo.id);
    closePhoto();
  };

  const getSourceChip = (photo: any): { label: string; bg: string } => {
    if (photo.source === 'imported_document') return { label: 'Doc', bg: 'bg-blue-600/80' };
    if (photo.appCaptured === true || photo.source === 'in_app_camera') return { label: 'In-App', bg: 'bg-green-600/80' };
    return { label: 'Legacy', bg: 'bg-gray-500/70' };
  };

  const getSourceLabel = (photo: any): string => {
    if (photo.source === 'in_app_camera' || photo.appCaptured === true) return 'Captured in ProofPacket';
    if (photo.source === 'imported_document') return 'Imported Document';
    if (photo.source === 'legacy_import') return 'Legacy / Imported';
    return 'Unknown source (legacy)';
  };

  const totalMB = photos.reduce((sum: number, p: any) => sum + (p.fileSize || 0), 0) / (1024 * 1024);
  const showStorageWarning = photos.length > 20 || totalMB > 200;
  const atPhotoLimit = limits.maxPhotosPerPacket !== Infinity && photos.length >= limits.maxPhotosPerPacket;

  return (
    <div className="space-y-4 pb-12">
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleCapture} />
      <input type="file" accept="image/*,application/pdf,.pdf,.doc,.docx,.txt" multiple className="hidden" ref={documentInputRef} onChange={handleDocumentImport} />

      {/* Evidence photos section */}
      <div className="space-y-3">
        <div className="text-[11px] bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md px-3 py-2 leading-relaxed text-green-800 dark:text-green-300">
          <span className="font-semibold block mb-0.5">Evidence photos must be taken inside ProofPacket.</span>
          Gallery uploads are disabled for evidence photos. In-app capture helps reduce disputes about photo origin and supports stronger documentation.
        </div>

        {atPhotoLimit ? (
          <button
            className="w-full rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-300 flex items-center justify-between gap-3"
            onClick={() => setPhotoUpgradeOpen(true)}
            data-testid="button-photo-limit-upgrade"
          >
            <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Free plan limit: {limits.maxPhotosPerPacket} photos per packet</span>
            <span className="text-xs font-semibold underline underline-offset-2 shrink-0">Upgrade</span>
          </button>
        ) : (
          <Button className="w-full h-14" onClick={() => cameraInputRef.current?.click()} disabled={uploading} data-testid="button-take-photo">
            <Camera className="w-5 h-5 mr-2" /> {uploading ? 'Saving…' : 'Take Photo'}
          </Button>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Camera access is required for evidence photos. If prompted, allow camera access in your browser or device settings.
        </p>
      </div>

      {limits.maxPhotosPerPacket !== Infinity && !atPhotoLimit && (
        <div className="text-[11px] text-muted-foreground text-right">
          {photos.length} / {limits.maxPhotosPerPacket} photos used
        </div>
      )}

      <UpgradePrompt
        open={photoUpgradeOpen}
        onClose={() => setPhotoUpgradeOpen(false)}
        requiredTier="pro"
        reason={`Free plan is limited to ${limits.maxPhotosPerPacket} photos per packet. Upgrade for unlimited original-quality photos.`}
      />

      {showStorageWarning && (
        <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 leading-relaxed">
          Original-quality photos can take up storage space. Export a backup before clearing browser data or switching devices.
          {totalMB > 0 && <span className="block mt-0.5 font-medium">{totalMB.toFixed(1)} MB used by photos in this packet.</span>}
        </div>
      )}

      {/* Evidence photos grid */}
      {evidencePhotos.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <Camera className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No evidence photos yet.</p>
          <p className="text-xs mt-1 opacity-60">Tap "Take Photo" to capture your first evidence photo.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{evidencePhotos.length} evidence photo{evidencePhotos.length !== 1 ? 's' : ''} — tap to view or edit</p>
          <div className="grid grid-cols-2 gap-2">
            {evidencePhotos.map((photo: any) => {
              const chip = getSourceChip(photo);
              return (
                <button
                  key={photo.id}
                  className="relative aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-left"
                  onClick={() => openPhoto(photo)}
                  data-testid={`photo-thumb-${photo.id}`}
                >
                  <img src={photo.thumbnailData} className="object-cover w-full h-full" alt={photo.caption || 'Photo'} />
                  <div className={`absolute top-1 left-1 ${chip.bg} text-white text-[9px] font-bold px-1.5 py-0.5 rounded`}>{chip.label}</div>
                  {photo.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1">
                      <p className="text-white text-[10px] truncate">{photo.caption}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Documents & Receipts section */}
      <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
        <div>
          <h3 className="text-sm font-semibold">Documents & Receipts</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            Rental agreements, return receipts, fuel receipts, weight tickets, screenshots, repair estimates, and other documents may be imported here. Imported files are labeled separately from in-app captured evidence photos.
          </p>
        </div>
        <Button variant="outline" className="w-full h-12" onClick={() => documentInputRef.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" /> Import Document or Receipt
        </Button>
        {importedDocs.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground">{importedDocs.length} document{importedDocs.length !== 1 ? 's' : ''} imported</p>
            <div className="grid grid-cols-2 gap-2">
              {importedDocs.map((photo: any) => (
                <button
                  key={photo.id}
                  className="relative aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 border border-blue-200 dark:border-blue-800 text-left"
                  onClick={() => openPhoto(photo)}
                >
                  <img src={photo.thumbnailData} className="object-cover w-full h-full" alt={photo.caption || 'Document'} />
                  <div className="absolute top-1 left-1 bg-blue-600/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Doc</div>
                  {photo.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1">
                      <p className="text-white text-[10px] truncate">{photo.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Full-size photo / document viewer */}
      <Dialog open={!!viewingPhoto} onOpenChange={(open) => { if (!open) closePhoto(); }}>
        <DialogContent className="sm:max-w-lg w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle className="text-sm">
              {viewingPhoto?.source === 'imported_document' ? 'Imported Document' : 'Evidence Photo'}
            </DialogTitle>
          </DialogHeader>
          {viewingPhoto && (
            <div className="flex flex-col gap-3 p-4">
              {viewUrl && (
                <div className="rounded-lg overflow-hidden bg-black max-h-64 flex items-center justify-center">
                  <img src={viewUrl} alt="Full size" className="max-h-64 w-full object-contain" />
                </div>
              )}
              {/* Source label */}
              <div className={`text-[11px] px-2 py-1.5 rounded border font-medium flex items-center justify-between gap-2 ${
                viewingPhoto.source === 'in_app_camera' || viewingPhoto.appCaptured === true
                  ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                  : viewingPhoto.source === 'imported_document'
                  ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                  : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}>
                <span>{getSourceLabel(viewingPhoto)}</span>
                {viewingPhoto.sha256Hash && (
                  <span className="font-mono font-normal opacity-60 text-[10px] shrink-0">
                    SHA-256: {viewingPhoto.sha256Hash.slice(0, 10)}…
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {viewingPhoto.fileName || 'file'} · {viewingPhoto.fileSize ? (viewingPhoto.fileSize / 1024).toFixed(0) + ' KB' : ''}
                {viewingPhoto.capturedAt && ` · Captured ${new Date(viewingPhoto.capturedAt).toLocaleDateString()}`}
                {viewingPhoto.importedAt && ` · Imported ${new Date(viewingPhoto.importedAt).toLocaleDateString()}`}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Caption</Label>
                <Input value={editCaption} onChange={e => setEditCaption(e.target.value)} placeholder="Add a caption..." className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PHOTO_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="destructive" size="sm" className="flex-1" onClick={() => deletePhoto(viewingPhoto)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
                <Button size="sm" className="flex-1" onClick={savePhotoEdits}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------------------------------------------
// COMM LOG TAB
// ------------------------------------------------------------------
function CommLogTab({ packet }: { packet: any }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("email");
  const [person, setPerson] = useState("");
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [followUp, setFollowUp] = useState(false);

  const logs: CommunicationLog[] = packet.communicationLogs || [];

  const handleAdd = async () => {
    if (!person || !summary) return;
    
    const newLog: CommunicationLog = {
      id: crypto.randomUUID(),
      packetId: packet.id,
      date: new Date().toISOString(),
      personContacted: person,
      method: method as any,
      subject,
      summary,
      followUpNeeded: followUp,
      photoIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storage.updatePacket(packet.id, { communicationLogs: [newLog, ...logs] });
    setOpen(false);
    setPerson(""); setSubject(""); setSummary(""); setFollowUp(false);
  };

  return (
    <div className="space-y-4 pb-12">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14"><MessageSquare className="w-5 h-5 mr-2" /> Log Communication</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="text">Text / SMS</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="app_message">App Message / Portal</SelectItem>
                  <SelectItem value="front_desk">Front Desk</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Person Contacted</Label>
              <Input value={person} onChange={e => setPerson(e.target.value)} placeholder="Name or Title" />
            </div>
            <div className="space-y-2">
              <Label>Subject (Optional)</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Broken AC" />
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="What was said?" rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={followUp} onCheckedChange={setFollowUp} id="followup" />
              <Label htmlFor="followup">Follow-up needed</Label>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!person || !summary}>Save Log</Button>
          </div>
        </DialogContent>
      </Dialog>

      {logs.length === 0 ? (
         <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No communications logged.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <Card key={log.id} className="shadow-xs border-muted">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
                      {log.method.replace('_', ' ')}
                    </span>
                    <h3 className="font-semibold text-sm mt-1">{log.personContacted}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(log.date), 'MMM d, h:mm a')}</span>
                </div>
                {log.subject && <div className="text-xs font-medium">{log.subject}</div>}
                <p className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded">{log.summary}</p>
                {log.followUpNeeded && <div className="text-[10px] font-bold text-destructive flex items-center"><div className="w-1.5 h-1.5 bg-destructive rounded-full mr-1"/> Follow-up Needed</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// SIGNATURES TAB
// ------------------------------------------------------------------
function SignaturesTab({ packet }: { packet: any }) {
  const [open, setOpen] = useState(false);
  const [sigUpgradeOpen, setSigUpgradeOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Signer");
  const padRef = useRef<SignaturePad | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { limits } = useTier();

  useEffect(() => {
    if (open && canvasRef.current) {
      padRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        penColor: 'rgb(0, 0, 0)'
      });
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
      canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
      canvasRef.current.getContext("2d")?.scale(ratio, ratio);
      padRef.current.clear();
    }
  }, [open]);

  const handleSave = async () => {
    if (!padRef.current || padRef.current.isEmpty() || !name.trim()) return;
    
    const dataUrl = padRef.current.toDataURL("image/png");
    const newSig: SignatureItem = {
      id: crypto.randomUUID(),
      packetId: packet.id,
      signerName: name,
      signerRole: role,
      signatureData: dataUrl,
      signedAt: new Date().toISOString()
    };

    const newSignatures = [...(packet.signatures || []), newSig];
    await storage.updatePacket(packet.id, { signatures: newSignatures });
    setOpen(false);
    setName("");
  };

  return (
    <div className="space-y-4 pb-12">
      <UpgradePrompt
        open={sigUpgradeOpen}
        onClose={() => setSigUpgradeOpen(false)}
        requiredTier="pro"
        reason="Acknowledgment signatures require ProofPacket Pro."
      />

      {!limits.hasSignatures ? (
        <button
          className="w-full h-14 rounded-md border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400 text-sm font-medium"
          onClick={() => setSigUpgradeOpen(true)}
          data-testid="button-add-signature-locked"
        >
          <Lock className="w-4 h-4" /> Add Signature
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 uppercase ml-1">Pro</span>
        </button>
      ) : (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14"><PenTool className="w-5 h-5 mr-2" /> Add Signature</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle>Add Signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Signer Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Tenant, Inspector" />
            </div>
            <div className="space-y-2">
              <Label>Signature</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md bg-white">
                <canvas ref={canvasRef} className="w-full h-40 touch-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => padRef.current?.clear()}>Clear</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!name}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {(!packet.signatures || packet.signatures.length === 0) ? (
        <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <PenTool className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No signatures collected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(packet.signatures || []).map((sig: SignatureItem) => (
            <Card key={sig.id} className="overflow-hidden shadow-xs">
              <CardContent className="p-0">
                <div className="bg-white border-b border-gray-100">
                  <img src={sig.signatureData} className="w-full h-24 object-contain" alt="Signature" />
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900">
                  <h4 className="font-semibold text-sm">{sig.signerName}</h4>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{sig.signerRole}</span>
                    <span>{format(new Date(sig.signedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <p className="text-[10px] text-center text-muted-foreground pt-4">
        Acknowledgment Signature — This is a documentation record, not a legally binding signature. Consult an attorney for legal requirements.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------
// EXPORT TAB
// ------------------------------------------------------------------
function ExportTab({ packet, settings, photos }: { packet: any, settings: any, photos: any[] }) {
  const { limits } = useTier();
  const { toast } = useToast();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'business'>('pro');
  const [opts, setOpts] = useState({
    includeCover: true, includeSummary: true, includeChecklist: true,
    includePhotos: true, includeCommLog: true, includeSignatures: true, includeDisclaimer: true
  });
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [showPdfOpts, setShowPdfOpts] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [travelOpen, setTravelOpen] = useState(false);
  const [travelText, setTravelText] = useState('');
  const cryptoOk = isCryptoAvailable();

  const showUpgrade = (reason: string, required: 'pro' | 'business') => {
    setUpgradeReason(reason);
    setUpgradeTier(required);
    setUpgradeOpen(true);
  };

  const withBusy = async (key: string, fn: () => Promise<void>) => {
    setBusyAction(key);
    try { await fn(); } catch (e: any) {
      toast({ title: "Export failed", description: e.message || "An error occurred.", variant: "destructive" });
    } finally { setBusyAction(null); }
  };

  const handlePDF = () => withBusy('pdf', async () => {
    await generatePDF(packet, settings, opts);
    await storage.updatePacket(packet.id, { exportCount: (packet.exportCount || 0) + 1 });
    await storage.logActivity({ packetId: packet.id, activityType: 'export_pdf', description: 'PDF report exported', timestamp: new Date().toISOString() });
    toast({ title: "PDF exported", description: "Check your downloads folder." });
  });

  const handleVerifiedExport = () => {
    if (!limits.hasVerifiedExport) { showUpgrade('Export Verified Packet requires ProofPacket Pro.', 'pro'); return; }
    if (!cryptoOk) { toast({ title: "Crypto unavailable", description: "Web Crypto API not available in this browser.", variant: "destructive" }); return; }
    withBusy('verified', async () => {
      const exportedBy = settings.userName || settings.userEmail || 'ProofPacket User';
      await exportVerifiedPacket(packet, photos, exportedBy);
      await storage.logActivity({ packetId: packet.id, activityType: 'export_verified', description: 'Verified Packet exported (manifest + summary)', timestamp: new Date().toISOString() });
      toast({ title: "Verified Packet exported", description: "Manifest JSON and summary downloaded." });
    });
  };

  const handleFullArchive = () => {
    if (!limits.hasArchiveExport) { showUpgrade('Export Full Archive requires ProofPacket Pro.', 'pro'); return; }
    if (!cryptoOk) { toast({ title: "Crypto unavailable", description: "Web Crypto API not available in this browser.", variant: "destructive" }); return; }
    withBusy('archive', async () => {
      const confirmed = window.confirm(
        `This will create a ZIP archive of "${packet.title}" with all photos, manifest, and metadata.\n\nSave the file somewhere safe — ProofPacket cannot recover deleted local data without an archive.\n\nProceed?`
      );
      if (!confirmed) return;
      const exportedBy = settings.userName || settings.userEmail || 'ProofPacket User';
      await exportFullArchive(packet, photos, exportedBy);
      await storage.logActivity({ packetId: packet.id, activityType: 'export_archive', description: 'Full Packet Archive exported (ZIP)', timestamp: new Date().toISOString() });
      toast({ title: "Archive exported", description: "Full packet archive ZIP downloaded." });
    });
  };

  const handlePhotosZip = () => {
    if (!limits.hasZipExport) { showUpgrade('Photos ZIP export requires Business Pro.', 'business'); return; }
    if (!cryptoOk) { toast({ title: "Crypto unavailable", description: "Web Crypto API not available.", variant: "destructive" }); return; }
    withBusy('photos', async () => {
      await exportPhotosZip(packet, photos);
      await storage.logActivity({ packetId: packet.id, activityType: 'export_photos_zip', description: `Photos ZIP exported (${photos.length} photos)`, timestamp: new Date().toISOString() });
      toast({ title: "Photos ZIP exported", description: "Original-quality photos downloaded." });
    });
  };

  const handleDisputeSummary = () => {
    const text = buildDisputeText(packet);
    setDisputeText(text);
    setDisputeOpen(true);
    storage.logActivity({ packetId: packet.id, activityType: 'dispute_summary_generated', description: 'Dispute summary generated', timestamp: new Date().toISOString() });
  };

  const handleTravelSummary = () => {
    const text = buildTravelSummaryText(packet);
    setTravelText(text);
    setTravelOpen(true);
    storage.logActivity({ packetId: packet.id, activityType: 'travel_summary_generated', description: 'Travel documentation summary generated', timestamp: new Date().toISOString() });
  };

  const busy = (key: string) => busyAction === key;
  const d = packet.details || {};
  const hasTravelContext = d.travelContext && !['Personal', ''].includes(d.travelContext);

  return (
    <div className="space-y-5 pb-12">

      {/* Dispute / Travel Summary */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Create Text Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate a plain-text factual summary you can copy into dispute forms, insurance portals, emails, or supporting documentation.
          </p>
          <Button variant="outline" className="w-full" onClick={handleDisputeSummary}>
            <FileText className="w-4 h-4 mr-2" /> Create Dispute Summary
          </Button>
          {hasTravelContext && (
            <Button variant="outline" className="w-full" onClick={handleTravelSummary}>
              <FileText className="w-4 h-4 mr-2" /> Create Travel Documentation Summary
            </Button>
          )}
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            ProofPacket does not provide legal advice. Consult your rental agreement, insurance policy, platform terms, or an attorney for your situation.
          </p>
        </CardContent>
      </Card>

      {/* PDF options (collapsible) */}
      <div>
        <button
          className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground py-2 px-1 border-b border-muted"
          onClick={() => setShowPdfOpts(p => !p)}
        >
          <span className="font-medium">PDF Options</span>
          <span className="text-xs font-mono opacity-50">{showPdfOpts ? '▲ hide' : '▼ show'}</span>
        </button>
        {showPdfOpts && (
          <Card className="mt-2">
            <CardContent className="space-y-3 pt-4">
              {Object.entries(opts).map(([key, val]) => (
                <div key={key} className="flex items-center space-x-3">
                  <Checkbox id={key} checked={val} onCheckedChange={(c) => setOpts(prev => ({...prev, [key]: !!c}))} className="w-5 h-5" />
                  <Label htmlFor={key} className="text-sm font-medium leading-none cursor-pointer">
                    {key.replace('include', '').replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Export actions */}
      <div className="space-y-3">
        {/* Export PDF */}
        <Button size="lg" className="w-full h-14 text-base" onClick={handlePDF} disabled={!!busyAction}>
          <Download className="w-5 h-5 mr-2" />
          {busy('pdf') ? "Generating…" : "Export PDF Report"}
        </Button>

        {/* Export Verified Packet */}
        <div className="space-y-1">
          {limits.hasVerifiedExport ? (
            <Button variant="outline" size="lg" className="w-full h-14 text-base border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" onClick={handleVerifiedExport} disabled={!!busyAction}>
              <Download className="w-5 h-5 mr-2 text-indigo-600" />
              {busy('verified') ? "Hashing photos…" : "Export Verified Packet"}
            </Button>
          ) : (
            <Button variant="outline" size="lg" className="w-full h-14 text-base" onClick={handleVerifiedExport}>
              <Lock className="w-5 h-5 mr-2" />
              Export Verified Packet
              <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded uppercase">Pro</span>
            </Button>
          )}
          <p className="text-[11px] text-muted-foreground px-1">
            Downloads manifest JSON + summary. Lets receivers verify photo integrity locally.
          </p>
        </div>

        {/* Export Full Archive */}
        <div className="space-y-1">
          {limits.hasArchiveExport ? (
            <Button variant="outline" size="lg" className="w-full h-14 text-base border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={handleFullArchive} disabled={!!busyAction}>
              <Download className="w-5 h-5 mr-2 text-green-700" />
              {busy('archive') ? "Building archive…" : "Export Full Packet Archive"}
            </Button>
          ) : (
            <Button variant="outline" size="lg" className="w-full h-14 text-base" onClick={handleFullArchive}>
              <Lock className="w-5 h-5 mr-2" />
              Export Full Packet Archive
              <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded uppercase">Pro</span>
            </Button>
          )}
          <p className="text-[11px] text-muted-foreground px-1">
            ZIP with original-quality photos, manifest, PDF, metadata. Save to computer, email, or cloud drive. Re-import later.
          </p>
        </div>

        {/* Export Photos ZIP */}
        <div className="space-y-1">
          {limits.hasZipExport ? (
            <Button variant="outline" size="lg" className="w-full h-14 text-base" onClick={handlePhotosZip} disabled={!!busyAction}>
              <Download className="w-5 h-5 mr-2" />
              {busy('photos') ? "Zipping photos…" : `Export Photos ZIP (${photos.length})`}
            </Button>
          ) : (
            <Button variant="outline" size="lg" className="w-full h-14 text-base" onClick={handlePhotosZip}>
              <Lock className="w-5 h-5 mr-2" />
              Export Photos ZIP
              <span className="ml-auto text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-1.5 py-0.5 rounded uppercase">Business</span>
            </Button>
          )}
          <p className="text-[11px] text-muted-foreground px-1">
            Original-quality photos with SHA-256 hashes. Includes photo-metadata.json.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong>Disclaimer:</strong> Verified Packet export helps receivers check whether files match the exported manifest. It does not create legal certification or replace professional advice. Company names are provided only to help organize your packet. ProofPacket is not affiliated with or endorsed by any rental company, car-sharing platform, hotel, property manager, insurer, government agency, military branch, or other listed entity.
          </p>
        </CardContent>
      </Card>

      <UpgradePrompt open={upgradeOpen} onClose={() => setUpgradeOpen(false)} requiredTier={upgradeTier} reason={upgradeReason} />

      {/* Dispute Summary Dialog */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent className="sm:max-w-lg w-[90vw]">
          <DialogHeader>
            <DialogTitle>Dispute Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Copy this text and paste it into a dispute form, email, rental company portal, car-sharing dispute flow, or insurance claim.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 max-h-64 overflow-y-auto border">
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">{disputeText}</pre>
            </div>
            <Button className="w-full" onClick={() => {
              navigator.clipboard.writeText(disputeText).then(() => toast({ title: 'Copied to clipboard' }));
            }}>
              <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Travel Summary Dialog */}
      <Dialog open={travelOpen} onOpenChange={setTravelOpen}>
        <DialogContent className="sm:max-w-lg w-[90vw]">
          <DialogHeader>
            <DialogTitle>Travel Documentation Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Copy this text for supporting documentation. This does not replace DTS, finance office guidance, or official travel instructions.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 max-h-64 overflow-y-auto border">
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">{travelText}</pre>
            </div>
            <Button className="w-full" onClick={() => {
              navigator.clipboard.writeText(travelText).then(() => toast({ title: 'Copied to clipboard' }));
            }}>
              <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------------------------------------------
// VEHICLE DETAILS CARD
// ------------------------------------------------------------------
function VehicleDetailsCard({ packet }: { packet: any }) {
  const d = packet.details || {};
  const vehicleParts = [d.vehicleYear, d.vehicleMake, d.vehicleModel].filter(Boolean);

  const rows: Array<[string, string]> = [];
  if (vehicleParts.length > 0) rows.push(['Vehicle', vehicleParts.join(' ')]);
  if (d.vehicleType) rows.push(['Type', d.vehicleType]);
  if (d.licensePlate) rows.push(['License Plate', d.licensePlate]);
  if (d.unitNumber) rows.push(['Unit #', d.unitNumber]);
  if (d.vin) rows.push(['VIN', d.vin]);
  if (d.rentalCompany) rows.push(['Company', d.rentalCompany]);
  if (d.rentalAgreementNumber) rows.push(['Agreement #', d.rentalAgreementNumber]);
  if (d.fuelLevelPickup) rows.push(['Fuel at pickup', d.fuelLevelPickup]);
  if (d.fuelLevelReturn) rows.push(['Fuel at return', d.fuelLevelReturn]);
  if (d.evBatteryPickup) rows.push(['Battery at pickup', d.evBatteryPickup]);
  if (d.evBatteryReturn) rows.push(['Battery at return', d.evBatteryReturn]);
  if (d.returnLocation) rows.push(['Return location', d.returnLocation]);
  if (d.fuelStation) rows.push(['Fuel / charge station', d.fuelStation]);
  if (d.fuelAmountPaid) rows.push(['Fuel amount paid', d.fuelAmountPaid]);
  if (d.accessories) rows.push(['Accessories', d.accessories]);
  if (d.travelContext && !['Personal', ''].includes(d.travelContext)) rows.push(['Travel context', d.travelContext]);
  if (d.travelOrderNumber) rows.push(['Order / Auth #', d.travelOrderNumber]);
  if (d.dtsVoucherNumber) rows.push(['DTS / Voucher #', d.dtsVoucherNumber]);
  if (d.dutyStation) rows.push(['Duty station', d.dutyStation]);
  if (d.driverName) rows.push(['Driver', d.driverName]);
  if (d.driverId) rows.push(['Employee ID', d.driverId]);
  if (d.supervisorName) rows.push(['Supervisor', d.supervisorName]);
  if (d.department) rows.push(['Department', d.department]);
  if (d.keysIssued) rows.push(['Keys issued', d.keysIssued]);
  if (d.fuelCardIssued) rows.push(['Fuel card issued', d.fuelCardIssued]);
  if (d.transponderIssued) rows.push(['Transponder issued', d.transponderIssued]);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Vehicle Details</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <span className="text-muted-foreground shrink-0 text-xs">{label}</span>
            <span className="text-right text-xs">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// PACKET READINESS CARD
// ------------------------------------------------------------------
function PacketReadinessCard({ packet, photos }: { packet: any; photos: any[] }) {
  const items = packet.checklistItems || [];
  const d = packet.details || {};

  const requiredItems = items.filter((i: any) =>
    i.section?.toLowerCase().includes('required') ||
    i.section?.toLowerCase().includes('before you leave') ||
    i.section?.toLowerCase().includes('return documentation')
  );
  const requiredChecked = requiredItems.filter((i: any) => isItemChecked(i));
  const requiredScore = requiredItems.length > 0
    ? Math.round((requiredChecked.length / requiredItems.length) * 50)
    : 0;

  const odometerScore = d.startingOdometer ? 10 : 0;
  const fuelScore = (d.fuelLevelPickup || d.evBatteryPickup) ? 10 : 0;
  const photoScore = photos.length >= 10 ? 15 : photos.length >= 5 ? 10 : photos.length >= 1 ? 5 : 0;
  const damageItems = items.filter((i: any) => hasIssueStatus(i));
  const reportedItems = damageItems.filter((i: any) => getEffectiveStatuses(i).some((s: string) => s === 'reported'));
  const damageScore = damageItems.length === 0 ? 15
    : reportedItems.length >= damageItems.length ? 15
    : reportedItems.length > 0 ? 8 : 0;

  const total = requiredScore + odometerScore + fuelScore + photoScore + damageScore;
  const label = total >= 85 ? 'Strong' : total >= 65 ? 'Good' : total >= 40 ? 'Partial' : 'Weak';
  const labelColor = total >= 85 ? 'text-green-600 dark:text-green-400'
    : total >= 65 ? 'text-amber-600 dark:text-amber-400'
    : 'text-destructive';
  const barColor = total >= 85 ? 'bg-green-500' : total >= 65 ? 'bg-amber-500' : 'bg-destructive';
  const missing = requiredItems.filter((i: any) => !isItemChecked(i));

  if (requiredItems.length === 0 && photos.length === 0 && !d.startingOdometer) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Packet Readiness
          <span className={`text-base font-bold ${labelColor}`}>{label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${total}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
          <div className={`flex items-center gap-1.5 ${requiredScore >= 35 ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${requiredScore >= 35 ? 'bg-green-500' : 'bg-gray-400'}`} />
            Checklist ({requiredChecked.length}/{requiredItems.length})
          </div>
          <div className={`flex items-center gap-1.5 ${odometerScore > 0 ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${odometerScore > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
            Odometer recorded
          </div>
          <div className={`flex items-center gap-1.5 ${fuelScore > 0 ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${fuelScore > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
            Fuel / battery recorded
          </div>
          <div className={`flex items-center gap-1.5 ${photoScore >= 10 ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${photoScore >= 10 ? 'bg-green-500' : 'bg-gray-400'}`} />
            Photos ({photos.length} taken)
          </div>
        </div>
        {missing.length > 0 && (
          <p className="text-[10px] text-muted-foreground">
            <span className="font-medium">Not yet checked:</span>{' '}
            {missing.slice(0, 3).map((i: any) => i.label).join(', ')}
            {missing.length > 3 ? ` +${missing.length - 3} more` : ''}
          </p>
        )}
        {total < 85 && (
          <p className={`text-[10px] rounded px-2 py-1.5 leading-relaxed ${
            label === 'Weak'
              ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
              : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
          }`}>
            {label === 'Weak'
              ? 'Key documentation is missing. Add required photos, odometer, and fuel records.'
              : label === 'Partial'
              ? 'Partial documentation — complete the checklist and add odometer and fuel photos.'
              : 'Almost complete — a few more items would make this packet stronger.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// MILEAGE CARD
// ------------------------------------------------------------------
function MileageCard({ packet }: { packet: any }) {
  const d = packet.details || {};
  if (!d.startingOdometer && !d.endingOdometer) return null;

  const parse = (s: string) => parseInt(s.replace(/[^0-9]/g, ''));
  const start = d.startingOdometer ? parse(d.startingOdometer) : NaN;
  const end = d.endingOdometer ? parse(d.endingOdometer) : NaN;
  const driven = !isNaN(start) && !isNaN(end) ? end - start : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Odometer / Mileage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 text-sm">
        {d.startingOdometer && (
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">At pickup / checkout</span>
            <span className="text-xs">{d.startingOdometer}</span>
          </div>
        )}
        {d.endingOdometer && (
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">At return / check-in</span>
            <span className="text-xs">{d.endingOdometer}</span>
          </div>
        )}
        {driven !== null && driven >= 0 && (
          <div className="flex justify-between font-semibold border-t pt-1.5 mt-1">
            <span className="text-xs">Miles driven</span>
            <span className="text-xs">{driven.toLocaleString()} mi</span>
          </div>
        )}
        {driven !== null && driven < 0 && (
          <p className="text-[11px] text-amber-600">Ending odometer is less than starting — check entries.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// ACTIVITY TAB
// ------------------------------------------------------------------
function ActivityTab({ packetId }: { packetId: string }) {
  const entries = useDexieQuery(() => storage.getActivityLog(packetId), [packetId]) || [];

  const ICONS: Record<string, string> = {
    packet_created: '📄',
    packet_edited: '✏️',
    photo_added: '📷',
    photo_deleted: '🗑',
    export_pdf: '📑',
    export_verified: '✅',
    export_archive: '📦',
    export_photos_zip: '🖼',
    verification_run: '🔍',
    dispute_summary_generated: '📝',
    travel_summary_generated: '✈️',
    comm_log_added: '💬',
    signature_added: '✍️',
    archive_imported: '📥',
  };

  if (entries.length === 0) {
    return (
      <div className="space-y-4 pb-12">
        <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No activity recorded yet.</p>
          <p className="text-xs mt-1 opacity-60">Exports, summaries, and other actions are recorded here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-12">
      <p className="text-[11px] text-muted-foreground">Activity is recorded locally on this device only.</p>
      {entries.map((entry) => (
        <Card key={entry.id} className="shadow-xs border-muted">
          <CardContent className="p-3 flex items-start gap-3">
            <span className="text-base shrink-0 mt-0.5">{ICONS[entry.activityType] || '•'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-snug">{entry.description}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------
// TEXT SUMMARY BUILDERS
// ------------------------------------------------------------------
function buildDisputeText(packet: any): string {
  const d = packet.details || {};
  const lines: string[] = [
    'PROOFPACKET DISPUTE SUMMARY',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    `Packet: ${packet.title}`,
  ];
  if (packet.companyOrPerson) lines.push(`Company / Platform: ${packet.companyOrPerson}`);
  if (packet.referenceNumber) lines.push(`Reservation / Reference #: ${packet.referenceNumber}`);
  if (d.rentalAgreementNumber) lines.push(`Agreement #: ${d.rentalAgreementNumber}`);
  if (packet.startDate) lines.push(`Start Date: ${packet.startDate}`);
  if (packet.endDate) lines.push(`End Date: ${packet.endDate}`);
  if (packet.location) lines.push(`Pickup Location: ${packet.location}`);
  if (d.returnLocation) lines.push(`Return Location: ${d.returnLocation}`);

  const vehicleParts = [d.vehicleYear, d.vehicleMake, d.vehicleModel].filter(Boolean);
  if (vehicleParts.length > 0 || d.licensePlate || d.unitNumber) {
    lines.push('');
    lines.push('VEHICLE');
    if (vehicleParts.length > 0) lines.push(`  ${vehicleParts.join(' ')}`);
    if (d.vehicleType) lines.push(`  Type: ${d.vehicleType}`);
    if (d.licensePlate) lines.push(`  License Plate: ${d.licensePlate}`);
    if (d.unitNumber) lines.push(`  Unit #: ${d.unitNumber}`);
    if (d.vin) lines.push(`  VIN: ${d.vin}`);
  }

  if (d.startingOdometer || d.endingOdometer) {
    lines.push('');
    lines.push('ODOMETER / MILEAGE');
    if (d.startingOdometer) lines.push(`  At pickup: ${d.startingOdometer}`);
    if (d.endingOdometer) lines.push(`  At return: ${d.endingOdometer}`);
    const s = d.startingOdometer ? parseInt(d.startingOdometer.replace(/[^0-9]/g, '')) : NaN;
    const e = d.endingOdometer ? parseInt(d.endingOdometer.replace(/[^0-9]/g, '')) : NaN;
    if (!isNaN(s) && !isNaN(e) && e >= s) lines.push(`  Miles driven: ${(e - s).toLocaleString()}`);
  }

  if (d.fuelLevelPickup || d.fuelLevelReturn || d.evBatteryPickup || d.evBatteryReturn) {
    lines.push('');
    lines.push('FUEL / BATTERY');
    if (d.fuelLevelPickup) lines.push(`  Fuel at pickup: ${d.fuelLevelPickup}`);
    if (d.fuelLevelReturn) lines.push(`  Fuel at return: ${d.fuelLevelReturn}`);
    if (d.evBatteryPickup) lines.push(`  EV battery at pickup: ${d.evBatteryPickup}`);
    if (d.evBatteryReturn) lines.push(`  EV battery at return: ${d.evBatteryReturn}`);
    if (d.fuelStation) lines.push(`  Fuel / charge station: ${d.fuelStation}`);
    if (d.fuelAmountPaid) lines.push(`  Amount paid: ${d.fuelAmountPaid}`);
  }

  const issues = (packet.checklistItems || []).filter((i: any) =>
    getEffectiveStatuses(i).some((s: string) => ISSUE_STATUSES.includes(s))
  );
  if (issues.length > 0) {
    lines.push('');
    lines.push('DOCUMENTED ISSUES');
    issues.forEach((i: any) => {
      const ss = getEffectiveStatuses(i);
      const issueStatuses = ss.filter((s: string) => ISSUE_STATUSES.includes(s));
      const displayStatuses = issueStatuses.length > 0 ? formatStatuses(issueStatuses) : formatStatuses(ss);
      lines.push(`  • ${i.label} — ${displayStatuses}${i.notes ? ': ' + i.notes : ''}`);
    });
  }

  const commLogs = packet.communicationLogs || [];
  if (commLogs.length > 0) {
    lines.push('');
    lines.push('COMMUNICATION LOG');
    commLogs.slice(0, 5).forEach((c: any) => {
      lines.push(`  • ${new Date(c.date).toLocaleDateString()} — ${c.method.replace('_', ' ')}: ${c.personContacted}${c.subject ? ' — ' + c.subject : ''}`);
      if (c.summary) lines.push(`    ${c.summary}`);
    });
    if (commLogs.length > 5) lines.push(`  ... and ${commLogs.length - 5} more entries`);
  }

  lines.push('');
  lines.push('STATEMENT');
  lines.push('I am disputing this charge/issue. My ProofPacket documents the condition at pickup and return. It includes odometer/fuel or battery records, exterior/interior photos, documented damage, communication logs, receipts where available, and a verification manifest with SHA-256 hashes for the original photo files.');
  lines.push('');
  lines.push('DISCLAIMER');
  lines.push('This summary was generated by ProofPacket. ProofPacket is not a legal service and does not provide legal advice. Consult your rental agreement, insurance policy, platform terms, or an attorney regarding your specific situation.');

  return lines.join('\n');
}

function buildTravelSummaryText(packet: any): string {
  const d = packet.details || {};
  const ctx = d.travelContext || 'official travel';
  const lines: string[] = [
    'PROOFPACKET TRAVEL DOCUMENTATION SUMMARY',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    `Packet: ${packet.title}`,
    `Travel context: ${ctx}`,
  ];
  if (packet.companyOrPerson) lines.push(`Company / Organization: ${packet.companyOrPerson}`);
  if (d.travelOrderNumber) lines.push(`Travel order / authorization #: ${d.travelOrderNumber}`);
  if (d.dtsVoucherNumber) lines.push(`DTS / voucher reference: ${d.dtsVoucherNumber}`);
  if (d.dutyStation) lines.push(`Duty station / destination: ${d.dutyStation}`);
  if (d.officialTravelNotes) lines.push(`Official travel notes: ${d.officialTravelNotes}`);
  if (packet.startDate) lines.push(`Start date: ${packet.startDate}`);
  if (packet.endDate) lines.push(`End date: ${packet.endDate}`);
  if (packet.location) lines.push(`Pickup / start location: ${packet.location}`);
  if (d.returnLocation) lines.push(`Return / end location: ${d.returnLocation}`);
  if (d.isPCS && d.isPCS !== 'No') lines.push(`PCS move: ${d.isPCS}`);
  if (d.isPersonallyProcuredMove && d.isPersonallyProcuredMove !== 'No') lines.push(`Personally procured move (PPM): ${d.isPersonallyProcuredMove}`);
  if (d.moveOrigin) lines.push(`Origin: ${d.moveOrigin}`);
  if (d.moveDestination) lines.push(`Destination: ${d.moveDestination}`);

  const vehicleParts = [d.vehicleYear, d.vehicleMake, d.vehicleModel].filter(Boolean);
  if (vehicleParts.length > 0 || d.licensePlate || d.unitNumber) {
    lines.push('');
    lines.push('VEHICLE');
    if (vehicleParts.length > 0) lines.push(`  ${vehicleParts.join(' ')}`);
    if (d.licensePlate) lines.push(`  License Plate: ${d.licensePlate}`);
    if (d.unitNumber) lines.push(`  Unit #: ${d.unitNumber}`);
  }

  if (d.startingOdometer || d.endingOdometer) {
    lines.push('');
    lines.push('ODOMETER');
    if (d.startingOdometer) lines.push(`  At pickup: ${d.startingOdometer}`);
    if (d.endingOdometer) lines.push(`  At return: ${d.endingOdometer}`);
    const s = d.startingOdometer ? parseInt(d.startingOdometer.replace(/[^0-9]/g, '')) : NaN;
    const e = d.endingOdometer ? parseInt(d.endingOdometer.replace(/[^0-9]/g, '')) : NaN;
    if (!isNaN(s) && !isNaN(e) && e >= s) lines.push(`  Miles driven: ${(e - s).toLocaleString()}`);
  }

  const issues = (packet.checklistItems || []).filter((i: any) =>
    getEffectiveStatuses(i).some((s: string) => ISSUE_STATUSES.includes(s))
  );
  if (issues.length > 0) {
    lines.push('');
    lines.push('DOCUMENTED ISSUES');
    issues.forEach((i: any) => {
      const ss = getEffectiveStatuses(i);
      const issueStatuses = ss.filter((s: string) => ISSUE_STATUSES.includes(s));
      const displayStatuses = issueStatuses.length > 0 ? formatStatuses(issueStatuses) : formatStatuses(ss);
      lines.push(`  • ${i.label} — ${displayStatuses}${i.notes ? ': ' + i.notes : ''}`);
    });
  }

  lines.push('');
  lines.push('STATEMENT');
  lines.push(`This ProofPacket documents vehicle / rental / lodging condition and supporting receipts for ${ctx}. It includes pickup/return condition, odometer/fuel or battery records where applicable, photos, receipts, communication logs, and a verification manifest with SHA-256 hashes for original photo files.`);
  lines.push('');
  lines.push('DISCLAIMER');
  lines.push('ProofPacket helps organize supporting documentation. It does not replace DTS, travel office guidance, claims office guidance, finance office guidance, JTR rules, rental company policies, insurance policies, employer policies, or official instructions. Military, government, and company names are provided only to help organize your packet. ProofPacket is not affiliated with or endorsed by the Department of Defense, any military branch, government agency, or other listed entity.');

  return lines.join('\n');
}
