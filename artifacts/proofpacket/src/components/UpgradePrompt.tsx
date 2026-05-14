import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Building2 } from 'lucide-react';

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  requiredTier: 'pro' | 'business';
  reason: string;
}

const TIER_DETAILS = {
  pro: {
    name: 'ProofPacket Pro',
    price: '$14.99',
    period: 'one-time',
    icon: Zap,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    perks: [
      'Unlimited proof packets & photos',
      'PDF export, verified packet export',
      'Full Packet Archive export & import',
      'Acknowledgment signatures',
      'JSON backup & restore',
      'Airbnb, Property Sale, Vehicle Sale, Moving, Accident Claim, and more',
      'All deep checklists',
    ],
  },
  business: {
    name: 'Business Pro',
    price: '$39.99',
    period: 'one-time',
    icon: Building2,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800',
    btnClass: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    perks: [
      'Everything in Pro',
      'Business / Commercial Lease template',
      'Business Changeover / As-Is Sale template',
      'Equipment Sale / As-Is Transfer template',
      'Commercial kitchen & warehouse checklists',
      'Asset inventory with serial/model tracking',
      'ZIP export of original-quality photos',
      'Save verification results locally',
    ],
  },
};

export function UpgradePrompt({ open, onClose, requiredTier, reason }: UpgradePromptProps) {
  const [, setLocation] = useLocation();
  const details = TIER_DETAILS[requiredTier];
  const Icon = details.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm w-[92vw] p-0 overflow-hidden">
        <div className={`${details.bg} ${details.border} border-b px-5 pt-5 pb-4`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${details.bg} border ${details.border}`}>
            <Lock className={`w-5 h-5 ${details.color}`} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold leading-snug">{reason}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Available in <span className={`font-semibold ${details.color}`}>{details.name}</span>
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{details.price}</span>
            <span className="text-sm text-muted-foreground">{details.period}</span>
          </div>

          <ul className="space-y-2">
            {details.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2 text-sm">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${details.color}`} />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>Not now</Button>
            <Button
              className={`flex-1 ${details.btnClass}`}
              onClick={() => { onClose(); setLocation('/pricing'); }}
            >
              See Plans
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            Payments not yet enabled. Use Developer Tools in Settings to simulate unlock for testing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
