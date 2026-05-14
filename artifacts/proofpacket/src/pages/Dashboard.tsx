import { useDexieQuery } from "@/hooks/useLiveQuery";
import { db } from "@/storage/db";
import { storage } from "@/storage/actions";
import { Link } from "wouter";
import {
  Shield, Plus, FileText, CheckCircle2, ChevronRight, Clock, Zap,
  ShieldCheck, FilePlus2, AlertTriangle, XCircle, Trash2, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useTier } from "@/hooks/useTier";
import { useToast } from "@/hooks/use-toast";
import type { VerificationResult } from "@/types";

const RESULT_CONFIG = {
  passed:  { label: 'All Verified',   color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/30',  icon: CheckCircle2 },
  warning: { label: 'Incomplete',     color: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/30',  icon: AlertTriangle },
  failed:  { label: 'Hash Mismatch',  color: 'text-red-700 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-950/30',      icon: XCircle },
} as const;

export default function Dashboard() {
  const packets = useDexieQuery(() => db.packets.orderBy('updatedAt').reverse().toArray()) || [];
  const photos = useDexieQuery(() => db.photos.count()) || 0;
  const verificationResults = useDexieQuery(() => storage.getVerificationResults()) || [];
  const { tier, limits } = useTier();
  const { toast } = useToast();

  const recentPackets = packets.slice(0, 4);
  const recentResults = verificationResults.slice(0, 3);
  const totalPackets = packets.length;

  const tierLabels: Record<string, { label: string; color: string; bg: string }> = {
    free:     { label: 'Free',         color: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-100 dark:bg-slate-800' },
    pro:      { label: 'Pro',          color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/40' },
    business: { label: 'Business Pro', color: 'text-indigo-700 dark:text-indigo-400',bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  };
  const tierInfo = tierLabels[tier];

  const handleDeleteResult = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await storage.deleteVerificationResult(id);
    toast({ title: "Result deleted" });
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-primary">ProofPacket</h1>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${tierInfo.bg} ${tierInfo.color}`}>
            {tierInfo.label}
          </span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Prove the condition before there's a dispute.</p>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full border border-green-200 dark:text-green-400 dark:bg-green-950/40 dark:border-green-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          No account. No cloud. No server.
        </div>
      </header>

      {/* What do you want to do? */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-muted-foreground">What do you want to do?</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/packets/new">
            <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group border-primary/20 bg-primary/3" data-testid="card-create-packet">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FilePlus2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base leading-tight">Create Packet</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    Document condition before a rental, sale, handoff, lease, claim, or transfer.
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-semibold text-primary">Start New Packet</span>
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/verify">
            <Card className="cursor-pointer hover:border-indigo-400/40 hover:shadow-sm transition-all group border-indigo-200/50 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/10" data-testid="card-verify-packet">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 group-hover:bg-indigo-200/70 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base leading-tight">Verify Packet</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    Verify that received photo files match a ProofPacket verification manifest.
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Verify Received Packet</span>
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-xs border-muted">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Packets</div>
            <div className="text-2xl font-bold">
              {totalPackets}
              {limits.maxPackets !== Infinity && (
                <span className="text-sm font-normal text-muted-foreground"> / {limits.maxPackets}</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-xs border-muted">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Photos</div>
            <div className="text-2xl font-bold">{photos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade nudge */}
      {tier === 'free' && (
        <Link href="/pricing">
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20 shadow-xs cursor-pointer hover:border-blue-400 transition-colors">
            <CardContent className="flex items-center gap-3 p-4">
              <Zap className="w-8 h-8 text-blue-600 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">Upgrade to ProofPacket Pro</div>
                <div className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">Unlimited packets, verified exports, archive ZIP, signatures — $14.99 one-time.</div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Recent Packets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Packets</h2>
          {packets.length > 0 && (
            <Link href="/packets" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          )}
        </div>

        {recentPackets.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Create your first proof packet before check-in, pickup, move-in, return, handoff, lease start, sale, transfer, or dispute.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentPackets.map(packet => (
              <Link key={packet.id} href={`/packets/${packet.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer shadow-xs border-muted" data-testid={`card-packet-${packet.id}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
                          {packet.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-medium truncate">{packet.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(packet.updatedAt), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {packet.checklistItems?.filter(i => i.status !== 'not_checked').length || 0}/{packet.checklistItems?.length || 0}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Verification Results */}
      {recentResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Verifications</h2>
          </div>
          <div className="space-y-3">
            {recentResults.map((r: VerificationResult) => {
              const cfg = RESULT_CONFIG[r.resultStatus];
              const Icon = cfg.icon;
              return (
                <Card key={r.id} className={`${cfg.bg} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{r.packetTitle}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(r.verifiedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
                            <span>·</span>
                            <span>{r.verifiedCount} verified</span>
                            {r.missingCount > 0 && <><span>·</span><span className="text-amber-600">{r.missingCount} missing</span></>}
                            {r.mismatchCount > 0 && <><span>·</span><span className="text-red-600">{r.mismatchCount} mismatched</span></>}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteResult(r.id, e)}
                        className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                        title="Delete result"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Privacy promise */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4 flex gap-3">
          <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium">Fully local. 100% private.</p>
            <p className="text-[11px] text-muted-foreground">
              All packet data, photos, and verification results are stored only on this device. Nothing is uploaded to any server.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
