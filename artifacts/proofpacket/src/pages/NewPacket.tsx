import { useState } from 'react';
import { Link, useLocation } from "wouter";
import { templates } from "@/templates";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Lock } from "lucide-react";
import type { PacketType } from "@/types";
import { useTier } from "@/hooks/useTier";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { db } from "@/storage/db";

export default function NewPacket() {
  const { tier, limits, tierRequiredForTemplate } = useTier();
  const [, setLocation] = useLocation();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'business'>('pro');

  const showUpgrade = (reason: string, required: 'pro' | 'business') => {
    setUpgradeReason(reason);
    setUpgradeTier(required);
    setUpgradeOpen(true);
  };

  const handleSelectType = async (type: PacketType, templateName: string) => {
    // Check template tier gate
    const requiredTier = tierRequiredForTemplate(type);
    if (requiredTier) {
      showUpgrade(`"${templateName}" requires ${requiredTier === 'business' ? 'Business Pro' : 'ProofPacket Pro'}.`, requiredTier);
      return;
    }

    // Check packet count gate for free users
    if (limits.maxPackets !== Infinity) {
      const count = await db.packets.count();
      if (count >= limits.maxPackets) {
        showUpgrade(`Free plan is limited to ${limits.maxPackets} proof packet. Upgrade to create unlimited packets.`, 'pro');
        return;
      }
    }

    setLocation(`/packets/new/${type}`);
  };

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
                .map(template => {
                  const requiredTier = tierRequiredForTemplate(template.type);
                  const locked = !!requiredTier;
                  return (
                    <button
                      key={template.type}
                      className="w-full text-left"
                      onClick={() => handleSelectType(template.type, template.name)}
                      data-testid={`button-template-${template.type}`}
                    >
                      <Card className={`transition-colors cursor-pointer shadow-xs ${locked ? 'border-muted opacity-75' : 'hover:border-primary/50 border-muted'}`}>
                        <CardContent className="flex items-start justify-between p-4">
                          <div className="space-y-1 pr-4">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{template.name}</h3>
                              {locked && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 ${requiredTier === 'business' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                                  <Lock className="w-2.5 h-2.5" />
                                  {requiredTier === 'business' ? 'Business' : 'Pro'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                          </div>
                          {locked ? <Lock className="w-4 h-4 mt-1 text-muted-foreground/50 shrink-0" /> : <ChevronRight className="w-5 h-5 mt-1 text-muted-foreground shrink-0" />}
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredTier={upgradeTier}
        reason={upgradeReason}
      />
    </div>
  );
}
