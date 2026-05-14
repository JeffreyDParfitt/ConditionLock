import { useDexieQuery } from "@/hooks/useLiveQuery";
import { db } from "@/storage/db";
import { storage } from "@/storage/actions";
import { Link, useLocation } from "wouter";
import {
  Shield, FileText, CheckCircle2, ChevronRight, Clock,
  ShieldCheck, AlertTriangle, XCircle, Trash2, Timer,
  Truck, Car, LayoutGrid, KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useTier } from "@/hooks/useTier";
import { useToast } from "@/hooks/use-toast";
import type { VerificationResult } from "@/types";

const RESULT_CONFIG = {
  passed:  { label: 'All Verified',  color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30',  icon: CheckCircle2 },
  warning: { label: 'Incomplete',    color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30',  icon: AlertTriangle },
  failed:  { label: 'Hash Mismatch', color: 'text-red-700 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-950/30',      icon: XCircle },
} as const;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const packets = useDexieQuery(() => db.packets.orderBy('updatedAt').reverse().toArray()) || [];
  const photos  = useDexieQuery(() => db.photos.count()) || 0;
  const verificationResults = useDexieQuery(() => storage.getVerificationResults()) || [];
  const { tier, isTrial, trialDaysRemaining, trialHoursRemaining, trialStatus } = useTier();
  const { toast } = useToast();

  const recentPackets = packets.slice(0, 4);
  const recentResults = verificationResults.slice(0, 3);

  const tierBadge: Record<string, { label: string; color: string; bg: string }> = {
    trial:    { label: 'Trial',         color: 'text-green-700 dark:text-green-400',   bg: 'bg-green-100 dark:bg-green-900/40' },
    pro:      { label: 'Pro',           color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-900/40' },
    business: { label: 'Business Pro',  color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
    locked:   { label: 'Trial Expired', color: 'text-red-700 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-900/40' },
  };
  const badge = tierBadge[tier] ?? tierBadge.trial;

  const handleDeleteResult = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await storage.deleteVerificationResult(id);
    toast({ title: "Result deleted" });
  };

  const trialCountdownLabel = () => {
    if (trialStatus === 'expired') return null;
    if (trialDaysRemaining === 0 && trialHoursRemaining === 0) return 'Trial ends very soon';
    if (trialDaysRemaining === 0) return `Trial ends today — ${trialHoursRemaining}h remaining`;
    if (trialDaysRemaining === 1) return 'Trial active — 1 day remaining';
    return `Trial active — ${trialDaysRemaining} days remaining`;
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-6">

      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-primary">ProofPacket</h1>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${badge.bg} ${badge.color}`}>
            {badge.label}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full border border-green-200 dark:text-green-400 dark:bg-green-950/40 dark:border-green-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          No account. No cloud. No server.
        </div>
      </header>

      {/* Trial countdown */}
      {isTrial && trialCountdownLabel() && (
        <Card className={trialDaysRemaining === 0
          ? 'border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20'
          : 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10'
        }>
          <CardContent className="flex items-center justify-between p-3 gap-3">
            <div className="flex items-center gap-2">
              <Timer className={`w-4 h-4 shrink-0 ${trialDaysRemaining === 0 ? 'text-amber-600' : 'text-green-700'}`} />
              <span className={`text-xs font-medium ${trialDaysRemaining === 0 ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
                {trialCountdownLabel()}
              </span>
            </div>
            <Link href="/pricing">
              <span className="text-xs font-semibold text-primary whitespace-nowrap">See Plans →</span>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Trial ending soon nudge */}
      {isTrial && trialDaysRemaining <= 1 && (
        <Link href="/pricing">
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20 shadow-xs cursor-pointer hover:border-blue-400 transition-colors">
            <CardContent className="flex items-center gap-3 p-4">
              <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">Keep your packets after the trial</div>
                <div className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">Pro $14.99 · Business Pro $39.99 — one-time purchase.</div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* ── Rental Vehicle Hero ── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Protect yourself from rental vehicle damage disputes.</h2>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            Create verified pickup and return condition packets for rental cars, moving trucks, cargo vans, trailers, and car-sharing trips.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">Most people take photos. ProofPacket tells you what they forget to document.</p>
        </div>

        <div className="grid gap-3">
          <button
            className="w-full text-left"
            onClick={() => setLocation('/packets/new/car_rental')}
            data-testid="card-rental-car"
          >
            <Card className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group border-primary/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base leading-tight">Start Rental Car Packet</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    Avis, Budget, Enterprise, Hertz, National, Alamo, Sixt, Turo, Getaround, Zipcar, and more.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-primary shrink-0" />
              </CardContent>
            </Card>
          </button>

          <button
            className="w-full text-left"
            onClick={() => setLocation('/packets/new/moving_truck_van')}
            data-testid="card-moving-truck"
          >
            <Card className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group border-muted">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/70 transition-colors">
                  <Truck className="w-6 h-6 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base leading-tight">Start Moving Truck / Van Packet</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    U-Haul, Penske, Budget Truck, Enterprise Truck, Ryder, Home Depot, and more.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className="w-full text-left"
            onClick={() => setLocation('/verify')}
            data-testid="card-verify-packet"
          >
            <Card className="cursor-pointer hover:border-indigo-400/40 hover:shadow-sm transition-all group border-indigo-200/50 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/10 h-full">
              <CardContent className="p-4 flex flex-col gap-2 h-full">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <div className="font-semibold text-sm leading-tight">Verify Received Packet</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">Check photo hashes against a manifest.</div>
                </div>
              </CardContent>
            </Card>
          </button>

          <button
            className="w-full text-left"
            onClick={() => setLocation('/packets/new')}
            data-testid="card-more-packet-types"
          >
            <Card className="cursor-pointer hover:border-muted-foreground/30 hover:shadow-sm transition-all group border-muted h-full">
              <CardContent className="p-4 flex flex-col gap-2 h-full">
                <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-semibold text-sm leading-tight">More Packet Types</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">Hotels, Airbnb, apartments, sales, and more.</div>
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      </div>

      {/* ── B2B / Fleet section ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For business & fleet use</p>
        <button
          className="w-full text-left"
          onClick={() => setLocation('/packets/new/company_vehicle_handoff')}
          data-testid="card-company-vehicle"
        >
          <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group border-muted">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/70 transition-colors">
                <KeyRound className="w-5 h-5 text-foreground/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm leading-tight">Company Vehicle Handoff</div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 uppercase tracking-wide shrink-0">Business</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Fleet cars, delivery vans, service trucks, pool vehicles, and any employer-assigned vehicle.
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-xs border-muted">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Packets</div>
            <div className="text-2xl font-bold">{packets.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs border-muted">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Photos</div>
            <div className="text-2xl font-bold">{photos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Packets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Packets</h2>
          {packets.length > 0 && (
            <Link href="/packets" className="text-sm font-medium text-primary hover:underline">View All</Link>
          )}
        </div>

        {recentPackets.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Create your first packet to document rental vehicle condition, property handoffs, sales, or any condition transfer.
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

      {/* Recent Verifications */}
      {recentResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Recent Verifications</h2>
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

      {/* Privacy card */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4 flex gap-3">
          <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium">Fully local. 100% private.</p>
            <p className="text-[11px] text-muted-foreground">
              ProofPacket runs on your device. Packets, photos, hashes, and archives are not uploaded to any server.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
