import { useState, useEffect } from 'react';

export type UsageIntent = 'personal' | 'business' | 'unsure';

const COMPLETED_KEY  = 'cl_onboarding_completed';
const INTENT_KEY     = 'cl_usage_intent';
const COMPLETED_AT_KEY = 'cl_onboarding_completed_at';
const CHANGE_EVENT   = 'cl_onboarding_change';

export interface OnboardingState {
  completed: boolean;
  usageIntent: UsageIntent | null;
  completedAt: string | null;
}

export function getOnboardingState(): OnboardingState {
  return {
    completed:    localStorage.getItem(COMPLETED_KEY) === 'true',
    usageIntent:  (localStorage.getItem(INTENT_KEY) as UsageIntent | null) || null,
    completedAt:  localStorage.getItem(COMPLETED_AT_KEY),
  };
}

export function completeOnboarding(intent: UsageIntent): void {
  localStorage.setItem(COMPLETED_KEY, 'true');
  localStorage.setItem(INTENT_KEY, intent);
  localStorage.setItem(COMPLETED_AT_KEY, new Date().toISOString());
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setUsageIntent(intent: UsageIntent): void {
  localStorage.setItem(INTENT_KEY, intent);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function resetOnboarding(): void {
  localStorage.removeItem(COMPLETED_KEY);
  localStorage.removeItem(INTENT_KEY);
  localStorage.removeItem(COMPLETED_AT_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useOnboarding() {
  const [state, setState] = useState(getOnboardingState);

  useEffect(() => {
    const handler = () => setState(getOnboardingState());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return state;
}
