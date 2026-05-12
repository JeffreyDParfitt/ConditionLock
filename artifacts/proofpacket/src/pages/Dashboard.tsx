import { useDexieQuery } from "@/hooks/useLiveQuery";
import { db } from "@/storage/db";
import { Link } from "wouter";
import { Shield, Plus, FileText, CheckCircle2, ChevronRight, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useTier } from "@/hooks/useTier";

export default function Dashboard() {
  const packets = useDexieQuery(() => db.packets.orderBy('updatedAt').reverse().toArray()) || [];
  const photos = useDexieQuery(() => db.photos.count()) || 0;
  const { tier, limits } = useTier();

  const recentPackets = packets.slice(0, 5);
  const totalPackets = packets.length;

  const tierLabels: Record<string, { label: string; color: string; bg: string }> = {
    free: { label: 'Free', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
    pro: { label: 'Pro', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
    business: { label: 'Business Pro', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  };
  const tierInfo = tierLabels[tier];

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

      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-xs border-muted">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Packets</div>
            <div className="text-2xl font-bold">{totalPackets}{limits.maxPackets !== Infinity && <span className="text-sm font-normal text-muted-foreground"> / {limits.maxPackets}</span>}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs border-muted">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Photos</div>
            <div className="text-2xl font-bold">{photos}</div>
          </CardContent>
        </Card>
      </div>

      {tier === 'free' && (
        <Link href="/pricing">
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20 shadow-xs cursor-pointer hover:border-blue-400 transition-colors">
            <CardContent className="flex items-center gap-3 p-4">
              <Zap className="w-8 h-8 text-blue-600 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">Upgrade to ProofPacket Pro</div>
                <div className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">Unlimited packets, no watermark, signatures, and more — $14.99 one-time.</div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      )}

      <Link href="/packets/new">
        <Button size="lg" className="w-full h-14 text-base shadow-sm" data-testid="button-create-packet">
          <Plus className="w-5 h-5 mr-2" />
          Create New Proof Packet
        </Button>
      </Link>

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
    </div>
  );
}
