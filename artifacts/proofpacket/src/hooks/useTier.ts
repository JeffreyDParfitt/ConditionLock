/**
 * useTier — derives the active feature set from trial + entitlement state.
 *
 * During trial:       full Business-level access
 * Entitlement 'pro':  Pro-level access
 * Entitlement 'business': Business-level access
 * Locked (trial expired, no entitlement): minimal access — lock screen gates all actions
 *
 * TODO (production): Replace setEntitlement() calls with RevenueCat / App Store / Google Play
 * purchase verification. Product IDs:
 *   iOS:     com.proofpacket.app.pro / com.proofpacket.app.business
 *   Android: proofpacket_pro / proofpacket_business
 */
import { useTrial, getTrialState, setEntitlement } from './useTrial';
export type { Entitlement } from './useTrial';

export type Tier = 'trial' | 'pro' | 'business' | 'locked';

export const FREE_TEMPLATES = ['car_rental', 'hotel', 'apartment_home', 'custom'];
export const PRO_TEMPLATES = [
  ...FREE_TEMPLATES,
  'airbnb', 'property_sale_home_sale', 'vehicle_sale_as_is_transfer',
  'moving_storage', 'accident_claim', 'general_item_sale_as_is_transfer',
  'equipment_rental',
];
export const BUSINESS_TEMPLATES = [
  ...PRO_TEMPLATES,
  'business_commercial_lease', 'business_changeover_as_is_sale', 'equipment_sale_as_is_transfer',
];

const ALL_FEATURES = {
  maxPackets: Infinity,
  maxPhotosPerPacket: Infinity,
  watermarkedPdf: false,
  hasSignatures: true,
  hasJsonBackup: true,
  hasVerifiedExport: true,
  hasArchiveExport: true,
  hasZipExport: true,
  hasSavedVerifications: true,
};

export const TIER_LIMITS = {
  trial: {
    ...ALL_FEATURES,
    templates: BUSINESS_TEMPLATES,
    label: 'Trial',
    price: '$0 for 3 days',
  },
  pro: {
    maxPackets: Infinity,
    maxPhotosPerPacket: Infinity,
    watermarkedPdf: false,
    hasSignatures: true,
    hasJsonBackup: true,
    hasVerifiedExport: true,
    hasArchiveExport: true,
    hasZipExport: false,
    hasSavedVerifications: false,
    templates: PRO_TEMPLATES,
    label: 'Pro',
    price: '$14.99',
  },
  business: {
    ...ALL_FEATURES,
    templates: BUSINESS_TEMPLATES,
    label: 'Business Pro',
    price: '$39.99',
  },
  locked: {
    maxPackets: 0,
    maxPhotosPerPacket: 0,
    watermarkedPdf: true,
    hasSignatures: false,
    hasJsonBackup: false,
    hasVerifiedExport: false,
    hasArchiveExport: false,
    hasZipExport: false,
    hasSavedVerifications: false,
    templates: [] as string[],
    label: 'Trial Expired',
    price: '',
  },
} as const;

export function getRequiredTierForTemplate(type: string): 'trial' | 'pro' | 'business' {
  if (PRO_TEMPLATES.includes(type)) return 'pro';
  if (BUSINESS_TEMPLATES.includes(type)) return 'business';
  return 'pro';
}

/** Kept for backward-compat with any remaining call sites. */
export function setTier(tier: 'free' | 'pro' | 'business'): void {
  const e = tier === 'free' ? 'none' : tier;
  setEntitlement(e as any);
}

export function getTier(): Tier {
  const s = getTrialState();
  if (s.isLocked) return 'locked';
  if (s.entitlement === 'business') return 'business';
  if (s.entitlement === 'pro') return 'pro';
  return 'trial'; // active trial OR no entitlement but trial still running
}

export function useTier() {
  const trial = useTrial();

  let tier: Tier;
  if (trial.isLocked) tier = 'locked';
  else if (trial.entitlement === 'business') tier = 'business';
  else if (trial.entitlement === 'pro') tier = 'pro';
  else tier = 'trial';

  const limits = TIER_LIMITS[tier];

  function canUseTemplate(type: string): boolean {
    return (limits.templates as string[]).includes(type);
  }

  function tierRequiredForTemplate(type: string): 'pro' | 'business' | null {
    if ((TIER_LIMITS.pro.templates as string[]).includes(type)) {
      if (tier === 'locked') return 'pro';
      return null; // pro and above can use it
    }
    if ((BUSINESS_TEMPLATES as string[]).includes(type)) {
      if (tier === 'pro') return 'business';
      if (tier === 'locked') return 'business';
      return null;
    }
    return null;
  }

  return {
    tier,
    limits,
    isLocked: trial.isLocked,
    isTrial: trial.isTrial,
    trialDaysRemaining: trial.daysRemaining,
    trialHoursRemaining: trial.hoursRemaining,
    trialStatus: trial.trialStatus,
    entitlement: trial.entitlement,
    canUseTemplate,
    tierRequiredForTemplate,
  };
}
