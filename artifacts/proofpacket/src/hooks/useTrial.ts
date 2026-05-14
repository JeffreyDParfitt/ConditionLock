import { useState, useEffect } from 'react';

export type Entitlement = 'none' | 'pro' | 'business';
export type TrialStatus = 'active' | 'expired';

// localStorage keys
const TRIAL_STARTED_KEY = 'pp_trial_started_at';
const TRIAL_ENDS_KEY   = 'pp_trial_ends_at';
const ENTITLEMENT_KEY  = 'pp_entitlement';
const SIM_EXPIRED_KEY  = 'pp_sim_expired'; // dev only

const CHANGE_EVENT = 'pp_trial_change';
const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/** Call once at startup — starts the trial if not already started. */
export function initTrial(): void {
  if (!localStorage.getItem(TRIAL_STARTED_KEY)) {
    const now = new Date().toISOString();
    const ends = new Date(Date.now() + TRIAL_DURATION_MS).toISOString();
    localStorage.setItem(TRIAL_STARTED_KEY, now);
    localStorage.setItem(TRIAL_ENDS_KEY, ends);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function getTrialState() {
  const entitlement = (localStorage.getItem(ENTITLEMENT_KEY) as Entitlement) || 'none';
  const simExpired   = localStorage.getItem(SIM_EXPIRED_KEY) === 'true';
  const trialStartedAt = localStorage.getItem(TRIAL_STARTED_KEY);
  const trialEndsAt    = localStorage.getItem(TRIAL_ENDS_KEY);

  let trialStatus: TrialStatus = 'active';
  let daysRemaining  = 0;
  let hoursRemaining = 0;

  if (trialEndsAt) {
    const now  = Date.now();
    const ends = new Date(trialEndsAt).getTime();
    if (simExpired || now >= ends) {
      trialStatus = 'expired';
    } else {
      const ms = ends - now;
      daysRemaining  = Math.floor(ms / (1000 * 60 * 60 * 24));
      hoursRemaining = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    }
  }

  const isLocked = trialStatus === 'expired' && entitlement === 'none';

  return {
    trialStartedAt,
    trialEndsAt,
    trialStatus,
    entitlement,
    daysRemaining,
    hoursRemaining,
    isLocked,
    isTrial: trialStatus === 'active' && entitlement === 'none',
  };
}

export function setEntitlement(e: Entitlement): void {
  localStorage.setItem(ENTITLEMENT_KEY, e);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Reset trial to a fresh 3-day window (dev only). */
export function resetTrial(): void {
  localStorage.removeItem(TRIAL_STARTED_KEY);
  localStorage.removeItem(TRIAL_ENDS_KEY);
  localStorage.removeItem(SIM_EXPIRED_KEY);
  initTrial();
}

/** Simulate the trial as expired right now (dev only). */
export function simulateTrialExpired(): void {
  localStorage.setItem(SIM_EXPIRED_KEY, 'true');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Clear dev simulation (dev only). */
export function clearSimulation(): void {
  localStorage.removeItem(SIM_EXPIRED_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useTrial() {
  const [state, setState] = useState(getTrialState);

  useEffect(() => {
    const handler = () => setState(getTrialState());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    // Refresh countdown every minute
    const interval = setInterval(() => setState(getTrialState()), 60_000);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  return state;
}
