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
import { Camera, Download, FileText, CheckSquare, MessageSquare, PenTool, Image as ImageIcon, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import SignaturePad from "signature_pad";
import { generatePDF } from "@/pdf/generator";
import type { ChecklistItem, ChecklistStatus, PhotoItem, SignatureItem, CommunicationLog } from "@/types";

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
                  <div className="text-xl font-bold">{packet.checklistItems?.filter(i => i.status !== 'not_checked').length || 0} / {packet.checklistItems?.length || 0}</div>
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
            
            <Button variant="destructive" className="w-full mt-8" onClick={async () => {
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
            <ChecklistTab packet={packet} />
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
            <ExportTab packet={packet} settings={settings} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ------------------------------------------------------------------
// CHECKLIST TAB
// ------------------------------------------------------------------
function ChecklistTab({ packet }: { packet: any }) {
  const items = packet.checklistItems || [];
  const sections = Array.from(new Set(items.map((i: any) => i.section)));
  
  const [filter, setFilter] = useState("all");
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newItemSection, setNewItemSection] = useState("Additional Items");
  const [newItemLabel, setNewItemLabel] = useState("");
  
  const updateItemStatus = async (itemId: string, status: ChecklistStatus) => {
    const newItems = items.map((i: any) => i.id === itemId ? { ...i, status } : i);
    await storage.updatePacket(packet.id, { checklistItems: newItems });
  };

  const updateItemNotes = async (itemId: string, notes: string) => {
    const newItems = items.map((i: any) => i.id === itemId ? { ...i, notes } : i);
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

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="rounded-full">All</Button>
        <Button variant={filter === 'not_checked' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('not_checked')} className="rounded-full">Not Checked</Button>
        <Button variant={filter === 'issues' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('issues')} className="rounded-full">Issues</Button>
      </div>

      {sections.map((section: any) => {
        const sectionItems = items.filter((i: any) => i.section === section).filter((i: any) => {
          if (filter === 'not_checked') return i.status === 'not_checked';
          if (filter === 'issues') return ['damaged', 'dirty', 'missing', 'not_working'].includes(i.status);
          return true;
        });

        if (sectionItems.length === 0) return null;
        
        const completed = items.filter((i: any) => i.section === section && i.status !== 'not_checked').length;
        const total = items.filter((i: any) => i.section === section).length;
        
        return (
          <div key={section} className="space-y-3">
            <div className="flex items-center justify-between sticky top-[100px] bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur py-2 z-10 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-sm">{section}</h2>
              <span className="text-xs text-muted-foreground">{completed}/{total}</span>
            </div>
            <div className="space-y-3">
              {sectionItems.map((item: any) => (
                <Card key={item.id} className="shadow-xs border-muted overflow-hidden">
                  <div className={`h-1 w-full ${item.status === 'not_checked' ? 'bg-gray-200 dark:bg-gray-800' : (item.status === 'good' || item.status === 'works' || item.status === 'present' || item.status === 'included') ? 'bg-green-500' : (item.status === 'not_applicable' || item.status === 'unknown') ? 'bg-gray-400' : 'bg-destructive'}`} />
                  <CardContent className="p-3 space-y-3">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium">{item.label}</h3>
                        {item.addedDuringInspection && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">ADDED</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={item.status === 'good' ? 'default' : 'outline'} 
                        size="sm" 
                        className={`h-10 text-xs ${item.status === 'good' ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}`}
                        onClick={() => updateItemStatus(item.id, 'good')}
                      >Good</Button>
                      <Button 
                        variant={item.status === 'damaged' ? 'default' : 'outline'} 
                        size="sm" 
                        className={`h-10 text-xs ${item.status === 'damaged' ? 'bg-destructive hover:bg-destructive/90 text-white border-destructive' : ''}`}
                        onClick={() => updateItemStatus(item.id, 'damaged')}
                      >Damaged</Button>
                      <Button 
                        variant={item.status === 'dirty' ? 'default' : 'outline'} 
                        size="sm" 
                        className={`h-10 text-xs ${item.status === 'dirty' ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' : ''}`}
                        onClick={() => updateItemStatus(item.id, 'dirty')}
                      >Dirty</Button>
                    </div>

                    <div className="flex gap-2 mt-2">
                       <Button 
                        variant={item.status === 'missing' ? 'default' : 'outline'} 
                        size="sm" 
                        className={`flex-1 h-8 text-xs ${item.status === 'missing' ? 'bg-destructive hover:bg-destructive/90 text-white border-destructive' : ''}`}
                        onClick={() => updateItemStatus(item.id, 'missing')}
                      >Missing</Button>
                      <Button 
                        variant={item.status === 'not_applicable' ? 'default' : 'outline'} 
                        size="sm" 
                        className={`flex-1 h-8 text-xs ${item.status === 'not_applicable' ? 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600' : ''}`}
                        onClick={() => updateItemStatus(item.id, 'not_applicable')}
                      >N/A</Button>
                    </div>

                    <Input 
                      placeholder="Add notes..." 
                      className="text-xs h-9 bg-gray-100 dark:bg-gray-900 border-none"
                      value={item.notes}
                      onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 1200;

        if (width > height && width > max) {
          height *= max / width;
          width = max;
        } else if (height > max) {
          width *= max / height;
          height = max;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        await storage.addPhoto({
          packetId: packet.id,
          imageData: dataUrl,
          caption: '',
          category: 'general',
          phase: 'both',
          dateTaken: new Date().toISOString()
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 pb-12">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleCapture}
      />
      <Button className="w-full h-14" onClick={() => fileInputRef.current?.click()}>
        <Camera className="w-5 h-5 mr-2" /> Take Photo
      </Button>

      {photos.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No photos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 group">
              <img src={photo.imageData} className="object-cover w-full h-full" alt={photo.caption || 'Photo'} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Button 
                  variant="destructive" 
                  size="icon" 
                  className="w-10 h-10 rounded-full"
                  onClick={async () => {
                    if(confirm('Delete this photo?')) await storage.deletePhoto(photo.id);
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [name, setName] = useState("");
  const [role, setRole] = useState("Signer");
  const padRef = useRef<SignaturePad | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
              <Input value={name} onChange={e => setName(e.target.value)} />
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
function ExportTab({ packet, settings }: { packet: any, settings: any }) {
  const [opts, setOpts] = useState({
    includeCover: true,
    includeSummary: true,
    includeChecklist: true,
    includePhotos: true,
    includeCommLog: true,
    includeSignatures: true,
    includeDisclaimer: true
  });
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      await generatePDF(packet, settings, opts);
      await storage.updatePacket(packet.id, { exportCount: (packet.exportCount || 0) + 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Include in PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(opts).map(([key, val]) => (
            <div key={key} className="flex items-center space-x-3">
              <Checkbox 
                id={key} 
                checked={val} 
                onCheckedChange={(c) => setOpts(prev => ({...prev, [key]: !!c}))}
                className="w-5 h-5"
              />
              <Label htmlFor={key} className="text-sm font-medium leading-none cursor-pointer">
                {key.replace('include', '').replace(/([A-Z])/g, ' $1').trim()}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full h-14 text-base" onClick={handleExport} disabled={generating}>
        <Download className="w-5 h-5 mr-2" />
        {generating ? "Generating..." : "Export PDF Report"}
      </Button>
    </div>
  );
}
