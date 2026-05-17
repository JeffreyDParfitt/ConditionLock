import { useLocation } from 'wouter';
import { useTier } from '@/hooks/useTier';
import { useTrial, setEntitlement } from '@/hooks/useTrial';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Check, Zap, Building2, Shield, Clock, RotateCcw, Archive } from 'lucide-react';

const PRO_FEATURES = [
  'Unlimited packets & original-quality photos',
  'PDF Condition Report export',
  'Verified Record export (SHA-256 manifest)',
  'Full Packet Archive export & import',
  'Receiver-side Verify Packet mode',
  'Acknowledgment signatures',
  'JSON backup & restore',
  'Rental Car — personal, business travel, military, govt, contractor',
  'Moving Truck / Van & Cargo Van Packet',
  'Trailer / Tow Equipment Packet',
  'Custom Rental Vehicle Packet',
  'Hotel Stay Packet',
  'Airbnb / Short-Term Rental Packet',
  'Apartment / Home Rental Packet',
  'Personal Vehicle Sale / As-Is Transfer',
  'Property Sale / Home Sale Packet',
  'Accident / Insurance Claim Packet',
  'Military / Government Travel personal documentation',
  'Moving / Storage & Equipment Rental',
  'All deep checklists (kitchen, bathroom, flip/lift/look under)',
  'Before / After / Pickup / Return / Sale / Transfer phases',
  'Custom packet type',
];

const BUSINESS_EXTRAS = [
  'Company Vehicle Handoff',
  'Fleet Vehicle Handoff & Employee Vehicle Assignment',
  'Business / Commercial Lease template',
  'Business Changeover / As-Is Sale template',
  'Equipment Rental & Equipment Sale for commercial use',
  'Commercial kitchen, office, retail, warehouse, workshop checklists',
  'Asset inventory with included / excluded tracking',
  'Serial & model number fields, keys & access card tracking',
  'Buyer / seller / tenant / landlord business signature roles',
  'Business-specific PDF titles & disclaimers',
  'ZIP export of original-quality photos',
  'Save verification results locally',
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { tier, entitlement } = useTier();
  const trial = useTrial();

  const handleUpgrade = (target: 'pro' | 'business') => {
    // TODO (production): Replace with RevenueCat / App Store / Google Play purchase flow.
    // iOS products:     com.conditionlock.app.pro / com.conditionlock.app.business
    // Android products: conditionlock_pro / conditionlock_business
    setEntitlement(target);
    setLocation('/');
  };

  const handleRestore = () => {
    // TODO (production): Replace with RevenueCat Purchases.restorePurchases() call.
    alert(
      'Restore Purchase\n\n' +
      'In the published app, this button restores your purchase through your App Store or Google Play account.\n\n' +
      'iOS: Same Apple ID used for the original purchase.\n' +
      'Android: Same Google account used for the original purchase.\n\n' +
      'Cross-platform transfers (iOS ↔ Android) are not supported by the app stores.'
    );
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
          All data is stored locally on your device. No account. No cloud. No server.
        </p>
      </header>

      <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        Payments are not yet enabled. Use the Developer Tools in Settings to simulate an unlock.
      </div>

      {/* Trial status */}
      {trial.isTrial && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="w-6 h-6 text-green-700 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                {trial.daysRemaining > 0
                  ? `Trial active — ${trial.daysRemaining} day${trial.daysRemaining !== 1 ? 's' : ''} remaining`
                  : 'Trial ends today'}
              </p>
              <p className="text-xs text-green-700/80 dark:text-green-400/80 mt-0.5">
                Full access to all ConditionLock features during your trial.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade note — shown when user has Pro */}
      {entitlement === 'pro' && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          ConditionLock Pro is active. Upgrade to Business Pro and pay only the difference — $25.00.
        </div>
      )}

      <div className="space-y-4">
        {/* ConditionLock Pro */}
        <Card className={`overflow-hidden shadow-xs transition-all ${entitlement === 'pro' ? 'ring-2 ring-blue-500' : 'border-muted'}`}>
          <div className="bg-blue-50 dark:bg-blue-950/40 px-4 pt-4 pb-3 border-b border-blue-100 dark:border-blue-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">ConditionLock Pro</span>
              </div>
              <div className="flex items-center gap-2">
                {entitlement === 'pro' && (
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">Active</span>
                )}
                {entitlement !== 'pro' && entitlement !== 'business' && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase">Most Popular</span>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">$14.99</span>
              <span className="text-sm text-muted-foreground">one-time</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">For individuals, solo travelers, business travelers, military/government travelers, and contractors documenting rentals, returns, stays, claims, sales, and personal handoffs.</p>
          </div>
          <CardContent className="p-4 space-y-4">
            <ul className="space-y-2">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {entitlement === 'none' && (
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleUpgrade('pro')} data-testid="button-upgrade-pro">
                Upgrade to ConditionLock Pro — $14.99
              </Button>
            )}
            {entitlement === 'pro' && (
              <div className="text-center text-sm text-blue-700 dark:text-blue-400 font-medium py-1">✓ ConditionLock Pro active</div>
            )}
            {entitlement === 'business' && (
              <div className="text-center text-sm text-muted-foreground py-1">Included in Business Pro</div>
            )}
          </CardContent>
        </Card>

        {/* Business Pro */}
        <Card className={`overflow-hidden shadow-xs transition-all ${entitlement === 'business' ? 'ring-2 ring-indigo-500' : 'border-muted'}`}>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 px-4 pt-4 pb-3 border-b border-indigo-100 dark:border-indigo-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-700" />
                <span className="font-semibold">ConditionLock Business Pro</span>
              </div>
              <div className="flex items-center gap-2">
                {entitlement === 'business' && (
                  <span className="text-[10px] font-bold bg-indigo-700 text-white px-2 py-0.5 rounded-full uppercase">Active</span>
                )}
                {entitlement !== 'business' && (
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase">Best for Business</span>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              {entitlement === 'pro' ? (
                <>
                  <span className="text-2xl font-bold">$25.00</span>
                  <span className="text-sm text-muted-foreground">upgrade from Pro</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold">$39.99</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </>
              )}
            </div>
            {entitlement === 'none' && (
              <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1 font-medium">Upgrade from Pro: $25.00</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">For companies, teams, fleets, commercial spaces, equipment handoffs, business changeovers, supervisor workflows, advanced exports, and business-specific records.</p>
          </div>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Everything in Pro, plus:</p>
            <ul className="space-y-2">
              {BUSINESS_EXTRAS.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {entitlement === 'none' && (
              <Button className="w-full h-11 bg-indigo-700 hover:bg-indigo-800 text-white" onClick={() => handleUpgrade('business')} data-testid="button-upgrade-business">
                Upgrade to Business Pro — $39.99
              </Button>
            )}
            {entitlement === 'pro' && (
              <Button className="w-full h-11 bg-indigo-700 hover:bg-indigo-800 text-white" onClick={() => handleUpgrade('business')} data-testid="button-upgrade-business-from-pro">
                Upgrade to Business Pro — $25.00
              </Button>
            )}
            {entitlement === 'business' && (
              <div className="text-center text-sm text-indigo-700 dark:text-indigo-400 font-medium py-1">✓ Business Pro active</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Explanatory copy — plan guidance */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4 space-y-2.5 text-[11px] text-muted-foreground leading-relaxed">
          <p>
            <span className="font-medium text-foreground">Rental vehicles and Pro: </span>
            Rental vehicle packets (car, moving truck, cargo van, trailer) can be used for personal trips, business travel, government travel, contractor travel, company-paid rentals, or military travel. All of these work with ConditionLock Pro.
          </p>
          <p>
            <span className="font-medium text-foreground">Business Pro is for: </span>
            Company/team workflows, fleet vehicle handoffs, commercial leases, equipment transfers, business changeovers, supervisor review, advanced exports, and business-specific roles.
          </p>
          <p>
            <span className="font-medium text-foreground">Not sure? </span>
            Start with Pro. You can upgrade to Business Pro later and pay only the difference — $25.00.
          </p>
          <p>Personal vs. business context helps tailor templates and export language. It does not automatically change your plan.</p>
        </CardContent>
      </Card>

      {/* Pro-to-Business upgrade note */}
      {entitlement === 'none' && (
        <p className="text-xs text-center text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Already have ConditionLock Pro? Upgrade to Business Pro later and pay only the difference — $25.00.
        </p>
      )}

      {/* Restore & portability */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full h-11" onClick={handleRestore}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restore Purchase
        </Button>
      </div>

      {/* Platform purchase language */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
              <p>Purchases are handled by the app store on the device platform you use.</p>
              <p>Purchases are tied to the app store account and platform used for purchase. An iOS purchase can be restored on supported Apple devices using the same Apple ID. An Android purchase can be restored on supported Android devices using the same Google account.</p>
              <p>If you switch from iOS to Android, or Android to iOS, the app stores do not automatically transfer purchases across platforms. A new purchase may be required on the new platform.</p>
            </div>
          </div>
          <div className="flex gap-2 pt-1 border-t border-muted">
            <Archive className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">Moving phones?</p>
              <p>Export a Full Packet Archive to move packets to another phone, computer, email, iCloud Drive, Google Drive, Dropbox, USB, or external drive. Import it into ConditionLock on the new device.</p>
              <p>Export/import transfers your packet files and original-quality photos. It does not transfer app store purchase entitlements between Apple and Google.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground leading-relaxed max-w-sm mx-auto">
        Purchases are platform-based and tied to the app store account used for purchase.
      </p>

      <p className="text-xs text-center text-muted-foreground leading-relaxed max-w-sm mx-auto">
        ConditionLock runs on your device. Your records, original-quality photos, hashes, verification results, and archives are not uploaded to ConditionLock servers because ConditionLock does not use servers.
      </p>
    </div>
  );
}
