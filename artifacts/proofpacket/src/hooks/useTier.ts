import { useState, useEffect } from 'react';

export type Tier = 'free' | 'pro' | 'business';

const STORAGE_KEY = 'pp_tier_sim';
const CHANGE_EVENT = 'pp_tier_change';

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

export const TIER_LIMITS = {
  free: {
    maxPackets: 1,
    maxPhotosPerPacket: 15,
    watermarkedPdf: true,
    hasSignatures: false,
    hasJsonBackup: false,
    hasZipExport: false,
    templates: FREE_TEMPLATES,
    label: 'Free',
    price: '$0',
  },
  pro: {
    maxPackets: Infinity,
    maxPhotosPerPacket: Infinity,
    watermarkedPdf: false,
    hasSignatures: true,
    hasJsonBackup: true,
    hasZipExport: false,
    templates: PRO_TEMPLATES,
    label: 'Pro',
    price: '$14.99',
  },
  business: {
    maxPackets: Infinity,
    maxPhotosPerPacket: Infinity,
    watermarkedPdf: false,
    hasSignatures: true,
    hasJsonBackup: true,
    hasZipExport: true,
    templates: BUSINESS_TEMPLATES,
    label: 'Business Pro',
    price: '$39.99',
  },
} as const;

export function getRequiredTierForTemplate(type: string): 'free' | 'pro' | 'business' {
  if (FREE_TEMPLATES.includes(type)) return 'free';
  if (PRO_TEMPLATES.includes(type)) return 'pro';
  return 'business';
}

export function getTier(): Tier {
  return (localStorage.getItem(STORAGE_KEY) as Tier) ?? 'free';
}

export function setTier(tier: Tier): void {
  localStorage.setItem(STORAGE_KEY, tier);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useTier() {
  const [tier, setTierState] = useState<Tier>(getTier);

  useEffect(() => {
    const handler = () => setTierState(getTier());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const limits = TIER_LIMITS[tier];

  function canUseTemplate(type: string): boolean {
    return limits.templates.includes(type);
  }

  function tierRequiredForTemplate(type: string): 'pro' | 'business' | null {
    const required = getRequiredTierForTemplate(type);
    if (required === 'free') return null;
    if (tier === 'free' && required === 'pro') return 'pro';
    if (tier === 'free' && required === 'business') return 'business';
    if (tier === 'pro' && required === 'business') return 'business';
    return null;
  }

  return { tier, limits, canUseTemplate, tierRequiredForTemplate };
}
