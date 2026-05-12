# ProofPacket — App Store Launch Guide

Everything you need to go from this Replit project to paid apps on Google Play and the Apple App Store, without owning a Mac.

---

## What This Costs (Before You Start)

| Item | Cost |
|---|---|
| Apple Developer Account | $99 / year |
| Google Play Developer Account | $25 one-time |
| Codemagic (iOS cloud builds) | ~$5–10 per build |
| GitHub account | Free |
| Android Studio | Free |

**Total to launch on both stores: ~$130–135**

---

## Overview of the Process

```
Replit code → GitHub → Build (Android Studio / Codemagic) → App Stores
```

Payments on mobile app stores work differently than the web:
- **Google Play** allows Stripe OR Google Play Billing
- **Apple App Store** requires Apple's own In-App Purchase system (no Stripe allowed for digital goods)
- Both stores take **30%** of each purchase

This guide covers Google Play Billing and Apple IAP — the required payment methods for each store.

---

## PHASE 1 — Push Your Code to GitHub

### Step 1: Create a GitHub account
Go to **github.com** and sign up for a free account.

### Step 2: Create a new repository
1. Click the **+** button → **New repository**
2. Name it: `proofpacket`
3. Set it to **Private** (recommended while in development)
4. Click **Create repository**

### Step 3: Connect Replit to GitHub
1. In Replit, click the **Git** icon in the left sidebar (looks like a branch)
2. Click **Connect to GitHub**
3. Authorize Replit to access your GitHub account
4. Select the `proofpacket` repository you just created
5. Click **Push** to upload all your code

Every time you make changes in Replit going forward, push again from the Git panel to keep GitHub up to date.

---

## PHASE 2 — Android (Google Play)

### Step 4: Install Android Studio
1. Go to **developer.android.com/studio**
2. Download and install Android Studio for Windows
3. During setup, accept all defaults and install the Android SDK

### Step 5: Install Node.js on your Windows PC
1. Go to **nodejs.org** and download the LTS version
2. Install it — this is needed to run the build commands

### Step 6: Clone and build the app on your PC
Open a terminal (Command Prompt or Windows Terminal) and run:

```bash
# Clone your code from GitHub
git clone https://github.com/YOUR_USERNAME/proofpacket.git
cd proofpacket

# Install dependencies
npm install -g pnpm
pnpm install

# Build the mobile version of the app
cd artifacts/proofpacket
pnpm build:mobile

# Initialize Capacitor Android project (first time only)
npx cap add android

# Sync the build into the Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 7: Set up your App ID in Android Studio
1. Android Studio will open with the project
2. In the left panel, find `app > manifests > AndroidManifest.xml`
3. Confirm the `applicationId` is `com.proofpacket.app` (or change it to match your brand)

### Step 8: Generate a signing key (do this once)
In Android Studio:
1. Go to **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle** (.aab — required for Play Store)
3. Click **Create new** under Key store path
4. Fill in the form — **save the keystore file and password somewhere safe, you need this forever**
5. Click **Next → Finish**
6. Your `.aab` file will be created in `app/release/`

### Step 9: Create a Google Play Developer account
1. Go to **play.google.com/console**
2. Sign in with a Google account
3. Pay the $25 one-time registration fee
4. Fill in your developer profile

### Step 10: Create the app listing on Google Play
1. Click **Create app**
2. Fill in: App name (ProofPacket), language, app or game (App), free or paid
3. Go to **Production → Create new release**
4. Upload the `.aab` file from Step 8
5. Fill in the release notes
6. Complete the content rating questionnaire
7. Set up pricing (free download, with in-app purchases)
8. Add screenshots, description, icon, and feature graphic
9. Submit for review (usually 1–3 days)

### Step 11: Set up Google Play Billing (payments)
To charge for Pro and Business upgrades on Android:
1. In the Play Console, go to **Monetize → Products → In-app products**
2. Create two products:
   - Product ID: `proofpacket_pro` — Price: $14.99 — Name: ProofPacket Pro
   - Product ID: `proofpacket_business` — Price: $39.99 — Name: ProofPacket Business Pro
3. In Replit, we'll need to integrate `@capacitor/google-play-billing` to wire up these purchases in the app code (this is a separate development step)

---

## PHASE 3 — iOS (App Store via Codemagic)

### Step 12: Create an Apple Developer account
1. Go to **developer.apple.com/account**
2. Sign in with your Apple ID (the one tied to your iPad works)
3. Enroll in the **Apple Developer Program** — $99/year
4. It may take up to 48 hours for Apple to approve your enrollment

### Step 13: Create the App ID and app record
1. In the Apple Developer portal, go to **Certificates, Identifiers & Profiles**
2. Click **Identifiers → +** to register a new App ID
3. Bundle ID: `com.proofpacket.app` (must match capacitor.config.ts)
4. Go to **App Store Connect** (appstoreconnect.apple.com)
5. Click **+** → **New App**
6. Fill in: Name (ProofPacket), Bundle ID (select from list), SKU (anything, e.g. `proofpacket001`)

### Step 14: Create a Codemagic account
1. Go to **codemagic.io** and sign up (free account)
2. Connect your GitHub account
3. Select your `proofpacket` repository

### Step 15: Configure Codemagic to build the iOS app
Codemagic will ask how to build your project. Select **React Native / Capacitor** workflow, then:
1. Build command: `cd artifacts/proofpacket && pnpm build:mobile && npx cap sync ios`
2. Set the Bundle ID to `com.proofpacket.app`
3. Connect your Apple Developer account under **Code signing**
4. Codemagic will handle generating the certificates and provisioning profiles automatically
5. Click **Start build**

The build takes about 15–20 minutes. When done, download the `.ipa` file or have Codemagic submit it directly to App Store Connect.

### Step 16: Submit to App Store review
1. In App Store Connect, your build will appear under **TestFlight** first
2. Test it on your iPad via TestFlight (Apple's beta testing app) — download TestFlight from the App Store
3. When ready, go to the **App Store** tab → create a new version
4. Add screenshots (required: iPhone 6.5", iPhone 5.5", iPad 12.9" sizes)
5. Write your description and keywords
6. Set pricing (free with in-app purchases)
7. Submit for review (usually 1–3 days)

### Step 17: Set up Apple In-App Purchases (payments)
To charge for Pro and Business upgrades on iOS:
1. In App Store Connect, go to **Features → In-App Purchases**
2. Click **+** and create:
   - Type: Non-Consumable (one-time purchase)
   - Reference Name: ProofPacket Pro | Product ID: `com.proofpacket.app.pro` | Price: $14.99
   - Reference Name: ProofPacket Business Pro | Product ID: `com.proofpacket.app.business` | Price: $39.99
3. In Replit, we'll integrate `@capacitor/purchases` or RevenueCat to wire these up in the app (separate development step)

---

## PHASE 4 — Payments: Wiring It All Together

### The smart approach: RevenueCat
Rather than building separate integrations for Apple IAP and Google Play Billing, use **RevenueCat** — it's a single SDK that handles both stores and gives you a dashboard showing all your revenue in one place.

1. Sign up at **revenuecat.com** (free up to $2,500/month revenue)
2. Create a project, connect your App Store and Play Store apps
3. Create "Entitlements": `pro` and `business`
4. Map them to your Apple and Google product IDs
5. In Replit, install: `@revenuecat/purchases-capacitor`
6. Replace the current `useTier` localStorage simulation with RevenueCat purchase checks

This is the most important development step before launch — we can build this in Replit once you have your Apple and Google accounts set up.

---

## Recommended Launch Order

1. ✅ **Code is ready** (done — you're here)
2. ☐ Push to GitHub
3. ☐ Sign up for Google Play Developer ($25) — start here, Android is faster to review
4. ☐ Build Android app with Android Studio → submit to Google Play
5. ☐ Sign up for Apple Developer ($99) — takes up to 48 hours to activate
6. ☐ Sign up for RevenueCat (free)
7. ☐ Add RevenueCat payment integration in Replit
8. ☐ Build iOS app with Codemagic → submit to App Store
9. ☐ Launch 🚀

---

## Quick Reference — Key Accounts to Create

| Service | URL | Cost |
|---|---|---|
| GitHub | github.com | Free |
| Google Play Console | play.google.com/console | $25 |
| Apple Developer | developer.apple.com | $99/yr |
| Codemagic | codemagic.io | Pay per build |
| RevenueCat | revenuecat.com | Free to start |

---

## What to Build Next in Replit

Once you have your developer accounts, come back and ask to:
- **"Add RevenueCat payments"** — replaces the simulated tier toggles with real purchases
- **"Add app icons and splash screen"** — required for store submission
- **"Add onboarding flow"** — helps new users understand the app (improves store ratings)
