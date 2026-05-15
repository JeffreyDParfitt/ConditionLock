import { useLocation } from 'wouter';
import { Shield, Zap, Building2, RotateCcw, Archive, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { setEntitlement } from '@/hooks/useTrial';

export function TrialLockScreen() {
  const [, setLocation] = useLocation();

  const handleUpgrade = (tier: 'pro' | 'business') => {
    // TODO (production): Replace with RevenueCat / App Store / Google Play purchase flow.
    // iOS products:     com.conditionlock.app.pro / com.conditionlock.app.business
    // Android products: conditionlock_pro / conditionlock_business
    setEntitlement(tier);
  };

  const handleRestore = () => {
    // TODO (production): Replace with RevenueCat Purchases.restorePurchases() call.
    alert(
      'Restore Purchase\n\n' +
      'In the published app, this will restore your purchase using your App Store or Google Play account.\n\n' +
      'iOS: Use the same Apple ID that made the original purchase.\n' +
      'Android: Use the same Google account that made the original purchase.\n\n' +
      'Cross-platform transfers (iOS ↔ Android) are not supported by app stores.'
    );
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-10 pb-24 space-y-6">
      <div className="flex flex-col items-center text-center space-y-3 pt-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-9 h-9 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Your 3-day ConditionLock trial has ended</h1>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Choose ConditionLock Pro or Business Pro to continue creating, editing, verifying, exporting, and restoring packets.
        </p>
      </div>

      <div className="space-y-3">
        {/* Pro */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">ConditionLock Pro</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase">Most Popular</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">$14.99</div>
                <div className="text-xs text-muted-foreground">one-time</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              Car Rental, Hotel, Airbnb, Apartment, Property Sale, Vehicle Sale, Moving, Accident Claim, and more. Unlimited packets, signatures, verified exports, archive ZIP.
            </p>
            <Button
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleUpgrade('pro')}
              data-testid="button-upgrade-pro-lock"
            >
              Upgrade to ConditionLock Pro — $14.99
            </Button>
          </CardContent>
        </Card>

        {/* Business Pro */}
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-700" />
                <span className="font-semibold">Business Pro</span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase">Best for Business</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">$39.99</div>
                <div className="text-xs text-muted-foreground">one-time</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              Everything in Pro plus Business / Commercial Lease, Business Changeover, Equipment Rental &amp; Sale, commercial checklists, asset inventory, and more.
            </p>
            <Button
              className="w-full h-11 bg-indigo-700 hover:bg-indigo-800 text-white"
              onClick={() => handleUpgrade('business')}
              data-testid="button-upgrade-business-lock"
            >
              Upgrade to Business Pro — $39.99
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Button variant="outline" className="w-full h-11" onClick={handleRestore}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restore Purchase
        </Button>

        <Button variant="ghost" className="w-full h-11 text-muted-foreground" onClick={() => setLocation('/pricing')}>
          <Info className="w-4 h-4 mr-2" />
          Learn About Plans &amp; Pricing
        </Button>
      </div>

      {/* Data portability */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4 flex gap-3">
          <Archive className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium">Your packet data stays local</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Export a Full Packet Archive to move packets to another phone, computer, email, or cloud drive. Archives can be imported back into ConditionLock later. Go to <strong>Settings</strong> to export your data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform purchase note */}
      <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-2">
        Purchases are handled by the app store on your device platform. Purchases are tied to the app store account and platform used for purchase. Packet archives can move between iOS and Android — app store purchases generally cannot.
      </p>

      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mx-auto" onClick={() => setLocation('/settings')}>
        Go to Settings
      </Button>
    </div>
  );
}
