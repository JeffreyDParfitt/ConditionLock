import { useDexieQuery } from "@/hooks/useLiveQuery";
import { db } from "@/storage/db";
import { storage } from "@/storage/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Download, Database, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { templates } from "@/templates";

export default function Settings() {
  const settings = useDexieQuery(() => storage.getSettings());
  const packets = useDexieQuery(() => db.packets.count()) || 0;
  const photos = useDexieQuery(() => db.photos.count()) || 0;
  const { toast } = useToast();

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

  const handleExportData = async () => {
    toast({ title: "Preparing backup...", description: "Serializing photos. This may take a moment." });
    const allPackets = await db.packets.toArray();
    const allPhotos = await db.photos.toArray();
    const allSettings = await db.settings.toArray();

    // Serialize blobs to base64 for JSON portability
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

  const handleLoadSampleData = async () => {
    // Generate a sample Car Rental packet
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

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your app preferences and data.</p>
      </header>

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
              <p className="text-xs text-muted-foreground">Add "ProofPacket" watermark to PDFs.</p>
            </div>
            <Switch 
              checked={settings.watermarkExports}
              onCheckedChange={v => updateSetting('watermarkExports', v)}
            />
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
            <span className="font-bold">{packets}</span>
          </div>
          <div className="flex justify-between text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
            <span className="text-muted-foreground font-medium">Total Photos</span>
            <span className="font-bold">{photos}</span>
          </div>

          <div className="pt-2 space-y-3">
            <Button variant="outline" className="w-full justify-start h-12" onClick={handleLoadSampleData}>
              <Database className="w-4 h-4 mr-2" /> Load Sample Data
            </Button>
            <Button variant="outline" className="w-full justify-start h-12" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" /> Export All Data (JSON)
            </Button>
            <Button variant="destructive" className="w-full justify-start h-12" onClick={handleClearData}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear All Data
            </Button>
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

      <div className="text-center p-4 bg-muted/30 rounded-lg space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Free Version: Limited to 10 packets, watermarked exports.
        </p>
        <p className="text-xs text-muted-foreground">
          Pro Version (coming soon): Unlimited packets, no watermark, custom templates, side-by-side photo comparison, ZIP export.
        </p>
      </div>
    </div>
  );
}
