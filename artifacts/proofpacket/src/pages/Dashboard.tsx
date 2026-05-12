import { useDexieQuery } from "@/hooks/useLiveQuery";
import { db } from "@/storage/db";
import { Link } from "wouter";
import { Shield, Plus, FileText, Camera, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function Dashboard() {
  const packets = useDexieQuery(() => db.packets.orderBy('updatedAt').reverse().toArray()) || [];
  const photos = useDexieQuery(() => db.photos.count()) || 0;
  
  const recentPackets = packets.slice(0, 5);
  const totalPackets = packets.length;
  const exportedCount = packets.reduce((sum, p) => sum + (p.exportCount || 0), 0);

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">ProofPacket</h1>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Prove the condition before there's a dispute.</p>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          No account. No cloud. No server.
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-xs border-muted">
          <CardHeader className="p-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Packets</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalPackets}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs border-muted">
          <CardHeader className="p-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Photos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{photos}</div>
          </CardContent>
        </Card>
      </div>

      <Link href="/packets/new">
        <Button size="lg" className="w-full h-14 text-base shadow-sm">
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
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer shadow-xs border-muted">
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
