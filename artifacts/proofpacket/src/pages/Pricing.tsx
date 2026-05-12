import { useLocation } from 'wouter';
import { useTier, setTier, TIER_LIMITS } from '@/hooks/useTier';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Check, Zap, Building2, Shield } from 'lucide-react';

const TIERS = [
  {
    key: 'free' as const,
    name: 'Free',
    price: '$0',
    period: '',
    icon: Shield,
    iconColor: 'text-slate-500',
    headerBg: 'bg-slate-50 dark:bg-slate-900',
    badge: null,
    btnVariant: 'outline' as const,
    btnLabel: 'Current plan',
    features: [
      '1 active proof packet',
      '15 original-quality photos',
      'Basic PDF export (watermarked)',
      'Car Rental, Hotel, Apartment / Home, Custom templates',
      'Local-only storage',
      'Checklist with all status types',
      'Add More Items during inspection',
      'Communication log',
    ],
    notIncluded: [
      'Unlimited packets',
      'Signatures',
      'JSON backup / restore',
      'Sale & business templates',
    ],
  },
  {
    key: 'pro' as const,
    name: 'ProofPacket Pro',
    price: '$14.99',
    period: 'one-time',
    icon: Zap,
    iconColor: 'text-blue-600',
    headerBg: 'bg-blue-50 dark:bg-blue-950/40',
    badge: 'Most Popular',
    btnVariant: 'default' as const,
    btnLabel: 'Upgrade to Pro',
    features: [
      'Unlimited proof packets',
      'Unlimited original-quality photos',
      'PDF export with no watermark',
      'Acknowledgment signatures',
      'JSON backup & restore',
      'Airbnb / Short-Term Rental template',
      'Property Sale / Home Sale template',
      'Vehicle Sale / As-Is Transfer template',
      'Moving / Storage template',
      'Accident / Insurance Claim template',
      'General Item Sale / As-Is Transfer template',
      'Equipment Rental template',
      'All deep checklists',
    ],
    notIncluded: [
      'Business & commercial templates',
      'ZIP photo export',
    ],
  },
  {
    key: 'business' as const,
    name: 'Business Pro',
    price: '$39.99',
    period: 'one-time',
    icon: Building2,
    iconColor: 'text-indigo-700',
    headerBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badge: 'Best for Business',
    btnVariant: 'default' as const,
    btnLabel: 'Upgrade to Business Pro',
    features: [
      'Everything in Pro',
      'Business / Commercial Lease template',
      'Business Changeover / As-Is Sale template',
      'Equipment Sale / As-Is Transfer template',
      'Commercial kitchen checklist',
      'Office / retail / warehouse / workshop checklists',
      'Asset inventory with included / excluded tracking',
      'Serial & model number fields',
      'Keys & access card tracking',
      'POS & electronics checklist',
      'ZIP export of original-quality photos',
      'Business-specific PDF titles & disclaimers',
    ],
    notIncluded: [],
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { tier } = useTier();

  const handleUpgrade = (targetTier: 'free' | 'pro' | 'business') => {
    if (targetTier === 'free') return;
    // Payments not yet implemented — simulate unlock
    setTier(targetTier);
    setLocation('/settings');
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-4 pb-28 space-y-6">
      <header className="space-y-1">
        <button
          onClick={() => setLocation(-1 as any)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          data-testid="button-back-pricing"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Plans & Pricing</h1>
        <p className="text-sm text-muted-foreground">
          All plans store data locally. No account. No cloud. No server.
        </p>
      </header>

      <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        Payments are not yet enabled. Use the developer toggles in Settings to simulate a tier unlock and explore Pro or Business features.
      </div>

      <div className="space-y-4">
        {TIERS.map((t) => {
          const Icon = t.icon;
          const isCurrentTier = tier === t.key;
          const isDowngrade = (t.key === 'free' && tier !== 'free') || (t.key === 'pro' && tier === 'business');

          return (
            <Card
              key={t.key}
              className={`overflow-hidden shadow-xs transition-all ${isCurrentTier ? 'ring-2 ring-primary' : 'border-muted'}`}
            >
              <div className={`${t.headerBg} px-4 pt-4 pb-3 border-b`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${t.iconColor}`} />
                    <span className="font-semibold">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrentTier && (
                      <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Current
                      </span>
                    )}
                    {t.badge && !isCurrentTier && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${t.key === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'}`}>
                        {t.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{t.price}</span>
                  {t.period && <span className="text-sm text-muted-foreground">{t.period}</span>}
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <ul className="space-y-2">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {t.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                      <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-muted-foreground/40">—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrentTier && !isDowngrade && (
                  <Button
                    className={`w-full h-11 ${t.key === 'business' ? 'bg-indigo-700 hover:bg-indigo-800 text-white' : ''}`}
                    variant={t.key === 'free' ? 'outline' : 'default'}
                    onClick={() => handleUpgrade(t.key)}
                    data-testid={`button-upgrade-${t.key}`}
                  >
                    {t.btnLabel}
                  </Button>
                )}
                {isCurrentTier && (
                  <div className="text-center text-sm text-muted-foreground py-1 font-medium">
                    You are on this plan
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center space-y-2 pt-2">
        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
          ProofPacket is an organization and documentation tool. Pricing subject to change before launch. No payment is required now.
        </p>
      </div>
    </div>
  );
}
