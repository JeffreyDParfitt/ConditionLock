import { useState } from "react";
import { useDexieQuery } from "@/hooks/useLiveQuery";
import { db } from "@/storage/db";
import { storage } from "@/storage/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Download, Database, ShieldAlert, Zap, Building2, Lock, Upload, Archive, AlertTriangle, RotateCcw, Timer, XCircle } from "lucide-react";
import { importArchive } from "@/utils/manifest";
import { useToast } from "@/hooks/use-toast";
import { templates } from "@/templates";
import { useTier, TIER_LIMITS } from "@/hooks/useTier";
import { useTrial, setEntitlement, resetTrial, simulateTrialExpired, clearSimulation } from "@/hooks/useTrial";
import { Link } from "wouter";
import { UpgradePrompt } from "@/components/UpgradePrompt";

export default function Settings() {
  const settings = useDexieQuery(() => storage.getSettings());
  const packets = useDexieQuery(() => db.packets.count()) || 0;
  const photos = useDexieQuery(() => db.photos.count()) || 0;
  const { toast } = useToast();
  const { tier, limits } = useTier();
  const trial = useTrial();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'business'>('pro');

  if (!settings) return null;

  const updateSetting = async (key: keyof typeof settings, value: any) => {
    await storage.updateSettings({ [key]: value });
  };

  const handleClearData = async () => {
    const confirm = window.prompt('Type "DELETE" to clear all data. This cannot be undone.');
    if (confirm === 'DELETE') {
      await db.packets.clear();
      await db.photos.clear();
      toast({ title: "Data Cleared", description: "All packets and photos have been deleted." });
    }
  };

  const showUpgrade = (reason: string, required: 'pro' | 'business') => {
    setUpgradeReason(reason);
    setUpgradeTier(required);
    setUpgradeOpen(true);
  };

  const handleExportData = async () => {
    if (!limits.hasJsonBackup) {
      showUpgrade('JSON backup & restore requires ProofPacket Pro.', 'pro');
      return;
    }
    toast({ title: "Preparing backup...", description: "Serializing photos. This may take a moment." });
    const allPackets = await db.packets.toArray();
    const allPhotos = await db.photos.toArray();
    const allSettings = await db.settings.toArray();

    const photosForExport = await Promise.all(allPhotos.map(async (p) => {
      try {
        const { blobToBase64 } = await import('@/utils/photo');
        const base64 = p.originalBlob instanceof Blob ? await blobToBase64(p.originalBlob) : '';
        const { originalBlob: _, ...rest } = p as any;
        return { ...rest, originalBase64: base64 };
      } catch {
        const { originalBlob: _, ...rest } = p as any;
        return { ...rest, originalBase64: '' };
      }
    }));

    const exportObj = {
      version: 2,
      exportDate: new Date().toISOString(),
      packets: allPackets,
      photos: photosForExport,
      settings: allSettings,
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ProofPacket_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Backup exported", description: "Original-quality photos are included." });
  };

  const handleImportData = async () => {
    if (!limits.hasJsonBackup) {
      showUpgrade('Import & restore requires ProofPacket Pro.', 'pro');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.packets || !data.photos) throw new Error('Invalid backup file');
        toast({ title: "Restoring...", description: "Importing your backup data." });
        for (const packet of data.packets) await db.packets.put(packet);
        for (const photo of data.photos) {
          try {
            const { base64ToBlob } = await import('@/utils/photo');
            const blob = photo.originalBase64 ? base64ToBlob(photo.originalBase64, photo.mimeType || 'image/jpeg') : new Blob([]);
            const { originalBase64: _, ...rest } = photo;
            await db.photos.put({ ...rest, originalBlob: blob });
          } catch {
            const { originalBase64: _, ...rest } = photo;
            await db.photos.put({ ...rest, originalBlob: new Blob([]) });
          }
        }
        toast({ title: "Backup restored", description: `${data.packets.length} packets imported.` });
      } catch (err) {
        toast({ title: "Import failed", description: "Invalid or corrupted backup file.", variant: "destructive" });
      }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const handleImportArchive = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,application/zip';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        toast({ title: "Reading archive…", description: "Extracting packet data and photos." });
        const { packet, photos, manifest } = await importArchive(file);

        const existing = await db.packets.get(packet.id);
        if (existing) {
          const choice = window.confirm(
            `A packet with the same ID already exists:\n"${existing.title}"\n\nClick OK to replace it, or Cancel to import as a duplicate.`
          );
          if (choice) {
            await db.packets.put(packet);
          } else {
            const { id: _, ...rest } = packet;
            const newId = crypto.randomUUID();
            await db.packets.put({ ...rest, id: newId, title: `${packet.title} (Restored)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
          }
        } else {
          await db.packets.put(packet);
        }

        let restoredPhotos = 0;
        let missingPhotos = 0;
        for (const { entry, blob } of photos) {
          if (blob) {
            const { generateThumbnail } = await import('@/utils/photo');
            const thumbnailData = await generateThumbnail(blob);
            await db.photos.put({
              id: entry.id,
              packetId: packet.id,
              originalBlob: blob,
              thumbnailData,
              mimeType: entry.mimeType,
              fileName: entry.archiveFileName,
              fileSize: entry.fileSize,
              caption: entry.caption,
              category: entry.category,
              phase: entry.phase as any,
              dateTaken: entry.dateTaken,
              createdAt: new Date().toISOString(),
            });
            restoredPhotos++;
          } else {
            missingPhotos++;
          }
        }

        const desc = missingPhotos > 0
          ? `Packet restored. ${restoredPhotos} photo(s) restored, ${missingPhotos} missing from archive.`
          : `Packet and ${restoredPhotos} photo(s) fully restored.`;
        toast({ title: "Archive imported", description: desc });
      } catch (err: any) {
        toast({ title: "Import failed", description: err.message || "Invalid or corrupted archive file.", variant: "destructive" });
      }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const handleLoadSampleData = async () => {
    const carTemplate = templates['car_rental'];
    const checklistItems = carTemplate.sections.flatMap(section =>
      section.items.map(item => ({
        id: crypto.randomUUID(),
        packetId: "",
        section: section.name,
        label: item.label,
        description: item.description,
        phase: item.phase,
        status: (Math.random() > 0.7 ? "good" : "not_checked") as any,
        notes: "",
        photoIds: [],
        addedDuringInspection: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    );

    const id = await storage.createPacket({
      type: "car_rental",
      title: "Sample Hertz Rental - SFO",
      location: "SFO Airport",
      companyOrPerson: "Hertz",
      referenceNumber: "RES-987654321",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      phase: "pickup",
      notes: "Sample data packet.",
      checklistItems,
      communicationLogs: [],
      signatures: [],
      details: {},
    });

    await storage.updatePacket(id, {
      checklistItems: checklistItems.map(item => ({ ...item, packetId: id }))
    });

    toast({ title: "Sample Data Loaded", description: "A sample car rental packet has been created." });
  };

  const tierLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
    trial:    { label: 'Trial Active',    color: 'text-green-700 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-950/30',   border: 'border-green-200 dark:border-green-800' },
    pro:      { label: 'Pro',             color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/40',     border: 'border-blue-200 dark:border-blue-800' },
    business: { label: 'Business Pro',    color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800' },
    locked:   { label: 'Trial Expired',   color: 'text-red-700 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-950/30',       border: 'border-red-200 dark:border-red-800' },
  };
  const tierInfo = tierLabels[tier] ?? tierLabels.trial;

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your app preferences and data.</p>
      </header>

      {/* Plan card */}
      <Card className={`${tierInfo.bg} ${tierInfo.border} border`}>
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-0.5">Current Plan</div>
            <div className={`text-base font-bold ${tierInfo.color}`}>{tierInfo.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {tier === 'trial' && trial.daysRemaining > 0
                ? `${trial.daysRemaining} day${trial.daysRemaining !== 1 ? 's' : ''} remaining · full access`
                : tier === 'trial'
                ? 'Trial ends today · full access'
                : tier === 'pro'
                ? 'Unlimited packets · signatures · JSON backup'
                : tier === 'business'
                ? 'Everything + business templates · ZIP export'
                : 'Trial expired — upgrade to continue'}
            </div>
          </div>
          {tier !== 'business' && (
            <Link href="/pricing">
              <Button size="sm" className="shrink-0 h-9" variant={tier === 'locked' ? 'default' : 'outline'} data-testid="button-upgrade-cta">
                {tier === 'locked' ? <><Zap className="w-3.5 h-3.5 mr-1" /> Upgrade</> : 'See Plans'}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Details</CardTitle>
          <CardDescription>Appears on exported PDF reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={settings.userName}
              onChange={e => updateSetting('userName', e.target.value)}
              placeholder="Your Name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={settings.userEmail}
              onChange={e => updateSetting('userEmail', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Default PDF Title</Label>
            <Input
              value={settings.defaultPdfTitle}
              onChange={e => updateSetting('defaultPdfTitle', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Disclaimer</Label>
              <p className="text-xs text-muted-foreground">Include legal disclaimer in PDFs.</p>
            </div>
            <Switch
              checked={settings.showDisclaimer}
              onCheckedChange={v => updateSetting('showDisclaimer', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Watermark Exports</Label>
              <p className="text-xs text-muted-foreground">Add "ProofPacket" watermark to exported PDFs.</p>
            </div>
            <Switch
              checked={settings.watermarkExports}
              onCheckedChange={v => updateSetting('watermarkExports', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import / Restore Archive */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Archive className="w-4 h-4 text-primary" />
            Import / Restore Archive
          </CardTitle>
          <CardDescription>
            Re-import a ProofPacket archive from your phone, computer, email, or cloud drive. Restored packets are stored locally on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={handleImportArchive}
            data-testid="button-import-archive"
          >
            <Archive className="w-4 h-4 mr-2 text-green-700" />
            Import Full Packet Archive (.zip)
          </Button>
          <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              ProofPacket archives are local user-controlled files. If you delete both the local packet and all exported archives, ProofPacket cannot recover the data.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data & Storage</CardTitle>
          <CardDescription>All data is stored locally on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
            <span className="text-muted-foreground font-medium">Total Packets</span>
            <span className="font-bold">{packets}{limits.maxPackets !== Infinity && ` / ${limits.maxPackets}`}</span>
          </div>
          <div className="flex justify-between text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
            <span className="text-muted-foreground font-medium">Total Photos</span>
            <span className="font-bold">{photos}</span>
          </div>

          <div className="pt-2 space-y-3">
            <Button variant="outline" className="w-full justify-start h-12" onClick={handleLoadSampleData} data-testid="button-load-sample">
              <Database className="w-4 h-4 mr-2" /> Load Sample Data
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={handleExportData}
              data-testid="button-export-json"
            >
              {limits.hasJsonBackup
                ? <><Download className="w-4 h-4 mr-2" /> Export All Data (JSON)</>
                : <><Lock className="w-4 h-4 mr-2" /> Export All Data (JSON) <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded uppercase">Pro</span></>
              }
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={handleImportData}
              data-testid="button-import-json"
            >
              {limits.hasJsonBackup
                ? <><Upload className="w-4 h-4 mr-2" /> Import / Restore Backup</>
                : <><Lock className="w-4 h-4 mr-2" /> Import / Restore Backup <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded uppercase">Pro</span></>
              }
            </Button>
            <Button variant="destructive" className="w-full justify-start h-12" onClick={handleClearData} data-testid="button-clear-data">
              <Trash2 className="w-4 h-4 mr-2" /> Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Developer Tools */}
      <Card className="border-dashed border-2 border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-amber-600">⚙</span> Developer Tools
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-300 uppercase tracking-wide">Dev Only</span>
          </CardTitle>
          <CardDescription>
            Developer testing only — remove or hide before production.
            Replace these toggles with RevenueCat / App Store / Google Play checks before release.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Trial controls */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Trial</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs"
                onClick={() => { resetTrial(); toast({ title: 'Trial reset', description: 'Fresh 3-day trial started.' }); }}
                data-testid="button-reset-trial"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Trial
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => { simulateTrialExpired(); toast({ title: 'Trial simulated as expired' }); }}
                data-testid="button-simulate-expired"
              >
                <Timer className="w-3.5 h-3.5 mr-1.5" /> Simulate Expired
              </Button>
            </div>
          </div>

          {/* Entitlement controls */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Simulated Entitlement</p>
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-blue-600" /> Simulate Pro Unlock</Label>
              <Switch
                checked={trial.entitlement === 'pro' || trial.entitlement === 'business'}
                onCheckedChange={v => setEntitlement(v ? 'pro' : 'none')}
                data-testid="toggle-simulate-pro"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-indigo-700" /> Simulate Business Pro Unlock</Label>
              <Switch
                checked={trial.entitlement === 'business'}
                onCheckedChange={v => setEntitlement(v ? 'business' : trial.entitlement === 'business' ? 'pro' : 'none')}
                data-testid="toggle-simulate-business"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs"
              onClick={() => { clearSimulation(); setEntitlement('none'); toast({ title: 'Simulated unlocks cleared' }); }}
              data-testid="button-clear-simulation"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Clear Simulated Unlocks
            </Button>
          </div>

          <div className="text-[11px] text-muted-foreground pt-1 border-t space-y-0.5">
            <div>Trial status: <strong>{trial.trialStatus}</strong>
              {trial.trialStatus === 'active' && ` · ${trial.daysRemaining}d ${trial.hoursRemaining}h remaining`}
            </div>
            <div>Entitlement: <strong>{trial.entitlement}</strong></div>
            <div>Active tier: <strong>{tier}</strong></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex gap-3">
          <ShieldAlert className="w-8 h-8 text-primary shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Privacy Statement</h4>
            <p className="text-xs text-muted-foreground">
              Your data is stored locally on this device. ProofPacket does not use accounts, servers, or cloud storage.
            </p>
          </div>
        </CardContent>
      </Card>

      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredTier={upgradeTier}
        reason={upgradeReason}
      />
    </div>
  );
}
