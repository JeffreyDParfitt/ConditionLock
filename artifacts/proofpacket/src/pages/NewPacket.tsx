import { Link } from "wouter";
import { templates } from "@/templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { PacketType } from "@/types";

export default function NewPacket() {
  const categories = Array.from(new Set(Object.values(templates).map(t => t.category)));

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Choose Packet Type</h1>
        <p className="text-sm text-muted-foreground">Select a template to pre-fill the right checklist items.</p>
      </header>

      <div className="space-y-8">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">{category}</h2>
            <div className="grid gap-3">
              {Object.values(templates)
                .filter(t => t.category === category)
                .map(template => (
                  <Link key={template.type} href={`/packets/new/${template.type}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer shadow-xs border-muted">
                      <CardContent className="flex items-start justify-between p-4">
                        <div className="space-y-1 pr-4">
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 mt-1 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
