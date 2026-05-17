# ConditionLock — AI Coding Agent Session Export

---

## 1. Project Overview

**Project name:** ConditionLock
**Original working name:** ProofPacket
**One-line description:** Verified condition records for physical handoffs, starting with rental vehicles.

**Current positioning:**
ConditionLock creates verified condition records for rentals, returns, sales, claims, and handoffs. The launch wedge is rental vehicles: rental cars, moving trucks/vans, cargo vans, trailers, car-sharing trips, company vehicles, and military/government travel documentation.

**Broader template system:**
The app also supports hotels, Airbnbs, apartments, commercial leases, business changeovers, property sales, equipment rentals/sales, insurance/accident documentation, and custom packets.

**Current MVP status:**
Local-first web/PWA MVP in active development. The app is not wrapped for iOS/Android yet. Mobile wrapping with Capacitor is planned. No backend. No accounts. No cloud runtime.

---

## 2. AI Tools Used

- **Replit Agent** — implementation inside the codebase: components, storage, types, PDF, exports, hashing, UI, routing, templates, pricing logic, camera, rename
- **ChatGPT** — product requirements, Replit prompts, feature design, debugging guidance, naming research, pricing model, YC positioning, app-store planning, launch strategy, disclaimer language
- **Gemini** — additional review and iteration support
- **GitHub** — version control; repository: https://github.com/JeffreyDParfitt/proofpacket.git
- **Replit Shell** — builds, typechecks, Git commits, pushes

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript 5.9 |
| Build | Vite + pnpm workspaces (monorepo) |
| Styling | Tailwind CSS + shadcn/ui |
| Local storage | Dexie v4 (IndexedDB) — no backend DB |
| Hashing | Web Crypto API — SHA-256, browser-native, no server |
| PDF export | jsPDF + jspdf-autotable |
| ZIP export | JSZip |
| Signatures | signature_pad |
| Animations | framer-motion |
| Icons | lucide-react |
| Routing | Wouter |
| Mobile (planned) | Capacitor wrapper for iOS/Android |
| Backend | None — fully local-first |

---

## 4. Development Philosophy and Constraints

These constraints were defined upfront and held throughout the session:

- MVP must run entirely locally on the user's device
- No backend server, no cloud storage, no Firebase, no Supabase, no AWS
- No user accounts or login
- No analytics or telemetry
- No server-side verification — all SHA-256 hashing runs in the browser via Web Crypto API
- Original-quality photos must be preserved at full resolution — no compression
- Verified evidence photos must be captured inside the app, not uploaded from the phone gallery, to reduce fraud opportunity
- Documents and receipts (PDFs, contracts) can be imported separately and are labeled as `source: 'imported_document'` in the manifest, distinct from `source: 'in_app_camera'`
- Receiver-side verification must run locally — no server round-trip
- Users must be able to export full archives and re-import to move packets between devices
- Future cloud backup and receiver download access are roadmap items, not MVP runtime requirements
- Cloud build services may be used later only to compile the iOS app package (since the founder does not own a Mac) — not for app runtime or user data

---

## 5. Reconstructed Prompt and Session Log

### Prompt 1 — Initial Product Build

**User prompt:**
> Build a mobile-first local-only web app called ProofPacket. The app should help people create timestamped proof-of-condition packets for rentals, stays, returns, handoffs, leases, claims, sales, as-is transfers, business changeovers, and disputes. No backend. No server database. No login. No accounts. No paid APIs. No cloud AI. Store everything locally. Use React, TypeScript, Tailwind, IndexedDB, and client-side PDF export.

**Implementation summary:**
- Created monorepo structure with pnpm workspaces
- Scaffolded React + Vite + Tailwind + TypeScript app
- Defined core data model: `Packet`, `ChecklistItem`, `PhotoItem`, `CommunicationLog`, `SignatureItem`, `AppSettings`
- Implemented Dexie v1 schema for IndexedDB storage
- Built page structure: Dashboard, New Packet, Packet Detail, Settings
- Implemented client-side PDF export with jsPDF
- Added mobile-first layout (max-w-lg, bottom nav, pb-24)

**Files created/changed:**
`src/types/index.ts`, `src/storage/db.ts`, `src/storage/actions.ts`, `src/pages/Dashboard.tsx`, `src/pages/NewPacket.tsx`, `src/pages/PacketDetail.tsx`, `src/pages/Settings.tsx`, `src/pdf/generator.ts`, `src/components/Navigation.tsx`

---

### Prompt 2 — Expand Templates Beyond Landlord/Tenant

**User prompt:**
> Add car rentals, insurance claims after an accident, hotel rentals, Airbnb, apartment/home rentals, business leasing spaces like offices and kitchens, business changeovers, property sale, car/home sale, and general as-is transfers.

**Implementation summary:**
- Expanded `PacketType` union to cover all major verticals
- Built template system (`src/templates/index.ts`) with full checklist sections per packet type
- Added template categories: Rental Vehicle, Lodging, Residential, Commercial, Sale/Transfer, Specialty
- Added template selector page (`src/pages/NewPacket.tsx`) with category grouping
- Each template defines sections and checklist items with phases (pickup/return/before/after/sale/transfer)

---

### Prompt 3 — Deep Inspection Requirements

**User prompt:**
> For apartment/home rentals/hotels, make sure to open cabinets and check the interior of items that can open/close. Check locks and hinges. Inside the toilet tank, etc. For cushions, flip them over.

**Implementation summary:**
- Added "Open and Inspect" checklist sections to hotel and apartment templates
- Added bathroom deep-check items (toilet tank interior, under-sink cabinet, grout/caulk, exhaust vent)
- Added kitchen deep-check items (inside oven, inside microwave, under burners, cabinet interiors)
- Added "Flip/Lift/Look Under" section for cushions, rugs, furniture feet
- Added lock and hinge inspection items for doors and windows

---

### Prompt 4 — Add More Items During Inspection

**User prompt:**
> There should be an option to select more items in the middle of an inspection just in case the user forgets and doesn't have to start over.

**Implementation summary:**
- Added "Add Custom Entry" flow within an active packet
- Added `addedDuringInspection: boolean` flag on `ChecklistItem`
- Custom entries appear immediately in the checklist without resetting progress
- Items labeled "Added during inspection" in PDF and exports
- Editable and deletable without affecting other checklist items

---

### Prompt 5 — Photo Storage Requirements

**User prompt:**
> The photos that are taken should not only be in the phone album. Store them inside the app so they don't accidentally get deleted. Not compressed. Same quality.

**Implementation summary:**
- Photos stored as raw `Blob` objects in IndexedDB via Dexie (`originalBlob` field)
- No compression or re-encoding applied to evidence photos
- Thumbnails generated separately for display performance (`thumbnailData: string` as base64 data URL)
- `fileSize`, `mimeType`, `dateTaken` metadata preserved
- SHA-256 hash computed at add time and stored with the photo record
- Original-quality blobs used for ZIP export, archive, and verified packet export

---

### Prompt 6 — Pricing and Trial

**User prompt:**
> NO FREE TIER. I want a 3-day free trial, then after three days, you must pay for Pro or Business. These prices are per device/platform/app store account. Purchases are platform-based and tied to the app store account used for purchase. Pro can upgrade to Business by paying only the difference.

**Implementation summary:**
- Removed free tier entirely
- Built `useTrial` hook: 3-day countdown from first app open, stored in `localStorage`
- Built `useTier` hook: derives active feature set from trial state + entitlement
- Tiers: `trial` (3-day full Business access) → `pro` ($14.99) → `business` ($39.99) → `locked` (expired, no purchase)
- Pro-to-Business upgrade: $25.00 difference price shown when Pro is active
- Entitlement stored in `localStorage` key `pp_entitlement_sim` for development simulation
- Developer toggle in Settings to simulate Pro/Business/expired
- Platform purchase language: purchases tied to app store account; iOS ↔ Android transfers not supported by app stores
- Archive export/import copy: packet data can move between platforms even when purchase entitlement cannot
- Production path: RevenueCat + App Store / Google Play; product IDs `com.conditionlock.app.pro` / `com.conditionlock.app.business`

---

### Prompt 7 — Photo Hashing and Receiver Verification

**User prompt:**
> Add some sort of hash to these high-quality photos so there can be a receiver side — property manager, etc. — so they also have proof of the documented findings. Sender/receiver should be on the same app, just have a selection option for what you want to be.

**Implementation summary:**
- Implemented SHA-256 hashing via browser Web Crypto API (`src/utils/crypto.ts`)
- Each photo's hash computed at capture/import time and stored on the `PhotoItem` record
- Added `buildManifest()` function: generates `VerificationManifest` JSON with per-photo hash entries
- Added manifest self-hash: the manifest JSON itself is hashed and the hash embedded in `manifestHash` field
- Added "Export Verified Record" flow: downloads `ConditionLock_[Title]_[Date]_Manifest.json`
- Added Verify Packet mode (same app, separate screen): receiver uploads manifest + photo files or a ZIP
- Receiver hash comparison runs entirely locally — no server
- Verification statuses: `verified` / `missing` / `mismatch` / `extra`
- Added HASH_DISCLAIMER: "Hash verification confirms whether the files being checked match the files recorded in this ConditionLock manifest. It does not prove who took the photos, where they were taken, whether the scene was staged, or whether the record has legal evidentiary value."

---

### Prompt 8 — Portable Archives and Restore

**User prompt:**
> Each side should be able to download these files to their PC in case they want to clear up space on their phones, and redownload to phones from email or cloud drives.

**Implementation summary:**
- Added Full Packet Archive export: JSZip ZIP containing `packet-data.json`, `verification-manifest.json`, `verification-summary.txt`, `checksums.txt`, `README.txt`, `DISCLAIMERS.txt`, original-quality photos, and optionally a PDF report
- Added Photos ZIP export (Business Pro feature): original-quality photos only
- Added archive import/restore flow: upload ZIP → extract → restore packet and photos to IndexedDB
- Duplicate detection on import: replace or keep both options
- JSON backup/restore: full data export with photos serialized as base64
- Archive filenames: `ConditionLock_[Title]_[Date]_Archive.zip`, `ConditionLock_[Title]_[Date]_Photos.zip`
- Storage management copy: export before deleting local copies

---

### Prompt 9 — Rental Vehicle Wedge

**User prompt:**
> Let's do rental cars first. And U-Haul. What about Avis or Budget? Also companies that require drivers to use company cars.

**Implementation summary:**
- Refocused Dashboard first-run experience around rental vehicles
- Added quick-start cards: Rental Car Packet, Moving Truck/Van Packet, Company Vehicle Handoff
- Built company/platform selector with grouped options:
  - **Rental Cars:** Avis, Budget, Enterprise, Hertz, National, Alamo, Sixt, Thrifty, Dollar, Fox
  - **Car-sharing:** Turo, Getaround, Zipcar
  - **Moving Trucks:** U-Haul, Penske, Budget Truck Rental, Enterprise Truck Rental, Ryder, Home Depot Truck Rental, Lowe's Truck Rental
  - **Always:** Local / Independent, Other (triggers free-text field)
- Added company affiliation disclaimer on all rental forms
- Added Company Vehicle Handoff packet type with fleet/employer checkout and return flows
- Added `RENTAL_VEHICLE_TYPES` constant and `isRentalVehicleType()` utility for tier logic

---

### Prompt 10 — Keep Broader Features

**User prompt:**
> Can I keep the other features we already added?

**Implementation summary:**
- Kept all broader packet types under "More Packet Types" section on Dashboard
- Rental vehicles remain the launch focus, not the only supported use case
- Hotel, Airbnb, apartment, business lease, business changeover, property sale, equipment sale/rental, insurance/accident, and custom workflows all preserved
- Tier gating: rental vehicle types available on Pro; business/commercial types gated to Business Pro

---

### Prompt 11 — Military and Government Travel Support

**User prompt:**
> This will be great for military personnel traveling as well. Add military/government travel, TDY/TAD, PCS, PPM, rental cars, moving trucks, lodging, receipts, and supporting documentation.

**Implementation summary:**
- Added travel type/context fields in the packet form: Military TDY/TAD, PCS move, Government travel, Contractor travel
- Added optional travel authorization, orders, and voucher reference fields
- Added PCS/PPM moving context fields
- Added Create Travel Documentation Summary export: auto-generated text block for reimbursement support
- Added disclaimers: no DoD/military/GSA affiliation; does not replace DTS, travel office guidance, JTR rules, finance office guidance, or official instructions
- Military/government names provided only to organize the record — ConditionLock has no integration with any government system

---

### Prompt 12 — Additional High-Value Features

**User prompt:**
> What else am I missing? Add required shot score, wide shot plus close-up damage pairing, reported-to-company field, return location proof, fuel/charging receipt capture, mileage calculator, dispute summary, activity history, storage estimate, documents/receipts, offline verifier if possible, app/template/manifest versions.

**Implementation summary:**
- **Required Shot Score** — tracks recommended photo angle coverage per packet *(partially implemented: coverage display implemented; scoring threshold partially specified)*
- **Damage Report Builder** — quick-add flow for damage with reported/not-reported flags and photo pairing *(implemented)*
- **Reported-to-Company field** — on checklist items; appears in dispute summary *(implemented)*
- **Return Location Proof** — photo section for return drop-off location *(implemented as checklist item)*
- **Fuel/Charging Documentation** — fuel gauge photo + charging receipt capture *(implemented as checklist items and receipt section)*
- **Mileage Calculator** — odometer at pickup vs. return, miles driven calculation *(specified/partially implemented in PDF)*
- **Create Dispute Summary** — auto-generated plain-text dispute letter block *(implemented)*
- **Activity History** — `ActivityLog` table in Dexie; all packet events timestamped *(implemented)*
- **Documents/Receipts** — attach PDFs, contracts, agreements; labeled as imported documents *(implemented)*
- **Offline verifier** — Verify Packet mode runs fully offline *(implemented)*
- **App/manifest versions** — manifest includes `manifestVersion: '1.0'` and `appName` *(implemented)*

---

### Prompt 13 — Flexible Custom Entries

**User prompt:**
> Also allow for custom entries in case something unexpected comes up.

**Implementation summary:**
- Added global "Add Custom Entry" option within any active packet
- Custom entry types: Custom Checklist Item, Custom Damage/Issue, Custom Photo Note, Custom Document/Receipt, Custom Area/Location, Custom Equipment/Accessory, Custom Person/Contact, Custom Communication Log, Custom Return/Handoff Note, Custom Travel/Reimbursement Note, Other/General Note
- Custom entries appear immediately; labeled "Added during inspection" in PDF and exports
- Included in PDFs, archives, manifests, dispute summaries, and travel summaries

---

### Prompt 14 — Multi-Select Statuses

**User prompt:**
> Users should be able to select multiple options, like dirty and damaged.

**Implementation summary:**
- Changed from single `status: ChecklistStatus` to `statuses?: string[]` array on `ChecklistItem`
- Maintained backward compatibility: `getEffectiveStatuses()` helper falls back to `[item.status]` for old records
- Added exclusive status logic: `not_applicable` and `not_checked` clear other selections
- Added priority ordering: issue statuses (damaged, missing, not_working) surface first for card color
- PDF and exports reflect all active statuses
- Examples: `['dirty', 'damaged']`, `['missing', 'reported']`, `['included', 'not_working']`

---

### Prompt 15 — In-App Camera Only

**User prompt:**
> Add photos must be taken with the app. Not the phone's camera app and photos are not able to be uploaded from the phone's gallery to prevent fraud.

**Implementation summary:**
- Replaced `<input capture="environment">` with custom `InAppCamera` component using `navigator.mediaDevices.getUserMedia()`
- `getUserMedia` + canvas capture: photo exists only as a Blob in memory and then IndexedDB — no OS camera roll copy on any platform
- Gallery import blocked for verified evidence photos: document import input restricted to PDF/doc/txt only; `image/*` excluded
- `appCaptured: true` and `source: 'in_app_camera'` metadata set on every in-app photo
- `verificationEligible: true` set on in-app captured photos; imported documents set to `verificationEligible: false`
- Receiver verification results show "Captured in ConditionLock" vs. "File matches original" labels accordingly
- Careful disclaimer wording: helps reduce fraud opportunity; does not fully prevent fraud; not legally certified

---

### Prompt 16 — Branding and Naming

**User prompt:**
> Search trademarks/databases for ProofPacket and ProofVault. Change the name because ProofPacket and ProofVault look crowded. I need a name that encompasses all templates. Search for ConditionLock.

**Implementation summary:**
- Found trademark concerns with ProofPacket/ProofVault from public searches
- Chose ConditionLock as the working name: covers all template verticals, positions the product as locking in a condition record
- Complete rename executed across all source files using bulk `sed` replacement
- IndexedDB name intentionally preserved as `ProofPacketDB` (changing the Dexie string opens a new database, orphaning existing user data)
- `VerificationManifest.appName` type set to `'ConditionLock' | 'ProofPacket'` union for backward compatibility with old exported manifests
- Updated: app title, PWA manifest, OG/Twitter tags, service worker cache name, tier names, export filenames, all disclaimer text, README, product positioning
- New tagline: *"Lock in the condition before there's a dispute."*
- Secondary: *"Verified records for rentals, returns, sales, claims, and handoffs."*

---

### Prompt 17 — Logo and Icon

**User prompt:**
> Now we need a logo for the web app and mobile icons. Don't make the icon logo yet. Okay, create the in-app logo and icon.

**Implementation summary:**
- App icon: folder + shield + lock mark; dark navy background with blue/teal gradient; rounded-corner square format suitable for iOS/Android/PWA home screen
- In-app logo: horizontal lockup — icon mark + "ConditionLock" wordmark in dark navy / teal; used in Dashboard header
- Both assets placed in `public/`: `icon-512.png` (PWA icon, favicon, Apple touch icon) and `logo.png` (in-app header)
- PWA manifest references `icon-512.png` at both 192×192 and 512×512

---

### Prompt 18 — GitHub, Build, and Deployment Debugging

**User prompt:**
> How do I push this to GitHub? Build failed because PORT was missing. Then BASE_PATH was missing. Help me push all updates.

**Implementation summary:**
- Build failed initially because `vite.config.ts` requires both `PORT` and `BASE_PATH` environment variables and throws explicit errors if either is absent
- Correct build command:
  ```bash
  PORT=3000 BASE_PATH=/ pnpm --filter "./artifacts/proofpacket" run build
  ```
- Sourcemap and chunk-size warnings appeared (jsPDF, JSZip, signature_pad bundle size) — non-blocking; did not fail the build
- Typecheck command used for validation without needing PORT/BASE_PATH:
  ```bash
  pnpm --filter @workspace/proofpacket run typecheck
  ```
- Git workflow:
  ```bash
  git status
  git add .
  git commit -m "Update ConditionLock MVP"
  git push
  ```
- One early error caused by typing `commit -m` without `git`; another by `git add` without `.` — both resolved
- GitHub repository: https://github.com/JeffreyDParfitt/proofpacket.git — pushes succeeded

---

### Prompt 19 — App Store and Mobile Wrapping

**User prompt:**
> Walk me through how to wrap this for iOS and Android. I do not own a Mac. I don't want any of this running from the cloud.

**Implementation summary:**
- Planned Capacitor wrapper: `capacitor.config.ts` already present in codebase with `webDir: 'dist/public'` and `androidScheme: 'https'`
- Android can be built locally or via cloud build service
- iOS requires a Mac or a cloud build service (Codemagic, EAS Build, GitHub Actions with macOS runner) — cloud build only compiles the app package; the installed app runs entirely locally
- Runtime stays local-first regardless of build method
- Future launch checklist: Apple Developer account, Google Play Console, RevenueCat for IAP, Codemagic for iOS builds without a Mac
- `cap:ios` and `cap:android` npm scripts already defined in `package.json`

---

### Prompt 20 — Future Cloud Backend Roadmap

**User prompt:**
> Eventually moving this to a cloud backend would be the goal. Store it locally and with backups with receiver download access.

**Implementation summary:**
- Current MVP remains fully local-first — no cloud dependency
- Future roadmap defined (not built):
  - Optional user accounts
  - Optional encrypted cloud backup (user-controlled)
  - Cross-device sync and restore via account
  - Receiver download links — share a verified record via URL instead of ZIP file transfer
  - Team/fleet accounts and shared packet access
  - Property/fleet/business integrations (Yardi, rental company APIs, fleet management systems)
  - B2B SaaS pricing for property managers, fleet operators, rental companies
- Design principle: local-first stays available; cloud is opt-in, not required

---

## 6. Current Product State

| Feature | Status |
|---|---|
| All packet types (rental vehicle, hotel, residential, commercial, sale, custom) | Implemented |
| Full checklist system with sections, phases, and status tracking | Implemented |
| Multi-select status tags | Implemented |
| Per-condition evidence cards with severity and inline notes | Implemented |
| In-app camera (no camera roll save, no gallery import for evidence) | Implemented |
| Original-quality photo storage in IndexedDB | Implemented |
| SHA-256 photo hashing via Web Crypto API | Implemented |
| Verification manifest generation (self-hashed) | Implemented |
| Export Verified Record (manifest JSON + summary TXT) | Implemented |
| Receiver-side Verify Packet mode (local hash comparison) | Implemented |
| Full Archive ZIP export and import/restore | Implemented |
| Photos ZIP export | Implemented |
| PDF Condition Report with evidence-by-condition section | Implemented |
| Dispute summary auto-generation | Implemented |
| Travel documentation summary | Implemented |
| Communication log | Implemented |
| Acknowledgment signatures (signature_pad) | Implemented |
| Documents/receipts import (labeled as imported documents) | Implemented |
| Activity history log | Implemented |
| 3-day trial + Pro + Business Pro entitlement system | Implemented (dev simulation) |
| JSON backup/restore | Implemented |
| Settings: data management, developer tools, storage info | Implemented |
| PWA manifest + service worker for home screen install | Implemented |
| ConditionLock branding (icon + wordmark) | Implemented |
| Real app-store purchases (RevenueCat) | Planned — not built |
| Capacitor iOS/Android wrapper | Planned — not built |
| Cloud backup / receiver download links | Future roadmap |
| B2B/fleet/property integrations | Future roadmap |
| Beta testers | Not yet — MVP in preparation |
| Revenue | Not yet |

---

## 7. Build Commands and Debugging

**Build command** (requires both env vars):
```bash
PORT=3000 BASE_PATH=/ pnpm --filter "./artifacts/proofpacket" run build
```

**Typecheck** (no env vars needed):
```bash
pnpm --filter @workspace/proofpacket run typecheck
# Full workspace:
pnpm run typecheck
```

**Git workflow:**
```bash
git status
git add .
git commit -m "Update ConditionLock MVP"
git push
```

**Build notes:**
- `PORT` is required — `vite.config.ts` throws an explicit error if absent
- `BASE_PATH` is required — also throws if absent
- Sourcemap and chunk-size warnings (jsPDF, JSZip, signature_pad) are non-blocking
- Typecheck passed cleanly at every milestone — no type errors introduced
- GitHub pushes succeeded: https://github.com/JeffreyDParfitt/proofpacket.git

**Key debugging decisions made during the session:**

1. **Dexie DB name preserved** — `super('ProofPacketDB')` was intentionally not renamed during the ConditionLock rebrand. Changing the Dexie string opens a new IndexedDB database, permanently orphaning all existing user data on their device.

2. **`getUserMedia` vs `<input capture>`** — iOS saves a copy of any photo taken through a file input to the camera roll at the OS level, behavior the app cannot prevent. Switching to `getUserMedia` + canvas avoids the OS save entirely.

3. **Backwards-compatible manifest type** — `VerificationManifest.appName` set to `'ConditionLock' | 'ProofPacket'` union so old manifests exported under the ProofPacket name still validate.

4. **`generatePDFBlob` vs `generatePDF`** — `generatePDF` triggers a browser download directly. Archive export flows pass `undefined` for the PDF blob to avoid double-downloading during ZIP creation.

---

## 8. What This Session Demonstrates

- Used AI coding tools to turn a broad "proof-of-condition" idea into a structured product with clear wedge, templates, and trust model
- Narrowed the launch focus to rental vehicles while preserving a full multi-vertical template system
- Designed privacy and local-first constraints intentionally: no backend, no accounts, no gallery evidence, no server verification
- Iterated on the user trust model step by step: in-app camera → original-quality storage → SHA-256 hashing → verified manifest → receiver verification → portable archives → no gallery uploads
- Used AI to debug build failures (missing PORT/BASE_PATH), trace type errors, and push to GitHub
- Used AI to refine pricing, trial logic, platform purchase language, mobile wrapping plan, app-store strategy, and YC positioning

---

## 9. Selected Code Excerpts

### Excerpt 1 — Packet Data Model
**File:** `artifacts/proofpacket/src/types/index.ts`

**Why this matters:** Shows how ConditionLock represents local-first condition records — packets, checklist items, photos with hash metadata, verification results, and activity logs — all typed in TypeScript, all stored in IndexedDB.

```typescript
export type PacketType =
  | 'car_rental' | 'moving_truck_van' | 'trailer_tow_equipment'
  | 'custom_rental_vehicle' | 'company_vehicle_handoff'
  | 'hotel' | 'airbnb' | 'apartment_home'
  | 'business_commercial_lease' | 'business_changeover_as_is_sale'
  | 'property_sale_home_sale' | 'vehicle_sale_as_is_transfer'
  | 'equipment_sale_as_is_transfer' | 'general_item_sale_as_is_transfer'
  | 'moving_storage' | 'equipment_rental' | 'accident_claim' | 'custom';

export type ChecklistStatus =
  | 'not_checked' | 'good' | 'works' | 'damaged' | 'dirty' | 'stained' | 'odor'
  | 'missing' | 'not_working' | 'unknown' | 'not_safe_to_check' | 'not_applicable'
  | 'included' | 'excluded' | 'present' | 'not_present' | 'returned' | 'not_returned'
  | 'reported' | 'not_reported' | 'needs_follow_up' | 'resolved' | 'unresolved';

export interface ChecklistItem {
  id: string;
  packetId: string;
  section: string;
  label: string;
  status: ChecklistStatus;
  statuses?: string[];           // multi-select statuses array
  notes: string;
  photoIds: string[];
  conditionEvidence?: ConditionEvidence[];
  addedDuringInspection: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoItem {
  id: string;
  packetId: string;
  originalBlob: Blob;            // original quality, no compression
  thumbnailData: string;         // base64 for display only
  mimeType: string;
  fileSize: number;
  appCaptured?: boolean;
  source?: 'in_app_camera' | 'imported_document' | 'legacy_import' | 'unknown';
  verificationEligible?: boolean;
  sha256Hash?: string;           // computed at capture time
  conditionEvidenceId?: string;
}

export interface VerificationResult {
  id: string;
  packetId: string;
  totalExpected: number;
  verifiedCount: number;
  missingCount: number;
  mismatchCount: number;
  resultStatus: 'passed' | 'warning' | 'failed';
  photoResults: VerificationPhotoResult[];
}
```

---

### Excerpt 2 — Template System (Rental Car)
**File:** `artifacts/proofpacket/src/templates/index.ts`

**Why this matters:** Shows how each packet type has its own structured checklist sections with per-item phases and default statuses. The template system is what lets ConditionLock handle many verticals while keeping rental vehicles as the prominent launch path.

```typescript
export interface PacketTemplate {
  type: PacketType;
  name: string;
  description: string;
  category: string;
  sections: TemplateSection[];
}

// Rental Car template (excerpt — first two sections)
car_rental: {
  type: 'car_rental',
  name: 'Rental Car',
  description: 'Document vehicle condition at pickup and return.',
  category: 'Rental Vehicle',
  sections: [
    {
      name: 'Before You Leave the Lot',
      items: [
        { label: 'Odometer at pickup', phase: 'pickup', status: 'not_checked' },
        { label: 'Fuel or battery level at pickup', phase: 'pickup', status: 'not_checked' },
        { label: 'Exterior walk-around — all four sides', phase: 'pickup', status: 'not_checked' },
        { label: 'Existing damage noted in photos', phase: 'pickup', status: 'not_checked' },
        { label: 'Pre-existing damage reported to company', phase: 'pickup', status: 'not_checked' },
        { label: 'Rental agreement captured', phase: 'pickup', status: 'not_checked' },
      ]
    },
    {
      name: 'Required Exterior Photos',
      items: [
        { label: 'Front of vehicle', phase: 'both', status: 'not_checked' },
        { label: 'Rear of vehicle', phase: 'both', status: 'not_checked' },
        { label: 'Driver side', phase: 'both', status: 'not_checked' },
        { label: 'Passenger side', phase: 'both', status: 'not_checked' },
        { label: 'Roof', phase: 'both', status: 'not_checked' },
        { label: 'Windshield & Glass', phase: 'both', status: 'not_checked' },
        { label: 'Existing Scratches / Dents', phase: 'pickup', status: 'not_checked' },
      ]
    },
    // ... Test It, Accessories & Extras, Return sections
  ]
}
```

---

### Excerpt 3 — Local Storage and Persistence
**File:** `artifacts/proofpacket/src/storage/db.ts`

**Why this matters:** Shows the no-backend architecture. All data lives in IndexedDB via Dexie. The database has four schema versions tracking the feature evolution during this session. The Dexie DB string `'ProofPacketDB'` was preserved intentionally during the rename to avoid breaking existing user data.

```typescript
import Dexie, { type Table } from 'dexie';

export class ProofPacketDB extends Dexie {
  packets!: Table<Packet, string>;
  photos!: Table<PhotoItem, string>;
  settings!: Table<AppSettings, number>;
  verificationResults!: Table<VerificationResult, string>;
  activityLog!: Table<ActivityLog, string>;

  constructor() {
    super('ProofPacketDB'); // DB name preserved — changing this orphans existing user data
    this.version(1).stores({
      packets: 'id, createdAt, updatedAt, type',
      photos: 'id, packetId, phase, createdAt',
      settings: 'id'
    });
    this.version(2).stores({ /* + verificationResults */ });
    this.version(3).stores({ /* + activityLog */ });
    this.version(4).stores({
      // photos indexed by conditionEvidenceId for per-condition evidence cards
      photos: 'id, packetId, phase, createdAt, conditionEvidenceId, checklistItemId',
      // ...all other tables unchanged
    });
  }
}

export const db = new ProofPacketDB();
```

---

### Excerpt 4 — Photo Handling (Trust Model)
**File:** `artifacts/proofpacket/src/storage/actions.ts`

**Why this matters:** The trust model depends on preserving original-quality evidence and distinguishing in-app captured photos from imported documents. Hashes are computed at add time.

```typescript
async addPhoto(photo: Omit<PhotoItem, 'id' | 'createdAt' | 'thumbnailData'> & { thumbnailData?: string }) {
  // Generate thumbnail for display (does not replace originalBlob)
  let thumbnailData = photo.thumbnailData;
  if (!thumbnailData && photo.originalBlob) {
    thumbnailData = await generateThumbnail(photo.originalBlob);
  }

  // Compute SHA-256 hash at capture time and store with the record
  let sha256Hash = photo.sha256Hash;
  if (!sha256Hash && photo.originalBlob) {
    try {
      sha256Hash = await sha256Blob(photo.originalBlob as Blob);
    } catch { /* hash fails gracefully if Web Crypto unavailable */ }
  }

  // source: 'in_app_camera'    → verificationEligible: true
  // source: 'imported_document' → verificationEligible: false
  // appCaptured: true/false carried through to manifest and PDF labels
}
```

---

### Excerpt 5 — SHA-256 Hashing
**File:** `artifacts/proofpacket/src/utils/crypto.ts`

**Why this matters:** The entire receiver verification workflow depends on this. SHA-256 runs entirely in the browser via the Web Crypto API — no server, no third-party hashing library.

```typescript
export function isCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.crypto?.subtle;
}

export async function sha256Blob(blob: Blob): Promise<string> {
  if (!isCryptoAvailable()) throw new Error('Web Crypto API not available.');
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256String(str: string): Promise<string> {
  if (!isCryptoAvailable()) throw new Error('Web Crypto API not available.');
  const encoder = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(str));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function archiveFileName(packetTitle: string, suffix: string, ext: string): string {
  const d = new Date().toISOString().split('T')[0];
  return `ConditionLock_${safeName(packetTitle)}_${d}_${suffix}.${ext}`;
}
```

---

### Excerpt 6 — Verified Packet Export and Manifest Generation
**File:** `artifacts/proofpacket/src/utils/manifest.ts`

**Why this matters:** Shows how ConditionLock turns local records into portable, verifiable archives. The manifest is self-hashed: the manifest JSON itself is hashed and the hash stored inside it, so tampering with the manifest is detectable.

```typescript
export interface VerificationManifest {
  manifestVersion: '1.0';
  appName: 'ConditionLock' | 'ProofPacket'; // union for old-manifest backwards compat
  generatedAt: string;
  packetId: string;
  packetTitle: string;
  exportedBy: string;
  totalPhotos: number;
  photos: ManifestPhotoEntry[];
  manifestHash?: string; // SHA-256 of the manifest JSON itself
}

export async function buildManifest(packet, photos, exportedBy) {
  const entries = await Promise.all(photos.map(async (p) => ({
    id: p.id,
    fileName: p.fileName,
    sha256: p.originalBlob instanceof Blob ? await sha256Blob(p.originalBlob) : '',
    source: p.source || (p.appCaptured ? 'in_app_camera' : 'unknown'),
    appCaptured: p.appCaptured ?? false,
    verificationEligible: p.verificationEligible ?? (p.appCaptured === true),
  })));

  const manifest: VerificationManifest = {
    manifestVersion: '1.0',
    appName: 'ConditionLock',
    generatedAt: new Date().toISOString(),
    packetId: packet.id,
    exportedBy,
    totalPhotos: photos.length,
    photos: entries,
  };

  // Self-hash: hash the manifest JSON and embed the hash inside
  const manifestJson = JSON.stringify(manifest, null, 2);
  manifest.manifestHash = await sha256String(manifestJson);

  return { manifest, entries };
}

export async function exportFullArchive(packet, photos, exportedBy, pdfBlob?) {
  const zip = new JSZip();
  const { manifest } = await buildManifest(packet, photos, exportedBy);

  zip.file('packet-data.json', JSON.stringify(packet, null, 2));
  zip.file('verification-manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('verification-summary.txt', buildSummaryText(manifest));
  zip.file('README.txt', buildReadme(packet, photos.length));
  zip.file('DISCLAIMERS.txt', DISCLAIMERS);

  // Original-quality photos — no re-encoding
  const photosFolder = zip.folder('photos/originals')!;
  for (const photo of photos) {
    if (photo.originalBlob instanceof Blob) {
      photosFolder.file(photo.archiveFileName, photo.originalBlob);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `ConditionLock_${safeName(packet.title)}_${d}_Archive.zip`);
}
```

---

### Excerpt 7 — Receiver-Side Verify Packet Mode
**File:** `artifacts/proofpacket/src/pages/VerifyPacket.tsx`

**Why this matters:** Shows the two-sided workflow. The sender creates and exports a verified record. The receiver uploads the manifest and photos locally — hashes are computed in the browser and compared against the manifest. No server involved.

```typescript
const HASH_DISCLAIMER =
  "Hash verification confirms whether the files being checked match the files " +
  "recorded in this ConditionLock manifest. It does not prove who took the photos, " +
  "where they were taken, whether the scene was staged, or whether the record " +
  "has legal evidentiary value.";

const STATUS_CONFIG = {
  verified: { label: 'Verified',          icon: CheckCircle2, color: 'text-green-700' },
  missing:  { label: 'Missing',           icon: AlertTriangle, color: 'text-amber-700' },
  mismatch: { label: 'Hash Mismatch',     icon: XCircle,      color: 'text-red-700' },
  extra:    { label: 'Extra / Unmatched', icon: Info,         color: 'text-slate-600' },
};

// Core hash comparison logic (simplified):
for (const entry of manifest.photos) {
  // Try hash-first matching (filename not required to match)
  const hashMatch = uploadedFiles.find(f => sha256(f) === entry.sha256);
  if (hashMatch) {
    results.push({ ...entry, status: 'verified', calculatedHash: entry.sha256 });
    continue;
  }
  // Fallback: filename match with hash comparison
  const nameMatch = uploadedFiles.find(f => f.name === entry.fileName);
  if (!nameMatch) {
    results.push({ ...entry, status: 'missing' });
  } else {
    const calculatedHash = await sha256Blob(nameMatch);
    results.push({
      ...entry,
      status: calculatedHash === entry.sha256 ? 'verified' : 'mismatch',
      calculatedHash,
    });
  }
}

// Overall result
const resultStatus = mismatchCount > 0 ? 'failed'
  : missingCount > 0 ? 'warning'
  : 'passed';
```

---

### Excerpt 8 — Pricing, Trial, and Entitlements
**File:** `artifacts/proofpacket/src/hooks/useTier.ts`

**Why this matters:** Shows the monetization model — 3-day full-access trial, then Pro or Business Pro one-time purchase. The feature gate logic is all local; RevenueCat replaces the dev simulation in production.

```typescript
// TODO (production): Replace with RevenueCat / App Store / Google Play
// iOS:     com.conditionlock.app.pro / com.conditionlock.app.business
// Android: conditionlock_pro / conditionlock_business

export type Tier = 'trial' | 'pro' | 'business' | 'locked';

export const TIER_LIMITS = {
  trial: {
    // Full Business-level access for 3 days
    hasZipExport: true, hasSavedVerifications: true,
    templates: BUSINESS_TEMPLATES,
    price: '$0 for 3 days',
  },
  pro: {
    hasZipExport: false,         // Photos ZIP is Business Pro only
    hasSavedVerifications: false, // Save verifications is Business Pro only
    hasVerifiedExport: true,
    hasArchiveExport: true,
    hasSignatures: true,
    hasJsonBackup: true,
    templates: PRO_TEMPLATES,
    price: '$14.99',
  },
  business: {
    // All features including ZIP export and saved verifications
    hasZipExport: true, hasSavedVerifications: true,
    templates: BUSINESS_TEMPLATES,
    price: '$39.99',
  },
  locked: {
    // Trial expired, no purchase — lock screen gates all actions
    maxPackets: 0, hasSignatures: false, hasVerifiedExport: false,
    templates: [],
  },
};

// Template tier gating
export const PRO_TEMPLATES = [
  'car_rental', 'hotel', 'apartment_home', 'airbnb',
  'moving_truck_van', 'trailer_tow_equipment', 'custom_rental_vehicle',
  'property_sale_home_sale', 'vehicle_sale_as_is_transfer',
  'moving_storage', 'accident_claim', 'custom', /* ... */
];
export const BUSINESS_TEMPLATES = [
  ...PRO_TEMPLATES,
  'business_commercial_lease', 'business_changeover_as_is_sale',
  'equipment_sale_as_is_transfer', 'company_vehicle_handoff',
];
```

---

### Excerpt 9 — Multi-Select Statuses
**File:** `artifacts/proofpacket/src/pages/PacketDetail.tsx`

**Why this matters:** Real-world condition is often multi-state (dirty AND damaged, missing AND reported). The status system handles combinations with priority ordering for display and backwards compatibility with old single-status records.

```typescript
// Backwards-compatible helper: falls back to [item.status] for old records
function getEffectiveStatuses(item: ChecklistItem): string[] {
  if (item.statuses && item.statuses.length > 0) return item.statuses;
  return [item.status];
}

// Card border color reflects highest-severity status
function getCardBorderColor(statuses: string[]): string {
  if (statuses.includes('not_applicable')) return 'bg-gray-400';
  if (statuses.every(s => s === 'not_checked')) return 'bg-gray-200';
  if (ISSUE_STATUSES.some(s => statuses.includes(s))) return 'bg-destructive'; // red
  if (POSITIVE_STATUSES.some(s => statuses.includes(s))) return 'bg-green-500';
  return 'bg-amber-400';
}

// Priority ordering: issue statuses surface first
function getPrimaryStatus(statuses: string[]): string {
  return statuses.find(s => ISSUE_STATUSES.includes(s))
    || statuses.find(s => !EXCLUSIVE_STATUSES.includes(s))
    || statuses[0]
    || 'not_checked';
}

// Exclusive statuses clear others when selected (not_applicable, not_checked)
const EXCLUSIVE_STATUSES = ['not_applicable', 'not_checked'];

// Examples of valid multi-status combinations:
// ['dirty', 'damaged']
// ['missing', 'reported']
// ['included', 'not_working']
// ['present', 'dirty']
// ['returned', 'damaged']
```

---

### Excerpt 10 — Build Config and PWA Manifest
**File:** `artifacts/proofpacket/vite.config.ts` and `artifacts/proofpacket/public/manifest.json`

**Why this matters:** Shows the build environment requirements and the PWA/mobile path. The Vite config enforces `PORT` and `BASE_PATH` at build time. The PWA manifest enables home-screen install. The Capacitor config shows the planned native wrapper structure.

```typescript
// vite.config.ts — PORT and BASE_PATH are required; build throws if absent
const rawPort = process.env.PORT;
if (!rawPort) throw new Error("PORT environment variable is required.");

const basePath = process.env.BASE_PATH;
if (!basePath) throw new Error("BASE_PATH environment variable is required.");

export default defineConfig({
  base: basePath,  // '/' for web, '/app/' for subdirectory deploys
  server: {
    port: Number(rawPort),
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    outDir: 'dist/public',
  },
});
```

```json
// public/manifest.json — PWA install support
{
  "name": "ConditionLock",
  "short_name": "ConditionLock",
  "description": "Verified condition records for rental vehicles, property handoffs, and more.",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-512.png", "sizes": "512x512", "purpose": "any maskable" }
  ]
}
```

```typescript
// capacitor.config.ts — planned native wrapper (not yet built)
const config: CapacitorConfig = {
  appId: 'com.conditionlock.app',  // update to match Apple/Google accounts
  appName: 'ConditionLock',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https', // required for IndexedDB and camera on Android
  },
};
```

```json
// package.json scripts
{
  "dev":          "vite --config vite.config.ts --host 0.0.0.0",
  "build":        "vite build --config vite.config.ts",
  "typecheck":    "tsc -p tsconfig.json --noEmit",
  "cap:sync":     "pnpm build:mobile && cap sync",
  "cap:android":  "pnpm build:mobile && cap sync android && cap open android",
  "cap:ios":      "pnpm build:mobile && cap sync ios && cap open ios"
}
```

---

## 10. Code and Architecture Notes

- The codebase is a local-first MVP. All data lives in IndexedDB (Dexie v4). No data leaves the device unless the user explicitly exports an archive or verified record.
- The product intentionally avoids a backend for the MVP. There is no server, no database, no API, no account system, and no cloud sync.
- The web/PWA version is the first build target. It installs as a home-screen app on iOS and Android without needing the App Store.
- Mobile wrapping with Capacitor is planned as a follow-on step using the existing `capacitor.config.ts` and the `cap:ios`/`cap:android` npm scripts.
- Optional cloud backup and receiver download access are roadmap items. They are not required for the MVP and will not change the local-first runtime model when added — cloud will be opt-in.
- **GitHub repository:** https://github.com/JeffreyDParfitt/proofpacket.git

---

## 11. Next Steps

- Finish MVP polish and edge case handling
- Deploy web/PWA beta to a public URL for early testers
- Record product demo video (rental car packet: create → photograph → export → verify flow)
- Test with rental car users, moving truck users, company vehicle users
- Test with military/government travelers if possible
- Apply to YC
- Wrap for Android/iOS later with Capacitor
- Add real app-store purchases via RevenueCat
- Optional cloud backup and receiver download links
- Explore B2B/fleet/property manager integrations

---

## YC Positioning Notes

- ConditionLock is positioned as the verified condition record layer for physical handoffs.
- The first wedge is rental vehicles: rental cars, moving trucks, cargo vans, trailers, car-sharing, company vehicles, and military/government travel documentation.
- Future roadmap may include optional cloud backup, receiver access links, team/fleet accounts, property manager workflows, and integrations with rental companies, fleet operators, and property management platforms.
- The current MVP is web/PWA, local-first, no backend.

---

## 12. Final Summary

This AI coding session took ConditionLock from a broad local-first "proof packet" concept to a focused MVP for verified condition records, starting with rental vehicles. The session shows how AI coding tools were used not only to generate code, but to refine product strategy, design the trust model, establish no-backend constraints, build a multi-vertical template system, implement SHA-256 photo hashing with receiver-side verification, debug builds, push to GitHub, and prepare for YC. The result is a working, typechecked, locally-runnable web app that creates portable, verifiable condition records — with no server, no accounts, and no cloud dependency.

---

*ConditionLock — AI coding session export, May 2026.*
