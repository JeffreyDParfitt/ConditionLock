import { useState } from 'react';
import { completeOnboarding, type UsageIntent } from '@/hooks/useOnboarding';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Building2, HelpCircle, ChevronRight, Shield } from 'lucide-react';

interface Option {
  intent: UsageIntent;
  icon: typeof Car;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  borderColor: string;
  selectedBorder: string;
}

const OPTIONS: Option[] = [
  {
    intent: 'personal',
    icon: Car,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Personal / Solo Use',
    description: 'Rental cars, moving trucks, hotels, Airbnbs, apartments, personal sales, travel documentation, and personal proof records.',
    borderColor: 'border-muted',
    selectedBorder: 'border-primary ring-2 ring-primary/20',
  },
  {
    intent: 'business',
    icon: Building2,
    iconColor: 'text-indigo-700',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    title: 'Business / Team Use',
    description: 'Company vehicles, employee handoffs, equipment transfers, commercial leases, business changeovers, fleet records, and business proof records.',
    borderColor: 'border-muted',
    selectedBorder: 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800',
  },
  {
    intent: 'unsure',
    icon: HelpCircle,
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-muted',
    title: "Not Sure Yet",
    description: 'Start with common personal templates. You can switch or upgrade later.',
    borderColor: 'border-muted',
    selectedBorder: 'border-muted-foreground/40 ring-2 ring-muted-foreground/10',
  },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<UsageIntent | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    completeOnboarding(selected);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-10 pb-12 space-y-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 text-center">
        <img src="/logo.png" alt="ConditionLock" className="h-9 w-auto" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight mt-3">
            What are you using ConditionLock for?
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
            This helps tailor templates and wording. You can change this later in Settings.
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.intent;
          return (
            <button
              key={opt.intent}
              className="w-full text-left"
              onClick={() => setSelected(opt.intent)}
            >
              <Card className={`cursor-pointer transition-all ${isSelected ? opt.selectedBorder : opt.borderColor + ' hover:border-muted-foreground/30'}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${opt.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-6 h-6 ${opt.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base leading-tight">{opt.title}</div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/40'}`} />
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-[11px] text-center text-muted-foreground leading-relaxed max-w-xs mx-auto">
        Personal vs. business context helps tailor templates and export language. It does not automatically change your plan.
      </p>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full h-14 text-base"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>

      {/* Privacy note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        No account. No cloud. Your data stays on this device.
      </div>
    </div>
  );
}
