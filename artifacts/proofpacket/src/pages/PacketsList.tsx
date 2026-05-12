import { useDexieQuery } from "@/hooks/useLiveQuery";
import { db } from "@/storage/db";
import { Link } from "wouter";
import { Search, Filter, Clock, FileText, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { templates } from "@/templates";

export default function PacketsList() {
  const packets = useDexieQuery(() => db.packets.orderBy('updatedAt').reverse().toArray()) || [];
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredPackets = packets.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.location?.toLowerCase().includes(search.toLowerCase()) ||
                          p.companyOrPerson?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Your Packets</h1>
        <p className="text-sm text-muted-foreground">Manage and export your documentation.</p>
      </header>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search packets..." 
            className="pl-9 bg-white dark:bg-gray-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.values(templates).map(t => (
              <SelectItem key={t.type} value={t.type}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredPackets.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No packets found.</p>
          </div>
        ) : (
          filteredPackets.map(packet => {
            const completedItems = packet.checklistItems?.filter(i => i.status !== 'not_checked').length || 0;
            const totalItems = packet.checklistItems?.length || 0;
            
            return (
              <Link key={packet.id} href={`/packets/${packet.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer shadow-xs border-muted">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
                          {templates[packet.type]?.name || packet.type}
                        </span>
                        <h3 className="font-semibold leading-tight">{packet.title}</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(packet.updatedAt), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {completedItems}/{totalItems}
                      </span>
                      {packet.location && (
                        <span className="truncate max-w-[120px]">{packet.location}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
