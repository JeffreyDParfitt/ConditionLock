import { useState, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTier } from "@/hooks/useTier";
import { storage } from "@/storage/actions";
import { sha256Blob, isCryptoAvailable } from "@/utils/crypto";
import type { VerificationManifest } from "@/utils/manifest";
import type { VerificationPhotoResult, VerificationResult } from "@/types";
import {
  ShieldCheck, Upload, FileJson, Image as ImageIcon, AlertTriangle,
  CheckCircle2, XCircle, ChevronLeft, Save, Download, Info,
  Archive, Loader2, FolderOpen
} from "lucide-react";
import { format } from "date-fns";
import JSZip from "jszip";

type Step = 'upload' | 'processing' | 'results';

const STATUS_CONFIG = {
  verified:  { label: 'Verified',         color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/30',   border: 'border-green-200 dark:border-green-800',  icon: CheckCircle2 },
  missing:   { label: 'Missing',          color: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/30',   border: 'border-amber-200 dark:border-amber-800',  icon: AlertTriangle },
  mismatch:  { label: 'Hash Mismatch',    color: 'text-red-700 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-950/30',       border: 'border-red-200 dark:border-red-800',      icon: XCircle },
  extra:     { label: 'Extra / Unmatched',color: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-900',      border: 'border-slate-200 dark:border-slate-700',  icon: Info },
} as const;

const HASH_DISCLAIMER = "Hash verification confirms whether the files being checked match the files recorded in this ConditionLock manifest. It does not prove who took the photos, where they were taken, whether the scene was staged, or whether the record has legal evidentiary value.";

export default function VerifyPacket() {
  const { toast } = useToast();
  const { limits } = useTier();

  const [step, setStep] = useState<Step>('upload');
  const [expandedHashes, setExpandedHashes] = useState<Set<number>>(new Set());
  const toggleHash = (i: number) => setExpandedHashes(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });
  const [manifestFile, setManifestFile] = useState<File | null>(null);
  const [manifest, setManifest] = useState<VerificationManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState('');

  const manifestInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const cryptoOk = isCryptoAvailable();

  const handleManifestFile = async (file: File) => {
    setManifestFile(file);
    setManifestError(null);
    setManifest(null);
    try {
      const text = await file.text();
      const parsed: VerificationManifest = JSON.parse(text);
      if (!parsed.photos || !parsed.packetId || parsed.manifestVersion !== '1.0') {
        throw new Error('This does not appear to be a valid ConditionLock manifest (v1.0).');
      }
      setManifest(parsed);
    } catch (e: any) {
      setManifestError(e.message || 'Failed to parse manifest file.');
    }
  };

  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    setPhotoFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      const newFiles = Array.from(files).filter(f => !existing.has(f.name + f.size));
      return [...prev, ...newFiles];
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleZipFile = (file: File) => {
    setZipFile(file);
    toast({ title: "ZIP selected", description: "Photos will be extracted from the ZIP during verification." });
  };

  const runVerification = async () => {
    if (!manifest) return;
    if (!cryptoOk) {
      toast({ title: "Crypto unavailable", description: "Your browser does not support Web Crypto API. Please use a modern browser.", variant: "destructive" });
      return;
    }
    setStep('processing');

    try {
      // Collect all photo files (individual + from ZIP)
      let allFiles: File[] = [...photoFiles];

      if (zipFile) {
        try {
          const zip = await JSZip.loadAsync(zipFile);
          const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']);
          for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
            if (zipEntry.dir) continue;
            const ext = '.' + relativePath.split('.').pop()!.toLowerCase();
            if (!imageExts.has(ext)) continue;
            const arrayBuffer = await zipEntry.async('arraybuffer');
            const blob = new Blob([arrayBuffer], { type: `image/${ext.slice(1)}` });
            const name = relativePath.split('/').pop() || relativePath;
            allFiles.push(new File([blob], name, { type: blob.type }));
          }
        } catch {
          toast({ title: "ZIP read error", description: "Could not extract photos from ZIP.", variant: "destructive" });
        }
      }

      // Hash all uploaded files
      const uploadedHashes = new Map<string, File>();
      const uploadedNames = new Map<string, File>();
      for (const file of allFiles) {
        const hash = await sha256Blob(file);
        uploadedHashes.set(hash, file);
        uploadedNames.set(file.name.toLowerCase(), file);
      }

      // Build results for each manifest entry
      const photoResults: VerificationPhotoResult[] = [];
      const matchedHashes = new Set<string>();

      for (const entry of manifest.photos) {
        const uploadedByHash = uploadedHashes.get(entry.sha256);
        const provenanceFields = {
          source: entry.source,
          appCaptured: entry.appCaptured,
          verificationEligible: entry.verificationEligible,
        };
        if (uploadedByHash) {
          matchedHashes.add(entry.sha256);
          photoResults.push({
            id: entry.id,
            fileName: entry.fileName,
            archiveFileName: entry.archiveFileName,
            caption: entry.caption,
            category: entry.category,
            phase: entry.phase,
            expectedHash: entry.sha256,
            calculatedHash: entry.sha256,
            status: 'verified',
            ...provenanceFields,
          });
        } else {
          // Check for name match with different hash
          const nameMatch = uploadedNames.get(entry.fileName.toLowerCase()) || uploadedNames.get(entry.archiveFileName.toLowerCase());
          if (nameMatch) {
            const calculatedHash = await sha256Blob(nameMatch);
            photoResults.push({
              id: entry.id,
              fileName: entry.fileName,
              archiveFileName: entry.archiveFileName,
              caption: entry.caption,
              category: entry.category,
              phase: entry.phase,
              expectedHash: entry.sha256,
              calculatedHash,
              status: 'mismatch',
              ...provenanceFields,
            });
          } else {
            photoResults.push({
              id: entry.id,
              fileName: entry.fileName,
              archiveFileName: entry.archiveFileName,
              caption: entry.caption,
              category: entry.category,
              phase: entry.phase,
              expectedHash: entry.sha256,
              calculatedHash: '',
              status: 'missing',
              ...provenanceFields,
            });
          }
        }
      }

      // Extra files not in manifest
      for (const [hash, file] of uploadedHashes.entries()) {
        if (!matchedHashes.has(hash)) {
          photoResults.push({
            id: '',
            fileName: file.name,
            archiveFileName: file.name,
            caption: '',
            category: '',
            phase: '',
            expectedHash: '',
            calculatedHash: hash,
            status: 'extra',
          });
        }
      }

      const verifiedCount = photoResults.filter(r => r.status === 'verified').length;
      const missingCount = photoResults.filter(r => r.status === 'missing').length;
      const mismatchCount = photoResults.filter(r => r.status === 'mismatch').length;
      const extraCount = photoResults.filter(r => r.status === 'extra').length;

      const resultStatus = mismatchCount > 0 ? 'failed' : missingCount > 0 ? 'warning' : 'passed';

      const verificationResult: VerificationResult = {
        id: crypto.randomUUID(),
        packetId: manifest.packetId,
        packetTitle: manifest.packetTitle,
        packetType: manifest.packetType,
        manifestHash: manifest.manifestHash || '',
        verifiedAt: new Date().toISOString(),
        totalExpected: manifest.totalPhotos,
        totalUploaded: allFiles.length,
        verifiedCount,
        missingCount,
        mismatchCount,
        extraCount,
        resultStatus,
        photoResults,
        notes,
      };

      setResult(verificationResult);
      setStep('results');
    } catch (e: any) {
      toast({ title: "Verification error", description: e.message || "An unexpected error occurred.", variant: "destructive" });
      setStep('upload');
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await storage.saveVerificationResult({ ...result, notes });
      setSaved(true);
      toast({ title: "Result saved", description: "Verification result saved locally." });
    } catch {
      toast({ title: "Save failed", description: "Could not save result.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleExportResult = () => {
    if (!result) return;
    const lines = [
      'ConditionLock Verification Result',
      '================================',
      `Packet:       ${result.packetTitle}`,
      `Type:         ${result.packetType}`,
      `Packet ID:    ${result.packetId}`,
      `Manifest Hash:${result.manifestHash}`,
      `Verified At:  ${result.verifiedAt}`,
      `Status:       ${result.resultStatus.toUpperCase()}`,
      '',
      `Total Expected:   ${result.totalExpected}`,
      `Total Uploaded:   ${result.totalUploaded}`,
      `Verified:         ${result.verifiedCount}`,
      `Missing:          ${result.missingCount}`,
      `Hash Mismatch:    ${result.mismatchCount}`,
      `Extra/Unmatched:  ${result.extraCount}`,
      '',
      'Per-Photo Results:',
      ...result.photoResults.map((r, i) =>
        `  [${i + 1}] ${r.status.toUpperCase()}\n       File: ${r.fileName}\n       Expected:   ${r.expectedHash || 'n/a'}\n       Calculated: ${r.calculatedHash || 'n/a'}`
      ),
      '',
      HASH_DISCLAIMER,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConditionLock_${result.packetTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_VerificationResult.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const reset = () => {
    setStep('upload');
    setManifestFile(null);
    setManifest(null);
    setManifestError(null);
    setPhotoFiles([]);
    setZipFile(null);
    setResult(null);
    setSaved(false);
    setNotes('');
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-5">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Link href="/">
            <button className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Verify Packet</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-1">
          Use this mode if someone sent you a ConditionLock. Upload the verification manifest and photo files you received. ConditionLock checks the files locally on this device and shows whether they match the recorded hashes.
        </p>
      </header>

      {!cryptoOk && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/30">
          <CardContent className="flex gap-3 p-4">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Your browser does not support Web Crypto API, which is required for hash verification. Please use a modern browser (Chrome, Firefox, Safari, Edge).
            </p>
          </CardContent>
        </Card>
      )}

      {step === 'upload' && (
        <div className="space-y-4">
          {/* Manifest upload */}
          <Card className={manifest ? 'border-green-300 dark:border-green-700' : manifestError ? 'border-red-300 dark:border-red-700' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileJson className="w-4 h-4 text-primary" />
                Verification Manifest
                <span className="text-xs font-normal text-muted-foreground">(required)</span>
              </CardTitle>
              <CardDescription>Upload the verification-manifest.json file from the sender.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                ref={manifestInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleManifestFile(e.target.files[0])}
              />
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => manifestInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {manifestFile ? manifestFile.name : 'Select Manifest JSON'}
              </Button>
              {manifestError && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {manifestError}
                </p>
              )}
              {manifest && (
                <div className="text-xs bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded p-3 space-y-1">
                  <p className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Manifest loaded
                  </p>
                  <p className="text-green-700 dark:text-green-400"><strong>Packet:</strong> {manifest.packetTitle}</p>
                  <p className="text-green-700 dark:text-green-400"><strong>Type:</strong> {manifest.packetType.replace(/_/g, ' ')}</p>
                  <p className="text-green-700 dark:text-green-400"><strong>Photos expected:</strong> {manifest.totalPhotos}</p>
                  <p className="text-green-700 dark:text-green-400"><strong>Generated:</strong> {new Date(manifest.generatedAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo files */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Photo Files
                <span className="text-xs font-normal text-muted-foreground">(select all you received)</span>
              </CardTitle>
              <CardDescription>Select the photo files you received from the sender.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handlePhotoFiles(e.target.files)}
              />
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => photoInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Photo Files
              </Button>
              {photoFiles.length > 0 && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {photoFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 px-2 bg-muted/50 rounded">
                      <span className="truncate flex-1 mr-2 text-muted-foreground">{f.name}</span>
                      <span className="text-muted-foreground shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                      <button
                        onClick={() => removePhoto(i)}
                        className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-1">{photoFiles.length} file(s) selected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ZIP upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Archive className="w-4 h-4 text-primary" />
                Photo ZIP
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </CardTitle>
              <CardDescription>If you received a ZIP of photos, upload it here instead of selecting individual files.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleZipFile(e.target.files[0])}
              />
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => zipInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {zipFile ? zipFile.name : 'Select ZIP File'}
              </Button>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-base"
            disabled={!manifest || (!photoFiles.length && !zipFile) || !cryptoOk}
            onClick={runVerification}
          >
            <ShieldCheck className="w-5 h-5 mr-2" />
            Run Verification
          </Button>

          {manifest && !photoFiles.length && !zipFile && (
            <p className="text-xs text-center text-muted-foreground">
              Add photo files or a ZIP to enable verification.
            </p>
          )}
        </div>
      )}

      {step === 'processing' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-medium">Calculating hashes…</p>
            <p className="text-sm text-muted-foreground text-center">
              Hashing photo files locally on this device. No data is uploaded anywhere.
            </p>
          </CardContent>
        </Card>
      )}

      {step === 'results' && result && (
        <div className="space-y-4">
          {/* Overall status banner */}
          <Card className={
            result.resultStatus === 'passed' ? 'border-green-300 dark:border-green-700 bg-green-50/60 dark:bg-green-950/20' :
            result.resultStatus === 'warning' ? 'border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20' :
            'border-red-300 dark:border-red-700 bg-red-50/60 dark:bg-red-950/20'
          }>
            <CardContent className="p-4 flex items-center gap-3">
              {result.resultStatus === 'passed'
                ? <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                : result.resultStatus === 'warning'
                ? <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                : <XCircle className="w-8 h-8 text-red-600 shrink-0" />
              }
              <div>
                <div className="font-bold text-base">
                  {result.resultStatus === 'passed' ? 'All files verified' :
                   result.resultStatus === 'warning' ? 'Verification incomplete' :
                   'Hash mismatch detected'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.verifiedCount} verified · {result.missingCount} missing · {result.mismatchCount} mismatched · {result.extraCount} extra
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {[
                ['Packet', result.packetTitle],
                ['Type', result.packetType.replace(/_/g, ' ')],
                ['Packet ID', result.packetId.slice(0, 16) + '…'],
                ['Verified At', format(new Date(result.verifiedAt), 'MMM d, yyyy h:mm a')],
                ['Manifest Hash', result.manifestHash ? result.manifestHash.slice(0, 20) + '…' : 'n/a'],
                ['Expected Photos', String(result.totalExpected)],
                ['Uploaded Files', String(result.totalUploaded)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-1 border-b border-muted last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right ml-4 truncate max-w-[180px]">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Per-photo results */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Photo Results ({result.photoResults.length})</h3>
            {result.photoResults.map((r, i) => {
              const cfg = STATUS_CONFIG[r.status];
              const Icon = cfg.icon;
              const hashExpanded = expandedHashes.has(i);
              const plainEnglish =
                r.status === 'verified'
                  ? (r.appCaptured === true ? 'File matches original — captured in ConditionLock.' : 'File received and hash matches the original.')
                  : r.status === 'missing'
                  ? 'This file was not provided or could not be matched.'
                  : r.status === 'mismatch'
                  ? 'A file with this name was found, but its hash does not match the original.'
                  : 'This file was uploaded but is not listed in the manifest.';
              return (
                <Card key={i} className={`${cfg.bg} ${cfg.border} border`}>
                  <CardContent className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className={`text-xs font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      {r.category && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{r.category} · {r.phase}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{r.fileName}</p>
                    {r.appCaptured !== undefined && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded w-fit block ${
                        r.appCaptured === true
                          ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/30'
                          : r.source === 'imported_document'
                          ? 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30'
                          : 'text-gray-500 bg-gray-100 dark:bg-gray-900'
                      }`}>
                        {r.appCaptured === true ? 'Captured in ConditionLock'
                          : r.source === 'imported_document' ? 'Imported Document'
                          : 'Legacy / Unknown source'}
                      </span>
                    )}
                    {r.caption && <p className="text-xs text-muted-foreground italic">{r.caption}</p>}
                    <p className="text-xs text-muted-foreground">{plainEnglish}</p>
                    {(r.expectedHash || r.calculatedHash) && (
                      <button
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                        onClick={() => toggleHash(i)}
                      >
                        <span className="font-mono opacity-60">{hashExpanded ? '▲' : '▼'}</span>
                        {hashExpanded ? 'Hide hash details' : 'Show hash details'}
                      </button>
                    )}
                    {hashExpanded && (
                      <div className="text-[10px] font-mono space-y-0.5 bg-black/5 dark:bg-white/5 rounded p-2 break-all">
                        {r.expectedHash && (
                          <div><span className="text-muted-foreground">Expected:   </span>{r.expectedHash}</div>
                        )}
                        {r.calculatedHash && r.status !== 'verified' && (
                          <div><span className="text-muted-foreground">Calculated: </span>{r.calculatedHash}</div>
                        )}
                        {r.status === 'verified' && (
                          <div className="text-green-600 dark:text-green-400">✓ Exact hash match</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes about this verification…"
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full h-12" onClick={handleExportResult}>
              <Download className="w-4 h-4 mr-2" />
              Export Verification Result
            </Button>

            {limits.hasSavedVerifications ? (
              <Button
                className="w-full h-12"
                onClick={handleSave}
                disabled={saving || saved}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saved ? 'Saved Locally' : 'Save Result Locally'}
              </Button>
            ) : (
              <Link href="/pricing">
                <Button variant="outline" className="w-full h-12 border-indigo-300 dark:border-indigo-700">
                  <Save className="w-4 h-4 mr-2 text-indigo-600" />
                  Save Result Locally
                  <span className="ml-auto text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-1.5 py-0.5 rounded uppercase">Business</span>
                </Button>
              </Link>
            )}

            <Button variant="ghost" className="w-full h-12 text-muted-foreground" onClick={reset}>
              Verify Another Packet
            </Button>
          </div>

          {/* Disclaimer */}
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-4 flex gap-3">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">{HASH_DISCLAIMER}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
